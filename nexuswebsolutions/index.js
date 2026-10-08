
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

      // 1. Run Cloudflare AI (Updated to 3.1)
      const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: "system", content: "You are an expert web developer. Return ONLY complete HTML with inline CSS. No markdown." },
          { role: "user", content: prompt }
        ]
      });
      const generatedCode = aiResponse.response;

      // 2. Create GitHub Repo via Composio
      await fetch('https://api.composio.dev/api/v1/actions/GITHUB_CREATE_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER/execute', {
        method: 'POST',
        headers: { 'x-api-key': env.COMPOSIO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { name: repoName, private: false } })
      });

      // 3. Upload Code to GitHub via Composio
      const encodedCode = btoa(unescape(encodeURIComponent(generatedCode))); 
      await fetch('https://api.composio.dev/api/v1/actions/GITHUB_CREATE_OR_UPDATE_FILE_CONTENTS/execute', {
        method: 'POST',
        headers: { 'x-api-key': env.COMPOSIO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { owner: githubUsername, repo: repoName, path: "index.html", message: "Initial commit", content: encodedCode }
        })
      });

      // 4. Create Subdomain on Textnexus.me via Cloudflare DNS API
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
