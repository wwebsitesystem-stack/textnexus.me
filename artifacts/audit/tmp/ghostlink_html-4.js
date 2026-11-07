
        let _caught4kTabId = null;
        function showCaught4kModal() {
            if (localStorage.getItem('gl_4k_dismissed')) return;
            if (window.__glAch) window.__glAch.onCaught4k();
            _caught4kTabId = activeTabId;
            document.getElementById('caught-4k-overlay').style.display = 'flex';
        }
        function closeCaught4kModal() {
            document.getElementById('caught-4k-overlay').style.display = 'none';
        }
        function caught4kDeny() {
            closeCaught4kModal();
            if (_caught4kTabId != null) {
                closeTab(_caught4kTabId);
                _caught4kTabId = null;
            }
        }
        function caught4kProceed() {
            localStorage.setItem('gl_4k_dismissed', '1');
            closeCaught4kModal();
        }
    