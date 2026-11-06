/**
 * POST /api/feedback
 *
 * Emails a feedback submission to the site owner through Brevo, server-side, so
 * the API key never reaches the browser. No database record is written.
 *
 * Required environment (Cloudflare Pages → Settings → Environment variables,
 * encrypted): BREVO_API_KEY, BREVO_SENDER. Optional: BREVO_SENDER_NAME,
 * FEEDBACK_TO (defaults to the TextNexus owner), APP_ORIGIN.
 */

const DEFAULT_FEEDBACK_TO = "brodywilliams0226@gmail.com";
const CATEGORIES = ["Bug", "Idea", "Content", "Other"];

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

const isEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

function feedbackHtml({ name, email, category, message, page, submittedAt, ip, userAgent }) {
  const row = (label, value) =>
    `<tr><td style="color:#888;font-size:12px;padding:6px 14px 6px 0;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>` +
    `<td style="color:#eee;font-size:13px;padding:6px 0;word-break:break-word">${escapeHtml(value || "—")}</td></tr>`;

  return `<!doctype html><html><body style="margin:0;background:#0a0a0a;font-family:-apple-system,Segoe UI,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:28px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#121212;border:1px solid #262626;border-radius:14px;padding:26px">
        <tr><td style="color:#fff;font-size:17px;font-weight:600;padding-bottom:4px">New ${escapeHtml(category)} feedback</td></tr>
        <tr><td style="color:#888;font-size:12px;padding-bottom:16px">from ${escapeHtml(name)}</td></tr>
        <tr><td>
          <table role="presentation" width="100%">${row("Name", name)}${row("Email", email)}${row("Category", category)}${row("Page", page)}${row("Sent", submittedAt)}${row("IP", ip)}${row("Browser", userAgent)}</table>
        </td></tr>
        <tr><td style="padding-top:18px">
          <div style="color:#888;font-size:12px;padding-bottom:6px">Message</div>
          <div style="color:#eee;font-size:14px;line-height:1.65;white-space:pre-wrap;background:#0f0f0f;border:1px solid #262626;border-radius:9px;padding:14px">${escapeHtml(message)}</div>
        </td></tr>
        <tr><td style="color:#555;font-size:11px;padding-top:16px">Reply to this email to answer ${escapeHtml(name)} directly.</td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  // Honeypot: real people never fill this hidden field.
  if (typeof payload?.website === "string" && payload.website.trim()) {
    return json({ ok: true });
  }

  const name = String(payload?.name || "").trim().slice(0, 80);
  const email = String(payload?.email || "").trim().slice(0, 254);
  const message = String(payload?.message || "").trim().slice(0, 5000);
  const category = CATEGORIES.includes(payload?.category) ? payload.category : "Other";
  const page = String(payload?.page || "").slice(0, 300);

  if (!name) return json({ error: "Add your name." }, 400);
  if (!isEmail(email)) return json({ error: "Add a valid email address." }, 400);
  if (message.length < 5) return json({ error: "Tell us a little more (at least 5 characters)." }, 400);

  if (!env.BREVO_API_KEY) {
    return json({ error: "Email is not configured on this deployment (BREVO_API_KEY missing)." }, 503);
  }
  if (!env.BREVO_SENDER) {
    return json({ error: "Email sender is not configured (BREVO_SENDER missing)." }, 503);
  }

  const to = env.FEEDBACK_TO || DEFAULT_FEEDBACK_TO;
  const submittedAt = new Date().toISOString();
  const ip = request.headers.get("cf-connecting-ip") || "";
  const userAgent = (request.headers.get("user-agent") || "").slice(0, 200);
  const subject = `[Feedback] ${category} from ${name}`.slice(0, 150);

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify({
      sender: { email: env.BREVO_SENDER, name: env.BREVO_SENDER_NAME || "TextNexus Feedback" },
      replyTo: { email, name },
      to: [{ email: to, name: "TextNexus" }],
      subject,
      htmlContent: feedbackHtml({ name, email, category, message, page, submittedAt, ip, userAgent }),
      textContent: [
        `New ${category} feedback from ${name} <${email}>`,
        `Page: ${page || "—"}`,
        `Sent: ${submittedAt}`,
        "",
        message
      ].join("\n"),
      tags: ["feedback", category.toLowerCase()]
    })
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    return json({ error: result?.message || `Brevo rejected the send (${res.status}).` }, 502);
  }
  return json({ ok: true, messageId: result.messageId || null });
}

export async function onRequestGet() {
  return json({ error: "POST only." }, 405);
}
