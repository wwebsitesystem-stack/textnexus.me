
        let _legalCache = {};
        let _legalActiveTab = null;
        function openLegalModal(tab) {
            const overlay = document.getElementById('legal-modal-overlay');
            overlay.style.display = 'flex';
            switchLegalTab(tab);
        }
        function closeLegalModal() {
            document.getElementById('legal-modal-overlay').style.display = 'none';
        }
        function openGithubModal() {
            document.getElementById('github-modal-overlay').style.display = 'flex';
        }
        function closeGithubModal() {
            document.getElementById('github-modal-overlay').style.display = 'none';
        }
        function switchLegalTab(tab) {
            _legalActiveTab = tab;
            if (window.__glAch) window.__glAch.onLegal(tab);
            ['tos','privacy','dmca'].forEach(t => {
                const btn = document.getElementById('legal-tab-' + t);
                if (!btn) return;
                btn.classList.toggle('active', t === tab);
            });
            const body = document.getElementById('legal-modal-body');
            if (_legalCache[tab]) {
                body.innerHTML = _legalCache[tab];
                return;
            }
            body.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:120px;">
                    <div style="width:32px;height:32px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
                </div>`;

            fetch(LEGAL_URLS[tab])
                .then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.text();
                })
                .then(md => {
                    const wrapped = `<div class="readme-body">${parseMarkdown(md)}</div>`;
                    _legalCache[tab] = wrapped;
                    if (_legalActiveTab === tab) body.innerHTML = wrapped;
                })
                .catch(() => {
                    const errHtml = `
                        <div style="text-align:center;padding:40px 20px;">
                            <div style="font-size:1.5rem;margin-bottom:12px;">◈</div>
                            <div style="color:var(--accent);font-size:0.7rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-shadow:0 0 8px var(--accent-glow);">
                                Could not load document
                            </div>
                            <p style="color:var(--text-dim);font-size:0.8rem;line-height:1.6;">
                                The document couldn't be fetched right now.<br>
                                Try again later or contact the site owner.
                            </p>
                        </div>`;
                    _legalCache[tab] = errHtml;
                    if (_legalActiveTab === tab) body.innerHTML = errHtml;
                });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('legal-modal-overlay').style.display === 'flex') {
                closeLegalModal();
            }
        });
    