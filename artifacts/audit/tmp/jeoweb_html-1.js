
		(function () {
			try {
				var stored = localStorage.getItem('site-theme');
				var prefersLight = !stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
				var theme = stored === 'light' || prefersLight ? 'light' : 'dark';
				document.documentElement.setAttribute('data-theme', theme);
				if (prefersLight) document.documentElement.setAttribute('data-pref-theme', 'light');
				// Premium FX (glass blur, 3D tilt, animated hero) — applied
				// before stylesheet parse so the user doesn't see a flash from
				// flat → glass on reload.
				if (localStorage.getItem('jeo-fx-premium') === 'true') {
					document.documentElement.setAttribute('data-fx', 'premium');
				}
			} catch (e) {}
		})();
	