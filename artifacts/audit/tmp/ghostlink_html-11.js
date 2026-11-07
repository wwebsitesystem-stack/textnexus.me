
        function showRipXrevanModal() {
            const overlay = document.getElementById('rip-xrevan-overlay');
            overlay.style.display = 'flex';
        }
        function closeRipXrevanModal() {
            document.getElementById('rip-xrevan-overlay').style.display = 'none';
        }
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.getElementById('rip-xrevan-overlay') &&
                document.getElementById('rip-xrevan-overlay').style.display === 'flex') {
                closeRipXrevanModal();
            }
        });
    