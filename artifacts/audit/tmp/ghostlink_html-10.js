
        (function() {
            const THRESHOLD = 160;
            let _devtoolsTriggered = false;
            function checkDevTools() {
                if (_devtoolsTriggered) return;
                const widthOpen  = window.outerWidth  - window.innerWidth  > THRESHOLD;
                const heightOpen = window.outerHeight - window.innerHeight > THRESHOLD;
                if (widthOpen || heightOpen) {
                    _devtoolsTriggered = true;
                    if (window.__glAch) window.__glAch.onWannabeDev();
                }
            }
            setInterval(checkDevTools, 1000);
        })();
    