import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  sendPasswordResetEmail, signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getDatabase, ref, onValue, set, update, remove, push
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
  authDomain: "nexus-web-development-official.firebaseapp.com",
  projectId: "nexus-web-development-official",
  databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com"
};

/**
 * Owner allowlists. These are mirrored in database.rules.json — the rules are
 * what actually enforce access; this map only decides which panel to show.
 */
export const TENANTS = {
  textnexus: {
    label: "TextNexus",
    owners: ["brodywilliams0226@gmail.com"],
    hosts: ["textnexus.me", "www.textnexus.me"]
  },
  leo: {
    label: "Leo",
    owners: ["lrosasaamot001@stpaul.k12.mn.us"],
    hosts: ["leo.textnexus.me"]
  },
  javier: {
    label: "Javier",
    owners: ["jcruz016@stpaul.k12.mn.us"],
    hosts: ["javier.textnexus.me"]
  }
};

function detectTenant() {
  const fromBody = document.body.dataset.tenant;
  if (fromBody && TENANTS[fromBody]) return fromBody;
  const host = location.hostname.toLowerCase();
  for (const [id, t] of Object.entries(TENANTS)) {
    if (t.hosts.includes(host)) return id;
  }
  return "textnexus";
}

const tenantId = detectTenant();
const tenant = TENANTS[tenantId];
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getDatabase(app);

const $ = (sel) => document.querySelector(sel);
const el = (tag, props = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    node.append(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
};

function setStatus(message, kind = "") {
  const box = $("#status");
  if (!box) return;
  box.textContent = message;
  box.className = kind;
}

let currentUser = null;
let memberRows = [];

/* ---------------------------------------------------------------- shell */

function renderShell() {
  const root = $("#app");
  root.textContent = "";

  const header = el("header", { class: "bar" },
    el("div", { class: "brand" },
      el("img", { src: "https://textnexus.me/logo.svg", alt: "" }),
      el("span", { text: "Nexus Admin" }),
      el("span", { class: "tenant-tag", text: tenant.label })
    ),
    el("div", { class: "who" }, el("span", { id: "whoami", text: "signed out" }),
      el("button", { class: "ghost", id: "signout", text: "Sign out", style: "margin-left:10px" })
    )
  );

  const gate = el("form", {
    class: "gate card",
    id: "gate",
    onsubmit: (event) => { event.preventDefault(); signIn(); }
  },
    el("h1", { text: `${tenant.label} admin` }),
    el("p", { text: "Sign in with the owner account for this panel. Access is enforced by the database rules, not by this page." }),
    el("label", { for: "email", text: "Email" }),
    el("input", { type: "email", id: "email", autocomplete: "username" }),
    el("label", { for: "password", text: "Password" }),
    el("input", { type: "password", id: "password", autocomplete: "current-password" }),
    el("div", { class: "row end", style: "margin-top:14px" },
      el("button", { class: "ghost", id: "reset", text: "Reset password" }),
      el("button", { class: "primary", id: "signin", type: "submit", text: "Sign in" })
    ),
    el("p", { class: "note", style: "margin-top:16px" },
      "No account? ", el("a", { href: "/signup.html", text: "Create one" }), ".")
  );

  const panel = el("div", { id: "panel", class: "hidden" });
  // Single status element shared by the sign-in gate, the panel and every action.
  const status = el("div", { id: "status", class: "statusbar" });
  root.append(header, gate, status, panel);

  $("#signout").addEventListener("click", () => signOut(auth));
  $("#reset").addEventListener("click", async () => {
    const email = $("#email").value.trim();
    if (!email) return setStatus("Enter your email first.", "err");
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("Password reset email sent.", "ok");
    } catch (err) {
      setStatus(err.message, "err");
    }
  });
}

async function signIn() {
  const email = $("#email").value.trim();
  const password = $("#password").value;
  if (!email || !password) return setStatus("Email and password are required.", "err");
  setStatus("Signing in…");
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    setStatus(friendlyAuthError(err), "err");
  }
}

function friendlyAuthError(err) {
  const code = err?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "Wrong email or password.";
  if (code.includes("user-not-found")) return "No account with that email.";
  if (code.includes("too-many-requests")) return "Too many attempts. Try again shortly.";
  if (code.includes("network")) return "Network error — check your connection.";
  return err?.message || "Sign-in failed.";
}

