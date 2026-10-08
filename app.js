async function deployNexusWebsite(promptText, subdomainText) {
  const statusBox = document.getElementById("statusBox"); // Replace with your status container ID
  const submitButton = document.getElementById("deployBtn"); // Replace with your submit button ID

  try {
    if (submitButton) submitButton.disabled = true;
    if (statusBox) statusBox.innerHTML = "<p>Building and deploying website... Please wait.</p>";

    const response = await fetch("https://little-unit-9bae.brodywilliams0226.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptText,
        subdomain: subdomainText
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error (${response.status})`);
    }

    if (statusBox) {
      statusBox.innerHTML = `
        <div style="color: #4ade80; background: rgba(74, 222, 128, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(74, 222, 128, 0.2);">
          <strong>Website Deployed Successfully!</strong><br/>
          <a href="${data.siteUrl}" target="_blank" style="color: #60a5fa; text-decoration: underline;">${data.siteUrl}</a><br/>
          <a href="${data.repoUrl}" target="_blank" style="color: #9ca3af; font-size: 12px;">View GitHub Repository</a>
        </div>
      `;
    }
  } catch (err) {
    if (statusBox) {
      statusBox.innerHTML = `
        <div style="color: #f87171; background: rgba(248, 113, 113, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(248, 113, 113, 0.2);">
          Error: ${err.message}
        </div>
      `;
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}
