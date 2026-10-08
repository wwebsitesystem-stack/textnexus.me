export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Send a POST request", { status: 405, headers: corsHeaders });
    }

    try {
      if (!env.AI) {
        return new Response(
          JSON.stringify({ error: "Workers AI binding 'AI' missing in Cloudflare Worker settings." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { prompt, subdomain } = await request.json();
      const repoName = `nexus-${subdomain.toLowerCase()}`;
      const defaultOrg = "wwebsite-stack";

      // 1. Generate site code via Cloudflare Workers AI
      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
        messages: [
          { role: "system", content: "You are an expert web developer. Return ONLY complete HTML with inline CSS. No markdown formatting." },
          { role: "user", content: prompt }
        ]
      });
      
      let generatedCode = aiResponse.response || "<h1>Website Created</h1>";

      // 2. Inject Watermark Badge
      const nexusBadge = `<a href="https://textnexus.me" target="_blank" style="position: fixed; bottom: 16px; right: 16px; z-index: 999999; font-family: sans-serif; font-size: 11px; font-weight: 600; color: #ededed; background-color: rgba(18, 18, 18, 0.9); border: 1px solid #262626; padding: 6px 12px; border-radius: 9999px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">Powered by Nexus • textnexus.me</a>`;

      if (generatedCode.includes('</body>')) {
        generatedCode = generatedCode.replace('</body>', `${nexusBadge}</body>`);
      } else {
        generatedCode += nexusBadge;
      }

      const githubHeaders = {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'User-Agent': 'Nexus-AI-Builder',
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      };

      // 3. Create Repo under Organization first, fallback to user account
      let actualOwner = defaultOrg;
      let repoRes = await fetch(`https://api.github.com/orgs/${defaultOrg}/repos`, {
        method: 'POST',
        headers: githubHeaders,
        body: JSON.stringify({ name: repoName, private: false, auto_init: false })
      });

      if (!repoRes.ok && repoRes.status !== 422) {
        repoRes = await fetch('https://api.github.com/user/repos', {
          method: 'POST',
          headers: githubHeaders,
          body: JSON.stringify({ name: repoName, private: false, auto_init: false })
        });

        const userRes = await fetch('https://api.github.com/user', { headers: githubHeaders });
        if (userRes.ok) {
          const userData = await userRes.json();
          actualOwner = userData.login;
        }
      }

      // 4. Safe UTF-8 Base64 Encoding
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(generatedCode);
      let binaryString = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const encodedCode = btoa(binaryString);

      // 5. Upload index.html to GitHub
      let fileSha = undefined;
      const getFileRes = await fetch(`https://api.github.com/repos/${actualOwner}/${repoName}/contents/index.html`, { headers: githubHeaders });
      if (getFileRes.ok) {
        const existingFile = await getFileRes.json();
        fileSha = existingFile.sha;
      }

      const uploadBody = {
        message: "Initial commit by Nexus AI",
        content: encodedCode
      };
      if (fileSha) uploadBody.sha = fileSha;

      const fileRes = await fetch(`https://api.github.com/repos/${actualOwner}/${repoName}/contents/index.html`, {
        method: 'PUT',
        headers: githubHeaders,
        body: JSON.stringify(uploadBody)
      });

      const fileData = await fileRes.json();
      if (!fileRes.ok) {
        throw new Error(`GitHub File Upload Error (${fileRes.status}): ${fileData.message || JSON.stringify(fileData)}`);
      }

      // 6. Map CNAME in Cloudflare DNS
      if (env.CLOUDFLARE_ZONE_ID && env.CLOUDFLARE_API_TOKEN) {
        await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: "CNAME",
            name: subdomain, 
            content: `${actualOwner}.github.io`, 
            proxied: false 
          })
        });
      }

      return new Response(JSON.stringify({ 
        status: "success", 
        repoUrl: `https://github.com/${actualOwner}/${repoName}`
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message || "An unexpected error occurred." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
};
