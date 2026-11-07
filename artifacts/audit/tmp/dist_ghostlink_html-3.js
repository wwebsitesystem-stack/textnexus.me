
        const DEFAULT_WORDS = ["GhostLink.", "Knowhere.", "modularity.", "blueeeee.", "anonymity.", "the OASIS.", "freedom.", "the hub ;P.", "liminality.", "simulation."];
        let words = JSON.parse(localStorage.getItem('ghostlink_words')) || DEFAULT_WORDS.slice();

        const tabPresets = [
            { name: "Google",       title: "Google",                          icon: "https://www.google.com/s2/favicons?domain=google.com&sz=32" },
            { name: "Drive",        title: "My Drive - Google Drive",         icon: "https://www.google.com/s2/favicons?domain=drive.google.com&sz=32" },
            { name: "Classroom",    title: "Classes",                         icon: "https://www.google.com/s2/favicons?domain=classroom.google.com&sz=32" },
            { name: "Blooket",      title: "Blooket",                         icon: "https://www.google.com/s2/favicons?domain=blooket.com&sz=32" },
            { name: "Desmos",       title: "Desmos | Graphing Calculator",    icon: "https://www.google.com/s2/favicons?domain=desmos.com&sz=32" },
            { name: "Canvas",       title: "Dashboard",                       icon: "https://www.google.com/s2/favicons?domain=instructure.com&sz=32" },
            { name: "Khan Academy", title: "Khan Academy",                    icon: "https://www.google.com/s2/favicons?domain=khanacademy.org&sz=32" },
            { name: "Wikipedia",    title: "Wikipedia, the free encyclopedia",icon: "https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32" },
            { name: "Docs",         title: "Google Docs",                     icon: "https://www.google.com/s2/favicons?domain=docs.google.com&sz=32" },
            { name: "Edpuzzle",     title: "Edpuzzle",                        icon: "https://www.google.com/s2/favicons?domain=edpuzzle.com&sz=32" },
            { name: "about:blank",  title: "about:blank",                     icon: "" }
        ];

        const svgLibrary = [
            `<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
            `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
            `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
            `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10l4.5 4.5"/><circle cx="12" cy="12" r="10"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
        ];

        // --- SYSTEM PAGE DATA ---
        const systemPages = [
            { id: 'home', name: 'Home', svg: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
            { id: 'games', name: 'Games', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 7C4 7 2 8.5 2 11c0 2 .5 3.8 1.5 5.2C4.4 17.5 5.3 18 6.2 18c.7 0 1.3-.3 2.1-.8l.8-.6C9.7 16.2 10.8 16 12 16s2.3.2 2.9.6l.8.6c.8.5 1.4.8 2.1.8.9 0 1.8-.5 2.7-1.8C21.5 14.8 22 13 22 11c0-2.5-2-4-3.5-4H5.5z"/><path d="M8.5 7V5.5A.5.5 0 0 1 9 5h6a.5.5 0 0 1 .5.5V7"/><line x1="7" y1="10.5" x2="7" y2="13.5"/><line x1="5.5" y1="12" x2="8.5" y2="12"/><circle cx="15.5" cy="10.5" r=".75" fill="currentColor"/><circle cx="17.5" cy="12.5" r=".75" fill="currentColor"/></svg>` },
            { id: 'ai', name: 'AI Terminal', svg: `<svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><line x1="10" y1="9" x2="10" y2="15"/><line x1="14" y1="9" x2="14" y2="15"/></svg>` },
            { id: 'lucide', name: 'Lucide', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg>` },
            { id: 'proxy', name: 'Proxy', svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>` },
            { id: 'customapps', name: 'Custom Apps', svg: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M3 14h7v7H3z"/></svg>` },
            { id: 'marketplace', name: 'Marketplace', svg: `<svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>` },
            { id: 'settings', name: 'Settings', svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>` }
        ];

        let customApps = JSON.parse(localStorage.getItem('ghostlink_apps')) || [];
        let marketplaceApps = [];
        let editingAppId = null;
        let shortcuts = JSON.parse(localStorage.getItem('ghostlink_shortcuts')) || { home: 'H', games: 'G', panic: 'P', custom: [] };
        if (!shortcuts.custom) shortcuts.custom = [];
        
        let navOrder = JSON.parse(localStorage.getItem('ghostlink_nav_order')) || {
            top: ['home', 'games', 'ai', 'lucide', 'proxy'],
            bottom: ['customapps', 'marketplace', 'settings']
        };

        navOrder.top = navOrder.top.filter(id => id !== 'gnmath');
        navOrder.bottom = navOrder.bottom.filter(id => id !== 'gnmath');

        if (!navOrder.top.includes('lucide') && !navOrder.bottom.includes('lucide')) {
            navOrder.top.splice(3, 0, 'lucide');
        }

        // --- SUPABASE SETUP 
        const SUPABASE_URL = 'https://npvjxyxnmdcncupbwdsx.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdmp4eXhubWRjbmN1cGJ3ZHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTU0MjcsImV4cCI6MjA4Mjg3MTQyN30.hZhxWo1iR8O0r66vIeElcsPy1PljtpJ_dEbAOvhrr1Q';

        function getSupabaseClient() {
            if (!window.supabase) { console.error('Supabase not loaded'); return null; }
            if (!getSupabaseClient._client) {
                getSupabaseClient._client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            }
            return getSupabaseClient._client;
        }

        async function initTotalVisits() {
            const client = getSupabaseClient();
            if (!client) return;
            const el = document.getElementById('total-visits');
            if (!el) return;
            try {
                const { data, error } = await client.rpc('increment_views');
                if (error) { console.error('Views RPC error:', error); el.textContent = ''; return; }
                el.textContent = Number(data).toLocaleString() + ' visits';
            } catch(e) { console.error('initTotalVisits failed:', e); }
        }

        function initOnlineUsers() {
            const client = getSupabaseClient();
            if (!client) return;
            const onlineEl = document.getElementById('online-count');
            const sessionKey = 'gl_' + Math.random().toString(36).substr(2, 9);

            const channel = client.channel('ghostlink-online', {
                config: { presence: { key: sessionKey } }
            });

            channel.on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const count = Object.keys(state).length;
                if (onlineEl) onlineEl.textContent = count.toLocaleString();
            });

            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString() });
                    // sync event may have already fired before track — read state directly
                    setTimeout(() => {
                        const state = channel.presenceState();
                        const count = Object.keys(state).length;
                        if (onlineEl) onlineEl.textContent = count.toLocaleString();
                    }, 500);
                }
            });
        }

        // --- NAV ---
        async function nav(page, appData = null) {
            // Close any open game when navigating
            const _zv = document.getElementById('zoneViewer');
            if (_zv && _zv.style.display === 'flex') closeZone();

            const frame = document.getElementById('app-frame');
            const home = document.getElementById('home-content');
            const settings = document.getElementById('settings');
            const customAppsView = document.getElementById('customapps');
            const marketplaceView = document.getElementById('marketplace');
            const gamesView = document.getElementById('games-content');
            const proxyView = document.getElementById('proxy-content');
            const achievementsView = document.getElementById('achievements-content');
            const hud = document.getElementById('home-hud');
            const socialHud = document.getElementById('social-hud');

            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            
            if (appData) {
                const navItem = document.getElementById(`nav-app-${appData.id}`);
                if (navItem) navItem.classList.add('active');
            } else {
                const navItemId = 'nav-' + page; 
                const navItem = document.getElementById(navItemId);
                if (navItem) navItem.classList.add('active');
            }

            [home, settings, customAppsView, marketplaceView, gamesView, proxyView, achievementsView, frame, hud, socialHud].forEach(el => {
                if (el) el.style.display = 'none';
            });

            const legalFooter = document.getElementById('legal-footer');
            if (legalFooter) legalFooter.style.display = page === 'home' ? 'block' : 'none';

            if (page === 'home') {
                home.style.display = 'flex';
                hud.style.display = 'block';
                socialHud.style.display = 'block';
            } else if (page === 'settings') {
                settings.style.display = 'block';
                renderWordsEditor();
                renderCustomShortcuts();
            } else if (page === 'customapps') {
                customAppsView.style.display = 'block'; 
                renderAppList();
            } else if (page === 'marketplace') {
                marketplaceView.style.display = 'block';
                renderMarketplace(marketplaceApps);
                fetchMarketplace();
            } else if (page === 'games') {
                gamesView.style.display = 'flex';
                if (!gamesLoaded) {
                    gamesLoaded = true;
                    gamesListZones();
                }
            } else if (page === 'run_custom' && appData) {
                loadIntoFrame(appData.content);
            } else if (page === 'proxy') {
                proxyView.style.display = 'flex';
                if (!proxyBrowserInitialized) {
                    proxyBrowserInitialized = true;
                    proxyInit();
                }
            } else if (page === 'achievements') {
                achievementsView.style.display = 'block';
            } else if (page === 'ai') {
                const baseUrl = 'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/src/';
                const fileMap = { 'ai': 'ai.html' };
                sendThemeToIframe();
                loadIntoFrame(`${baseUrl}${fileMap[page]}?v=${new Date().getTime()}`);
                sendThemeToIframe();
            } else if (page === 'lucide') {
                loadIntoFrame('Lucide/index.html');
            }
        }

        // --- MARKETPLACE SYSTEM ---
        async function fetchMarketplace() {
            const container = document.getElementById('market-apps');
            if (marketplaceApps.length > 0) return;

            try {
                const apiURL = "https://api.github.com/repos/virtuan4-max/ghostlink-apps/contents/apps";
                const response = await fetch(apiURL);
                const files = await response.json();

                const fetchPromises = files
                    .filter(file => file.name.endsWith('.json'))
                    .map(file => fetch(file.download_url).then(res => res.json()));

                marketplaceApps = await Promise.all(fetchPromises);
                renderMarketplace(marketplaceApps);
            } catch (err) {
                console.error("Marketplace Load Error:", err);
                container.innerHTML = `<p style="color:#ff4444">Failed to connect to the registry. Check your connection.</p>`;
            }
        }

        function renderMarketplace(apps) {
            const container = document.getElementById('market-apps');
            if (!apps || apps.length === 0) return;
            
            container.innerHTML = '';
            apps.forEach((app, index) => {
                const isInstalled = customApps.some(a => a.name === app.name);
                const card = document.createElement('div');
                card.className = 'app-card';
                card.style.animationDelay = `${index * 0.05}s`;
                card.innerHTML = `
                    <div class="app-card-header">
                        <div class="app-card-icon">${app.svg}</div>
                        <div class="app-card-title">${app.name}</div>
                    </div>
                    <div class="app-card-desc">${app.description || 'No description provided.'}</div>
                    <p style="font-size:10px; color:var(--accent)">by ${app.author || 'Anonymous'}</p>
                    <div class="app-actions">
                        ${isInstalled ? 
                            `<button class="btn-small installed">INSTALLED</button>` : 
                            `<button class="btn-small run" onclick='installFromMarket("${app.name}")'>INSTALL</button>`
                        }
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function filterMarketplace() {
            const query = document.getElementById('market-search').value.toLowerCase();
            const filtered = marketplaceApps.filter(app => 
                app.name.toLowerCase().includes(query) || 
                app.description.toLowerCase().includes(query)
            );
            renderMarketplace(filtered);
        }

        function installFromMarket(appName) {
            const app = marketplaceApps.find(a => a.name === appName);
            if (!app) return;

            if (app.name === 'GhostLink^2' && window.__glAch) window.__glAch.onRussianDolls();

            const newApp = {
                id: 'app_' + Date.now(),
                name: app.name,
                content: app.url,
                svg: app.svg,
                pinned: true 
            };

            customApps.push(newApp);
            localStorage.setItem('ghostlink_apps', JSON.stringify(customApps));
            
            navOrder.top.push(`app_${newApp.id}`);
            localStorage.setItem('ghostlink_nav_order', JSON.stringify(navOrder));

            renderMarketplace(marketplaceApps);
            updateSidebar();
            nav('run_custom', newApp);
        }

        // --- CUSTOM APP SYSTEM ---
        function renderAppList() {
            const container = document.getElementById('installed-apps');
            container.innerHTML = '';
            customApps.forEach(app => {
                const card = document.createElement('div');
                card.className = 'app-card';
                card.innerHTML = `
                    <div class="app-card-header">
                        <div class="app-card-icon">${app.svg}</div>
                        <div class="app-card-title">${app.name}</div>
                    </div>
                    <div class="app-actions">
                        <button class="btn-small run" onclick='runSavedApp("${app.id}")'>LAUNCH</button>
                        <button class="btn-small" onclick='editApp("${app.id}")'>EDIT</button>
                        <button class="btn-small" onclick="deleteApp('${app.id}')" style="color:#ff4444">REMOVE</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function runSavedApp(id) {
            const app = customApps.find(a => a.id === id);
            if (app) nav('run_custom', app);
        }

        function editApp(id) {
            const app = customApps.find(a => a.id === id);
            if (!app) return;

            editingAppId = id;
            document.getElementById('new-app-name').value = app.name;
            document.getElementById('new-app-html').value = app.content;
            document.getElementById('new-app-svg').value = app.svg;
            document.getElementById('new-app-pin').checked = app.pinned;
            
            document.getElementById('app-editor-title').innerText = "Edit App: " + app.name;
            document.getElementById('save-app-btn').innerText = "UPDATE APP";
            document.getElementById('cancel-edit-btn').style.display = "block";

            document.querySelectorAll('.icon-opt').forEach(opt => {
                if(opt.innerHTML === app.svg) opt.classList.add('selected');
                else opt.classList.remove('selected');
            });

            document.getElementById('customapps').scrollTo({ top: 0, behavior: 'smooth' });
        }

        function clearAppForm() {
            editingAppId = null;
            document.getElementById('new-app-name').value = '';
            document.getElementById('new-app-html').value = '';
            document.getElementById('new-app-svg').value = '';
            document.getElementById('new-app-pin').checked = false;
            document.getElementById('name-error').style.display = 'none';
            document.getElementById('app-editor-title').innerText = "Create New App";
            document.getElementById('save-app-btn').innerText = "INSTALL APP";
            document.getElementById('cancel-edit-btn').style.display = "none";
            document.querySelectorAll('.icon-opt').forEach(o => o.classList.remove('selected'));
        }

        function saveNewApp() {
            const name = document.getElementById('new-app-name').value.trim();
            const content = document.getElementById('new-app-html').value;
            const svg = document.getElementById('new-app-svg').value || svgLibrary[0];
            const pinned = document.getElementById('new-app-pin').checked;
            const errorEl = document.getElementById('name-error');

            if (!name || !content) return;

            const isDuplicate = customApps.some(app => 
                app.name.toLowerCase() === name.toLowerCase() && app.id !== editingAppId
            );

            if (isDuplicate) {
                errorEl.style.display = 'block';
                return;
            } else {
                errorEl.style.display = 'none';
            }

            let savedApp;
            if (editingAppId) {
                const index = customApps.findIndex(a => a.id === editingAppId);
                const wasPinned = customApps[index].pinned;
                customApps[index] = { ...customApps[index], name, content, svg, pinned };
                savedApp = customApps[index];
                
                if (pinned && !wasPinned) {
                    if (!navOrder.top.includes(`app_${savedApp.id}`)) {
                        navOrder.top.push(`app_${savedApp.id}`);
                    }
                } 
                else if (!pinned && wasPinned) {
                    navOrder.top = navOrder.top.filter(i => i !== `app_${savedApp.id}`);
                    navOrder.bottom = navOrder.bottom.filter(i => i !== `app_${savedApp.id}`);
                }
            } else {
                savedApp = { id: 'app_' + Date.now(), name, content, svg, pinned };
                customApps.push(savedApp);
                
                if (pinned) {
                    navOrder.top.push(`app_${savedApp.id}`);
                }
            }

            localStorage.setItem('ghostlink_apps', JSON.stringify(customApps));
            localStorage.setItem('ghostlink_nav_order', JSON.stringify(navOrder));
            
            updateSidebar();
            clearAppForm();
            renderAppList();
            renderMarketplace(marketplaceApps);
            nav('run_custom', savedApp);
        }

        function deleteApp(id) {
            {
                customApps = customApps.filter(a => a.id !== id);
                navOrder.top = navOrder.top.filter(i => i !== `app_${id}`);
                navOrder.bottom = navOrder.bottom.filter(i => i !== `app_${id}`);
                localStorage.setItem('ghostlink_apps', JSON.stringify(customApps));
                localStorage.setItem('ghostlink_nav_order', JSON.stringify(navOrder));
                if (editingAppId === id) clearAppForm();
                renderAppList();
                renderMarketplace(marketplaceApps);
                updateSidebar();
            }
        }

        // --- SIDEBAR DRAG AND DROP ---
        function updateSidebar() {
            const topGroup = document.getElementById('sidebar-nav-top');
            const bottomGroup = document.getElementById('sidebar-nav-bottom');
            
            topGroup.innerHTML = '';
            bottomGroup.innerHTML = '';

            const createNavItem = (id) => {
                let itemData;
                let isCustom = false;

                if (id.startsWith('app_')) {
                    const appId = id.replace('app_', '');
                    itemData = customApps.find(a => a.id === appId);
                    isCustom = true;
                } else {
                    itemData = systemPages.find(p => p.id === id);
                }

                if (!itemData) return null;

                const div = document.createElement('div');
                div.id = isCustom ? `nav-app-${itemData.id}` : `nav-${itemData.id}`;
                div.className = 'nav-item';
                div.draggable = true;
                div.dataset.id = id;
                div.onclick = () => isCustom ? nav('run_custom', itemData) : nav(itemData.id);
                div.innerHTML = `${itemData.svg}<span>${itemData.name}</span>`;

                div.addEventListener('dragstart', () => div.classList.add('dragging'));
                div.addEventListener('dragend', () => {
                    div.classList.remove('dragging');
                    saveNavOrder();
                });

                return div;
            };

            navOrder.top.forEach(id => {
                const el = createNavItem(id);
                if (el) topGroup.appendChild(el);
            });

            navOrder.bottom.forEach(id => {
                const el = createNavItem(id);
                if (el) bottomGroup.appendChild(el);
            });

            initDragHandlers(topGroup);
            initDragHandlers(bottomGroup);
        }

        function initDragHandlers(container) {
            container.addEventListener('dragover', e => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                const afterElement = getDragAfterElement(container, e.clientY);
                if (afterElement == null) {
                    container.appendChild(dragging);
                } else {
                    container.insertBefore(dragging, afterElement);
                }
            });
        }

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.nav-item:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        function saveNavOrder() {
            const topIds = [...document.querySelectorAll('#sidebar-nav-top .nav-item')].map(el => el.dataset.id);
            const bottomIds = [...document.querySelectorAll('#sidebar-nav-bottom .nav-item')].map(el => el.dataset.id);
            
            navOrder.top = topIds;
            navOrder.bottom = bottomIds;
            localStorage.setItem('ghostlink_nav_order', JSON.stringify(navOrder));
        }

        // --- BACKGROUND SYSTEM ---
        function applyBackground(type, val) {
            const root = document.documentElement;
            const sidebar = document.getElementById('main-sidebar');
            const bgUrlInput = document.getElementById('bg-url');
            const currentImg = bgUrlInput.value;
            const hasImage = currentImg && currentImg !== 'none';
            
            if (type === 'color') {
                root.style.setProperty('--bg', val);
                if (!hasImage) {
                    root.style.setProperty('--sidebar-bg', val);
                    sidebar.style.backdropFilter = "none";
                }
            } else if (type === 'url') {
                const newHasImage = val && val !== 'none';
                root.style.setProperty('--bg-image', newHasImage ? `url(${val})` : 'none');
                
                if (newHasImage) {
                    root.style.setProperty('--sidebar-bg', 'rgba(5, 5, 5, 0.3)');
                    sidebar.style.backdropFilter = "blur(15px) saturate(180%)";
                    root.style.setProperty('--bg-blur', document.getElementById('bg-blur-input').value + 'px');
                    root.style.setProperty('--bg-brightness', document.getElementById('bg-bright-input').value + '%');
                } else {
                    const currentBgColor = document.getElementById('bg-picker').value;
                    root.style.setProperty('--sidebar-bg', currentBgColor);
                    sidebar.style.backdropFilter = "none";
                    root.style.setProperty('--bg-blur', '0px');
                    root.style.setProperty('--bg-brightness', '100%');
                }
            } else if (type === 'blur') {
                if (hasImage) root.style.setProperty('--bg-blur', val + 'px');
            } else if (type === 'brightness') {
                if (hasImage) root.style.setProperty('--bg-brightness', val + '%');
            }
            saveConfig();
            sendThemeToNtTabs();
            if (window.__glAch) {
                if (type === 'color') { window.__glAch.onSettingChanged('bgColor'); window.__glAch.checkColors(); }
                else if (type === 'url') window.__glAch.onSettingChanged('bgUrl');
                else if (type === 'blur') window.__glAch.onSettingChanged('bgBlur');
                else if (type === 'brightness') window.__glAch.onSettingChanged('bgBright');
            }
        }

        function handleBgUpload(input) {
            const file = input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const b64 = e.target.result;
                document.getElementById('bg-url').value = b64;
                applyBackground('url', b64);
            };
            reader.readAsDataURL(file);
        }

        // --- KEYBOARD SHORTCUTS ---
        function getUsedShortcutKeys(excludeAction, excludeCustomIndex) {
            const used = [];
            if (excludeAction !== 'home')  used.push(shortcuts.home);
            if (excludeAction !== 'games') used.push(shortcuts.games);
            if (excludeAction !== 'panic') used.push(shortcuts.panic);
            shortcuts.custom.forEach((sc, i) => {
                if (excludeAction === 'custom' && i === excludeCustomIndex) return;
                used.push(sc.key);
            });
            return used.filter(Boolean).map(k => k.toUpperCase());
        }

        function flashShortcutError(input, msg) {
            input.value = msg || 'TAKEN!';
            input.style.borderColor = '#ff4444';
            input.style.color = '#ff4444';
            setTimeout(() => {
                input.style.borderColor = '';
                input.style.color = '';
                syncShortcutUI();
            }, 1200);
        }

        function captureShortcut(action) {
            const input = document.getElementById(`sc-${action}`);
            input.value = "PRESS KEY...";
            const listener = (e) => {
                e.preventDefault();
                const key = e.key.toUpperCase();
                if (key === "ALT" || key === "CONTROL" || key === "SHIFT" || key === "META") return;
                const used = getUsedShortcutKeys(action, null);
                if (used.includes(key)) {
                    window.removeEventListener('keydown', listener);
                    flashShortcutError(input, 'TAKEN!');
                    return;
                }
                shortcuts[action] = key;
                input.value = key;
                localStorage.setItem('ghostlink_shortcuts', JSON.stringify(shortcuts));
                window.removeEventListener('keydown', listener);
                input.blur();
            };
            window.addEventListener('keydown', listener);
        }

        function resetShortcuts() {
            shortcuts = { home: 'H', games: 'G', panic: 'P', custom: [] };
            localStorage.setItem('ghostlink_shortcuts', JSON.stringify(shortcuts));
            syncShortcutUI();
        }

        function syncShortcutUI() {
            document.getElementById('sc-home').value = shortcuts.home;
            document.getElementById('sc-games').value = shortcuts.games;
            document.getElementById('sc-panic').value = shortcuts.panic;
            renderCustomShortcuts();
        }

        // --- CUSTOM KEYBINDS ---
        function renderCustomShortcuts() {
            const list = document.getElementById('custom-shortcuts-list');
            if (!list) return;
            list.innerHTML = '';
            const pageNames = { home:'Home', games:'Games', ai:'AI Terminal', proxy:'Proxy', customapps:'Custom Apps', marketplace:'Marketplace', settings:'Settings' };
            shortcuts.custom.forEach((sc, i) => {
                const row = document.createElement('div');
                row.className = 'custom-shortcut-row';
                row.innerHTML = `
                    <input type="text" class="shortcut-input" value="${sc.key}" readonly style="width:60px; flex-shrink:0;" onclick="captureCustomShortcutKey(${i})">
                    <span style="flex:1; font-size:0.85rem; color:var(--text-dim)">→ Alt + ${sc.key} opens <strong style="color:white">${pageNames[sc.action] || sc.action}</strong></span>
                    <button class="word-del-btn" onclick="deleteCustomShortcut(${i})">✕</button>
                `;
                list.appendChild(row);
            });
        }

        function captureNewShortcutKey() {
            const input = document.getElementById('new-sc-key');
            input.value = "...";
            const listener = (e) => {
                e.preventDefault();
                const key = e.key.toUpperCase();
                if (key === "ALT" || key === "CONTROL" || key === "SHIFT" || key === "META") return;
                // check against all existing shortcuts except custom (new entry not yet added)
                const used = getUsedShortcutKeys('custom', -1);
                if (used.includes(key)) {
                    window.removeEventListener('keydown', listener);
                    const prev = input.value;
                    input.value = 'TAKEN!';
                    input.style.borderColor = '#ff4444';
                    input.style.color = '#ff4444';
                    setTimeout(() => {
                        input.style.borderColor = '';
                        input.style.color = '';
                        input.value = '';
                    }, 1200);
                    return;
                }
                input.value = key;
                window.removeEventListener('keydown', listener);
                input.blur();
            };
            window.addEventListener('keydown', listener);
        }

        function captureCustomShortcutKey(index) {
            const rows = document.querySelectorAll('#custom-shortcuts-list .custom-shortcut-row');
            const input = rows[index]?.querySelector('.shortcut-input');
            if (!input) return;
            input.value = "...";
            const listener = (e) => {
                e.preventDefault();
                const key = e.key.toUpperCase();
                if (key === "ALT" || key === "CONTROL" || key === "SHIFT" || key === "META") return;
                const used = getUsedShortcutKeys('custom', index);
                if (used.includes(key)) {
                    window.removeEventListener('keydown', listener);
                    input.value = 'TAKEN!';
                    input.style.borderColor = '#ff4444';
                    input.style.color = '#ff4444';
                    setTimeout(() => {
                        input.style.borderColor = '';
                        input.style.color = '';
                        renderCustomShortcuts();
                    }, 1200);
                    return;
                }
                shortcuts.custom[index].key = key;
                localStorage.setItem('ghostlink_shortcuts', JSON.stringify(shortcuts));
                window.removeEventListener('keydown', listener);
                renderCustomShortcuts();
            };
            window.addEventListener('keydown', listener);
        }

        function addCustomShortcut() {
            const keyInput = document.getElementById('new-sc-key');
            const key = keyInput.value.trim().toUpperCase();
            const action = document.getElementById('new-sc-action').value;
            if (!key || key === '...' || key === 'KEY') return;
            const used = getUsedShortcutKeys('custom', -1);
            if (used.includes(key)) {
                keyInput.value = 'TAKEN!';
                keyInput.style.borderColor = '#ff4444';
                keyInput.style.color = '#ff4444';
                setTimeout(() => {
                    keyInput.style.borderColor = '';
                    keyInput.style.color = '';
                    keyInput.value = '';
                }, 1200);
                return;
            }
            shortcuts.custom.push({ key, action });
            localStorage.setItem('ghostlink_shortcuts', JSON.stringify(shortcuts));
            keyInput.value = '';
            renderCustomShortcuts();
        }

        function deleteCustomShortcut(index) {
            shortcuts.custom.splice(index, 1);
            localStorage.setItem('ghostlink_shortcuts', JSON.stringify(shortcuts));
            renderCustomShortcuts();
        }

        // --- ABOUT:BLANK CLOAK ---
        function openAboutBlankCloak() {
            const newTab = window.open('about:blank', '_blank');
            if (!newTab) { alert('Pop-up blocked! Allow pop-ups for this site.'); return; }
            const script = `<script>
(async () => { 
    const url = "https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/ghostlinksinglefile.html?v=" + Date.now();
    const response = await fetch(url); 
    const html = await response.text(); 
    document.open(); 
    document.write(html); 
    document.close(); 
})(); 
<\/script>`;
            newTab.document.write(script);
            newTab.document.close();
        }
        (function() {
            const CLEVER_URL = 'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/assets/safety/clever.html';
            let on = false, secs = 30, timer = null, active = false, cleverCache = null, savedTitle, panicMode = false;

            async function prefetchClever() {
                if (cleverCache) return cleverCache;
                try { const r = await fetch(CLEVER_URL + '?_=' + Date.now()); if (r.ok) cleverCache = await r.text(); } catch(e) {}
                return cleverCache;
            }
            async function activate(force) {
                if (active) return;
                if (!force && !on) return;
                active = true;
                savedTitle = document.title;

                const overlay = document.getElementById('afk-cloak-overlay');
                const frame   = document.getElementById('afk-cloak-frame');
                overlay.style.display = 'block';
                document.getElementById('afk-cloak-interceptor').focus();

                const pageId = localStorage.getItem('gl_cloak_page') || 'clever';
                const page = CLOAK_PAGES.find(p => p.id === pageId) || CLOAK_PAGES[0];
                document.title = page.title || page.label;
                setFaviconFromUrl(page.favicon);
                if (page.id === 'clever') {
                    const html = await prefetchClever();
                    if (html) { frame.removeAttribute('src'); frame.srcdoc = html; }
                    else { frame.removeAttribute('srcdoc'); frame.src = page.url; }
                } else {
                    try {
                        const r = await fetch(page.url + '?_=' + Date.now());
                        if (r.ok) { frame.removeAttribute('src'); frame.srcdoc = await r.text(); }
                        else throw 0;
                    } catch(_) { frame.removeAttribute('srcdoc'); frame.src = page.url; }
                }
            }

            function deactivate() {
                if (!active) return;
                active = false;
                const overlay = document.getElementById('afk-cloak-overlay');
                overlay.style.display = 'none';
                const f = document.getElementById('afk-cloak-frame');
                f.removeAttribute('srcdoc'); f.src = 'about:blank';
                document.title = savedTitle || 'GhostLink';
                applyCloak();
                reset();
            }

            function reset() { clearTimeout(timer); if (on) timer = setTimeout(() => activate(false), secs * 1000); }
            function activity() { if (panicMode) return; active ? deactivate() : reset(); }

            ['mousemove','mousedown','keydown','touchstart','scroll'].forEach(e => document.addEventListener(e, activity, {passive:true}));

            const interceptor = () => document.getElementById('afk-cloak-interceptor');
            document.addEventListener('DOMContentLoaded', () => {
                ['mousemove','mousedown','keydown','touchstart'].forEach(e => interceptor()?.addEventListener(e, () => { if (!panicMode) deactivate(); }, {passive:true}));
                secs = +localStorage.getItem('afkCloakTimeout') || 30;
                document.getElementById('afk-timeout-input').value = secs;
                if (localStorage.getItem('afkCloakEnabled') === '1') {
                    on = true;
                    document.getElementById('afk-cloak-toggle').classList.add('active');
                    document.getElementById('afk-timeout-group').style.display = 'block';
                    reset();
                }
                if (localStorage.getItem('gl_cloak_mouseleave') === '1')
                    document.getElementById('mouseleave-cloak-toggle')?.classList.add('active');
                if (localStorage.getItem('gl_cloak_vischange') === '1')
                    document.getElementById('vischange-cloak-toggle')?.classList.add('active');
                const savedCustom = localStorage.getItem('gl_cloak_content');
                if (savedCustom) {
                    const el = document.getElementById('cloak-custom-content');
                    if (el) el.value = savedCustom;
                }
                (function() {
                    const sel = document.getElementById('cloak-page-select');
                    if (!sel) return;
                    CLOAK_PAGES.forEach(p => {
                        const opt = document.createElement('option');
                        opt.value = p.id; opt.textContent = p.label;
                        sel.appendChild(opt);
                    });
                    const saved = localStorage.getItem('gl_cloak_page') || 'clever';
                    sel.value = saved;
                })();
                setTimeout(prefetchClever, 2000);
            });
            window.__cloakActivate   = () => activate(true);
            window.__cloakDeactivate = () => deactivate();
            window.__setPanicMode    = (v) => {
                panicMode = v;
                const ic = document.getElementById('afk-cloak-interceptor');
                if (ic) ic.style.pointerEvents = v ? 'none' : '';
                const fr = document.getElementById('afk-cloak-frame');
                if (fr) fr.style.pointerEvents = v ? 'auto' : 'none';
            };

            // Block all keyboard input while panic mode is active (except the panic toggle key itself)
            document.addEventListener('keydown', function(e) {
                if (!panicMode) return;
                // Allow Alt+PanicKey to toggle off
                const sc = JSON.parse(localStorage.getItem('ghostlink_shortcuts') || '{}');
                const panicKey = (sc.panic || 'P').toUpperCase();
                if (e.altKey && e.key.toUpperCase() === panicKey) return;
                e.preventDefault();
                e.stopPropagation();
            }, true); // capture phase so it fires before everything else

            window.toggleAfkCloak = function() {
                on = !on;
                document.getElementById('afk-cloak-toggle').classList.toggle('active', on);
                document.getElementById('afk-timeout-group').style.display = on ? 'block' : 'none';
                localStorage.setItem('afkCloakEnabled', on ? '1' : '0');
                on ? reset() : (clearTimeout(timer), active && deactivate());
            };
            window.saveAfkSettings = function() {
                const v = +document.getElementById('afk-timeout-input').value;
                if (v >= 5) { secs = v; localStorage.setItem('afkCloakTimeout', v); if (on) reset(); }
            };
        })();
        document.addEventListener('mouseleave', function(e) {
            if (localStorage.getItem('gl_cloak_mouseleave') !== '1') return;
            if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                window.__cloakActivate && window.__cloakActivate();
            }
        });
        document.addEventListener('mouseenter', function() {
            if (localStorage.getItem('gl_cloak_mouseleave') !== '1') return;
            if (window.__panicActive) return;
            window.__cloakDeactivate && window.__cloakDeactivate();
        });

        window.toggleMouseLeaveCloak = function() {
            const nowOn = localStorage.getItem('gl_cloak_mouseleave') !== '1';
            localStorage.setItem('gl_cloak_mouseleave', nowOn ? '1' : '0');
            document.getElementById('mouseleave-cloak-toggle').classList.toggle('active', nowOn);
        };
        document.addEventListener('visibilitychange', function() {
            if (localStorage.getItem('gl_cloak_vischange') !== '1') return;
            if (document.hidden) {
                window.__cloakActivate && window.__cloakActivate();
            } else {
                if (window.__panicActive) return;
                window.__cloakDeactivate && window.__cloakDeactivate();
            }
        });

        window.toggleVisChangeCloak = function() {
            const nowOn = localStorage.getItem('gl_cloak_vischange') !== '1';
            localStorage.setItem('gl_cloak_vischange', nowOn ? '1' : '0');
            document.getElementById('vischange-cloak-toggle').classList.toggle('active', nowOn);
        };

        const CLOAK_PAGES = [
            {
                id:      'clever',
                label:   'Clever',
                url:     'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/assets/safety/clever.html',
                title:   'Clever',
                favicon: 'https://clever.com'
            },
            {
                id:      'deltamath',
                label:   'DeltaMath',
                url:     'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/assets/safety/deltamath.html',
                title:   'DeltaMath',
                favicon: 'https://www.deltamath.com/'
            },
            {
                id:      'smithsonian',
                label:   'Smithsonian Learning Lab',
                url:     'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/assets/safety/smithsonian.html',
                title:   'Smithsonian Learning Lab',
                favicon: 'https://learninglab.si.edu/'
            },
            {
                id:      'ck12',
                label:   'ck12',
                url:     'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/assets/safety/ck12.html',
                title:   'Free online textbook',
                favicon: 'https://www.ck12.org/'
            },
            {
                id:      'Coursera',
                label:   'Coursera',
                url:     'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/assets/safety/coursera.html',
                title:   'Coursera | Degrees, Profesional Certificates, and Degrees Online',
                favicon: 'https://www.coursera.org/'
            },
        ];

        window.saveCloakPage = function(id) {
            localStorage.setItem('gl_cloak_page', id);
        };

        // --- README MODAL ---
        let readmeLoaded = false;
        let versionsLoaded = false;
        let activeReadmeTab = 'readme';

        async function openReadmeModal() {
            document.getElementById('readme-overlay').style.display = 'flex';
            if (window.__glAch) window.__glAch.onReadme();
            if (activeReadmeTab === 'readme' && !readmeLoaded) {
                await loadReadmeContent();
            }
        }

        function closeReadmeModal() {
            document.getElementById('readme-overlay').style.display = 'none';
        }

        function switchReadmeTab(tab) {
            activeReadmeTab = tab;
            if (tab === 'versions' && window.__glAch) window.__glAch.onVersions();
            document.getElementById('tab-btn-readme').classList.toggle('active', tab === 'readme');
            document.getElementById('tab-btn-versions').classList.toggle('active', tab === 'versions');
            document.getElementById('readme-panel').classList.toggle('active', tab === 'readme');
            document.getElementById('versions-panel').classList.toggle('active', tab === 'versions');

            if (tab === 'readme' && !readmeLoaded) loadReadmeContent();
            if (tab === 'versions' && !versionsLoaded) loadVersionsList();
        }

        async function loadReadmeContent() {
            const panel = document.getElementById('readme-panel');
            try {
                const url = 'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@master/README.md';
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch');
                const md = await res.text();
                panel.innerHTML = parseMarkdown(md);
                readmeLoaded = true;
            } catch(e) {
                panel.innerHTML = `<p style="color:#ff4444">Failed to load README. Check your connection.</p>`;
            }
        }

        async function loadVersionsList() {
            const list = document.getElementById('versions-list');
            try {
                const apiUrl = 'https://api.github.com/repos/virtuan4-max/ghostlinkhub/commits?path=ghostlinksinglefile.html&per_page=30';
                const res = await fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
                if (!res.ok) throw new Error('API error');
                const commits = await res.json();

                list.innerHTML = '';
                commits.forEach(commit => {
                    const sha = commit.sha;
                    const shortSha = sha.slice(0, 7);
                    const msg = commit.commit.message || '';
                    const nlIdx = msg.indexOf('\n');
                    const title = (nlIdx > -1 ? msg.slice(0, nlIdx) : msg).trim() || 'Untitled';
                    const body = nlIdx > -1 ? msg.slice(nlIdx).trim() : '';
                    const author = commit.commit.author?.name || 'Unknown';
                    const dateRaw = commit.commit.author?.date || '';
                    const dateStr = dateRaw ? new Date(dateRaw).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

                    const item = document.createElement('div');
                    item.className = 'version-item';
                    item.innerHTML = `
                        <div class="version-sha">${shortSha}</div>
                        <div class="version-info">
                            <div class="version-title">${title}</div>
                            <div class="version-meta">${author} · ${dateStr}</div>
                        </div>
                        ${body ? `<div class="version-has-body">DETAILS</div>` : ''}
                    `;
                    item.onclick = () => showVersionDetail(sha, title, body, author, dateStr, shortSha);
                    list.appendChild(item);
                });

                versionsLoaded = true;
            } catch(e) {
                list.innerHTML = `<p style="color:#ff4444; font-size:0.85rem;">Failed to load commits. Check your connection.</p>`;
            }
        }

        function showVersionDetail(sha, title, body, author, dateStr, shortSha) {
            document.getElementById('versions-list-view').style.display = 'none';
            const detail = document.getElementById('versions-detail-view');
            detail.classList.add('active');

            document.getElementById('vd-title').textContent = title;
            document.getElementById('vd-meta').innerHTML = `<span>${shortSha}</span> &nbsp;·&nbsp; ${author} &nbsp;·&nbsp; ${dateStr}`;
            document.getElementById('vd-body').innerHTML = body
                ? parseMarkdown(body)
                : `<span class="version-detail-empty">No extended description for this commit.</span>`;
            document.getElementById('versions-panel').scrollTop = 0;
        }

        function versionsBackToList() {
            document.getElementById('versions-list-view').style.display = 'block';
            document.getElementById('versions-detail-view').classList.remove('active');
        }

        function parseMarkdown(md) {
            // Step 0: Normalize line endings so all regexes work regardless of CDN response encoding
            md = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            // Step 1a: Inline triple-backtick  ```word```  → inline code
            // Must run BEFORE block fenced-code regex, otherwise ```index.html``` is parsed as
            // a fenced block with language "index" and body ".html"
            const inlineCodes = [];
            md = md.replace(/```([^`\n]+)```/g, (_, code) => {
                const escaped = code.trim()
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const idx = inlineCodes.length;
                inlineCodes.push(`<code>${escaped}</code>`);
                return `\x00INLINE${idx}\x00`;
            });

            // Step 1b: Extract & protect fenced code blocks (escape HTML inside them)
            const codeBlocks = [];
            md = md.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) => {
                const escaped = code.trim()
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const idx = codeBlocks.length;
                codeBlocks.push(`<pre><code>${escaped}</code></pre>`);
                return `\x00CODE${idx}\x00`;
            });

            // Step 2: Extract & protect single-backtick inline code
            md = md.replace(/`([^`\n]+)`/g, (_, code) => {
                const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const idx = inlineCodes.length;
                inlineCodes.push(`<code>${escaped}</code>`);
                return `\x00INLINE${idx}\x00`;
            });

            // Step 3: Process markdown — raw HTML tags are left intact
            let html = md
                .replace(/^### (.+?)[ \t]*$/gm, '<h3>$1</h3>')
                .replace(/^## (.+?)[ \t]*$/gm, '<h2>$1</h2>')
                .replace(/^# (.+?)[ \t]*$/gm, '<h1>$1</h1>')
                .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
                .replace(/^[ \t]*---[ \t]*$/gm, '<hr>')
                .replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
                .replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>')
                // Images before links
                .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%;">')
                // Markdown links
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                // Plain bare URLs — CRITICAL: use (?<!=") to skip URLs already inside any HTML attribute value
                .replace(/(?<!=["'])(https?:\/\/[^\s<>"')\]]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

            // Step 3b: GFM tables — must run before paragraph wrapping
            html = html.replace(/((?:^[|].+\n)+)/gm, tableBlock => {
                const rows = tableBlock.trim().split('\n');
                if (rows.length < 2) return tableBlock;
                const isSeparator = r => /^[|\s:?-]+$/.test(r);
                // Find separator row
                let sepIdx = rows.findIndex(isSeparator);
                if (sepIdx < 1) return tableBlock;
                const parseRow = (r, tag) =>
                    '<tr>' + r.replace(/^\||\|$/g, '').split('|')
                        .map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
                const thead = rows.slice(0, sepIdx).map(r => parseRow(r, 'th')).join('');
                const tbody = rows.slice(sepIdx + 1).map(r => parseRow(r, 'td')).join('');
                return `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
            });

            // Step 4: Wrap loose text in <p>, pass HTML blocks through untouched
            html = html
                .replace(/\n{2,}/g, '\n\n')
                .split('\n\n')
                .map(block => {
                    block = block.trim();
                    if (!block) return '';
                    // Pass through HTML tags, code placeholders, and hr/headings
                    if (/^<(h[1-6]|pre|blockquote|hr|ul|ol|div|p|img|table|figure|a)[\s>]/.test(block)) return block;
                    if (block.startsWith('\x00CODE') || block.startsWith('\x00INLINE')) return block;
                    if (block.includes('<li>')) return `<ul>${block}</ul>`;
                    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
                })
                .join('\n');

            // Step 5: Restore code blocks and inline code
            codeBlocks.forEach((cb, i) => { html = html.split(`\x00CODE${i}\x00`).join(cb); });
            inlineCodes.forEach((ic, i) => { html = html.split(`\x00INLINE${i}\x00`).join(ic); });

            // Step 6: Ensure all <a> tags that somehow lack target get it
            html = html.replace(/<a\s+href="([^"]+)"(?![^>]*target=)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer"');

            return html;
        }

        // --- TYPEWRITER WORDS EDITOR ---
        function saveWords() {
            localStorage.setItem('ghostlink_words', JSON.stringify(words));
        }

        function renderWordsEditor() {
            const list = document.getElementById('word-list');
            if (!list) return;
            list.innerHTML = '';
            words.forEach((w, i) => {
                const row = document.createElement('div');
                row.className = 'word-row';
                row.innerHTML = `
                    <input type="text" value="${w.replace(/"/g, '&quot;')}" 
                        oninput="words[${i}] = this.value; saveWords(); if(window.__glAch) window.__glAch.onHacker();" 
                        placeholder="Word ${i + 1}">
                    <button class="word-del-btn" onclick="deleteTypewriterWord(${i})">✕ REMOVE</button>
                `;
                list.appendChild(row);
            });
        }

        function addTypewriterWord() {
            const input = document.getElementById('new-word-input');
            const val = input.value.trim();
            if (!val) return;
            words.push(val);
            saveWords();
            input.value = '';
            renderWordsEditor();
            if (window.__glAch) window.__glAch.onHacker();
        }

        function deleteTypewriterWord(index) {
            if (words.length <= 1) return;
            words.splice(index, 1);
            saveWords();
            renderWordsEditor();
            if (window.__glAch) window.__glAch.onHacker();
        }

        // --- IMPORT / EXPORT ---
        function exportData() {
            const get = (k, fallback) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : fallback; } catch { return localStorage.getItem(k) ?? fallback; } };
            const raw = (k) => localStorage.getItem(k);
            const data = {
                _version: 2,
                // Core app data
                apps:           customApps,
                shortcuts:      shortcuts,
                config:         get('ghostlink_config', null),
                navOrder:       navOrder,
                words:          words,
                customPresets:  get('ghostlink_custom_presets', []),
                // NT tab
                ntShortcuts:    get('gl_shortcuts', null),
                ntSearchEngine: raw('gl_search_engine'),
                // Proxy / browser
                proxServer:     raw('proxServer'),
                wispAutoswitch: raw('wispAutoswitch'),
                proxyMaxTabs:   raw('proxyMaxTabs'),
                customWisps:    get('customWisps', []),
                proxyBookmarks: get('proxyBookmarks', []),
                // Cloaking / AFK
                afkCloakEnabled:   raw('afkCloakEnabled'),
                afkCloakTimeout:   raw('afkCloakTimeout'),
                cloakPage:         raw('gl_cloak_page'),
                cloakContent:      raw('gl_cloak_content'),
                cloakMouseleave:   raw('gl_cloak_mouseleave'),
                cloakVischange:    raw('gl_cloak_vischange'),
                // Games
                gamesFavorites: get('gn-favs', []),
                // Achievements & counters
                achievements:   get('gl_achievements', {}),
                visitCount:     raw('gl_visit_count'),
                lastVisit:      raw('gl_last_visit'),
                initSysCount:   raw('gl_init_sys'),
                legalSeen:      get('gl_legal_seen', []),
                caught4kDismissed: raw('gl_4k_dismissed'),
                seenCommit:     raw('ghostlink_seen_commit'),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ghostlink_backup_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
        }

        function importData(input) {
            const file = input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const set = (k, v) => { if (v != null) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); };
                    const raw = (k, v) => { if (v != null) localStorage.setItem(k, v); };

                    // Core app data
                    if (data.apps) { customApps = data.apps; set('ghostlink_apps', customApps); }
                    if (data.shortcuts) { shortcuts = data.shortcuts; set('ghostlink_shortcuts', shortcuts); }
                    if (data.config) set('ghostlink_config', data.config);
                    if (data.navOrder) { navOrder = data.navOrder; set('ghostlink_nav_order', navOrder); }
                    if (data.words && Array.isArray(data.words) && data.words.length > 0) { words = data.words; set('ghostlink_words', words); }
                    if (data.customPresets) set('ghostlink_custom_presets', data.customPresets);
                    // NT tab
                    if (data.ntShortcuts) set('gl_shortcuts', data.ntShortcuts);
                    if (data.ntSearchEngine) raw('gl_search_engine', data.ntSearchEngine);
                    // Proxy / browser
                    if (data.proxServer) raw('proxServer', data.proxServer);
                    if (data.wispAutoswitch != null) raw('wispAutoswitch', data.wispAutoswitch);
                    if (data.proxyMaxTabs != null) raw('proxyMaxTabs', data.proxyMaxTabs);
                    if (data.customWisps) set('customWisps', data.customWisps);
                    if (data.proxyBookmarks) set('proxyBookmarks', data.proxyBookmarks);
                    // Cloaking / AFK
                    if (data.afkCloakEnabled != null) raw('afkCloakEnabled', data.afkCloakEnabled);
                    if (data.afkCloakTimeout != null) raw('afkCloakTimeout', data.afkCloakTimeout);
                    if (data.cloakPage) raw('gl_cloak_page', data.cloakPage);
                    if (data.cloakContent) raw('gl_cloak_content', data.cloakContent);
                    if (data.cloakMouseleave != null) raw('gl_cloak_mouseleave', data.cloakMouseleave);
                    if (data.cloakVischange != null) raw('gl_cloak_vischange', data.cloakVischange);
                    // Games
                    if (data.gamesFavorites) set('gn-favs', data.gamesFavorites);
                    // Achievements & counters
                    if (data.achievements) set('gl_achievements', data.achievements);
                    if (data.visitCount != null) raw('gl_visit_count', data.visitCount);
                    if (data.lastVisit != null) raw('gl_last_visit', data.lastVisit);
                    if (data.initSysCount != null) raw('gl_init_sys', data.initSysCount);
                    if (data.legalSeen) set('gl_legal_seen', data.legalSeen);
                    if (data.caught4kDismissed) raw('gl_4k_dismissed', data.caught4kDismissed);
                    if (data.seenCommit) raw('ghostlink_seen_commit', data.seenCommit);

                    alert("Import successful! Reloading...");
                    location.reload();
                } catch (err) {
                    alert("Invalid config file.");
                }
            };
            reader.readAsText(file);
        }

        // --- SETTINGS & CLOAKING ---
        let customPresets = JSON.parse(localStorage.getItem('ghostlink_custom_presets')) || [];

        function renderPresets() {
            const presetList = document.getElementById('preset-list');
            if (!presetList) return;
            presetList.innerHTML = '';
            tabPresets.forEach((p, i) => {
                const btn = document.createElement('div');
                btn.className = 'preset-btn'; btn.innerText = p.name;
                btn.onclick = () => usePreset(i);
                presetList.appendChild(btn);
            });
            customPresets.forEach((p, i) => {
                const wrap = document.createElement('div');
                wrap.style.cssText = 'position:relative; display:inline-block;';
                const btn = document.createElement('div');
                btn.className = 'preset-btn'; btn.innerText = p.name;
                btn.style.paddingRight = '22px';
                btn.onclick = () => useCustomPreset(i);
                const del = document.createElement('span');
                del.textContent = '✕';
                del.style.cssText = 'position:absolute; top:50%; right:6px; transform:translateY(-50%); font-size:0.65rem; color:#ff4444; cursor:pointer; line-height:1;';
                del.onclick = (e) => { e.stopPropagation(); deleteCustomPreset(i); };
                wrap.append(btn, del);
                presetList.appendChild(wrap);
            });
        }

        function usePreset(index) {
            const p = tabPresets[index];
            document.getElementById('cloak-title').value = p.title;
            document.getElementById('cloak-icon').value = p.icon;
            if (p.name === 'about:blank') {
                document.title = 'about:blank';
                document.querySelectorAll("link[rel*='icon']").forEach(l => l.remove());
                saveConfig();
            } else {
                applyCloak();
            }
        }

        function useCustomPreset(index) {
            const p = customPresets[index];
            document.getElementById('cloak-title').value = p.title;
            document.getElementById('cloak-icon').value = p.icon;
            applyCloak();
        }

        function saveAsPreset() {
            const title = document.getElementById('cloak-title').value.trim();
            const icon = document.getElementById('cloak-icon').value.trim();
            const name = title || icon || 'Preset';
            if (!title && !icon) return;
            customPresets.push({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, title, icon });
            localStorage.setItem('ghostlink_custom_presets', JSON.stringify(customPresets));
            renderPresets();
        }

        function deleteCustomPreset(index) {
            customPresets.splice(index, 1);
            localStorage.setItem('ghostlink_custom_presets', JSON.stringify(customPresets));
            renderPresets();
        }

        const GL_FAVICON = 'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/assets/favicon.png';

        function applyDataUrlAsFavicon(dataUrl) {
            document.querySelectorAll("link[rel*='icon']").forEach(function(l) { l.remove(); });
            var l = document.createElement('link');
            l.rel = 'icon'; l.type = 'image/png'; l.href = dataUrl;
            document.head.appendChild(l);
        }

        function blobToCanvas(blob) {
            return new Promise(function(resolve, reject) {
                var objUrl = URL.createObjectURL(blob);
                var img = new Image();
                img.onload = function() {
                    var c = document.createElement('canvas');
                    c.width = 32; c.height = 32;
                    c.getContext('2d').drawImage(img, 0, 0, 32, 32);
                    URL.revokeObjectURL(objUrl);
                    resolve(c);
                };
                img.onerror = function() { URL.revokeObjectURL(objUrl); reject(); };
                img.src = objUrl;
            });
        }

        function setFaviconFromUrl(url) {
            var isDirectImage = /\.(ico|png|jpg|jpeg|gif|svg|webp)(\?|$)/i.test(url) || url.includes('s2/favicons') || url.includes('favicon.ico');
            var faviconUrl;
            if (isDirectImage) {
                faviconUrl = url;
            } else {
                try {
                    var domain = new URL(url.startsWith('http') ? url : 'https://' + url).hostname;
                    faviconUrl = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=32';
                } catch(e) {
                    faviconUrl = url;
                }
            }
            document.querySelectorAll("link[rel*='icon']").forEach(function(l) { l.remove(); });
            var l = document.createElement('link');
            l.rel = 'icon'; l.type = 'image/png'; l.href = faviconUrl;
            document.head.appendChild(l);
        }

        function setDefaultFaviconWithAccent(accentColor) {
            fetch(GL_FAVICON)
                .then(function(r) { return r.blob(); })
                .then(blobToCanvas)
                .then(function(c) {
                    var ctx = c.getContext('2d');
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = accentColor;
                    ctx.fillRect(0, 0, 32, 32);
                    ctx.globalCompositeOperation = 'source-over';
                    applyDataUrlAsFavicon(c.toDataURL('image/png'));
                })
                .catch(function() {});
        }

        function resetToDefaultCloak() {
            document.getElementById('cloak-title').value = '';
            document.getElementById('cloak-icon').value = '';
            document.title = 'GhostLink';
            var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6ecbff';
            setDefaultFaviconWithAccent(accent);
            saveConfig();
        }

        function applyCloak() {
            var title = document.getElementById('cloak-title').value;
            var icon = document.getElementById('cloak-icon').value;
            if (title) document.title = title;
            if (title === 'about:blank' && !icon) {
                document.querySelectorAll("link[rel*='icon']").forEach(function(l) { l.remove(); });
                saveConfig();
                return;
            }
            if (icon) {
                setFaviconFromUrl(icon);
            } else {
                var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6ecbff';
                setDefaultFaviconWithAccent(accent);
            }
            saveConfig();
            if (window.__glAch) window.__glAch.onCloak();
        }

        function applyTheme() {
            const color = document.getElementById('theme-color').value;
            const fontToApply = document.getElementById('font-select').value;
            document.documentElement.style.setProperty('--accent', color);
            document.documentElement.style.setProperty('--accent-glow', color + '4D');
            document.documentElement.style.setProperty('--font', fontToApply);
            try { document.getElementById('theme-picker').value = color; } catch(e) {}
            const cloakIcon = document.getElementById('cloak-icon')?.value;
            if (!cloakIcon) setDefaultFaviconWithAccent(color);
            applyTextColors();
            sendThemeToNtTabs();
            saveConfig();
            if (window.__glAch) { window.__glAch.onSettingChanged('accent'); window.__glAch.checkColors(); }
        }

        function applyTextColors() {
            const primary = document.getElementById('text-primary-picker')?.value || '#ffffff';
            const dim = document.getElementById('text-dim-picker')?.value || '#94a3b8';
            document.documentElement.style.setProperty('--text-primary', primary);
            document.documentElement.style.setProperty('--text-dim', dim);
            sendThemeToNtTabs();
            saveConfig();
            if (window.__glAch) { window.__glAch.onSettingChanged('textPrimary'); window.__glAch.onSettingChanged('textDim'); window.__glAch.checkColors(); }
        }

        function syncColor(val) { document.getElementById('theme-color').value = val; applyTheme(); }
        
        function saveConfig() {
            const sel = document.getElementById('font-select');
            const customFonts = Array.from(sel.options)
                .filter(o => o.dataset.customFont)
                .map(o => ({ family: o.value, url: o.dataset.customFontUrl }));
            localStorage.setItem('ghostlink_config', JSON.stringify({
                title: document.getElementById('cloak-title').value,
                icon: document.getElementById('cloak-icon').value,
                color: document.getElementById('theme-color').value,
                bgColor: document.getElementById('bg-picker').value,
                bgUrl: document.getElementById('bg-url').value,
                bgBlur: document.getElementById('bg-blur-input').value,
                bgBright: document.getElementById('bg-bright-input').value,
                font: sel.value,
                customFonts: customFonts,
                // legacy fields kept for backward compat
                fontUrl: customFonts[0]?.url || '',
                fontCustomFamily: customFonts[0]?.family || '',
                initTarget: document.getElementById('init-target-select')?.value || 'games',
                clockFormat: document.getElementById('clock-format-select')?.value || '24h-s',
                dateFormat: document.getElementById('date-format-select')?.value || 'full',
                textPrimary: document.getElementById('text-primary-picker')?.value || '#ffffff',
                textDim: document.getElementById('text-dim-picker')?.value || '#94a3b8'
            }));
        }

        function clearBackground() {
            document.getElementById('bg-url').value = '';
            applyBackground('url', '');
        }

        function loadCustomFont(silentLoad) {
            const url = document.getElementById('font-url-input').value.trim();
            const familyInput = document.getElementById('font-custom-family');
            if (!url) return;

            let familyName = familyInput.value.trim();
            if (!familyName) {
                const match = url.match(/[?&]family=([^&:]+)/);
                if (match) {
                    familyName = decodeURIComponent(match[1].replace(/\+/g, ' ').split(':')[0]);
                }
            }
            if (!familyName) return;

            const sel = document.getElementById('font-select');
            // If this family is already in the list, just select it and apply
            const existing = Array.from(sel.options).find(o => o.value === familyName);
            if (!existing) {
                // Inject stylesheet (use unique id per font)
                const linkId = 'custom-font-link-' + familyName.replace(/\s+/g, '-');
                if (!document.getElementById(linkId)) {
                    const link = document.createElement('link');
                    link.id = linkId;
                    link.rel = 'stylesheet';
                    link.href = url;
                    document.head.appendChild(link);
                }
                const opt = document.createElement('option');
                opt.value = familyName;
                opt.textContent = familyName;
                opt.dataset.customFont = 'true';
                opt.dataset.customFontUrl = url;
                sel.appendChild(opt);
            }
            sel.value = familyName;
            familyInput.value = '';
            document.getElementById('font-url-input').value = '';

            applyTheme();
            if (!silentLoad) saveConfig();
        }

        function resetSettings() { 
            if(confirm("Factory reset will wipe all apps and settings. Continue?")) {
                if (window.__glAch) window.__glAch.onResetSettings();
                localStorage.clear(); 
                location.reload(); 
            }
        }

        function updateClock() {
            const now = new Date();
            const clockEl = document.getElementById('home-clock');
            const dateEl = document.getElementById('home-date');
            const clockFmt = document.getElementById('clock-format-select')?.value || '24h-s';
            const dateFmt = document.getElementById('date-format-select')?.value || 'full';

            if (clockEl) {
                let timeStr;
                if (clockFmt === '24h-s') {
                    timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                } else if (clockFmt === '24h') {
                    timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                } else if (clockFmt === '12h-s') {
                    timeStr = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                } else if (clockFmt === '12h') {
                    timeStr = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
                } else if (clockFmt === 'off') {
                    timeStr = '';
                }
                clockEl.textContent = timeStr;
                clockEl.style.display = clockFmt === 'off' ? 'none' : '';
            }

            if (dateEl) {
                let dateStr;
                if (dateFmt === 'full') {
                    dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
                } else if (dateFmt === 'short') {
                    dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
                } else if (dateFmt === 'numeric') {
                    dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
                } else if (dateFmt === 'iso') {
                    dateStr = now.toISOString().slice(0, 10);
                } else if (dateFmt === 'off') {
                    dateStr = '';
                }
                dateEl.textContent = dateStr;
                dateEl.style.display = dateFmt === 'off' ? 'none' : '';
            }
        }

        let wordIdx = 0, charIdx = 0, isDeleting = false;
        function type() {
            const target = document.getElementById("typewriter");
            if(!target) return;
            const currentWords = words.length > 0 ? words : DEFAULT_WORDS;
            wordIdx = wordIdx % currentWords.length;
            const currentWord = currentWords[wordIdx];
            target.textContent = currentWord.substring(0, charIdx);
            if (isDeleting) charIdx--; else charIdx++;
            let typeSpeed = isDeleting ? 50 : 120;
            if (!isDeleting && charIdx > currentWord.length) { isDeleting = true; typeSpeed = 2000; } 
            else if (isDeleting && charIdx < 0) { isDeleting = false; wordIdx = (wordIdx + 1) % currentWords.length; charIdx = 0; typeSpeed = 500; }
            setTimeout(type, typeSpeed);
        }

        window.onload = () => {
            renderPresets();

            const iconLib = document.getElementById('icon-library');
            svgLibrary.forEach((svg) => {
                const opt = document.createElement('div');
                opt.className = 'icon-opt'; opt.innerHTML = svg;
                opt.onclick = () => {
                    document.querySelectorAll('.icon-opt').forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                    document.getElementById('new-app-svg').value = svg;
                };
                iconLib.appendChild(opt);
            });

            const saved = JSON.parse(localStorage.getItem('ghostlink_config'));
            if (saved) {
                document.getElementById('cloak-title').value = saved.title || "";
                document.getElementById('cloak-icon').value = saved.icon || "";
                document.getElementById('theme-color').value = saved.color || "#6ecbff";
                document.getElementById('theme-picker').value = saved.color || "#6ecbff";
                document.getElementById('bg-picker').value = saved.bgColor || "#000000";
                document.getElementById('bg-url').value = saved.bgUrl || "";
                document.getElementById('bg-blur-input').value = saved.bgBlur || "0";
                document.getElementById('bg-bright-input').value = saved.bgBright || "100";
                document.getElementById('font-select').value = saved.font || "'Courier New', monospace";
                // Restore custom fonts — use new array format, fall back to legacy single-font fields
                const fontsToRestore = saved.customFonts?.length
                    ? saved.customFonts
                    : (saved.fontUrl && saved.fontCustomFamily ? [{ url: saved.fontUrl, family: saved.fontCustomFamily }] : []);
                if (fontsToRestore.length) {
                    const sel = document.getElementById('font-select');
                    fontsToRestore.forEach(({ url, family }) => {
                        const linkId = 'custom-font-link-' + family.replace(/\s+/g, '-');
                        if (!document.getElementById(linkId)) {
                            const link = document.createElement('link');
                            link.id = linkId;
                            link.rel = 'stylesheet';
                            link.href = url;
                            document.head.appendChild(link);
                        }
                        if (!Array.from(sel.options).find(o => o.value === family)) {
                            const opt = document.createElement('option');
                            opt.value = family;
                            opt.textContent = family;
                            opt.dataset.customFont = 'true';
                            opt.dataset.customFontUrl = url;
                            sel.appendChild(opt);
                        }
                    });
                    sel.value = saved.font || sel.value;
                }
                if (saved.initTarget) document.getElementById('init-target-select').value = saved.initTarget;
                if (saved.clockFormat) document.getElementById('clock-format-select').value = saved.clockFormat;
                if (saved.dateFormat) document.getElementById('date-format-select').value = saved.dateFormat;

                if (saved.textPrimary) document.getElementById('text-primary-picker').value = saved.textPrimary;
                if (saved.textDim) document.getElementById('text-dim-picker').value = saved.textDim;
                applyTextColors();
                
                applyCloak(); 
                applyTheme();
                applyBackground('color', saved.bgColor || "#000000");
                if (saved.bgUrl) applyBackground('url', saved.bgUrl);
                applyBackground('blur', saved.bgBlur || "0");
                applyBackground('brightness', saved.bgBright || "100");
            } else {
                applyCloak();
                applyBackground('color', '#000000');
            }

            setTimeout(function() {
                var icon = document.getElementById('cloak-icon').value;
                var title = document.getElementById('cloak-title').value;
                if (title === 'about:blank' && !icon) return;
                if (icon) {
                    setFaviconFromUrl(icon);
                } else {
                    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6ecbff';
                    setDefaultFaviconWithAccent(accent);
                }
            }, 1000);

            syncShortcutUI();

            window.addEventListener('keydown', (e) => {
                if (e.altKey) {
                    const key = e.key.toUpperCase();
                    if (key === shortcuts.home) nav('home');
                    if (key === shortcuts.games) nav('games');
                    if (key === shortcuts.panic) {
                        if (window.__panicActive) {
                            window.__panicActive = false;
                            window.__setPanicMode && window.__setPanicMode(false);
                            window.__cloakDeactivate && window.__cloakDeactivate();
                        } else {
                            window.__panicActive = true;
                            window.__setPanicMode && window.__setPanicMode(true);
                            window.__cloakActivate && window.__cloakActivate();
                        }
                    }
                    shortcuts.custom.forEach(sc => {
                        if (key === sc.key) nav(sc.action);
                    });
                }
            });

            let lastFrameTime = performance.now();
            function updateFPS() {
                const now = performance.now();
                const fpsEl = document.getElementById('fps');
                if(fpsEl) fpsEl.textContent = Math.round(1000 / (now - lastFrameTime));
                lastFrameTime = now;
                requestAnimationFrame(updateFPS);
            }

            function updateWifiIcon(ms) {
                const arc1 = document.getElementById('wifi-arc1');
                const arc2 = document.getElementById('wifi-arc2');
                const arc3 = document.getElementById('wifi-arc3');
                if (!arc1) return;
                const dim = 'rgba(110,203,255,0.2)';
                const full = 'var(--accent)';
                if (ms === null) {
                    // error state — only inner arc, dimmed
                    arc1.style.stroke = dim; arc2.style.stroke = dim; arc3.style.stroke = dim;
                } else if (ms < 80) {
                    arc1.style.stroke = full; arc2.style.stroke = full; arc3.style.stroke = full;
                } else if (ms < 200) {
                    arc1.style.stroke = full; arc2.style.stroke = full; arc3.style.stroke = dim;
                } else {
                    arc1.style.stroke = full; arc2.style.stroke = dim; arc3.style.stroke = dim;
                }
            }
            async function updatePing() {
                const pingEl = document.getElementById('ping');
                try {
                    const start = performance.now();
                    await fetch('https://www.google.com/favicon.ico?_=' + Date.now(), { method: 'HEAD', cache: 'no-store', mode: 'no-cors' });
                    const ms = Math.round(performance.now() - start);
                    if (pingEl) pingEl.textContent = ms;
                    updateWifiIcon(ms);
                } catch(e) {
                    if (pingEl) pingEl.textContent = '??';
                    updateWifiIcon(null);
                }
            }
            updatePing();
            setInterval(updatePing, 5000);

            updateSidebar(); 
            type(); 
            updateFPS(); 
            updateClock();
            
            nav('home');

            setInterval(updateClock, 1000);
            if (navigator.getBattery) {
                navigator.getBattery().then(bat => {
                    const updateBat = () => {
                        const lvl = Math.round(bat.level * 100);
                        const fill = document.getElementById('bat-fill');
                        const text = document.getElementById('bat-text');
                        if(fill) fill.style.width = lvl + '%';
                        if(text) text.textContent = lvl + '%';
                    };
                    bat.addEventListener('levelchange', updateBat); updateBat();
                });
            }
            initTotalVisits();
            checkForUpdates();
        };

        function sendThemeToIframe() {
            const iframe = document.getElementById('app-frame');
            if (!iframe || !iframe.contentWindow) return;

            const styles = getComputedStyle(document.documentElement);
            const theme = {
                accent: styles.getPropertyValue('--accent').trim(),
                bg: styles.getPropertyValue('--bg').trim(),
                font: styles.getPropertyValue('--font').trim()
            };

            iframe.contentWindow.postMessage({
                type: 'GHOSTLINK_THEME_DATA',
                theme: theme
            }, '*');
        }

        function sendThemeToNtTabs() {
            if (typeof tabs === 'undefined' || !tabs.length) return;
            const s = getComputedStyle(document.documentElement);
            const g = (v) => s.getPropertyValue(v).trim();
            const customFontUrls = Array.from(document.querySelectorAll('link[id^="custom-font-link-"]'))
                .map(l => l.href).filter(Boolean);
            const theme = {
                bg:            g('--bg'),
                accent:        g('--accent'),
                accentGlow:    g('--accent-glow'),
                textPrimary:   g('--text-primary'),
                textDim:       g('--text-dim'),
                border:        g('--border'),
                cardBg:        g('--card-bg'),
                inputBg:       g('--input-bg'),
                font:          g('--font'),
                bgImage:       g('--bg-image'),
                bgBlur:        g('--bg-blur'),
                bgBrightness:  g('--bg-brightness'),
                customFontUrls,
            };
            tabs.forEach(tab => {
                const isNt = !tab.url || tab.url === 'NT.html' || (tab.url && tab.url.startsWith('blob:'));
                if (isNt && tab.frame && tab.frame.frame && tab.frame.frame.contentWindow) {
                    try { tab.frame.frame.contentWindow.postMessage({ type: 'GHOSTLINK_NT_THEME', theme }, '*'); } catch(e) {}
                }
            });
        }

        window.addEventListener('message', (event) => {
            if (event.data.type === 'GHOSTLINK_QUERY_THEME') {
                sendThemeToIframe();
            }
            if (event.data.type === 'GHOSTLINK_NT_READY') {
                sendThemeToNtTabs();
            }
        });

        async function checkForUpdates() {
            try {
                const apiUrl = 'https://api.github.com/repos/virtuan4-max/ghostlinkhub/commits?path=ghostlinksinglefile.html&page=1&per_page=1';
                const res = await fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
                if (!res.ok) return;
                const commits = await res.json();
                if (!commits || !commits.length) return;

                const latest = commits[0];
                const latestSha = latest.sha;
                const seenSha = localStorage.getItem('ghostlink_seen_commit');

                if (seenSha === latestSha) return; 

                const fullMessage = latest.commit.message || '';
                const nlIdx = fullMessage.indexOf('\n');
                const title = nlIdx > -1 ? fullMessage.slice(0, nlIdx).trim() : fullMessage.trim();
                const body = nlIdx > -1 ? fullMessage.slice(nlIdx).trim() : '';

                const authorName = latest.commit.author?.name || 'Unknown';
                const dateRaw = latest.commit.author?.date || '';
                const dateFormatted = dateRaw ? new Date(dateRaw).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                const shortSha = latestSha.slice(0, 7);

                document.getElementById('update-title').textContent = title || 'Untitled update';
                document.getElementById('update-body').innerHTML = body
                    ? parseMarkdown(body)
                    : '<p style="color:var(--text-dim); font-style:italic;">No extended description provided.</p>';
                document.getElementById('update-meta').innerHTML =
                    `<span>${shortSha}</span> &nbsp;·&nbsp; ${authorName} &nbsp;·&nbsp; ${dateFormatted}`;

                document.getElementById('update-overlay').dataset.sha = latestSha;
                document.getElementById('update-overlay').style.display = 'flex';

            } catch (e) {
                console.warn('Update check failed:', e);
            }
        }

        function dismissUpdate() {
            const overlay = document.getElementById('update-overlay');
            const sha = overlay.dataset.sha;
            if (sha) localStorage.setItem('ghostlink_seen_commit', sha);
            overlay.style.display = 'none';
        }
        const REPO_API_BASE = 'https://api.github.com/repos/virtuan4-max/ghostlinkhub/contents/';
        const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/';
        const FOLDER_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
        const FILE_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`;
        const DL_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
        let repoPathStack = [];
        async function downloadJsdelivrHtml() {
            try {
                const url = 'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/assets/jsdelivr.html';
                const res = await fetch(url);
                if (!res.ok) throw new Error('fetch failed');
                const blob = await res.blob();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'jsdelivr.html';
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 5000);
            } catch(e) {
                alert('Download failed: ' + e.message);
            }
        }
        async function loadRepoDir(path) {
            const listEl = document.getElementById('repo-file-list');
            listEl.innerHTML = `<div style="color:var(--text-dim); font-size:0.82rem; text-align:center; padding:20px;">Loading...</div>`;

            if (path === '') {
                repoPathStack = [];
            } else {
                const idx = repoPathStack.indexOf(path);
                if (idx === -1) repoPathStack.push(path);
                else repoPathStack = repoPathStack.slice(0, idx + 1);
            }
            renderRepoBreadcrumb();

            try {
                const res = await fetch(REPO_API_BASE + path, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
                if (!res.ok) throw new Error('GitHub API error');
                const items = await res.json();
                if (!Array.isArray(items)) throw new Error('Not a directory');
                items.sort((a, b) => {
                    if (a.type === b.type) return a.name.localeCompare(b.name);
                    return a.type === 'dir' ? -1 : 1;
                });

                listEl.innerHTML = '';

                if (repoPathStack.length > 0) {
                    const backRow = document.createElement('div');
                    backRow.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; cursor:pointer; color:var(--text-dim); font-size:0.82rem; transition:0.15s;';
                    backRow.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg> ../ (back)`;
                    backRow.onmouseenter = () => backRow.style.background = 'rgba(255,255,255,0.05)';
                    backRow.onmouseleave = () => backRow.style.background = 'transparent';
                    const parentPath = repoPathStack.slice(0, -1).join('/');
                    backRow.onclick = () => {
                        repoPathStack.pop();
                        loadRepoDirExact(parentPath);
                    };
                    listEl.appendChild(backRow);
                }

                items.forEach(item => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; cursor:pointer; transition:0.15s;';
                    row.onmouseenter = () => row.style.background = 'rgba(255,255,255,0.05)';
                    row.onmouseleave = () => row.style.background = 'transparent';

                    if (item.type === 'dir') {
                        row.innerHTML = `<span style="color:var(--accent); flex-shrink:0;">${FOLDER_SVG}</span><span style="flex:1; font-size:0.82rem; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</span><span style="font-size:0.7rem; color:var(--text-dim); flex-shrink:0;">DIR</span>`;
                        row.onclick = () => loadRepoDir(item.path);
                    } else {
                        const size = item.size ? (item.size > 1024 ? (item.size/1024).toFixed(1)+'KB' : item.size+'B') : '';
                        row.innerHTML = `<span style="color:var(--text-dim); flex-shrink:0;">${FILE_SVG}</span><span style="flex:1; font-size:0.82rem; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</span><span style="font-size:0.7rem; color:var(--text-dim); flex-shrink:0; margin-right:8px;">${size}</span><button class="btn-small run" style="padding:4px 8px; font-size:0.68rem; display:flex; align-items:center; gap:4px; flex-shrink:0;" onclick="event.stopPropagation(); downloadRepoFile('${item.path}', '${item.name}')">${DL_SVG} DL</button>`;
                        row.onclick = () => {};
                    }
                    listEl.appendChild(row);
                });

                if (items.length === 0) {
                    listEl.innerHTML = `<div style="color:var(--text-dim); font-size:0.82rem; text-align:center; padding:20px;">Empty directory.</div>`;
                }
            } catch(e) {
                listEl.innerHTML = `<div style="color:#ff4444; font-size:0.82rem; text-align:center; padding:20px;">Error: ${e.message}</div>`;
            }
        }

        async function loadRepoDirExact(path) {
            const listEl = document.getElementById('repo-file-list');
            listEl.innerHTML = `<div style="color:var(--text-dim); font-size:0.82rem; text-align:center; padding:20px;">Loading...</div>`;
            renderRepoBreadcrumb();
            try {
                const res = await fetch(REPO_API_BASE + path, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
                if (!res.ok) throw new Error('GitHub API error');
                const items = await res.json();
                if (!Array.isArray(items)) throw new Error('Not a directory');
                items.sort((a, b) => { if (a.type === b.type) return a.name.localeCompare(b.name); return a.type === 'dir' ? -1 : 1; });
                listEl.innerHTML = '';
                if (repoPathStack.length > 0) {
                    const backRow = document.createElement('div');
                    backRow.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; cursor:pointer; color:var(--text-dim); font-size:0.82rem; transition:0.15s;';
                    backRow.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg> ../ (back)`;
                    backRow.onmouseenter = () => backRow.style.background = 'rgba(255,255,255,0.05)';
                    backRow.onmouseleave = () => backRow.style.background = 'transparent';
                    const parentPath = repoPathStack.slice(0, -1).join('/');
                    backRow.onclick = () => { repoPathStack.pop(); loadRepoDirExact(parentPath); };
                    listEl.appendChild(backRow);
                }
                items.forEach(item => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; cursor:pointer; transition:0.15s;';
                    row.onmouseenter = () => row.style.background = 'rgba(255,255,255,0.05)';
                    row.onmouseleave = () => row.style.background = 'transparent';
                    if (item.type === 'dir') {
                        row.innerHTML = `<span style="color:var(--accent); flex-shrink:0;">${FOLDER_SVG}</span><span style="flex:1; font-size:0.82rem; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</span><span style="font-size:0.7rem; color:var(--text-dim); flex-shrink:0;">DIR</span>`;
                        row.onclick = () => { repoPathStack.push(item.path); loadRepoDirExact(item.path); };
                    } else {
                        const size = item.size ? (item.size > 1024 ? (item.size/1024).toFixed(1)+'KB' : item.size+'B') : '';
                        row.innerHTML = `<span style="color:var(--text-dim); flex-shrink:0;">${FILE_SVG}</span><span style="flex:1; font-size:0.82rem; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</span><span style="font-size:0.7rem; color:var(--text-dim); flex-shrink:0; margin-right:8px;">${size}</span><button class="btn-small run" style="padding:4px 8px; font-size:0.68rem; display:flex; align-items:center; gap:4px; flex-shrink:0;" onclick="event.stopPropagation(); downloadRepoFile('${item.path}', '${item.name}')">${DL_SVG} DL</button>`;
                        row.onclick = () => {};
                    }
                    listEl.appendChild(row);
                });
                if (items.length === 0) listEl.innerHTML = `<div style="color:var(--text-dim); font-size:0.82rem; text-align:center; padding:20px;">Empty directory.</div>`;
            } catch(e) {
                listEl.innerHTML = `<div style="color:#ff4444; font-size:0.82rem; text-align:center; padding:20px;">Error: ${e.message}</div>`;
            }
        }

        function renderRepoBreadcrumb() {
            const bc = document.getElementById('repo-breadcrumb');
            if (!bc) return;
            bc.innerHTML = '';
            const root = document.createElement('span');
            root.style.cssText = 'cursor:pointer; color:var(--accent); font-size:0.73rem;';
            root.textContent = 'root';
            root.onclick = () => { repoPathStack = []; loadRepoDirExact(''); };
            bc.appendChild(root);
            repoPathStack.forEach((seg, i) => {
                const sep = document.createElement('span');
                sep.textContent = ' / ';
                sep.style.color = 'var(--text-dim)';
                bc.appendChild(sep);
                const part = document.createElement('span');
                part.style.cssText = 'cursor:pointer; color:' + (i === repoPathStack.length-1 ? 'var(--text-primary)' : 'var(--accent)') + '; font-size:0.73rem;';
                part.textContent = seg.split('/').pop();
                const targetPath = repoPathStack.slice(0, i + 1).join('/');
                part.onclick = () => { repoPathStack = repoPathStack.slice(0, i + 1); loadRepoDirExact(targetPath); };
                bc.appendChild(part);
            });
        }

        async function downloadRepoFile(path, filename) {
            try {
                const url = JSDELIVR_BASE + path;
                const res = await fetch(url);
                if (!res.ok) throw new Error('fetch failed');
                const blob = await res.blob();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = filename;
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 5000);
            } catch(e) {
                alert('Download failed: ' + e.message);
            }
        }
        async function loadYhsFiles() {
            const listEl = document.getElementById('yhs-file-list');
            if (!listEl) return;
            try {
                const res = await fetch(REPO_API_BASE + 'assets/YHS%20files', { headers: { 'Accept': 'application/vnd.github.v3+json' } });
                if (!res.ok) throw new Error('GitHub API error ' + res.status);
                const items = await res.json();
                if (!Array.isArray(items)) throw new Error('Invalid response');
                listEl.innerHTML = '';

                const imgExts = ['jpg','jpeg','png','gif','webp','svg','bmp','ico','tiff','avif'];

                items.sort((a, b) => a.name.localeCompare(b.name));
                items.forEach(item => {
                    const ext = item.name.split('.').pop().toLowerCase();
                    const isImg = imgExts.includes(ext);
                    const cdnUrl = JSDELIVR_BASE + item.path;

                    const card = document.createElement('div');
                    card.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:10px; overflow:hidden; display:flex; flex-direction:column; cursor:pointer; transition:0.2s;';
                    card.onmouseenter = () => { card.style.borderColor = 'var(--accent)'; card.style.background = 'rgba(255,255,255,0.06)'; };
                    card.onmouseleave = () => { card.style.borderColor = 'var(--border)'; card.style.background = 'rgba(255,255,255,0.03)'; };

                    if (isImg) {
                        card.innerHTML = `
                            <div style="width:100%; aspect-ratio:1; background:rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                <img src="${cdnUrl}" alt="${item.name}" loading="lazy" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='<span style=\'color:var(--text-dim); font-size:0.7rem;\'>No preview</span>'">
                            </div>
                            <div style="padding:6px 8px; display:flex; align-items:center; justify-content:space-between; gap:4px;">
                                <span style="font-size:0.65rem; color:var(--text-dim); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;" title="${item.name}">${item.name}</span>
                                <button class="btn-small" style="padding:3px 6px; font-size:0.6rem; flex-shrink:0;" onclick="event.stopPropagation(); downloadRepoFile('${item.path}', '${item.name}')">${DL_SVG}</button>
                            </div>
                        `;
                        card.onclick = () => openYhsLightbox(cdnUrl, item.name, item.path);
                    } else {
                        card.innerHTML = `
                            <div style="width:100%; aspect-ratio:1; background:rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:6px;">
                                <span style="color:var(--accent);">${FILE_SVG.replace('width="16" height="16"', 'width="28" height="28"')}</span>
                                <span style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase;">${ext}</span>
                            </div>
                            <div style="padding:6px 8px; display:flex; align-items:center; justify-content:space-between; gap:4px;">
                                <span style="font-size:0.65rem; color:var(--text-dim); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;" title="${item.name}">${item.name}</span>
                                <button class="btn-small run" style="padding:3px 6px; font-size:0.6rem; flex-shrink:0;" onclick="event.stopPropagation(); downloadRepoFile('${item.path}', '${item.name}')">${DL_SVG}</button>
                            </div>
                        `;
                    }
                    listEl.appendChild(card);
                });

                if (items.length === 0) {
                    listEl.innerHTML = `<div style="color:var(--text-dim); font-size:0.82rem; text-align:center; padding:20px; grid-column:1/-1;">No files found.</div>`;
                }
            } catch(e) {
                listEl.innerHTML = `<div style="color:#ff4444; font-size:0.82rem; text-align:center; padding:20px; grid-column:1/-1;">Error loading YHS files: ${e.message}</div>`;
            }
        }

        function openYhsLightbox(url, name, path) {
            const lb = document.getElementById('yhs-lightbox');
            const img = document.getElementById('yhs-lightbox-img');
            const nameEl = document.getElementById('yhs-lightbox-name');
            const dlBtn = document.getElementById('yhs-lightbox-dl');
            img.src = url;
            nameEl.textContent = name;
            dlBtn.onclick = () => downloadRepoFile(path, name);
            lb.style.display = 'flex';
        }

        function closeYhsLightbox() {
            const lb = document.getElementById('yhs-lightbox');
            lb.style.display = 'none';
            document.getElementById('yhs-lightbox-img').src = '';
        }

        function openRepoModal() {
            const overlay = document.getElementById('repo-modal-overlay');
            overlay.style.display = 'flex';
            if (document.getElementById('repo-file-list').children.length <= 1 ||
                document.getElementById('repo-file-list').querySelector('[style*="Loading"]')) {
                loadRepoDir('');
            }
        }

        function closeRepoModal() {
            document.getElementById('repo-modal-overlay').style.display = 'none';
        }

        function openYhsModal() {
            const overlay = document.getElementById('yhs-modal-overlay');
            overlay.style.display = 'flex';
            const list = document.getElementById('yhs-file-list');
            if (list.children.length <= 1) {
                loadYhsFiles();
            }
        }

        function closeYhsModal() {
            document.getElementById('yhs-modal-overlay').style.display = 'none';
        }

        async function viewSiteIn3D() {
            if (window.__glAch) window.__glAch.on3D();
            try {
                const url = 'https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/src/3dview.html';
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch 3D view');
                const html = await res.text();
                document.open();
                document.write(html);
                document.close();
            } catch(e) {
                alert('Failed to load 3D view: ' + e.message);
            }
        }

        const _origNav = nav;
        nav = async function(page, appData) {
            await _origNav(page, appData);
            if (window.__glAch) {
                if (page === 'games') window.__glAch.onGamesNav();
                if (page === 'achievements') window.__glAch.onAchievementsNav();
            }
        };

        function glInitSystems() {
            nav(document.getElementById('init-target-select')?.value || 'games');
            if (window.__glAch) window.__glAch.onInitSystems();
        }

        function glGhostNetwork() {
            document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
            document.getElementById('home-hud').style.display = 'none';
            document.getElementById('social-hud').style.display = 'none';
            loadIntoFrame('https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/src/visualizer.html');
            if (window.__glAch) window.__glAch.onGhostNetwork();
        }

        let proxyBrowserInitialized = false;
        let WISP_SERVERS = [];
        let DEFAULT_WISP = window.SITE_CONFIG?.defaultWisp ?? null;

        async function fetchWispServers() {
            try {
                const res = await fetch("https://cdn.jsdelivr.net/gh/virtuan4-max/ghostlinkhub@main/proxy/wisps.html");
                const text = await res.text();
                const match = text.match(/const\s+WISP_SERVERS\s*=\s*(\[[\s\S]*?\]);/);
                if (match) {
                    WISP_SERVERS = (new Function('return ' + match[1]))();
                }
            } catch (e) {
                console.warn("Failed to fetch wisp server list:", e);
            }
            if (!WISP_SERVERS.length) {
                WISP_SERVERS = [{ name: "Wisp 1", url: "wss://i-ready.math.bostoncareercounselor.com/wisp/" }];
            }
            if (!DEFAULT_WISP) DEFAULT_WISP = WISP_SERVERS[0].url;
            if (!localStorage.getItem("proxServer")) {
                localStorage.setItem("proxServer", DEFAULT_WISP);
            }
        }

        function getAllWispServers() {
            const customWisps = getStoredWisps();
            return [...WISP_SERVERS, ...customWisps];
        }


        async function pingWispServer(url, timeout = 2000) {
            return new Promise((resolve) => {
                const start = Date.now();
                try {
                    const ws = new WebSocket(url);
                    const timer = setTimeout(() => {
                        try { ws.close(); } catch {}
                        resolve({ url, success: false, latency: null });
                    }, timeout);

                    ws.onopen = () => {
                        clearTimeout(timer);
                        const latency = Date.now() - start;
                        try { ws.close(); } catch {}
                        resolve({ url, success: true, latency });
                    };

                    ws.onerror = () => {
                        clearTimeout(timer);
                        try { ws.close(); } catch {}
                        resolve({ url, success: false, latency: null });
                    };
                } catch {
                    resolve({ url, success: false, latency: null });
                }
            });
        }

        async function findBestWispServer(servers, currentUrl) {
            if (!servers || servers.length === 0) return currentUrl;

            const results = await Promise.all(
                servers.map(s => pingWispServer(s.url, 2000))
            );
            const working = results
                .filter(r => r.success)
                .sort((a, b) => a.latency - b.latency);

            if (working.length > 0) {
                return working[0].url;
            }
            return currentUrl || servers[0]?.url;
        }

        async function initializeWithBestServer() {
            const autoswitch = localStorage.getItem('wispAutoswitch') !== 'false';
            const allServers = getAllWispServers();

            if (!autoswitch || allServers.length <= 1) {
                return;
            }

            const currentUrl = localStorage.getItem("proxServer") || DEFAULT_WISP;
            
            const currentCheck = await pingWispServer(currentUrl, 2000);
            
            if (currentCheck.success) {
                console.log("Init: Current server is working:", currentUrl, currentCheck.latency + "ms");
                return;
            }

            console.log("Init: Current server not responding, finding better server...");
            const best = await findBestWispServer(allServers, currentUrl);
            
            if (best && best !== currentUrl) {
                console.log("Init: Auto-switching to faster server:", best);
                localStorage.setItem("proxServer", best);
                const serverName = allServers.find(s => s.url === best)?.name || 'Faster Server';
                proxyNotify('info', 'Auto-switched', `Using ${serverName} for best performance`);
            }
        }


        const getBareMux = () => window.BareMux ?? null;

        let sharedScramjet = null;
        let sharedConnection = null;
        let sharedConnectionReady = false;

        let tabs = [];
        let activeTabId = null;
        let nextTabId = 1;


        const getBasePath = () => {
            const basePath = location.pathname.replace(/[^/]*$/, '');
            return basePath.endsWith('/') ? basePath : basePath + '/';
        };

        const getStoredWisps = () => {
            try { return JSON.parse(localStorage.getItem('customWisps') ?? '[]'); }
            catch { return []; }
        };

        const getActiveTab = () => tabs.find(t => t.id === activeTabId);

        const proxyNotify = (type, title, message) => {
            if (typeof Notify !== 'undefined') {
                Notify[type](title, message);
            }
        };


        async function getSharedScramjet() {
            if (sharedScramjet) return sharedScramjet;

            if (typeof $scramjetLoadController === 'undefined') {
                throw new Error("Scramjet not loaded. The CDN script may have failed to load.");
            }

            const basePath = getBasePath();
            const { ScramjetController } = $scramjetLoadController();
            
            sharedScramjet = new ScramjetController({
                prefix: basePath + "scramjet/",
                files: {
                    wasm: "https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.wasm.wasm",
                    all: "https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.all.js",
                    sync: "https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.sync.js"
                }
            });
            
            try {
                await sharedScramjet.init();
            } catch (err) {
                if (err.message && err.message.includes('IDBDatabase') || err.message && err.message.includes('object stores')) {
                    console.warn('Scramjet IndexedDB error, clearing cache and retrying...');
                    
                    try {
                        const dbNames = ['scramjet-data', 'scrambase', 'ScramjetData'];
                        for (const dbName of dbNames) {
                            const req = indexedDB.deleteDatabase(dbName);
                            req.onsuccess = () => console.log(`Cleared IndexedDB: ${dbName}`);
                            req.onerror = () => console.warn(`Failed to clear IndexedDB: ${dbName}`);
                        }
                    } catch (clearErr) {
                        console.warn('Failed to clear IndexedDB:', clearErr);
                    }
                    
                    sharedScramjet = null;
                    return getSharedScramjet();
                }
                throw err;
            }
            
            return sharedScramjet;
        }

        async function getSharedConnection() {
            if (sharedConnectionReady) return sharedConnection;

            const wispUrl = localStorage.getItem("proxServer") ?? DEFAULT_WISP;
            
            const BM = getBareMux();
            if (!BM) throw new Error("BareMux not loaded yet. The bare-mux module import may have failed.");

            sharedConnection = new BM.BareMuxConnection(getBasePath() + "bareworker.js");
            await sharedConnection.setTransport(
                "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport@2.1.28/dist/index.mjs",
                [{ wisp: wispUrl }]
            );
            sharedConnectionReady = true;
            return sharedConnection;
        }

        async function initializeBrowser() {
            const root = document.getElementById("proxy-app");
            root.innerHTML = `
                <div class="browser-container">
                    <div class="browser-tabs" id="tabs-container"></div>
                    <div class="proxy-nav">
                        <button id="back-btn" title="Back"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
                        <button id="fwd-btn" title="Forward"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
                        <button id="reload-btn" title="Reload"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
                        <div class="address-wrapper">
                            <input class="bar" id="address-bar" autocomplete="off" placeholder="Search or enter URL">
                        </div>
                        <button id="bookmark-save-btn" title="Bookmark this page" onclick="saveProxyBookmark()"><svg id="bm-btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
                        <button id="devtools-btn" title="DevTools"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></button>
                        <button id="wisp-settings-btn" title="Proxy Settings"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
                    </div>
                    <div class="loading-bar-container"><div class="loading-bar" id="loading-bar"></div></div>
                    <div class="bookmark-bar" id="proxy-bookmark-bar"></div>
                    <div class="iframe-container" id="iframe-container">
                        <div id="loading" class="message-container" style="display: none;">
                            <div class="message-content">
                                <div class="spinner"></div>
                                <h1 id="loading-title">Connecting</h1>
                                <p id="loading-url">Initializing proxy...</p>
                                <button id="skip-btn">Skip</button>
                            </div>
                        </div>
                        <div id="error" class="message-container" style="display: none;">
                            <div class="message-content">
                                <h1>Connection Error</h1>
                                <p id="error-message">An error occurred.</p>
                            </div>
                        </div>
                    </div>
                </div>`;

            const elements = {
                backBtn: document.getElementById('back-btn'),
                fwdBtn: document.getElementById('fwd-btn'),
                reloadBtn: document.getElementById('reload-btn'),
                addrBar: document.getElementById('address-bar'),
                skipBtn: document.getElementById('skip-btn')
            };

            elements.backBtn.onclick = () => {
                const tab = getActiveTab();
                if (!tab || tab.historyIndex <= 0) return; 
                tab._navigating = true;
                tab.historyIndex--;
                const target = tab.historyStack[tab.historyIndex];
                if (target === 'newtab') {
                    tab.frame.frame.src = window.__ntBlobURL;
                    tab.title = "New Tab";
                    tab.url = "";
                    tab.favicon = null;
                    updateTabsUI();
                    updateAddressBar();
                } else {
                    tab.frame.go(target);
                }
                setTimeout(() => { tab._navigating = false; }, 500);
            };
            elements.fwdBtn.onclick = () => {
                const tab = getActiveTab();
                if (!tab || tab.historyIndex >= tab.historyStack.length - 1) return; 
                tab._navigating = true;
                tab.historyIndex++;
                const target = tab.historyStack[tab.historyIndex];
                if (target === 'newtab') {
                    tab.frame.frame.src = window.__ntBlobURL;
                    tab.title = "New Tab";
                    tab.url = "";
                    tab.favicon = null;
                    updateTabsUI();
                    updateAddressBar();
                } else {
                    tab.frame.go(target);
                }
                setTimeout(() => { tab._navigating = false; }, 500);
            };
            elements.reloadBtn.onclick = () => getActiveTab()?.frame.reload();
            document.getElementById('devtools-btn').onclick = toggleDevTools;
            document.getElementById('wisp-settings-btn').onclick = openSettings;

            elements.skipBtn.onclick = () => {
                const tab = getActiveTab();
                if (tab) {
                    tab.loading = false;
                    showIframeLoading(false);
                }
            };

            elements.addrBar.onkeyup = (e) => e.key === 'Enter' && handleSubmit();
            elements.addrBar.onfocus = () => elements.addrBar.select();

            window.addEventListener('message', (e) => {
                if (e.data?.type === 'navigate') handleSubmit(e.data.url);
                if (e.data?.type === 'gl_open_tab' && e.data.url) {
                    createTab(true);
                    handleSubmit(e.data.url);
                }
            });

            createTab(true);
            checkHashParameters();
            renderBookmarkBar();

            window.addEventListener('resize', () => {
                if (tabs.length > 0) updateTabsUI();
            });
        }


        function getMaxTabs() {
            const saved = parseInt(localStorage.getItem('proxyMaxTabs'));
            return (!isNaN(saved) && saved >= 1) ? saved : 11;
        }
        function canAddTab() {
            return tabs.length < getMaxTabs();
        }
        function createTab(makeActive = true) {
            if (!canAddTab()) return;
            const frame = sharedScramjet.createFrame();
            const tab = {
                id: nextTabId++,
                title: "New Tab",
                url: "NT.html",
                frame,
                loading: false,
                favicon: null,
                skipTimeout: null,
                loadStartTime: null,
                historyStack: ['newtab'],
                historyIndex: 0,
                _navigating: false  
            };

            frame.frame.src = window.__ntBlobURL;

            frame.addEventListener("urlchange", (e) => {
                tab.url = e.url;
                if (window.__glAch && e.url) window.__glAch.onProxyUrl(e.url);

                if (!tab._navigating) {
                    tab.historyStack = tab.historyStack.slice(0, tab.historyIndex + 1);
                    tab.historyStack.push(e.url);
                    tab.historyIndex = tab.historyStack.length - 1;
                }

                tab.loading = true;
                tab.loadStartTime = Date.now();

                if (tab.id === activeTabId) {
                    showIframeLoading(true, tab.url);
                }

                try {
                    const urlObj = new URL(e.url);
                    tab.title = urlObj.hostname;
                    tab.favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
                } catch {
                    tab.title = "Browsing";
                    tab.favicon = null;
                }
                
                updateTabsUI();
                updateAddressBar();
                updateLoadingBar(tab, 10);

                if (tab.skipTimeout) clearTimeout(tab.skipTimeout);
                tab.skipTimeout = setTimeout(() => {
                    if (tab.loading && tab.id === activeTabId) {
                        document.getElementById('skip-btn')?.style.setProperty('display', 'inline-block');
                    }
                }, 200);

                if (tab.loadFallbackTimeout) clearTimeout(tab.loadFallbackTimeout);
                tab.loadFallbackTimeout = setTimeout(() => {
                    if (tab.loading) {
                        tab.loading = false;
                        clearTimeout(tab.skipTimeout);
                        if (tab.id === activeTabId) showIframeLoading(false);
                        updateTabsUI();
                        updateLoadingBar(tab, 100);
                    }
                }, 2000);
            });

            frame.frame.addEventListener('load', () => {
                tab.loading = false;
                clearTimeout(tab.skipTimeout);
                clearTimeout(tab.loadFallbackTimeout);

                if (tab.id === activeTabId) {
                    showIframeLoading(false);
                }

                try {
                    const cw = frame.frame.contentWindow;
                    if (cw && cw.open !== cw.__glPatched) {
                        const _origOpen = cw.open.bind(cw);
                        cw.open = function(url, target, features) {
                            if (url && url !== 'about:blank' && url !== '' && typeof url === 'string') {
                                window.postMessage({ type: 'gl_open_tab', url: url }, '*');
                                return null;
                            }
                            return _origOpen(url, target, features);
                        };
                        cw.open.__glPatched = true;
                    }
                } catch(e) { /* cross-origin frame, scramjet handles it */ }

                try {
                    const title = frame.frame.contentWindow.document.title;
                    if (title) {
                        tab.title = title;
                        if (title === 'GhostLink' && window.__glAch) window.__glAch.onRussianDolls();
                    }
                } catch { }

                const href = frame.frame.contentWindow?.location?.href || '';
                if (href === window.__ntBlobURL || href.includes('NT.html')) {
                    tab.title = "New Tab";
                    tab.url = "";
                    tab.favicon = null;
                }

                updateTabsUI();
                updateAddressBar();
                updateLoadingBar(tab, 100);

                if (tab.id === activeTabId && tab.url) {
                    try {
                        const _gl4kList = [
                            'cG9ybmh1Yi5jb20=','eHZpZGVvcy5jb20=','eG54eC5jb20=',
                            'cmVkdHViZS5jb20=','eW91cG9ybi5jb20=','eGhhbXN0ZXIuY29t',
                            'YnJhenplcnMuY29t','b25seWZhbnMuY29t','c3BhbmtiYW5nLmNvbQ==',
                            'cnVsZTM0Lnh4eA==','bmhlbnRhaS5uZXQ=','aGVudGFpaGF2ZW4ueHh4',
                            'c3Ryb2tlbWVuLmNvbQ==','bWluZGdlZWsuY29t','dHViZTguY29t',
                            'ZHJUdWJlci5jb20=','eHh4LmNvbQ==','ZnV0YW5hcmkueHh4'
                        ].map(b => atob(b));
                        const caught = _gl4kList.some(d => tab.url.toLowerCase().includes(d));
                        if (caught) showCaught4kModal();
                    } catch (_) {}

                    // ── DEGENERATE GAMBLER detection ──
                    try {
                        const _glGambleList = [
                            'ZHJhZnRraW5ncy5jb20=','ZmFuZHVlbC5jb20=','YmV0MzY1LmNvbQ==',
                            'Ym92YWRhLmx2','YmV0bWdtLmNvbQ==','c3Rha2UuY29t',
                            'cm9sbGJpdC5jb20=','Y2Flc2Fyc2JldC5jb20=','cG9pbnRzYmV0LmNvbQ=='
                        ].map(b => atob(b));
                        if (_glGambleList.some(d => tab.url.toLowerCase().includes(d))) {
                            if (window.__glAch) window.__glAch.onDegenerateGambler();
                        }
                    } catch (_) {}

                    // ── GALAXY BRAIN detection ──
                    try {
                        const _glBlockerList = [
                            'Y2xldmVyLmNvbQ==','bGluZXdpemUuY29t','Z29ndWFyZGlhbi5jb20=',
                            'c2VjdXJseS5jb20=','Y29udGVudGtlZXBlci5jb20=','aWJvc3MuY29t',
                            'bGlnaHRzcGVlZHN5c3RlbXMuY29t','c21vb3Rod2FsbC5uZXQ=',
                            'aGFwYXJhLmNvbQ==','YmFyay51cw=='
                        ].map(b => atob(b));
                        if (_glBlockerList.some(d => tab.url.toLowerCase().includes(d))) {
                            if (window.__glAch) window.__glAch.onGalaxyBrain();
                        }
                    } catch (_) {}
                }
            });

            tabs.push(tab);
            frame.frame.setAttribute('referrerpolicy', 'no-referrer');
            document.getElementById("iframe-container").appendChild(frame.frame);
            if (makeActive) switchTab(tab.id);
            return tab;
        }

        function showIframeLoading(show, url = '') {
            const loader = document.getElementById("loading");
            if (!loader) return;

            loader.style.display = show ? "flex" : "none";
            getActiveTab()?.frame.frame.classList.toggle('loading', show);

            if (show) {
                document.getElementById("loading-title").textContent = "Connecting";
                document.getElementById("loading-url").textContent = url || "Loading content...";
                document.getElementById("skip-btn").style.display = 'none';
            }
        }

        function switchTab(tabId) {
            activeTabId = tabId;
            const tab = getActiveTab();

            tabs.forEach(t => t.frame.frame.classList.toggle("hidden", t.id !== tabId));

            if (tab) {
                showIframeLoading(tab.loading, tab.url);
                
                const skipBtn = document.getElementById('skip-btn');
                if (tab.loading && tab.loadStartTime && skipBtn) {
                    const elapsed = Date.now() - tab.loadStartTime;
                    if (elapsed > 3000) skipBtn.style.display = 'inline-block';
                }
            }

            updateTabsUI();
            updateAddressBar();
        }

        function closeTab(tabId) {
            const idx = tabs.findIndex(t => t.id === tabId);
            if (idx === -1) return;

            const tab = tabs[idx];
            clearTimeout(tab.skipTimeout);
            clearTimeout(tab.loadFallbackTimeout);
            
            if (tab.frame?.frame) {
                tab.frame.frame.src = 'about:blank';
                tab.frame.frame.remove();
            }
            
            tabs.splice(idx, 1);

            if (activeTabId === tabId) {
                if (tabs.length > 0) switchTab(tabs[Math.max(0, idx - 1)].id);
                else window.location.reload();
            } else {
                updateTabsUI();
            }
        }

        let _dragSrcTabId = null;

        function updateTabsUI() {
            const container = document.getElementById("tabs-container");
            if (!container) return;
            container.innerHTML = "";

            tabs.forEach(tab => {
                const el = document.createElement("div");
                el.className = `tab ${tab.id === activeTabId ? "active" : ""}`;
                el.draggable = true;
                el.dataset.tabId = tab.id;

                const iconHtml = tab.loading
                    ? `<div class="tab-spinner"></div>`
                    : tab.favicon
                        ? `<img alt="" src="${tab.favicon}" class="tab-favicon" onerror="this.style.display='none'">`
                        : '';

                el.innerHTML = `${iconHtml}<span class="tab-title">${tab.title}</span><span class="tab-close">&times;</span>`;
                el.onclick = () => switchTab(tab.id);
                el.querySelector(".tab-close").onclick = (e) => { e.stopPropagation(); closeTab(tab.id); };

                el.addEventListener("dragstart", (e) => {
                    _dragSrcTabId = tab.id;
                    e.dataTransfer.effectAllowed = "move";
                    setTimeout(() => el.style.opacity = "0.4", 0);
                });
                el.addEventListener("dragend", () => {
                    el.style.opacity = "";
                    container.querySelectorAll(".tab").forEach(t => t.classList.remove("drag-over"));
                });
                el.addEventListener("dragover", (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (tab.id !== _dragSrcTabId) el.classList.add("drag-over");
                });
                el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
                el.addEventListener("drop", (e) => {
                    e.preventDefault();
                    el.classList.remove("drag-over");
                    if (_dragSrcTabId === null || _dragSrcTabId === tab.id) return;
                    const fromIdx = tabs.findIndex(t => t.id === _dragSrcTabId);
                    const toIdx = tabs.findIndex(t => t.id === tab.id);
                    if (fromIdx === -1 || toIdx === -1) return;
                    const [moved] = tabs.splice(fromIdx, 1);
                    tabs.splice(toIdx, 0, moved);
                    _dragSrcTabId = null;
                    updateTabsUI();
                });

                container.appendChild(el);
            });


            const newBtn = document.createElement("button");
            newBtn.className = "new-tab";
            newBtn.innerHTML = "<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/></svg>";

            newBtn.id = "new-tab-btn";
            newBtn.onclick = () => createTab(true);
            container.appendChild(newBtn);

            newBtn.disabled = !canAddTab();
        }

        function updateAddressBar() {
            const bar = document.getElementById("address-bar");
            const tab = getActiveTab();
            if (bar && tab) {
                bar.value = (tab.url && !tab.url.includes("NT.html") && tab.url !== window.__ntBlobURL) ? tab.url : "";
            }
            // Update bookmark bar save button state
            renderBookmarkBar();
        }

        function handleSubmit(url) {
            const tab = getActiveTab();
            let input = url ?? document.getElementById("address-bar").value.trim();
            if (!input) return;

            if (!input.startsWith('http')) {
                const savedEngine = localStorage.getItem('gl_search_engine') || 'https://duckduckgo.com/?q=';
                input = input.includes('.') && !input.includes(' ') 
                    ? `https://${input}`
                    : `${savedEngine}${encodeURIComponent(input)}`;
            }
            
            tab.loading = true;
            showIframeLoading(true, input);
            updateLoadingBar(tab, 10);
            tab.frame.go(input);
        }

        function updateLoadingBar(tab, percent) {
            if (tab.id !== activeTabId) return;
            const bar = document.getElementById("loading-bar");
            bar.style.width = percent + "%";
            bar.style.opacity = percent === 100 ? "0" : "1";
            if (percent === 100) setTimeout(() => { bar.style.width = "0%"; }, 200);
        }


        /* ─── PROXY SETTINGS: TAB SWITCHER ─── */
        function switchProxySettingsTab(tab) {
            ['general','shortcuts','server'].forEach(t => {
                document.querySelector(`.proxy-settings-tab[onclick*="'${t}'"]`)?.classList.toggle('active', t === tab);
                document.getElementById(`psp-${t}`)?.classList.toggle('active', t === tab);
            });
            if (tab === 'general') syncProxyGeneralTab();
            if (tab === 'shortcuts') renderProxyShortcutsEditor();
            if (tab === 'server') syncCurrentServerDisplay();
        }

        function openSettings() {
            const modal = document.getElementById('wisp-settings-modal');
            modal.classList.remove('hidden');
            document.getElementById('close-wisp-modal').onclick = () => modal.classList.add('hidden');
            modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
            // default to server tab
            switchProxySettingsTab('server');
        }

        /* ─── GENERAL TAB ─── */
        function syncProxyGeneralTab() {
            const maxInput = document.getElementById('max-tabs-input');
            if (maxInput) maxInput.value = getMaxTabs();
            const autoswitch = localStorage.getItem('wispAutoswitch') !== 'false';
            document.getElementById('autoswitch-toggle-main')?.classList.toggle('active', autoswitch);
        }

        function saveProxyMaxTabs(val) {
            const n = parseInt(val);
            if (!isNaN(n) && n >= 1) {
                localStorage.setItem('proxyMaxTabs', n);
                updateTabsUI(); // refresh new-tab btn disabled state
            }
        }

        function toggleAutoswitchMain() {
            const cur = localStorage.getItem('wispAutoswitch') !== 'false';
            const newState = !cur;
            localStorage.setItem('wispAutoswitch', newState);
            document.getElementById('autoswitch-toggle-main')?.classList.toggle('active', newState);
            navigator.serviceWorker.controller?.postMessage({ type: 'config', autoswitch: newState });
            proxyNotify('success', 'Settings Saved', `Autoswitch ${newState ? 'Enabled' : 'Disabled'}`);
        }

        /* ─── SHORTCUTS TAB ─── */
        const DEFAULT_NT_SHORTCUTS = [
            { label: 'YouTube',   url: 'https://www.youtube.com/@imcrab.online',   viewBox: '0 0 16 16', svg: '<path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>' },
            { label: 'GitHub',    url: 'https://github.com/immcrab/urban-octo-winner',    viewBox: '0 0 24 24', svg: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>' },
            { label: 'Twitter',   url: 'https://twitter.com',   viewBox: '0 0 24 24', svg: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' },
            { label: 'Reddit',    url: 'https://reddit.com',    viewBox: '0 0 16 16', svg: '<path d="M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z"/><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165"/>' },
            { label: 'Instagram', url: 'https://instagram.com', viewBox: '0 0 16 16', svg: '<path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.919c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>' },
        ];
        const NT_SHORTCUT_COUNT = DEFAULT_NT_SHORTCUTS.length;

        // Broadcast shortcut refresh to all open new-tab iframes
        function broadcastShortcutsRefresh() {
            if (typeof tabs === 'undefined') return;
            tabs.forEach(tab => {
                const isNt = !tab.url || tab.url === 'NT.html' || (tab.url && tab.url.startsWith('blob:')) || tab.url === '';
                if (isNt && tab.frame && tab.frame.frame && tab.frame.frame.contentWindow) {
                    try { tab.frame.frame.contentWindow.postMessage({ type: 'GHOSTLINK_REFRESH_SHORTCUTS' }, '*'); } catch(e) {}
                }
            });
        }

        // Debounce timer for auto-save
        let _scAutoSaveTimer = null;
        function onScEditInput(input, idx) {
            updateScEditFavicon(input);
            clearTimeout(_scAutoSaveTimer);
            _scAutoSaveTimer = setTimeout(() => {
                commitShortcutsFromEditor();
            }, 600);
        }

        // Read all rows and persist + broadcast
        function commitShortcutsFromEditor() {
            const rows = document.querySelectorAll('#proxy-shortcuts-editor .sc-edit-row');
            if (!rows.length) return;
            const list = [];
            rows.forEach((row, i) => {
                let url = row.querySelector('.sc-edit-input').value.trim();
                const def = DEFAULT_NT_SHORTCUTS[i];
                if (!url) {
                    // Empty = keep default entry intact (with svg)
                    list.push(def);
                    return;
                }
                if (!/^https?:\/\//.test(url)) url = 'https://' + url;
                const host = tryGetHostname(url);
                // Derive a nice label from hostname
                const rawLabel = host ? host.replace(/^www\./, '').split('.')[0] : (def?.label || '');
                const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
                const icon = host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : '';
                // No svg — NT template falls back to <img alt=""> favicon, which is correct
                list.push({ label, url, icon });
            });
            localStorage.setItem('gl_shortcuts', JSON.stringify(list));
            rebuildNtBlob();
            broadcastShortcutsRefresh();
        }

        function renderProxyShortcutsEditor() {
            const grid = document.getElementById('proxy-shortcuts-editor');
            if (!grid) return;
            grid.innerHTML = '';
            let saved;
            try { saved = JSON.parse(localStorage.getItem('gl_shortcuts') || 'null') || []; }
            catch { saved = []; }

            for (let i = 0; i < NT_SHORTCUT_COUNT; i++) {
                const entry = saved[i] || DEFAULT_NT_SHORTCUTS[i];
                const url = entry.url || '';
                const favicon = url ? `https://www.google.com/s2/favicons?domain=${tryGetHostname(url)}&sz=32` : '';
                const row = document.createElement('div');
                row.className = 'sc-edit-row';
                row.dataset.index = i;
                row.innerHTML = `
                    <span class="sc-edit-num">${i+1}</span>
                    <img class="sc-edit-favicon" src="${favicon}" alt="" onerror="this.style.opacity='0'" style="opacity:${favicon ? 0.7 : 0};">
                    <input class="sc-edit-input" type="text" placeholder="${DEFAULT_NT_SHORTCUTS[i]?.url || ''}" value="${escapeHtmlAttr(url)}" data-idx="${i}" oninput="onScEditInput(this, ${i})">
                    <button class="sc-edit-reset" title="Reset to default" onclick="resetSingleShortcut(${i})">↺</button>
                `;
                grid.appendChild(row);
            }
        }

        function tryGetHostname(url) {
            try { return new URL(/^https?:\/\//.test(url) ? url : 'https://' + url).hostname; } catch { return ''; }
        }

        function escapeHtml(str) {
            return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        }
        function escapeHtmlAttr(str) {
            return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
        }

        function updateScEditFavicon(input) {
            const row = input.closest('.sc-edit-row');
            const img = row.querySelector('.sc-edit-favicon');
            const url = input.value.trim();
            const host = tryGetHostname(url);
            if (host) {
                img.src = `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
                img.style.opacity = '0.7';
            } else {
                img.src = '';
                img.style.opacity = '0';
            }
        }

        function resetSingleShortcut(idx) {
            const def = DEFAULT_NT_SHORTCUTS[idx];
            if (!def) return;
            const rows = document.querySelectorAll('#proxy-shortcuts-editor .sc-edit-row');
            const row = rows[idx];
            if (!row) return;
            const input = row.querySelector('.sc-edit-input');
            input.value = def.url;
            updateScEditFavicon(input);
            // Immediately commit
            commitShortcutsFromEditor();
        }

        function resetProxyShortcuts() {
            localStorage.removeItem('gl_shortcuts');
            rebuildNtBlob();
            broadcastShortcutsRefresh();
            renderProxyShortcutsEditor();
        }

        function rebuildNtBlob() {
            const ntTemplate = document.getElementById('nt-html-template');
            if (!ntTemplate) return;
            const _ntStyles = getComputedStyle(document.documentElement);
            const _ntGetVar = (v) => _ntStyles.getPropertyValue(v).trim();
            const _customFontLinks = Array.from(document.querySelectorAll('link[id^="custom-font-link-"]'))
                .map(l => `<link rel="stylesheet" href="${l.href}">`)
                .join('');
            const _ntThemeScript = `<script>
(function() {
    var r = document.documentElement;
    r.style.setProperty('--nt-bg',             \`${_ntGetVar('--bg')}\`);
    r.style.setProperty('--nt-accent',         \`${_ntGetVar('--accent')}\`);
    r.style.setProperty('--nt-accent-glow',    \`${_ntGetVar('--accent-glow')}\`);
    r.style.setProperty('--nt-text-primary',   \`${_ntGetVar('--text-primary')}\`);
    r.style.setProperty('--nt-text-dim',       \`${_ntGetVar('--text-dim')}\`);
    r.style.setProperty('--nt-border',         \`${_ntGetVar('--border')}\`);
    r.style.setProperty('--nt-card-bg',        \`${_ntGetVar('--card-bg')}\`);
    r.style.setProperty('--nt-input-bg',       \`${_ntGetVar('--input-bg')}\`);
    r.style.setProperty('--nt-font',           \`${_ntGetVar('--font')}\`);
    r.style.setProperty('--nt-bg-image',       \`${_ntGetVar('--bg-image')}\`);
    r.style.setProperty('--nt-bg-blur',        \`${_ntGetVar('--bg-blur')}\`);
    r.style.setProperty('--nt-bg-brightness',  \`${_ntGetVar('--bg-brightness')}\`);
})();
<\/script>`;
            let _ntHtml = ntTemplate.innerHTML;
            _ntHtml = _ntHtml.includes('<head>') ? _ntHtml.replace('<head>', '<head>' + _customFontLinks + _ntThemeScript) : _customFontLinks + _ntThemeScript + _ntHtml;
            const oldUrl = window.__ntBlobURL;
            const ntBlob = new Blob([_ntHtml], { type: 'text/html' });
            window.__ntBlobURL = URL.createObjectURL(ntBlob);
            if (oldUrl) URL.revokeObjectURL(oldUrl);
        }

        /* ─── SERVER TAB ─── */
        function syncCurrentServerDisplay() {
            const currentUrl = localStorage.getItem('proxServer') ?? DEFAULT_WISP;
            const allServers = [...WISP_SERVERS, ...getStoredWisps()];
            const found = allServers.find(s => s.url === currentUrl);
            document.getElementById('cs-name').textContent = found?.name ?? 'Custom Server';
            document.getElementById('cs-url').textContent = currentUrl;
            // ping it
            const dot = document.getElementById('cs-indicator');
            const txt = document.getElementById('cs-ping');
            dot.className = 'status-indicator';
            txt.textContent = '...';
            const start = Date.now();
            const tryPing = () => {
                try {
                    const ws = new WebSocket(currentUrl);
                    const t = setTimeout(() => { try { ws.close(); } catch{} dot.classList.add('status-error'); txt.textContent = 'Timeout'; }, 2500);
                    ws.onopen = () => { clearTimeout(t); dot.classList.add('status-success'); txt.textContent = (Date.now()-start)+'ms'; try{ws.close();}catch{} };
                    ws.onerror = () => { clearTimeout(t); dot.classList.add('status-error'); txt.textContent = 'Offline'; };
                } catch { dot.classList.add('status-error'); txt.textContent = 'Error'; }
            };
            tryPing();
        }

        function openServerSelectModal() {
            document.getElementById('server-select-modal').classList.remove('hidden');
            document.getElementById('save-custom-wisp').onclick = saveCustomWisp;
            renderServerList();
        }

        function closeServerSelectModal() {
            document.getElementById('server-select-modal').classList.add('hidden');
        }

        function renderServerList() {
            const list = document.getElementById('server-list');
            if (!list) return;
            list.innerHTML = '';

            const currentUrl = localStorage.getItem('proxServer') ?? DEFAULT_WISP;
            const allWisps = [...WISP_SERVERS, ...getStoredWisps()];

            allWisps.forEach((server, index) => {
                const isActive = server.url === currentUrl;
                const isCustom = index >= WISP_SERVERS.length;

                const item = document.createElement('div');
                item.className = `wisp-option ${isActive ? 'active' : ''}`;

                const customBtns = isCustom
                    ? `<button class="edit-wisp-btn" onclick="event.stopPropagation(); editCustomWispName('${server.url}')" title="Rename"><i class="fa-solid fa-pencil"></i></button>
                       <button class="delete-wisp-btn" aria-label="Remove server" onclick="event.stopPropagation(); deleteCustomWisp('${server.url}')"><i class="fa-solid fa-trash"></i></button>`
                    : '';

                item.innerHTML = `
                    <div class="wisp-option-header">
                        <div class="wisp-option-name">
                            ${server.name}
                            ${isActive ? '<i class="fa-solid fa-check" style="margin-left:8px; font-size: 0.7em; color: var(--accent);"></i>' : ''}
                        </div>
                        <div class="server-status">
                            <span class="ping-text">...</span>
                            <div class="status-indicator"></div>
                            ${customBtns}
                        </div>
                    </div>
                    <div class="wisp-option-url" title="${server.url}">${server.url.length > 40 ? server.url.slice(0, 40) + '...' : server.url}</div>
                `;

                item.onclick = () => {
                    setWisp(server.url);
                    closeServerSelectModal();
                };
                list.appendChild(item);
                checkServerHealth(server.url, item);
            });

            const isAutoswitch = localStorage.getItem('wispAutoswitch') !== 'false';
            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'wisp-option';
            toggleContainer.style.cssText = 'margin-top: 10px; cursor: default;';
            toggleContainer.innerHTML = `
                <div class="wisp-option-header" style="justify-content: space-between;">
                    <div class="wisp-option-name"><i class="fa-solid fa-rotate" style="margin-right:8px"></i> Auto-switch on failure</div>
                    <div class="toggle-switch ${isAutoswitch ? 'active' : ''}" id="autoswitch-toggle">
                        <div class="toggle-knob"></div>
                    </div>
                </div>
            `;
            toggleContainer.onclick = () => {
                const newState = localStorage.getItem('wispAutoswitch') !== 'false' ? false : true;
                localStorage.setItem('wispAutoswitch', newState);
                document.getElementById('autoswitch-toggle')?.classList.toggle('active', newState);
                document.getElementById('autoswitch-toggle-main')?.classList.toggle('active', newState);
                navigator.serviceWorker.controller?.postMessage({ type: 'config', autoswitch: newState });
                proxyNotify('success', 'Settings Saved', `Autoswitch ${newState ? 'Enabled' : 'Disabled'}`);
            };
            list.appendChild(toggleContainer);
        }

        function saveCustomWisp() {
            const input = document.getElementById('custom-wisp-input');
            const nameInput = document.getElementById('custom-wisp-name');
            const url = input.value.trim();

            if (!url) return;
            if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
                proxyNotify('error', 'Invalid URL', 'URL must start with wss:// or ws://');
                return;
            }

            const customWisps = getStoredWisps();
            if (customWisps.some(w => w.url === url) || WISP_SERVERS.some(w => w.url === url)) {
                proxyNotify('warning', 'Already Exists', 'This server is already in the list.');
                return;
            }

            const rawName = nameInput ? nameInput.value.trim() : '';
            const name = rawName || `Custom ${customWisps.length + 1}`;
            const newServer = { name, url };
            customWisps.push(newServer);
            localStorage.setItem('customWisps', JSON.stringify(customWisps));
            
            setWisp(url);
            
            input.value = '';
            if (nameInput) nameInput.value = '';
        }

        window.deleteCustomWisp = function (urlToDelete) {
            if (!confirm("Remove this server?")) return;

            let customWisps = getStoredWisps().filter(w => w.url !== urlToDelete);
            localStorage.setItem('customWisps', JSON.stringify(customWisps));

            if (localStorage.getItem('proxServer') === urlToDelete) {
                setWisp(DEFAULT_WISP);
            } else {
                renderServerList();
            }
        };

        window.editCustomWispName = function (url) {
            const customWisps = getStoredWisps();
            const server = customWisps.find(w => w.url === url);
            if (!server) return;

            const newName = prompt('Rename server:', server.name);
            if (newName === null) return;
            const trimmed = newName.trim();
            if (!trimmed) { proxyNotify('error', 'Invalid Name', 'Name cannot be empty.'); return; }

            server.name = trimmed;
            localStorage.setItem('customWisps', JSON.stringify(customWisps));
            renderServerList();
            proxyNotify('success', 'Renamed', `Server renamed to "${trimmed}"`);
        };

        async function checkServerHealth(url, element) {
            const dot = element.querySelector('.status-indicator');
            const text = element.querySelector('.ping-text');
            const start = Date.now();

            const markOffline = () => {
                dot.classList.add('status-error');
                text.textContent = "Offline";
            };

            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 2000);
                
                await fetch(url.replace('wss://', 'https://').replace('/wisp/', '/health') || url, {
                    method: 'HEAD',
                    signal: controller.signal,
                    mode: 'no-cors'
                });
                
                clearTimeout(timeout);
                dot.classList.add('status-success');
                text.textContent = `${Date.now() - start}ms`;
            } catch {
                try {
                    const wsTest = new WebSocket(url);
                    wsTest.onopen = () => {
                        dot.classList.add('status-success');
                        text.textContent = `${Date.now() - start}ms`;
                        wsTest.close();
                    };
                    wsTest.onerror = markOffline;
                    
                    setTimeout(() => {
                        if (wsTest.readyState !== WebSocket.OPEN) {
                            wsTest.close();
                            markOffline();
                        }
                    }, 1000);
                } catch { markOffline(); }
            }
        }

        async function setWisp(url) {
            const oldUrl = localStorage.getItem('proxServer');
            localStorage.setItem('proxServer', url);

            // Actually update the live BareMux transport so the proxy uses the new server immediately
            try {
                if (sharedConnection) {
                    await sharedConnection.setTransport(
                        "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport@2.1.28/dist/index.mjs",
                        [{ wisp: url }]
                    );
                }
            } catch (e) {
                console.warn("Failed to update BareMux transport:", e);
            }

            navigator.serviceWorker.controller?.postMessage({ type: 'config', wispurl: url });

            if (oldUrl !== url) {
                const serverName = [...WISP_SERVERS, ...getStoredWisps()].find(s => s.url === url)?.name ?? 'Custom Server';
                proxyNotify('success', 'Proxy Changed', `Switching to ${serverName}...`);
            }

            // Re-render server list so active checkmark updates, also refresh current server display
            renderServerList();
            setTimeout(() => syncCurrentServerDisplay(), 100);

            const activeTab = getActiveTab();
            if (activeTab) {
                if (activeTab.url && activeTab.url !== 'NT.html' && activeTab.url !== 'newtab') {
                    const currentUrl = activeTab.url;
                    activeTab.loading = true;
                    showIframeLoading(true, currentUrl);
                    updateLoadingBar(activeTab, 10);
                    activeTab.frame.go(currentUrl);
                }
            }
        }

        /* ─────────────────────────────────────────
           PROXY BOOKMARK BAR
        ───────────────────────────────────────── */
        function getProxyBookmarks() {
            try { return JSON.parse(localStorage.getItem('proxyBookmarks') || '[]'); }
            catch { return []; }
        }
        function saveProxyBookmarks(list) {
            localStorage.setItem('proxyBookmarks', JSON.stringify(list));
        }

        function renderBookmarkBar() {
            const bar = document.getElementById('proxy-bookmark-bar');
            if (!bar) return;
            bar.innerHTML = '';
            const bookmarks = getProxyBookmarks();
            const tab = getActiveTab();
            const curUrl = tab?.url && tab.url !== 'NT.html' && !tab.url.includes('NT.html') && tab.url !== 'newtab' ? tab.url : '';

            // Update the nav bookmark icon: filled = already bookmarked, outline = not
            const isBookmarked = curUrl && bookmarks.some(b => b.url === curUrl);
            const bmBtn = document.getElementById('bookmark-save-btn');
            if (bmBtn) {
                bmBtn.classList.toggle('bm-active', isBookmarked);
                bmBtn.innerHTML = isBookmarked
                    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`
                    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
            }

            // Only render chips — bar always visible, just empty when there are none
            if (bookmarks.length === 0) return;

            bookmarks.forEach((bm, idx) => {
                const chip = document.createElement('div');
                chip.className = 'bookmark-chip';
                chip.title = bm.url;
                const favicon = bm.favicon || `https://www.google.com/s2/favicons?domain=${tryGetHostname(bm.url)}&sz=32`;
                chip.innerHTML = `
                    <img src="${favicon}" alt="" onerror="this.style.display='none'" style="width:11px;height:11px;border-radius:2px;flex-shrink:0;">
                    <span class="bookmark-chip-label">${escapeHtml(bm.label)}</span>
                    <span class="bookmark-chip-del" onclick="event.stopPropagation();deleteProxyBookmark(${idx})" title="Remove">×</span>
                `;
                chip.addEventListener('click', () => handleSubmit(bm.url));
                chip.addEventListener('dblclick', (e) => { e.stopPropagation(); openBmEditModal(idx); });
                bar.appendChild(chip);
            });
        }

        function saveProxyBookmark() {
            const tab = getActiveTab();
            const url = tab?.url;
            if (!url || url === 'NT.html' || url.includes('NT.html') || url === 'newtab') {
                proxyNotify('warning', 'No Page', 'Navigate to a page first.');
                return;
            }

            const bookmarks = getProxyBookmarks();
            const existingIdx = bookmarks.findIndex(b => b.url === url);

            if (existingIdx !== -1) {
                // Remove bookmark
                bookmarks.splice(existingIdx, 1);
                saveProxyBookmarks(bookmarks);
                renderBookmarkBar();
                proxyNotify('info', 'Removed', 'Bookmark removed.');
                return;
            }

            // Add bookmark
            let label = '';
            try {
                label = tab.title && tab.title !== 'New Tab' ? tab.title : new URL(url).hostname.replace('www.','');
            } catch {
                label = url;
            }
            if (label.length > 20) label = label.slice(0, 20);
            const favicon = tab.favicon || `https://www.google.com/s2/favicons?domain=${tryGetHostname(url)}&sz=32`;
            bookmarks.push({ label, url, favicon });
            saveProxyBookmarks(bookmarks);
            renderBookmarkBar();
            proxyNotify('success', 'Bookmarked', `"${label}" saved.`);
        }

        function deleteProxyBookmark(idx) {
            const bookmarks = getProxyBookmarks();
            bookmarks.splice(idx, 1);
            saveProxyBookmarks(bookmarks);
            renderBookmarkBar();
        }

        /* ── Bookmark edit modal ── */
        let _bmEditIdx = -1;
        function openBmEditModal(idx) {
            _bmEditIdx = idx;
            const bm = getProxyBookmarks()[idx];
            if (!bm) return;
            document.getElementById('bm-edit-label').value = bm.label;
            document.getElementById('bm-edit-url').value = bm.url;
            document.getElementById('bm-edit-overlay').classList.remove('hidden');
        }
        function closeBmEditModal() {
            document.getElementById('bm-edit-overlay').classList.add('hidden');
            _bmEditIdx = -1;
        }
        function saveBmEdit() {
            if (_bmEditIdx < 0) return;
            const bookmarks = getProxyBookmarks();
            const label = document.getElementById('bm-edit-label').value.trim();
            let url = document.getElementById('bm-edit-url').value.trim();
            if (!url) return;
            if (!/^https?:\/\//.test(url)) url = 'https://' + url;
            bookmarks[_bmEditIdx] = { ...bookmarks[_bmEditIdx], label: label || url, url, favicon: `https://www.google.com/s2/favicons?domain=${tryGetHostname(url)}&sz=32` };
            saveProxyBookmarks(bookmarks);
            closeBmEditModal();
            renderBookmarkBar();
        }


        function hideErudaEntryBtn(win) {
            const attempt = (tries) => {
                try {
                    const container = win.document.getElementById('eruda');
                    if (!container) {
                        if (tries > 0) setTimeout(() => attempt(tries - 1), 80);
                        return;
                    }
                    const root = container.shadowRoot || container;
                    const btn = root.querySelector('.eruda-entry-btn');
                    if (btn) {
                        btn.style.cssText += 'display:none!important;visibility:hidden!important;pointer-events:none!important;';
                    } else if (tries > 0) {
                        setTimeout(() => attempt(tries - 1), 80);
                    }
                } catch {}
            };
            attempt(10); 
        }

        function toggleDevTools() {
            const tab = getActiveTab();
            const win = tab?.frame.frame.contentWindow;
            if (!win) return;

            if (win.eruda) {
                const panel = win.eruda._shadowRoot || win.document.querySelector('.__chobitsu-hide__') || win.eruda._container;
                if (tab._erudaOpen) {
                    win.eruda.hide();
                    tab._erudaOpen = false;
                } else {
                    win.eruda.show();
                    hideErudaEntryBtn(win);
                    tab._erudaOpen = true;
                }
                return;
            }

            const script = win.document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/eruda";
            script.onload = () => {
                win.eruda.init();
                win.eruda.show();
                hideErudaEntryBtn(win);
                tab._erudaOpen = true;
            };
            win.document.body.appendChild(script);
        }

        async function checkHashParameters() {
            if (window.location.hash) {
                const hash = decodeURIComponent(window.location.hash.substring(1));
                if (hash) handleSubmit(hash);
                history.replaceState(null, null, location.pathname);
            }
        }


        async function proxyInit() {
            const root = document.getElementById('proxy-app');
            const _piSteps = [
                { id: 'pi-s1', label: 'Fetching server list' },
                { id: 'pi-s2', label: 'Selecting fastest server' },
                { id: 'pi-s3', label: 'Loading proxy engine' },
                { id: 'pi-s4', label: 'Opening transport' },
                { id: 'pi-s5', label: 'Registering service worker' },
            ];
            root.innerHTML = `
                <div id="proxy-init-screen" style="
                    display:flex; align-items:center; justify-content:center;
                    width:100%; height:100%;
                    background:var(--bg); font-family:var(--font);">
                    <div style="
                        text-align:center; max-width:340px; width:90%;
                        padding:36px 32px;
                        background:var(--card-bg);
                        border:1px solid var(--accent);
                        border-radius:16px;
                        box-shadow:0 0 60px var(--accent-glow),0 0 20px rgba(0,0,0,0.8);
                        backdrop-filter:blur(10px);">
                        <div style="
                            width:42px; height:42px; margin:0 auto 20px;
                            border:3px solid var(--border);
                            border-top-color:var(--accent);
                            border-radius:50%;
                            animation:spin 0.8s linear infinite;">
                        </div>
                        <div style="font-size:0.65rem; letter-spacing:3px; text-transform:uppercase; color:var(--accent); margin-bottom:20px; text-shadow:0 0 8px var(--accent-glow);">
                            GHOSTLINK PROXY
                        </div>
                        <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
                            ${_piSteps.map(s => `
                                <div id="${s.id}" style="display:flex; align-items:center; gap:10px; font-size:0.78rem; color:var(--text-dim); transition:color 0.3s;">
                                    <span id="${s.id}-icon" style="
                                        width:18px; height:18px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
                                        border:1.5px solid var(--border); border-radius:50%; font-size:0.6rem; color:var(--text-dim); transition:0.3s;">
                                        ○
                                    </span>
                                    ${s.label}
                                </div>`).join('')}
                        </div>
                        <div id="pi-bar-wrap" style="
                            height:3px; background:var(--border); border-radius:2px; margin-top:22px; overflow:hidden;">
                            <div id="pi-bar" style="
                                height:100%; width:0%; background:var(--accent);
                                box-shadow:0 0 6px var(--accent-glow);
                                transition:width 0.5s cubic-bezier(0.4,0,0.2,1);
                                border-radius:2px;">
                            </div>
                        </div>
                    </div>
                </div>`;

            const _piMark = (stepId, state) => {
                const row = document.getElementById(stepId);
                const icon = document.getElementById(stepId + '-icon');
                const bar = document.getElementById('pi-bar');
                if (!row || !icon) return;
                const idx = _piSteps.findIndex(s => s.id === stepId);
                if (state === 'active') {
                    row.style.color = 'var(--text-primary)';
                    icon.textContent = '◌';
                    icon.style.borderColor = 'var(--accent)';
                    icon.style.color = 'var(--accent)';
                    if (bar) bar.style.width = ((idx / _piSteps.length) * 100) + '%';
                } else if (state === 'done') {
                    row.style.color = 'var(--accent)';
                    icon.textContent = '✓';
                    icon.style.borderColor = 'var(--accent)';
                    icon.style.color = 'var(--accent)';
                    icon.style.background = 'rgba(110,203,255,0.12)';
                    if (bar) bar.style.width = (((idx + 1) / _piSteps.length) * 100) + '%';
                }
            };

            const ntTemplate = document.getElementById('nt-html-template');
            const _ntStyles = getComputedStyle(document.documentElement);
            const _ntGetVar = (v) => _ntStyles.getPropertyValue(v).trim();
            const _customFontLinks = Array.from(document.querySelectorAll('link[id^="custom-font-link-"]'))
                .map(l => `<link rel="stylesheet" href="${l.href}">`)
                .join('');
            const _ntThemeScript = `<script>
(function() {
    var r = document.documentElement;
    r.style.setProperty('--nt-bg',             \`${_ntGetVar('--bg')}\`);
    r.style.setProperty('--nt-accent',         \`${_ntGetVar('--accent')}\`);
    r.style.setProperty('--nt-accent-glow',    \`${_ntGetVar('--accent-glow')}\`);
    r.style.setProperty('--nt-text-primary',   \`${_ntGetVar('--text-primary')}\`);
    r.style.setProperty('--nt-text-dim',       \`${_ntGetVar('--text-dim')}\`);
    r.style.setProperty('--nt-border',         \`${_ntGetVar('--border')}\`);
    r.style.setProperty('--nt-card-bg',        \`${_ntGetVar('--card-bg')}\`);
    r.style.setProperty('--nt-input-bg',       \`${_ntGetVar('--input-bg')}\`);
    r.style.setProperty('--nt-font',           \`${_ntGetVar('--font')}\`);
    r.style.setProperty('--nt-bg-image',       \`${_ntGetVar('--bg-image')}\`);
    r.style.setProperty('--nt-bg-blur',        \`${_ntGetVar('--bg-blur')}\`);
    r.style.setProperty('--nt-bg-brightness',  \`${_ntGetVar('--bg-brightness')}\`);
})();
<\/script>`;
            let _ntHtml = ntTemplate.innerHTML;
            _ntHtml = _ntHtml.includes('<head>') ? _ntHtml.replace('<head>', '<head>' + _customFontLinks + _ntThemeScript) : _customFontLinks + _ntThemeScript + _ntHtml;
            const ntBlob = new Blob([_ntHtml], { type: 'text/html' });
            window.__ntBlobURL = URL.createObjectURL(ntBlob);
            const _slowTimer = setTimeout(() => {
                const screen = document.getElementById('proxy-init-screen');
                if (!screen) return;
                const existing = document.getElementById('pi-slow-banner');
                if (existing) return;
                const card = screen.querySelector('div');
                if (!card) return;
                card.style.maxWidth = '480px';
                card.style.width = '90%';
                const banner = document.createElement('div');
                banner.id = 'pi-slow-banner';
                banner.style.cssText = `
                    margin-top:18px; padding:14px 16px; border-radius:10px;
                    background:rgba(110,203,255,0.06); border:1px solid var(--accent);
                    box-shadow:0 0 18px var(--accent-glow); text-align:left;`;
                banner.innerHTML = `
                    <div style="font-size:0.7rem;letter-spacing:2px;text-transform:uppercase;color:var(--accent);margin-bottom:8px;text-shadow:0 0 8px var(--accent-glow);">
                        Still loading&hellip;
                    </div>
                    <p style="color:var(--text-dim);font-size:0.78rem;line-height:1.7;margin-bottom:10px;">
                        This is taking longer than usual. Still trying &mdash; but here are common reasons it gets stuck:
                    </p>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <div style="border-left:2px solid var(--accent);padding-left:10px;">
                            <span style="color:var(--text-primary);font-size:0.78rem;font-weight:bold;">Missing files</span>
                            <p style="color:var(--text-dim);font-size:0.76rem;line-height:1.6;margin-top:2px;">
                                <code style="background:rgba(255,255,255,0.07);padding:1px 4px;border-radius:3px;">sw.js</code> and
                                <code style="background:rgba(255,255,255,0.07);padding:1px 4px;border-radius:3px;">bareworker.js</code>
                                must be in the root of the site.
                                Get them from the <a href="https://github.com/immcrab/urban-octo-winner" target="_blank" rel="noopener"
                                style="color:var(--accent);text-decoration:underline;">GhostLink GitHub</a> or contact the site owner.
                            </p>
                        </div>
                        <div style="border-left:2px solid var(--accent);padding-left:10px;">
                            <span style="color:var(--text-primary);font-size:0.78rem;font-weight:bold;">Insecure connection</span>
                            <p style="color:var(--text-dim);font-size:0.76rem;line-height:1.6;margin-top:2px;">
                                The proxy requires <strong style="color:var(--accent)">HTTPS</strong>. If your URL starts with
                                <code style="background:rgba(255,255,255,0.07);padding:1px 4px;border-radius:3px;">http://</code>,
                                switch to <code style="background:rgba(255,255,255,0.07);padding:1px 4px;border-radius:3px;">https://</code>.
                            </p>
                        </div>
                    </div>`;
                card.appendChild(banner);
            }, 15000);
            const _showProxyError = (err) => {
                clearTimeout(_slowTimer);
                const root = document.getElementById('proxy-app');
                if (!root) return;
                root.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;height:100%;width:100%;font-family:var(--font);background:var(--bg);color:var(--text-primary);">
                        <div style="text-align:center;max-width:500px;width:90%;padding:32px;
                            background:var(--card-bg);border:1px solid var(--accent);border-radius:16px;
                            box-shadow:0 0 60px var(--accent-glow),0 0 20px rgba(0,0,0,0.8);backdrop-filter:blur(10px);">
                            <div style="width:42px;height:42px;margin:0 auto 16px;
                                border:3px solid var(--border);border-top-color:var(--accent);
                                border-radius:50%;opacity:0.4;"></div>
                            <div style="font-size:0.65rem;letter-spacing:3px;text-transform:uppercase;
                                color:var(--accent);margin-bottom:6px;text-shadow:0 0 8px var(--accent-glow);">
                                PROXY FAILED TO START
                            </div>
                            <p style="color:var(--text-dim);font-size:0.8rem;margin-bottom:22px;line-height:1.5;">
                                Something went wrong. Here&rsquo;s what to check:
                            </p>
                            <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;text-align:left;">
                                <div style="background:rgba(110,203,255,0.04);border:1px solid var(--accent);
                                    border-radius:10px;padding:14px 16px;">
                                    <div style="color:var(--accent);font-size:0.8rem;font-weight:bold;margin-bottom:6px;
                                        text-shadow:0 0 8px var(--accent-glow);">
                                        Missing files
                                    </div>
                                    <p style="color:var(--text-dim);font-size:0.78rem;line-height:1.7;">
                                        Make sure <code style="background:rgba(255,255,255,0.07);padding:1px 5px;border-radius:3px;">sw.js</code>
                                        and <code style="background:rgba(255,255,255,0.07);padding:1px 5px;border-radius:3px;">bareworker.js</code>
                                        are in the root of your site. Download them from the
                                        <a href="https://github.com/immcrab/urban-octo-winner" target="_blank" rel="noopener"
                                            style="color:var(--accent);text-decoration:underline;text-shadow:0 0 6px var(--accent-glow);">
                                            GhostLink GitHub repo</a>,
                                        or contact the site owner.
                                    </p>
                                </div>
                                <div style="background:rgba(110,203,255,0.04);border:1px solid var(--accent);
                                    border-radius:10px;padding:14px 16px;">
                                    <div style="color:var(--accent);font-size:0.8rem;font-weight:bold;margin-bottom:6px;
                                        text-shadow:0 0 8px var(--accent-glow);">
                                        Insecure connection
                                    </div>
                                    <p style="color:var(--text-dim);font-size:0.78rem;line-height:1.7;">
                                        The proxy requires a secure connection.
                                        Make sure your URL starts with
                                        <code style="background:rgba(255,255,255,0.07);padding:1px 5px;border-radius:3px;color:var(--accent);">https://</code>
                                        and not <code style="background:rgba(255,255,255,0.07);padding:1px 5px;border-radius:3px;">http://</code>.
                                    </p>
                                </div>
                            </div>
                            <button onclick="proxyBrowserInitialized=false; nav('proxy');"
                                style="padding:12px 30px;background:var(--accent);color:#000;border:none;border-radius:8px;
                                cursor:pointer;font-family:var(--font);font-weight:bold;font-size:0.75rem;
                                letter-spacing:1px;text-transform:uppercase;
                                box-shadow:0 0 18px var(--accent-glow);transition:0.2s;">
                                Retry
                            </button>
                        </div>
                    </div>`;
            };

            try {
                _piMark('pi-s1', 'active');
                await fetchWispServers();
                _piMark('pi-s1', 'done');

                _piMark('pi-s2', 'active');
                await initializeWithBestServer();
                _piMark('pi-s2', 'done');

                _piMark('pi-s3', 'active');
                await getSharedScramjet();
                _piMark('pi-s3', 'done');

                _piMark('pi-s4', 'active');
                await getSharedConnection();
                _piMark('pi-s4', 'done');

                if ('serviceWorker' in navigator) {
                    _piMark('pi-s5', 'active');
                    const reg = await navigator.serviceWorker.register(getBasePath() + 'sw.js', { scope: getBasePath() });
                    
                    await navigator.serviceWorker.ready;
                    
                    const wispUrl = localStorage.getItem("proxServer") ?? DEFAULT_WISP;
                    const allServers = getAllWispServers();
                    const autoswitch = localStorage.getItem('wispAutoswitch') !== 'false';
                    
                    const swConfig = {
                        type: "config",
                        wispurl: wispUrl,
                        servers: allServers,
                        autoswitch: autoswitch
                    };

                    const sendConfig = async () => {
                        const sw = reg.active || navigator.serviceWorker.controller;
                        if (sw) {
                            console.log("Sending config to SW:", swConfig);
                            sw.postMessage(swConfig);
                        }
                    };
                    sendConfig();
                    setTimeout(sendConfig, 500);
                    setTimeout(sendConfig, 1500);

                    navigator.serviceWorker.addEventListener('message', (event) => {
                        const { type, url, name, message } = event.data;
                        if (type === 'wispChanged') {
                            console.log("SW reported Wisp Change:", event.data);
                            localStorage.setItem("proxServer", url);
                            proxyNotify('info', 'Autoswitched Proxy', `Now using ${name} because the previous server was slow or offline.`);
                        } else if (type === 'wispError') {
                            console.error("SW reported Wisp Error:", event.data);
                            proxyNotify('error', 'Proxy Error', message);
                        }
                    });

                    reg.update();
                    _piMark('pi-s5', 'done');
                }

                clearTimeout(_slowTimer);
                await initializeBrowser();
            } catch (err) {
                console.error("Proxy initialization error:", err);
                _showProxyError(err);
            }
        }
        // ---END PROXY BROWSER LOGIC---

        // --- GAMES LOGIC ---
        function cleanHTML(html) {
            // ── Phase 1: Targeted DOM junk removal (ad divs, sidebarad CSS) ──
            html = html.replace(/#sidebarad1\s*,\s*\n?#sidebarad2[\s\S]*?\.sidebar-frame\s*\{[\s\S]*?\}/g, '');
            html = html.replace(/<div\s+id=["']sidebarad[12]["'][^>]*>[\s\S]*?<\/div>\s*(<\/div>)?/g, '');
            html = html.replace(/<style>[^<]*#sidebarad[\s\S]*?<\/style>/g, '');

            // ── Phase 2: Universal obfuscated <script> removal ──
            // Extracts every <script> block, scores it for obfuscation signals,
            // and drops it if the score crosses the threshold.
            html = html.replace(/<script(\s[^>]*)?>[\s\S]*?<\/script>/gi, (fullTag) => {
                // Always keep external scripts (src="…") — they are not inline obfuscation
                if (/\ssrc\s*=/i.test(fullTag)) return fullTag;

                // Pull just the body text between the tags
                const body = fullTag.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');

                let score = 0;

                // ── Hard patterns: one match = instant removal ──
                const hardPatterns = [
                    // _0x hex-variable names from javascript-obfuscator / obfuscator.io
                    /_0x[a-f0-9]{3,}\s*[\[=(,;]/i,
                    // eval( wrapping a decoded string
                    /eval\s*\(\s*(atob|unescape|decodeURI|String\.fromCharCode)\s*\(/i,
                    // Function constructor as eval surrogate  e.g. Function("return …")()
                    /new\s+Function\s*\(\s*["'`][^"'`]{30,}/,
                    // p,a,c,k,e,r packer signature
                    /eval\s*\(\s*function\s*\(\s*p\s*,\s*a\s*,\s*c\s*,\s*k\s*,\s*e\s*,\s*[rd]\s*\)/,
                    // JSFuck / JJEncode: heavy use of []!+ symbols
                    /(\[\]|\!\[\])\s*\+\s*(\[\]|\!\[\])\s*\+\s*(\[\]|\!\[\])/,
                    // Aaencode / smiley obfuscation
                    /ﾟωﾟ|ﾟΘﾟ|ﾟｰﾟ/,
                    // Hex-encoded string property access  obj['\x61\x74\x6f\x62']
                    /\[['"`](?:\\x[0-9a-f]{2}){3,}['"`]\]/i,
                    // atob + immediate eval pipeline
                    /\batob\s*\([^)]*\)\s*[,;)]\s*(eval|Function)\b/i,
                ];

                for (const pat of hardPatterns) {
                    if (pat.test(body)) return ''; // instant strip
                }

                // ── Soft signals: accumulate a score ──

                // _0x hex variable references anywhere (softer — needs more signals to confirm)
                const hexVarMatches = (body.match(/_0x[a-f0-9]{3,}/gi) || []).length;
                score += Math.min(hexVarMatches * 3, 30);

                // Hex escape sequences  \x61\x74
                const hexEscapes = (body.match(/\\x[0-9a-f]{2}/gi) || []).length;
                score += Math.min(hexEscapes * 2, 20);

                // Unicode escapes  \u0041
                const unicodeEscapes = (body.match(/\\u[0-9a-f]{4}/gi) || []).length;
                score += Math.min(unicodeEscapes * 2, 20);

                // String.fromCharCode usage
                if (/String\s*\.\s*fromCharCode\s*\(/.test(body)) score += 15;

                // Bare atob( or btoa( — common in decode pipelines
                if (/\batob\s*\(/.test(body)) score += 10;
                if (/\bbtoa\s*\(/.test(body)) score += 5;

                // unescape( — old-school obfuscation
                if (/\bunescape\s*\(/.test(body)) score += 10;

                // Bare eval( without decode wrapper (still suspicious)
                if (/\beval\s*\(/.test(body)) score += 15;

                // Very long single tokens (minified/packed source, long encoded strings)
                const longTokens = (body.match(/[^\s,;(){}\[\]"'`]{200,}/g) || []).length;
                score += longTokens * 8;

                // Long base64-looking strings  (A-Za-z0-9+/=  run of 60+ chars)
                const b64Runs = (body.match(/[A-Za-z0-9+/=]{60,}/g) || []).length;
                score += b64Runs * 5;

                // Dense comma-separated number arrays (common in charcode obfuscation)
                const numArrays = (body.match(/(?:\d+\s*,\s*){10,}\d+/g) || []).length;
                score += numArrays * 8;

                // High ratio of non-alphanumeric characters (symbol soup)
                const nonAlpha = (body.match(/[^a-zA-Z0-9\s]/g) || []).length;
                const ratio = body.length > 0 ? nonAlpha / body.length : 0;
                if (ratio > 0.6 && body.length > 200) score += 20;

                // Obfuscated array-rotation / self-defence tricks
                if (/\bsetInterval\s*\(.*\btoString\b/s.test(body)) score += 10;
                if (/parseInt\s*\([^)]+\)\s*!==?\s*parseInt\s*\(/.test(body)) score += 10;

                // Strip if total score is high enough
                return score >= 25 ? '' : fullTag;
            });

            return html;
        }

        const gamesContainer = document.getElementById('gamesContainer');
        const zoneViewer = document.getElementById('zoneViewer');
        let zoneFrame = document.getElementById('zoneFrame');
        const gamesFeatContainer = document.getElementById('gamesFeaturedContainer');
        const gamesFeatWrapper = document.getElementById('gamesFeaturedWrapper');
        let gamesPopularityData = {};
        let gamesLoaded = false;

        const zonesurls = [
            "https://cdn.jsdelivr.net/gh/freebuisness/assets@latest/zones.json"
        ];
        let zonesURL = zonesurls[0];
        const coverURL = "https://cdn.jsdelivr.net/gh/freebuisness/covers@main";
        let htmlURL = "https://cdn.jsdelivr.net/gh/freebuisness/html@main";
        fetch("https://api.github.com/repos/freebuisness/html/commits?per_page=1&t=" + Date.now())
            .then(r => r.json())
            .then(j => { if (j[0] && j[0].sha) htmlURL = `https://cdn.jsdelivr.net/gh/freebuisness/html@${j[0].sha}`; })
            .catch(() => {});

        let zones = [];
        let gamesFavorites = JSON.parse(localStorage.getItem('gn-favs') || '[]');
        let gamesShowFavsOnly = false;

        let gamesFeaturedGames = [];
        let gamesCarouselIndex = 0;
        let gamesCarouselTimer;
        let gamesPauseTimer;
        let gamesIsTransitioning = false;

        async function gamesListZones() {
            try {
                let sharesponse;
                try {
                    sharesponse = await fetch("https://api.github.com/repos/freebuisness/assets/commits?t=" + Date.now());
                } catch (error) {}
                if (sharesponse && sharesponse.status === 200) {
                    try {
                        let shajson = await sharesponse.json();
                        let sha = shajson[0]['sha'];
                        if (sha) zonesURL = `https://cdn.jsdelivr.net/gh/freebuisness/assets@${sha}/zones.json`;
                    } catch (error) {}
                }
                const response = await fetch(zonesURL + "?t=" + Date.now());
                zones = await response.json();
                await gamesFetchPopularity();
                gamesSetupFeatured();
                gamesHandleSearch();
            } catch (error) {
                gamesContainer.innerHTML = "Error: " + error;
            }
        }

        async function gamesFetchPopularity() {
            try {
                const response = await fetch("https://data.jsdelivr.com/v1/stats/packages/gh/gn-math/html@main/files?period=year");
                const data = await response.json();
                data.forEach(file => {
                    const idMatch = file.name.match(/\/(\d+)\.html$/);
                    if (idMatch) {
                        const id = parseInt(idMatch[1]);
                        gamesPopularityData[id] = file.hits.total;
                    }
                });
            } catch (error) {
                gamesPopularityData[0] = 0;
            }
        }

        function gamesSetupFeatured() {
            if (zones.length < 5) return;
            const now = new Date();
            const dateStr = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
            const block = now.getHours() < 12 ? 'AM' : 'PM';
            const seed = dateStr + block;
            let seededRandom = function(s) {
                let hash = 0;
                for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
                return function() {
                    hash = Math.sin(hash) * 10000;
                    return hash - Math.floor(hash);
                };
            };
            const rand = seededRandom(seed);
            let pool = [...zones].filter(z => !z.name.includes("SUGGEST"));
            gamesFeaturedGames = [];
            for (let i = 0; i < 10; i++) {
                let idx = Math.floor(rand() * pool.length);
                gamesFeaturedGames.push(pool.splice(idx, 1)[0]);
            }
            gamesRenderFeatured();
            gamesFeatWrapper.style.display = 'block';
        }

        function gamesRenderFeatured() {
            gamesFeatContainer.innerHTML = "";
            const itemsVisible = window.innerWidth > 800 ? 5 : 2;
            const clonesBefore = gamesFeaturedGames.slice(-itemsVisible);
            const clonesAfter = gamesFeaturedGames.slice(0, itemsVisible);
            const displayPool = [...clonesBefore, ...gamesFeaturedGames, ...clonesAfter];
            displayPool.forEach((file) => {
                const div = document.createElement('div');
                div.className = 'games-featured-item';
                div.onclick = () => openZone(file);
                const img = document.createElement('img');
                img.src = file.cover.replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
                const p = document.createElement('p');
                p.textContent = file.name;
                p.style.fontSize = "0.75rem";
                p.style.marginTop = "8px";
                p.style.fontWeight = "bold";
                div.append(img, p);
                gamesFeatContainer.appendChild(div);
            });
            gamesCarouselIndex = itemsVisible;
            gamesUpdateCarouselPosition(false);
            gamesStartCarousel();
        }

        function gamesUpdateCarouselPosition(transition = true) {
            const itemsVisible = window.innerWidth > 800 ? 5 : 2;
            const offset = gamesCarouselIndex * (100 / itemsVisible);
            gamesFeatContainer.style.transition = transition ? "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)" : "none";
            gamesFeatContainer.style.transform = `translateX(-${offset}%)`;
        }

        function gamesStartCarousel() {
            clearInterval(gamesCarouselTimer);
            gamesCarouselTimer = setInterval(() => {
                gamesMoveCarousel(1);
            }, 4000);
        }

        function gamesMoveCarousel(direction) {
            if (gamesIsTransitioning) return;
            const itemsVisible = window.innerWidth > 800 ? 5 : 2;
            const totalItems = gamesFeaturedGames.length;
            gamesIsTransitioning = true;
            gamesCarouselIndex += direction;
            gamesUpdateCarouselPosition(true);
            setTimeout(() => {
                if (gamesCarouselIndex >= totalItems + itemsVisible) {
                    gamesCarouselIndex = itemsVisible;
                    gamesUpdateCarouselPosition(false);
                } else if (gamesCarouselIndex <= 0) {
                    gamesCarouselIndex = totalItems;
                    gamesUpdateCarouselPosition(false);
                }
                gamesIsTransitioning = false;
            }, 600);
        }

        function gamesManualNav(dir) {
            gamesMoveCarousel(dir);
            clearInterval(gamesCarouselTimer);
            clearTimeout(gamesPauseTimer);
            gamesPauseTimer = setTimeout(gamesStartCarousel, 4000);
        }

        function gamesHandleSearch() {
            const query = document.getElementById('gamesSearchInput').value.toLowerCase();
            const sortBy = document.getElementById('gamesSortSelect').value;
            let filtered = zones.filter(z => {
                const matchesSearch = z.name.toLowerCase().includes(query);
                const matchesFav = gamesShowFavsOnly ? gamesFavorites.includes(z.id) : true;
                return matchesSearch && matchesFav;
            });
            if (sortBy === 'name') {
                filtered.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === 'id') {
                filtered.sort((a, b) => b.id - a.id);
            } else {
                filtered.sort((a, b) => (gamesPopularityData[b.id] || 0) - (gamesPopularityData[a.id] || 0));
            }
            gamesRenderGrid(filtered);
        }

        function gamesToggleFavFilter() {
            gamesShowFavsOnly = !gamesShowFavsOnly;
            document.getElementById('gamesFavFilter').classList.toggle('active', gamesShowFavsOnly);
            gamesHandleSearch();
        }

        function gamesToggleHeart(e, id) {
            e.stopPropagation();
            if (gamesFavorites.includes(id)) {
                gamesFavorites = gamesFavorites.filter(f => f !== id);
            } else {
                gamesFavorites.push(id);
            }
            localStorage.setItem('gn-favs', JSON.stringify(gamesFavorites));
            gamesHandleSearch();
        }

        function gamesRenderGrid(data) {
            const query = document.getElementById('gamesSearchInput').value.toLowerCase();
            const displayData = data.filter(z => {
                const matchesSearch = z.name.toLowerCase().includes(query);
                const matchesFav = gamesShowFavsOnly ? gamesFavorites.includes(z.id) : true;
                return matchesSearch && matchesFav;
            });
            gamesContainer.innerHTML = "";
            displayData.forEach(file => {
                const div = document.createElement('div');
                div.className = 'zone-item';
                div.onclick = () => openZone(file);
                const heart = document.createElement('button');
                heart.className = `games-heart-btn ${gamesFavorites.includes(file.id) ? 'active' : ''}`;
                heart.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
                heart.onclick = (e) => gamesToggleHeart(e, file.id);
                const img = document.createElement('img');
                img.src = file.cover.replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
                const p = document.createElement('p');
                p.textContent = file.name;
                div.append(heart, img, p);
                gamesContainer.appendChild(div);
            });
        }

        // A few catalog wrappers are incomplete. Google Baseball (id 257) ships only
        // Google's localization fragment and never loads july4th19.js, so point it at
        // the full doodle page. The original URL stays as a fallback.
        const GAME_SOURCE_OVERRIDES = {
            257: "https://cdn.jsdelivr.net/gh/bubblfan/google-doodles@main/baseball/july4th19.html"
        };

        async function fetchGameHtml(file) {
            const original = file.url.replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
            const candidates = [GAME_SOURCE_OVERRIDES[file.id], original].filter(Boolean);
            let lastError;
            for (const candidate of candidates) {
                try {
                    const response = await fetch(candidate + "?t=" + Date.now());
                    if (!response.ok) throw new Error("HTTP " + response.status);
                    const html = await response.text();
                    if (html.length < 1000) throw new Error("Empty game page");
                    return html;
                } catch (error) {
                    lastError = error;
                }
            }
            throw lastError || new Error("Could not load game");
        }

        async function openZone(file) {
            if (file.name === "[!] GHOSTLINK DISCORD .gg/D4c9VFYWyU") {
                window.open("https://discord.com/invite/dKs2sUNUXd", "_blank");
                return;
            }
            if (file.url.startsWith("http")) {
                window.open(file.url, "_blank");
                return;
            }
            try {
                let html = await fetchGameHtml(file);
                html = cleanHTML(html);
                if (!zoneFrame || zoneFrame.contentDocument === null) {
                    zoneFrame = document.createElement("iframe");
                    zoneFrame.id = "zoneFrame";
                    zoneViewer.appendChild(zoneFrame);
                }
                zoneFrame.contentDocument.open();
                zoneFrame.contentDocument.write(html);
                zoneFrame.contentDocument.close();
                document.getElementById('zoneName').textContent = file.name;
                zoneViewer.dataset.zoneId = file.id;
                zoneViewer.style.display = "flex";
                zoneViewer.hidden = false;
            } catch (error) {
                alert("Failed to load zone: " + error.message);
            }
        }

        function closeZone() {
            zoneViewer.hidden = true;
            zoneViewer.style.display = "none";
            if (zoneFrame && zoneFrame.parentNode) {
                zoneViewer.removeChild(zoneFrame);
            }
            const url = new URL(window.location);
            url.searchParams.delete('id');
            history.pushState(null, '', url.toString());
        }

        function downloadZone() {
            let zone = zones.find(zone => zone.id + '' === zoneViewer.dataset.zoneId);
            fetch(zone.url.replace("{HTML_URL}", htmlURL) + "?t=" + Date.now()).then(res => res.text()).then(text => {
                text = cleanHTML(text);
                const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = zone.name + ".html";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }

        function fullscreenZone() {
            if (zoneFrame.requestFullscreen) {
                zoneFrame.requestFullscreen();
            } else if (zoneFrame.webkitRequestFullscreen) {
                zoneFrame.webkitRequestFullscreen();
            }
        }

        window.addEventListener('resize', () => {
            if (gamesFeaturedGames.length > 0) gamesRenderFeatured();
        });
    // ---END GAMES LOGIC---
    