/* ------------------------------------------------------------- the panel */

function renderPanelFor(user) {
  $("#gate").classList.add("hidden");
  const panel = $("#panel");
  panel.classList.remove("hidden");
  panel.textContent = "";
  $("#whoami").textContent = user.email || "";
  $("#signout").classList.remove("hidden");

  panel.append(
    membersCard(user),
    announcementCard(user),
    auditCard()
  );
}

function membersCard(user) {
  const tbody = el("tbody");
  const card = el("section", { class: "card" },
    el("h2", { text: "Accounts" }),
    el("p", { class: "hint", text: "Everyone who created an account under this panel. Removing access revokes their membership and clears their profile data; the Firebase Auth login itself can only be deleted from the Firebase console." }),
    el("table", {},
      el("thead", {}, el("tr", {},
        el("th", { text: "Email" }),
        el("th", { text: "Name" }),
        el("th", { text: "Status" }),
        el("th", { text: "Created" }),
        el("th", { text: "" })
      )),
      tbody
    )
  );

  const render = () => {
    tbody.textContent = "";
    const rows = Object.entries(memberRows).sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));
    if (!rows.length) {
      tbody.append(el("tr", {}, el("td", { colspan: "5" },
        el("span", { class: "note", text: "No accounts yet. New sign-ups appear here automatically." }))));
      return;
    }
    for (const [uid, m] of rows) {
      const status = m.status === "removed" ? "removed" : "active";
      tbody.append(el("tr", {},
        el("td", { text: m.email || "(no email)" }),
        el("td", { text: m.name || "—" }),
        el("td", {}, el("span", { class: `pill ${status}`, text: status })),
        el("td", { class: "note", text: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—" }),
        el("td", {},
          el("div", { class: "row" },
            el("button", {
              class: "ghost",
              text: "Email",
              onclick: () => emailMember(user, m)
            }),
            status === "active"
              ? el("button", { class: "danger", text: "Remove", onclick: () => removeMember(user, uid, m) })
              : el("button", { class: "ghost", text: "Restore", onclick: () => restoreMember(user, uid, m) })
          ))
      ));
    }
  };

  onValue(ref(db, `tenants/${tenantId}/members`), (snap) => {
    memberRows = snap.val() || {};
    render();
  }, (err) => {
    setStatus(`Cannot read accounts: ${err.message}. If this is the first deploy, database.rules.json has not been published yet.`, "err");
  });

  return card;
}

async function audit(user, action, extra = {}) {
  try {
    await set(push(ref(db, `tenants/${tenantId}/audit`)), {
      actorEmail: user.email,
      action,
      timestamp: Date.now(),
      ...extra
    });
  } catch {
    /* audit is best-effort; never block the action */
  }
}

async function removeMember(user, uid, member) {
  if (!confirm(`Remove access for ${member.email}?`)) return;
  try {
    await update(ref(db, `tenants/${tenantId}/members/${uid}`), {
      status: "removed",
      removedAt: Date.now(),
      removedBy: user.email
    });
    // Best-effort profile cleanup. These paths are owner-writable by rule.
    for (const path of [`nexus/users/${uid}`, `textnexus/users/${uid}`]) {
      try { await remove(ref(db, path)); } catch { /* tenant owners may not own these roots */ }
    }
    await audit(user, "member.remove", { target: member.email, uid });
    setStatus(`Access removed for ${member.email}.`, "ok");
  } catch (err) {
    setStatus(`Could not remove: ${err.message}`, "err");
  }
}

async function restoreMember(user, uid, member) {
  try {
    await update(ref(db, `tenants/${tenantId}/members/${uid}`), {
      status: "active",
      restoredAt: Date.now(),
      restoredBy: user.email
    });
    await audit(user, "member.restore", { target: member.email, uid });
    setStatus(`Access restored for ${member.email}.`, "ok");
  } catch (err) {
    setStatus(`Could not restore: ${err.message}`, "err");
  }
}

