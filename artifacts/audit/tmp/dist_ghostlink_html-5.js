
        (function() {
            let _toastTimer = null;

            window.showAchievementToast = function(icon, title, desc) {
                const toast = document.getElementById('achievement-toast');
                document.getElementById('achievement-toast-icon').textContent = icon;
                document.getElementById('achievement-toast-title').textContent = title;
                document.getElementById('achievement-toast-desc').textContent = desc || '';

                toast.classList.remove('gl-toast-hide');
                void toast.offsetWidth;
                toast.classList.add('gl-toast-show');

                if (_toastTimer) clearTimeout(_toastTimer);
                _toastTimer = setTimeout(() => {
                    toast.classList.remove('gl-toast-show');
                    toast.classList.add('gl-toast-hide');
                }, 5000);

                toast.onclick = () => {
                    clearTimeout(_toastTimer);
                    toast.classList.remove('gl-toast-show');
                    toast.classList.add('gl-toast-hide');
                    nav('achievements');
                };
            };
        })();
    