/**
 * POST /api/welcome
 *
 * Sends the TextNexus welcome mail through Brevo from the server, so the API
 * key never reaches the browser. The caller must present a real Firebase ID
 * token; the recipient is taken from that verified token, never from the body.
 *
 * Required environment (Cloudflare Pages → Settings → Environment variables,
 * encrypted): BREVO_API_KEY, BREVO_SENDER. Optional: BREVO_SENDER_NAME,
 * BREVO_REPLY_TO, FIREBASE_API_KEY, APP_ORIGIN.
 */

const PUBLIC_FIREBASE_API_KEY = "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

async function verifyIdToken(idToken, apiKey) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken })
    }
  );
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const user = data?.users?.[0];
  if (!user?.email) return null;
  return { email: user.email, name: user.displayName || "", verified: !!user.emailVerified };
}

function welcomeHtml({ name, origin }) {
  const safeName = escapeHtml(name || "there");
  return `<!doctype html><html><body style="margin:0;background:#000;font-family:-apple-system,Segoe UI,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#0a0a0a;border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px">
        <tr><td style="color:#fff;font-size:19px;font-weight:600;padding-bottom:10px">Welcome to TextNexus</td></tr>
        <tr><td style="color:#9a9a9a;font-size:14px;line-height:1.65">
          Hi ${safeName}, your account is ready.
        </td></tr>
        <tr><td style="padding:22px 0">
          <a href="${escapeHtml(origin)}/home.html" style="display:inline-block;background:#fff;color:#000;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:9px">Open TextNexus</a>
        </td></tr>
        <tr><td style="color:#777;font-size:12.5px;line-height:1.6">
          Confirm your email address with the separate verification link Firebase sends, or some features stay locked.
        </td></tr>
      </table>
      <div style="color:#555;font-size:11px;padding-top:16px">TextNexus · textnexus.me</div>
    </td></tr>
  </table></body></html>`;
}

export async function onRequestPost({ request, env }) {
  const apiKey = env.FIREBASE_API_KEY || PUBLIC_FIREBASE_API_KEY;
  const origin = env.APP_ORIGIN || "https://textnexus.me";

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const idToken = payload?.idToken;
  if (!idToken) return json({ error: "Missing idToken." }, 401);

  const account = await verifyIdToken(idToken, apiKey);
  if (!account) return json({ error: "Invalid or expired token." }, 401);

  if (!env.BREVO_API_KEY) {
    return json({ error: "Email is not configured on this deployment (BREVO_API_KEY missing)." }, 503);
  }
  if (!env.BREVO_SENDER) {
    return json({ error: "Email sender is not configured (BREVO_SENDER missing)." }, 503);
  }

  const to = { email: account.email, name: account.name };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify({
      sender: { email: env.BREVO_SENDER, name: env.BREVO_SENDER_NAME || "TextNexus" },
      replyTo: env.BREVO_REPLY_TO ? { email: env.BREVO_REPLY_TO } : undefined,
      to: [to],
      subject: "Welcome to TextNexus",
      htmlContent: welcomeHtml({ name: account.name, origin }),
      textContent: `Welcome to TextNexus, ${account.name || "there"}. Your account is ready: ${origin}/home.html`,
      tags: ["signup", "welcome"]
    })
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    return json({ error: result?.message || `Brevo rejected the send (${res.status}).` }, 502);
  }
  return json({ ok: true, messageId: result.messageId || null, to: to.email });
}

export async function onGet() {
  return json({ error: "POST only." }, 405);
}
