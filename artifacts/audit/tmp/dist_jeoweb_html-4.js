
		// Apply the theme preference detected in <head> (avoids any flash of dark on light-mode).
		(function () {
			try {
				if (document.documentElement.getAttribute('data-theme') === 'light') {
					document.body.classList.remove('theme-dark');
					document.body.classList.add('theme-light');
				}
			} catch (e) {}
		})();
	