
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
    import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
    import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

    const firebaseConfig = {
      apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
      authDomain: "nexus-web-development-official.firebaseapp.com",
      projectId: "nexus-web-development-official",
      databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase(app);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const googleBtn = document.getElementById("googleBtn");
    const msgEl = document.getElementById("msg");
    const msg = (text, kind = "") => { msgEl.textContent = text; msgEl.className = kind; };
    let redirecting = false;

    function friendly(error) {
      const code = error?.code || "";
      if (code.includes("popup-closed") || code.includes("cancelled-popup-request")) return "Google sign-in was closed.";
      if (code.includes("popup-blocked")) return "Allow pop-ups, then try Google sign-in again.";
      if (code.includes("redirect-cancelled")) return "Google sign-in was cancelled.";
      if (code.includes("web-storage-unsupported")) return "Your browser is blocking the storage needed for sign-in. Allow cookies and try again.";
      if (code.includes("unauthorized-domain")) return "This domain is not authorized for Google sign-in in Firebase.";
      if (code.includes("operation-not-allowed")) return "Google sign-in is not enabled in the Firebase console.";
      if (code.includes("network-request-failed")) return "Network error. Try Google sign-in again.";
      return error?.message || "Google sign-in failed. Try again.";
    }

    async function saveProfile(user) {
      try {
        await set(ref(db, `users/${user.uid}`), {
          uid: user.uid,
          email: user.email || "",
          name: user.displayName || "",
          provider: "google",
          createdAt: Date.now()
        });
      } catch {
        // The user is authenticated even if the Realtime Database rules are not published yet.
      }
    }

    function enterNexus(user) {
      if (redirecting) return;
      redirecting = true;
      const name = user.displayName || user.email || "your Google account";
      msg(`Signed in as ${name}. Opening TextNexus...`, "ok");
      setTimeout(() => location.assign("/index.html"), 700);
    }

    googleBtn.addEventListener("click", async () => {
      googleBtn.disabled = true;
      msg("Redirecting to Google...");
      try {
        // Redirect keeps Google sign-in in the first-party context, avoiding
        // the blank popup that appears when a browser blocks third-party storage.
        await signInWithRedirect(auth, provider);
      } catch (error) {
        msg(friendly(error), "err");
        googleBtn.disabled = false;
      }
    });

    onAuthStateChanged(auth, (user) => {
      if (user) {
        saveProfile(user);
        enterNexus(user);
      } else {
        googleBtn.disabled = false;
      }
    });

    // Firebase processes the redirect on this page load. Surface any OAuth or
    // authorized-domain error instead of silently returning to a signed-out page.
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return;
        await saveProfile(result.user);
        enterNexus(result.user);
      })
      .catch((error) => {
        msg(friendly(error), "err");
        googleBtn.disabled = false;
      });
  