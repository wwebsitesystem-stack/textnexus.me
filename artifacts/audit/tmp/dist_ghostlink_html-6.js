
        (function() {
            let _homeBuf = '';
            document.addEventListener('keydown', function(e) {
                if (e.altKey || e.ctrlKey || e.metaKey) return;
                const home = document.getElementById('home-content');
                if (!home || home.style.display === 'none') { _homeBuf = ''; return; }
                if (e.key.length !== 1) { _homeBuf = ''; return; }
                _homeBuf += e.key.toLowerCase();
                if (_homeBuf.length > 11) _homeBuf = _homeBuf.slice(-11);
                const _bufNorm = _homeBuf.replace(/\s/g, '');

                if (_homeBuf.endsWith('mirror')) {
                    _homeBuf = '';
                    window._glMirrored = !window._glMirrored;
                    const h = document.documentElement;
                    h.style.transition = 'filter 0.4s ease, transform 0.4s ease';
                    h.style.filter = window._glMirrored ? 'invert(1)' : '';
                    h.style.transform = window._glMirrored ? 'scale(-1, -1)' : '';
                    if (window._glMirrored && window.__glAch) window.__glAch.onMirror();
                }

                if (_homeBuf.endsWith('toast')) {
                    _homeBuf = '';
                    showAchievementToast('🔮', 'Test Achievement', 'You typed the secret word.');
                }

                if (_bufNorm.endsWith('ripxrevan')) {
                    _homeBuf = '';
                    if (window.__glAch) window.__glAch.onRipXrevan();
                    showRipXrevanModal();
                }
            });
        })();
    