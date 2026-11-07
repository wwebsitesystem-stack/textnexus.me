
        function loadIntoFrame(targetUrl) {
            const frame = document.getElementById('app-frame');
            frame.style.display = 'block';

            const styles = getComputedStyle(document.documentElement);
            const accent = styles.getPropertyValue('--accent').trim();
            const bg = styles.getPropertyValue('--bg').trim();
            const font = styles.getPropertyValue('--font').trim();

            const injectThemeScript = (html) => {
                const styles = getComputedStyle(document.documentElement);
                const accent = styles.getPropertyValue('--accent').trim();
                const bg = styles.getPropertyValue('--bg').trim();
                const font = styles.getPropertyValue('--font').trim();

                const themeScript = `
                    <script>
                        (function() {
                            document.documentElement.style.setProperty('--accent-color', \`${accent}\`);
                            document.documentElement.style.setProperty('--bg-dark', \`${bg}\`);
                            document.documentElement.style.setProperty('--font-family', \`${font}\`);
                            // Force all links to open in a new tab
                            function patchLinks() {
                                document.querySelectorAll('a[href]').forEach(function(a) {
                                    var href = a.getAttribute('href');
                                    if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
                                        a.setAttribute('target', '_blank');
                                        a.setAttribute('rel', 'noopener noreferrer');
                                    }
                                });
                            }
                            document.addEventListener('DOMContentLoaded', patchLinks);
                            var observer = new MutationObserver(patchLinks);
                            document.addEventListener('DOMContentLoaded', function() {
                                observer.observe(document.body, { childList: true, subtree: true });
                            });
                            // Capture-phase click fallback
                            document.addEventListener('click', function(e) {
                                var a = e.target.closest('a[href]');
                                if (a) {
                                    var href = a.getAttribute('href');
                                    if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
                                        e.preventDefault();
                                        window.open(href, '_blank', 'noopener,noreferrer');
                                    }
                                }
                            }, true);
                        })();
                    <\/script>`;
                return html.includes('<head>') ? html.replace('<head>', '<head>' + themeScript) : themeScript + html;
            };

            if (targetUrl.startsWith('data:text/html') || targetUrl.trim().startsWith('<')) {
                frame.removeAttribute('src');
                let rawHtml = targetUrl.startsWith('data:') ? decodeURIComponent(targetUrl.split(',')[1]) : targetUrl;
                frame.srcdoc = injectThemeScript(rawHtml);
                frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
                return;
            }

            const isGitHub = targetUrl.includes('github.com');
            const isJsDelivr = targetUrl.includes('cdn.jsdelivr.net');

            if (isGitHub || isJsDelivr) {
                let processedUrl = targetUrl;
                if (isGitHub && !targetUrl.includes('raw.githubusercontent.com')) {
                    processedUrl = targetUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
                }

                fetch(processedUrl)
                    .then(response => {
                        if (!response.ok) throw new Error(`Fetch failed`);
                        return response.text();
                    })
                    .then(htmlContent => {
                        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
                        frame.srcdoc = injectThemeScript(htmlContent);
                    })
                    .catch(err => {
                        console.warn('Raw fetch failed, falling back to direct src load.');
                        frame.removeAttribute('srcdoc');
                        frame.src = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}accent=${encodeURIComponent(accent)}&bg=${encodeURIComponent(bg)}`;
                    });
            } else {
                frame.removeAttribute('srcdoc');
                if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('file://')) {
                    try {
                        targetUrl = new URL(targetUrl, location.href).href;
                    } catch (e) {
                        targetUrl = 'https://' + targetUrl;
                    }
                }
                frame.src = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}accent=${encodeURIComponent(accent)}&bg=${encodeURIComponent(bg)}`;
            }
        }
    