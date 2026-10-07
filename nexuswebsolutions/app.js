const generateBtn = document.getElementById('generate-btn');
const statusOutput = document.getElementById('status-output');

generateBtn.addEventListener('click', async () => {
  const prompt = document.getElementById('site-prompt').value;
  const subdomain = document.getElementById('subdomain-name').value;

  if (!prompt || !subdomain) return alert("Please fill out both fields.");

  // Clean up subdomain to remove spaces/special characters
  const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  statusOutput.innerText = "Processing... AI is building your site and configuring Textnexus.me...";

  try {
    const workerUrl = "https://throbbing-hill-3378.brodywilliams0226.workers.dev"; 
    
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, subdomain: cleanSubdomain })
    });

    const result = await response.json();
    
    if (result.error) {
      statusOutput.innerText = `Error: ${result.error}`;
    } else {
      statusOutput.innerText = `Success! Your site is deploying.\n\nGitHub Repo: ${result.repoUrl}\nLive Link: https://${cleanSubdomain}.textnexus.me\n\n(Note: DNS and GitHub Pages may take 1-3 minutes to go live).`;
    }
  } catch (error) {
    statusOutput.innerText = "Error connecting to backend.";
    console.error(error);
  }
});
