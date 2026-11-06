/**
 * TextNexus AI site builder (standalone Worker).
 *
 * Security: same-origin CORS, a per-IP rate limit, Firebase ID token required
 * for the repo/DNS automation path. Secrets stay in the Worker environment:
 * AI, GITHUB_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID.
 */

const PUBLIC_FIREBASE_API_KEY = "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco";
const DEFAULT_ORIGINS = ["https://textnexus.me", "https://www.textnexus.me"];
const RESERVED_SUBDOMAINS = new Set(["www", "mail", "api", "admin", "app", "dev", "staging", "cdn", "static"]);
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;
const buckets = new Map(); // isolate-local; good enough to blunt abuse, not a global quota

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function origins(env) {
  const configured = (env.ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean);
  return configured.length ? configured : DEFAULT_ORIGINS;
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin"
  };
  if (origin && origins(env).includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

const json = (body, status, request, env, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request, env), "Content-Type": "application/json", ...extra }
  });

function rateLimited(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const now = Date.now();
  const bucket = buckets.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + RATE_WINDOW_MS;
  }
  bucket.count += 1;
  buckets.set(ip, bucket);
  if (buckets.size > 5000) {
    for (const [key, value] of buckets) if (now > value.reset) buckets.delete(key);
  }
  return bucket.count > RATE_MAX;
}

async function verifyFirebaseToken(idToken, apiKey) {
  if (!idToken) return null;
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken })
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const user = data?.users?.[0];
  return user?.email ? { email: user.email, uid: user.localId } : null;
}

const toBase64 = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

function gh(path, token, init = {}) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "TextNexus-Worker",
      Accept: "application/vnd.github+json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {})
    }
  });
}

async function waitForRepo(fullName, token) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const res = await gh(`/repos/${fullName}`, token);
    if (res.ok) return true;
    await sleep(350 * (attempt + 1));
  }
  return false;
}

async function putFile(fullName, path, content, message, token) {
  const res = await gh(`/repos/${fullName}/contents/${path}`, token, {
    method: "PUT",
    body: JSON.stringify({ message, content: toBase64(content) })
  });
  return res.ok;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(request, env) });
    if (request.method !== "POST") return json({ error: "Send a POST request." }, 405, request, env);

    const origin = request.headers.get("Origin");
    if (origin && !origins(env).includes(origin)) {
      return json({ error: "Origin not allowed." }, 403, request, env);
    }

    if (rateLimited(request)) {
      return json({ error: "Too many requests — try again in a minute." }, 429, request, env, { "Retry-After": "60" });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body." }, 400, request, env);
    }

    const prompt = String(body?.prompt || "").slice(0, 4000);
    const subdomain = String(body?.subdomain || "").trim().toLowerCase();

    if (!prompt.trim()) return json({ error: "Missing prompt." }, 400, request, env);

    // Creating repos and DNS records is the dangerous path: require a real Firebase identity.
    let account = null;
    if (subdomain) {
      if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain) || RESERVED_SUBDOMAINS.has(subdomain)) {
        return json({ error: "Choose a different subdomain: lowercase letters, numbers and dashes only." }, 400, request, env);
      }
      const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      account = await verifyFirebaseToken(token, env.FIREBASE_API_KEY || PUBLIC_FIREBASE_API_KEY);
      if (!account) {
        return json({ error: "Sign in before publishing a site." }, 401, request, env);
      }
    }

    if (!env.AI) return json({ error: "Cloudflare AI binding 'AI' is not configured." }, 500, request, env);

    let replyText;
    try {
      const aiResponse = await env.AI.run("@cf/openai/gpt-oss-120b", {
        messages: [
          {
            role: "system",
            content: "You are an expert full-stack developer. Return ONLY valid, clean, fully responsive HTML/CSS without markdown fences or commentary."
          },
          { role: "user", content: prompt }
        ]
      });
      if (typeof aiResponse === "string") replyText = aiResponse;
      else if (aiResponse?.response) replyText = aiResponse.response;
      else if (aiResponse?.choices?.[0]?.message?.content) replyText = aiResponse.choices[0].message.content;
      else replyText = JSON.stringify(aiResponse);
    } catch {
      return json({ error: "The AI model could not generate a site. Try again." }, 502, request, env);
    }

    if (!replyText || !replyText.trim()) replyText = "<h1>Error: the model returned an empty page.</h1>";

    if (!subdomain) return json({ reply: replyText }, 200, request, env);

    const repoName = `nexus-${subdomain}`;
    const customDomain = `${subdomain}.textnexus.me`;
    const warnings = [];

    if (!env.GITHUB_TOKEN) {
      warnings.push("GitHub publishing is not configured.");
    } else {
      try {
        const userRes = await gh("/user", env.GITHUB_TOKEN);
        const userData = await userRes.json().catch(() => ({}));
        const owner = userData.login;
        if (!owner) throw new Error("GitHub user lookup failed");
        const fullName = `${owner}/${repoName}`;

        const created = await gh("/user/repos", env.GITHUB_TOKEN, {
          method: "POST",
          body: JSON.stringify({
            name: repoName,
            description: `Generated by TextNexus AI for: ${prompt.slice(0, 120)}`,
            private: false,
            auto_init: true
          })
        });
        if (!created.ok && created.status !== 422) throw new Error(`repo create failed (${created.status})`);

        // Poll instead of sleeping a fixed 2s, then write both files concurrently.
        await waitForRepo(fullName, env.GITHUB_TOKEN);
        const [indexOk, cnameOk] = await Promise.all([
          putFile(fullName, "index.html", replyText, "Initial commit generated by TextNexus AI", env.GITHUB_TOKEN),
          putFile(fullName, "CNAME", customDomain, "Add custom domain CNAME", env.GITHUB_TOKEN)
        ]);
        if (!indexOk) warnings.push("The page could not be committed to GitHub.");
        if (!cnameOk) warnings.push("The CNAME file could not be committed.");

        // Pages and DNS are independent once the files exist.
        const pagesCall = gh(`/repos/${fullName}/pages`, env.GITHUB_TOKEN, {
          method: "POST",
          body: JSON.stringify({ source: { branch: "main", path: "/" }, cname: customDomain })
        });
        const dnsCall = env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ZONE_ID
          ? fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records`, {
              method: "POST",
              headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
              body: JSON.stringify({ type: "CNAME", name: customDomain, content: "textnexus.me", proxied: true })
            })
          : Promise.resolve(null);
        const [pagesRes] = await Promise.all([pagesCall, dnsCall]);
        if (pagesRes && !pagesRes.ok && pagesRes.status !== 409) warnings.push("GitHub Pages could not be enabled yet.");
      } catch (error) {
        console.error("builder publish error:", error);
        warnings.push("Publishing was interrupted. The generated page is still returned.");
      }
    }

    return json({
      reply: replyText,
      code: replyText,
      repo: repoName,
      siteUrl: `https://${customDomain}`,
      user: account.email,
      warnings
    }, 200, request, env);
  }
};