async function emailMember(user, member) {
  const subject = prompt(`Subject for the email to ${member.email}:`, "Update from TextNexus");
  if (!subject) return;
  const body = prompt("Message body:", "");
  if (!body) return;
  setStatus("Sending email…");
  try {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, action: "message", tenant: tenantId, to: member.email, subject, body })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    await audit(user, "member.email", { target: member.email, subject });
    setStatus(`Email sent to ${member.email}.`, "ok");
  } catch (err) {
    setStatus(`Email failed: ${err.message}. The Brevo key is configured on Cloudflare Pages, so this only works once the site is deployed there.`, "err");
  }
}

function announcementCard(user) {
  const text = el("input", { type: "text", id: "annText", maxlength: "200" });
  const link = el("input", { type: "text", id: "annLink", placeholder: "/updates.html" });
  const headline = el("input", { type: "text", id: "siteHeadline", placeholder: "Private chat, file sharing & AI sites" });
  const toggle = el("input", { type: "text", id: "annEnabled", placeholder: "true or false" });

  const card = el("section", { class: "card" },
    el("h2", { text: "Site content" }),
    el("p", { class: "hint", text: "The announcement bar at the top of the public site reads these values. Saving needs the published rules." }),
    el("label", { text: "Announcement text" }),
    text,
    el("label", { text: "Announcement link" }),
    link,
    el("label", { text: "Show the announcement bar (true / false)" }),
    toggle,
    el("label", { text: "Homepage headline" }),
    headline,
    el("div", { class: "row end", style: "margin-top:16px" },
      el("button", { class: "primary", id: "saveSite", text: "Save" })
    )
  );

  onValue(ref(db, `tenants/${tenantId}/site`), (snap) => {
    const site = snap.val() || {};
    const ann = site.announcement || {};
    if (!text.value) text.value = ann.text || "";
    if (!link.value) link.value = ann.link || "";
    if (!toggle.value) toggle.value = String(ann.enabled !== false);
    if (!headline.value) headline.value = site.headline || "";
  }, () => { /* unreadable site node: leave the form empty */ });

  card.querySelector("#saveSite").addEventListener("click", async () => {
    try {
      await set(ref(db, `tenants/${tenantId}/site/announcement`), {
        enabled: String(toggle.value).toLowerCase() !== "false",
        text: text.value.trim().slice(0, 200),
        link: link.value.trim().slice(0, 300)
      });
      if (headline.value.trim()) {
        await set(ref(db, `tenants/${tenantId}/site/headline`), headline.value.trim().slice(0, 160));
      }
      await audit(user, "site.save");
      setStatus("Saved.", "ok");
    } catch (err) {
      setStatus(`Save failed: ${err.message}`, "err");
    }
  });

  return card;
}

function auditCard() {
  const list = el("div", { class: "log" });
  onValue(ref(db, `tenants/${tenantId}/audit`), (snap) => {
    const rows = Object.entries(snap.val() || {}).sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0)).slice(0, 40);
    list.textContent = "";
    if (!rows.length) {
      list.append(el("div", { text: "No activity recorded yet." }));
      return;
    }
    for (const [, r] of rows) {
      list.append(el("div", {},
        el("span", { class: "t", text: new Date(r.timestamp || 0).toLocaleString() }),
        "  ", r.action || "?", "  ", r.actorEmail || "", r.target ? `  → ${r.target}` : ""
      ));
    }
  }, () => { list.textContent = "Audit log unavailable."; });

  return el("section", { class: "card" },
    el("h2", { text: "Activity" }),
    el("p", { class: "hint", text: "Newest first, last 40 actions on this panel." }),
    list
  );
}

/* -------------------------------------------------------------- lifecycle */

renderShell();

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!user) {
    $("#panel").classList.add("hidden");
    $("#gate").classList.remove("hidden");
    $("#whoami").textContent = "signed out";
    $("#signout").classList.add("hidden");
    return;
  }
  const authorized = (user.email || "").toLowerCase() && tenant.owners.includes((user.email || "").toLowerCase());
  if (!authorized) {
    $("#gate").classList.remove("hidden");
    $("#panel").classList.add("hidden");
    $("#whoami").textContent = user.email || "";
    setStatus(`${user.email} is not an owner of the ${tenant.label} panel.`, "err");
    return;
  }
  renderPanelFor(user);
});
