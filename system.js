/*
 * Nexus system status banner.
 *
 * Reads `system` from the Realtime Database and paints a slim banner when the
 * workspace is in maintenance or when an announcement is switched on.
 * The node is world-readable by design (see database.rules.json) so this works
 * before anyone signs in.
 */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
    authDomain: "nexus-web-development-official.firebaseapp.com",
    projectId: "nexus-web-development-official",
    databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com"
};

const TONES = {
    info:    { bg: "rgba(127, 168, 201, 0.14)", border: "rgba(127, 168, 201, 0.45)", dot: "#7fa8c9" },
    warning: { bg: "rgba(240, 208, 138, 0.14)", border: "rgba(240, 208, 138, 0.48)", dot: "#f0d08a" },
    danger:  { bg: "rgba(200, 69, 58, 0.16)",   border: "rgba(200, 69, 58, 0.5)",    dot: "#e2564a" }
};

const STYLE_ID = "nexus-system-style";
const BAR_ID = "nexus-system-banner";

function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        #${BAR_ID} {
            position: sticky;
            top: 0;
            z-index: 2147483000;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 18px;
            font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
            font-size: 12.5px;
            line-height: 1.5;
            color: #eef4ff;
            background: #0b1220;
            border-bottom: 1px solid transparent;
            backdrop-filter: blur(8px);
        }
        #${BAR_ID}[hidden] { display: none; }
        #${BAR_ID} .nx-sys-dot {
            width: 7px;
            height: 7px;
            border-radius: 999px;
            flex: 0 0 auto;
            box-shadow: 0 0 8px currentColor;
        }
        #${BAR_ID} .nx-sys-text { flex: 1 1 auto; min-width: 0; }
        #${BAR_ID} .nx-sys-tag {
            flex: 0 0 auto;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: 999px;
            border: 1px solid currentColor;
            opacity: 0.85;
        }
        @media (max-width: 560px) {
            #${BAR_ID} { font-size: 11.5px; padding: 8px 12px; }
            #${BAR_ID} .nx-sys-tag { display: none; }
        }
    `;
    document.head.appendChild(style);
}

function ensureBar() {
    let bar = document.getElementById(BAR_ID);
    if (bar) return bar;

    bar = document.createElement("div");
    bar.id = BAR_ID;
    bar.setAttribute("role", "status");
    bar.setAttribute("aria-live", "polite");
    bar.hidden = true;

    const dot = document.createElement("span");
    dot.className = "nx-sys-dot";

    const text = document.createElement("span");
    text.className = "nx-sys-text";

    const tag = document.createElement("span");
    tag.className = "nx-sys-tag";

    bar.append(dot, text, tag);
    document.body.insertBefore(bar, document.body.firstChild);
    return bar;
}

function paint(state) {
    const bar = ensureBar();
    const status = String(state?.status || (state?.maintenance ? "maintenance" : "operational"));
    const down = state?.maintenance === true || status === "maintenance" || status === "offline";
    const banner = state?.banner || {};
    const announce = banner.enabled === true;

    document.documentElement.dataset.systemStatus = status;

    if (!down && !announce) {
        bar.hidden = true;
        return;
    }

    const tone = TONES[(down ? "danger" : banner.tone) || "info"] || TONES.info;
    const fallback = down
        ? "Nexus is in maintenance right now. Some parts of the workspace may not respond."
        : "Heads up from the Nexus team.";

    bar.style.background = tone.bg;
    bar.style.borderBottomColor = tone.border;
    bar.querySelector(".nx-sys-dot").style.background = tone.dot;
    bar.querySelector(".nx-sys-dot").style.color = tone.dot;
    bar.querySelector(".nx-sys-text").textContent =
        (down ? state?.message : banner.message) || fallback;
    const tag = bar.querySelector(".nx-sys-tag");
    tag.textContent = down ? "Maintenance" : (banner.tone === "danger" ? "Important" : "Notice");
    tag.style.color = tone.dot;
    bar.hidden = false;
}

// The workspace shell frames pages in an iframe; only the top document paints
// the banner, otherwise it would appear twice.
if (window.top === window.self) {
    injectStyle();
    try {
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const db = getDatabase(app);
        onValue(ref(db, "system"), (snap) => {
            const state = snap.val() || {};
            window.nexusSystem = state;
            paint(state);
        }, (error) => {
            console.warn("Nexus system status unavailable:", error?.code || error?.message);
        });
    } catch (error) {
        console.warn("Nexus system status could not start:", error?.message);
    }
}
