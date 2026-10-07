export default {
  async fetch(request, env) {
    // Handle CORS (so your frontend can talk to this worker)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Send a POST request", { status: 405 });
    }

    const body = await request.json();
    const userPrompt = body.prompt;
    const subdomain = body.subdomain;

    // 1. Run Cloudflare Workers AI
    // We are telling Llama-3 to act as an expert web developer
    const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: "system", content: "You are an expert web developer. Output ONLY valid, complete HTML and CSS code for the user's request. Do not include markdown formatting or explanations." },
        { role: "user", content: userPrompt }
      ]
    });

    const generatedCode = aiResponse.response;

    // 2. Here is where you will add Composio and Cloudflare DNS logic
    // - Use env.COMPOSIO_API_KEY to authenticate with GitHub
    // - Create a repo using the 'subdomain' variable
    // - Upload 'generatedCode' as index.html to that repo
    // - Call Cloudflare DNS API to point subdomain.nexuswebsolutions.com to GitHub Pages

    return new Response(JSON.stringify({ 
      status: "success", 
      message: `Task queued for ${subdomain}`,
      aiGeneratedCode: generatedCode 
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
