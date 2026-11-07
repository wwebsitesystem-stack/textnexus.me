
        // BOOT SEQUENCE + CLOUDFLARE TURNSTILE
        (() => {
            const productionHosts = new Set(['textnexus.me', 'www.textnexus.me']);
            const TURNSTILE_SITE_KEY = productionHosts.has(location.hostname)
                ? '0x4AAAAAAFXCQ7lZ7OM2JFsT'
                : '1x00000000000000000000AA'; // Cloudflare test key, preview hosts only
            let turnstileWidgetId = null;

            function showTurnstileGate() {
                const gate = document.getElementById('turnstile-gate');
                if (!gate) return;
                gate.classList.add('gate-visible');
                renderTurnstileWidget();
            }

            function gateError(message) {
                const statusEl = document.getElementById('gate-status-text');
                const retryBtn = document.getElementById('gate-retry-btn');
                if (!statusEl || !retryBtn) return;
                statusEl.classList.add('gate-status-error');
                statusEl.textContent = message;
                retryBtn.style.display = 'inline-block';
            }

            function renderTurnstileWidget() {
                const statusEl = document.getElementById('gate-status-text');
                const retryBtn = document.getElementById('gate-retry-btn');
                if (!statusEl || !retryBtn) return;
                retryBtn.style.display = 'none';
                statusEl.classList.remove('gate-status-error');
                statusEl.textContent = 'Loading verification...';

                const render = () => {
                    if (!window.turnstile) return false;
                    statusEl.textContent = '';
                    try {
                        if (turnstileWidgetId !== null) {
                            window.turnstile.reset(turnstileWidgetId);
                        } else {
                            turnstileWidgetId = window.turnstile.render('#turnstile-widget', {
                                sitekey: TURNSTILE_SITE_KEY,
                                theme: 'dark',
                                callback: window.onTurnstileSuccess,
                                'error-callback': window.onTurnstileError,
                                'expired-callback': window.onTurnstileExpired,
                                'timeout-callback': window.onTurnstileExpired
                            });
                        }
                    } catch (error) {
                        console.error('Turnstile could not initialise:', error);
                        gateError('Verification could not load. Please retry.');
                    }
                    return true;
                };

                if (render()) return;
                let waited = 0;
                const poll = setInterval(() => {
                    waited += 100;
                    if (render()) {
                        clearInterval(poll);
                    } else if (waited >= 10000) {
                        clearInterval(poll);
                        gateError('Verification is unavailable. Check your connection and retry.');
                    }
                }, 100);
            }

            window.retryTurnstile = function () {
                const statusEl = document.getElementById('gate-status-text');
                const retryBtn = document.getElementById('gate-retry-btn');
                if (!statusEl || !retryBtn) return;
                retryBtn.style.display = 'none';
                statusEl.classList.remove('gate-status-error');
                statusEl.textContent = '';
                if (window.turnstile && turnstileWidgetId !== null) {
                    try { window.turnstile.reset(turnstileWidgetId); }
                    catch { turnstileWidgetId = null; renderTurnstileWidget(); }
                } else {
                    turnstileWidgetId = null;
                    renderTurnstileWidget();
                }
            };

            window.onTurnstileSuccess = function (token) {
                // This is a client-side check only. Static GitHub Pages has no
                // endpoint to call Cloudflare's server-side siteverify API.
                const gate = document.getElementById('turnstile-gate');
                const appRoot = document.getElementById('app-root');
                const statusEl = document.getElementById('gate-status-text');
                if (!token) { gateError('Verification failed. Please try again.'); return; }
                statusEl.classList.remove('gate-status-error');
                statusEl.textContent = 'Verified. Opening Nexus...';
                setTimeout(() => {
                    gate.classList.add('gate-hidden');
                    appRoot?.classList.add('loaded');
                    setTimeout(() => { gate.style.display = 'none'; }, 800);
                }, 400);
            };

            window.onTurnstileError = function () {
                gateError('Verification failed. Please try again.');
            };

            window.onTurnstileExpired = function () {
                const statusEl = document.getElementById('gate-status-text');
                if (statusEl) statusEl.textContent = 'Verification expired, retrying...';
                if (window.turnstile && turnstileWidgetId !== null) {
                    try { window.turnstile.reset(turnstileWidgetId); } catch { /* retry button is available */ }
                }
            };

            function startBoot() {
                const bootScreen = document.getElementById('boot-screen');
                const statusText = document.getElementById('boot-status-text');
                const percentText = document.getElementById('boot-percent');
                const progressBar = document.getElementById('boot-progress-bar');
                if (!bootScreen || !statusText || !percentText || !progressBar) {
                    showTurnstileGate();
                    return;
                }

                const finishBoot = () => {
                    setTimeout(() => {
                        bootScreen.classList.add('boot-hidden');
                        setTimeout(() => {
                            bootScreen.style.display = 'none';
                            showTurnstileGate();
                        }, 1200);
                    }, 450);
                };

                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    progressBar.style.width = '100%';
                    percentText.textContent = '100%';
                    statusText.textContent = 'System ready.';
                    finishBoot();
                    return;
                }

                const logs = [
                    { p: 15, text: 'Warming the hearth...' },
                    { p: 32, text: 'Setting the harvest table...' },
                    { p: 58, text: 'Lighting the lanterns...' },
                    { p: 85, text: 'Polishing the workspace...' },
                    { p: 91, text: 'Ready to gather.' },
                    { p: 100, text: 'Happy Thanksgiving!' }
                ];
                let progress = 0;
                let logIndex = 0;
                const bootInterval = setInterval(() => {
                    progress = Math.min(100, progress + (Math.random() * 2) + 0.5);
                    progressBar.style.width = `${progress}%`;
                    percentText.textContent = `${Math.floor(progress)}%`;
                    if (logIndex < logs.length && progress >= logs[logIndex].p) {
                        statusText.textContent = logs[logIndex].text;
                        logIndex++;
                    }
                    if (progress >= 100) {
                        clearInterval(bootInterval);
                        finishBoot();
                    }
                }, 30);
            }

            if (document.readyState === 'complete') startBoot();
            else window.addEventListener('load', startBoot, { once: true });
        })();

        // Clock logic
        function updateClock() {
            const now = new Date();
            const clockEl = document.getElementById('hud-clock');
            if (clockEl) {
                clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
            }
        }
        setInterval(updateClock, 1000);
        updateClock();

        // Route loader
        function loadRoute(route, el) {
            const iframe = document.getElementById('nexus-viewport');
            if (iframe) {
                iframe.classList.add('loading');
                setTimeout(() => {
                    iframe.src = route;
                    iframe.onload = () => iframe.classList.remove('loading');
                }, 300);
            }
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            if (el) el.classList.add('active');
            return false;
        }

        // Command palette stub
        function toggleCommandPalette() {
            const overlay = document.getElementById('cmd-overlay');
            if (overlay) {
                overlay.style.display = 'flex';
                setTimeout(() => overlay.classList.add('active'), 10);
                
                const input = document.getElementById('cmd-input');
                if (input) {
                    input.value = '';
                    input.focus();
                }
            }
        }

        // Close command palette on Escape or clicking outside
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const overlay = document.getElementById('cmd-overlay');
                if (overlay && overlay.classList.contains('active')) {
                    overlay.classList.remove('active');
                    setTimeout(() => overlay.style.display = 'none', 200);
                }
            }
            // Cmd/Ctrl + K shortcut
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggleCommandPalette();
            }
        });

        document.getElementById('cmd-overlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.classList.remove('active');
                setTimeout(() => e.currentTarget.style.display = 'none', 200);
            }
        });

        // Collapsible, resizable sidebar. The width and collapsed state persist.
        (() => {
            const layout = document.getElementById('app-root');
            const sidebar = document.getElementById('nexusSidebar');
            const collapseBtn = document.getElementById('sidebarCollapse');
            const resizer = document.getElementById('sidebarResizer');
            if (!layout || !sidebar || !collapseBtn || !resizer) return;

            const WIDTH_KEY = 'nexus-sidebar-width';
            const COLLAPSED_KEY = 'nexus-sidebar-collapsed';
            const mobile = window.matchMedia('(max-width: 820px)');
            const clampWidth = (value) => Math.min(420, Math.max(210, value));
            let storedWidth = 260;
            let storedCollapsed = false;

            try {
                const savedWidth = Number(localStorage.getItem(WIDTH_KEY));
                if (Number.isFinite(savedWidth) && savedWidth >= 210 && savedWidth <= 420) storedWidth = savedWidth;
                storedCollapsed = localStorage.getItem(COLLAPSED_KEY) === 'true';
            } catch { /* storage can be unavailable in private contexts */ }

            layout.style.setProperty('--sidebar-w', `${storedWidth}px`);
            resizer.setAttribute('aria-valuenow', String(Math.round(storedWidth)));

            function setCollapsed(next, persist = true) {
                const collapsed = Boolean(next) && !mobile.matches;
                layout.classList.toggle('sidebar-collapsed', collapsed);
                collapseBtn.setAttribute('aria-expanded', String(!collapsed));
                collapseBtn.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
                if (persist) {
                    try { localStorage.setItem(COLLAPSED_KEY, String(Boolean(next))); } catch { /* no-op */ }
                }
            }

            setCollapsed(storedCollapsed, false);
            collapseBtn.addEventListener('click', () => {
                storedCollapsed = !layout.classList.contains('sidebar-collapsed');
                setCollapsed(storedCollapsed);
            });

            const syncMobile = () => {
                if (mobile.matches) layout.classList.remove('sidebar-collapsed');
                else setCollapsed(storedCollapsed, false);
            };
            if (mobile.addEventListener) mobile.addEventListener('change', syncMobile);
            else mobile.addListener(syncMobile);

            let dragging = false;
            let startX = 0;
            let startWidth = 0;

            function setWidth(value) {
                const width = clampWidth(value);
                layout.style.setProperty('--sidebar-w', `${width}px`);
                resizer.setAttribute('aria-valuenow', String(Math.round(width)));
                return width;
            }

            function endDrag() {
                if (!dragging) return;
                dragging = false;
                layout.classList.remove('resizing');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                try { localStorage.setItem(WIDTH_KEY, String(Math.round(sidebar.getBoundingClientRect().width))); } catch { /* no-op */ }
            }

            resizer.addEventListener('pointerdown', (event) => {
                if (mobile.matches || layout.classList.contains('sidebar-collapsed')) return;
                event.preventDefault();
                dragging = true;
                startX = event.clientX;
                startWidth = sidebar.getBoundingClientRect().width;
                layout.classList.add('resizing');
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
                resizer.setPointerCapture?.(event.pointerId);
            });

            window.addEventListener('pointermove', (event) => {
                if (!dragging) return;
                setWidth(startWidth + event.clientX - startX);
            });
            window.addEventListener('pointerup', endDrag);
            window.addEventListener('pointercancel', endDrag);

            resizer.addEventListener('keydown', (event) => {
                if (mobile.matches || layout.classList.contains('sidebar-collapsed')) return;
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                event.preventDefault();
                const width = setWidth(sidebar.getBoundingClientRect().width + (event.key === 'ArrowRight' ? 12 : -12));
                try { localStorage.setItem(WIDTH_KEY, String(Math.round(width))); } catch { /* no-op */ }
            });
        })();
    