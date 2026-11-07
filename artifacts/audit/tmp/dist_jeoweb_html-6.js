
		(function(){
			function showOverlay(msg){
				let el = document.getElementById('errorOverlay');
				if (!el){
					el = document.createElement('div');
					el.id = 'errorOverlay';
					el.style.cssText = [
						'position:fixed',
						'inset:16px',
						'padding:24px',
						'border-radius:16px',
						'background:rgba(0,0,0,0.95)',
						'color:#fff',
						'font-family:system-ui,Segoe UI,Roboto',
						'z-index:99999',
						'overflow:auto',
						'max-height:60vh',
						'border:1px solid rgba(255,255,255,0.1)'
					].join(';');
					document.body.appendChild(el);
				}
				el.textContent = msg;
				el.style.display = 'block';
			}

			window.addEventListener('error', function(e){
				const msg = e.error?.message || e.message;
				console.error(e.error || e.message);
				showOverlay('Error: ' + msg);
				if (window.JeoAnalytics) window.JeoAnalytics.trackError(msg, 'window_error');
			});

			window.addEventListener('unhandledrejection', function(e){
				const msg = e.reason?.message || String(e.reason);
				console.error('Unhandled rejection', e.reason);
				showOverlay('Unhandled rejection: ' + msg);
				if (window.JeoAnalytics) window.JeoAnalytics.trackError(msg, 'promise_rejection');
			});

			function loadScript(src){
				return new Promise(function(resolve, reject){
					const s = document.createElement('script');
					s.src = src;
					s.defer = true;
					s.onload = () => resolve(src);
					s.onerror = () => reject(new Error('Failed to load ' + src));
					document.body.appendChild(s);
				});
			}

			(async function start(){
				try{
					await loadScript('app.js');
				} catch (err) {
					console.error(err);
					showOverlay(err.message || String(err));
				}

				// Fetch last commit for "Last Updated" badge — deferred so it never
				// competes with game catalog rendering on slow connections.
				var _fetchLastCommit = function() {
					fetch('https://api.github.com/repos/Gotojeowebsite/jeoweb/commits?per_page=1')
						.then(function(resp) { return resp.ok ? resp.json() : null; })
						.then(function(data) {
							if (!data || !data.length) return;
							var d = new Date(data[0].commit.author.date);
							var dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
							var timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
							var el = document.getElementById('lastUpdated');
							if (el) el.textContent = 'Last updated: ' + dateStr + ' at ' + timeStr;
						})
						.catch(function(e) { console.warn('Could not fetch last commit', e); });
				};
				if (window.requestIdleCallback) {
					requestIdleCallback(_fetchLastCommit, { timeout: 5000 });
				} else {
					setTimeout(_fetchLastCommit, 5000);
				}
			})();


			document.addEventListener('keydown', function(e){
				if (e.key === 'Escape'){
					const collectionModal = document.getElementById('collectionModal');
					if (collectionModal && !collectionModal.classList.contains('hidden')){
						const cClose = document.getElementById('collectionModalClose');
						if (cClose) { cClose.click(); return; }
					}
					const modal = document.getElementById('playModal');
					if (modal && !modal.classList.contains('hidden')){
						const close = document.getElementById('closeModal');
						if (close) close.click();
					}
				}
			});
		})();
	