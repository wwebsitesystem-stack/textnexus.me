
        // Open a route in the Nexus shell when embedded, otherwise navigate directly.
        window.openInShell = function (event, route) {
            const shell = window.parent;
            if (shell && shell !== window && typeof shell.loadRoute === 'function') {
                shell.loadRoute(route);
                event.preventDefault();
                return false;
            }
            return true;
        };

        // Firebase is only needed for the announcement bar and optional theme, so load it after paint.
        function afterPaint(fn) {
            if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1500 });
            else setTimeout(fn, 300);
        }

        afterPaint(async () => {
            try {
                const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js');
                const { getDatabase, ref, onValue } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js');
                const app = getApps().length ? getApps()[0] : initializeApp({
                    apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
                    authDomain: "nexus-web-development-official.firebaseapp.com",
                    projectId: "nexus-web-development-official",
                    databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com"
                });
                const db = getDatabase(app);

                const themeStylesheet = document.getElementById('theme-stylesheet');
                if (themeStylesheet) {
                    onValue(ref(db, 'system/theme'), (snapshot) => {
                        const themeVal = snapshot.val();
                        if (themeVal && themeVal !== 'default' && themeVal !== 'none') {
                            let themePath = String(themeVal).trim();
                            if (!themePath.endsWith('.css')) themePath = `themes/${themePath}.css`;
                            else if (!themePath.startsWith('themes/')) themePath = `themes/${themePath}`;
                            themeStylesheet.href = themePath;
                        }
                    });
                }
            } catch { /* rules unpublished or offline: the static page is complete without this */ }
        });

        if (localStorage.getItem('nexus-brand-color')) {
            document.documentElement.style.setProperty('--brand-color', localStorage.getItem('nexus-brand-color'));
        }
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'update-theme') {
                document.documentElement.style.setProperty('--brand-color', event.data.color);
            }
        });
    