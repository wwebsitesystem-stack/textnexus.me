export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    if (request.method !== "POST") return new Response("Send a POST request", { status: 405 });

    try {
      const { prompt, subdomain } = await request.json();
      const repoName = `nexus-${subdomain}`;
      const githubUsername = "wwebsitesystem-stack";

      // 1. Run Cloudflare AI with the current active Llama 3.1 FP8 model
      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
        messages: [
          { role: "system", content: "You are an expert web developer. Return ONLY complete HTML with inline CSS. No markdown formatting." },
          { role: "user", content: prompt }
        ]
      });
      
      let generatedCode = aiResponse.response;

      // 2. Inject "Powered by Nexus" Watermark Badge
      const nexusBadge = `<a href="https://textnexus.me" target="_blank" style="position: fixed; bottom: 16px; right: 16px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; color: #ededed; background-color: rgba(18, 18, 18, 0.9); border: 1px solid #262626; padding: 6px 12px; border-radius: 9999px; text-decoration: none; backdrop-filter: blur(8px); display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">Powered by Nexus • textnexus.me</a>`;

      if (generatedCode.includes('</body>')) {
        generatedCode = generatedCode.replace('</body>', `${nexusBadge}</body>`);
      } else {
        generatedCode += nexusBadge;
      }

      // 3. Create GitHub Repo via Composio
      await fetch('https://api.composio.dev/api/v1/actions/GITHUB_CREATE_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER/execute', {
        method: 'POST',
        headers: { 'x-api-key': env.COMPOSIO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { name: repoName, private: false } })
      });

      // 4. Upload Code to GitHub via Composio
      const encodedCode = btoa(unescape(encodeURIComponent(generatedCode))); 
      await fetch('https://api.composio.dev/api/v1/actions/GITHUB_CREATE_OR_UPDATE_FILE_CONTENTS/execute', {
        method: 'POST',
        headers: { 'x-api-key': env.COMPOSIO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { owner: githubUsername, repo: repoName, path: "index.html", message: "Initial commit", content: encodedCode }
        })
      });

      // 5. Create Subdomain on Textnexus.me via Cloudflare DNS API
      await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: "CNAME",
          name: subdomain, 
          content: `${githubUsername}.github.io`, 
          proxied: true
        })
      });

      return new Response(JSON.stringify({ 
        status: "success", 
        repoUrl: `https://github.com/${githubUsername}/${repoName}`
      }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
  }
};
