
	document.addEventListener('DOMContentLoaded', function() {
	(function () {
		const slot = document.getElementById('jeoAccountSlot');
		if (!slot || !window.JeoAccount) return;
		const PRESET_GRADS = {
			p1: ['#7a5cff','#22d3ee'], p2: ['#ff6b9d','#7a5cff'], p3: ['#22c55e','#0ea5e9'],
			p4: ['#f59e0b','#ef4444'], p5: ['#06b6d4','#8b5cf6'], p6: ['#ec4899','#f43f5e'],
			p7: ['#10b981','#3b82f6'], p8: ['#f97316','#a78bfa'],
		};
		function presetBg(p) { const [a,b] = (PRESET_GRADS[p] || PRESET_GRADS.p1); return `linear-gradient(135deg, ${a}, ${b})`; }

		function render(state) {
			slot.innerHTML = '';
			if (!state) {
				const a = document.createElement('a');
				a.href = 'login.html'; a.className = 'jeo-header-signin'; a.textContent = 'Sign in';
				slot.appendChild(a);
				const b = document.createElement('a');
				b.href = 'signup.html'; b.className = 'jeo-header-signin';
				b.style.background = 'rgba(255,255,255,0.06)'; b.style.color = '#e7e7ee';
				b.textContent = 'Create';
				slot.appendChild(b);
				return;
			}
			const av = document.createElement('div');
			av.className = 'jeo-header-avatar';
			if (state.profile.avatar_data_url) av.style.backgroundImage = `url(${state.profile.avatar_data_url})`;
			else av.style.backgroundImage = presetBg(state.profile.avatar_preset);
			av.title = state.profile.name;
			av.innerHTML = '<div class="badge"></div>';
			av.onclick = (e) => { e.stopPropagation(); openMenu(state); };
			slot.appendChild(av);
		}

		function backupLabel(days) {
			if (!Number.isFinite(days)) return { text: 'Last backup: never — download a .jeo file now', stale: true };
			if (days < 1) return { text: 'Last backup: today', stale: false };
			if (days < 2) return { text: 'Last backup: yesterday', stale: false };
			const d = Math.floor(days);
			return { text: `Last backup: ${d} day${d === 1 ? '' : 's'} ago`, stale: d >= 7 };
		}

		async function downloadBackup(state) {
			const pw = prompt('Enter a passphrase to encrypt your save (≥ 5 chars).\nUse this passphrase + the .jeo file to sign in on another device.');
			if (!pw) return false;
			try {
				const { blob, recoveryCodes } = await JeoAccount.exportBlob(pw);
				const a = document.createElement('a');
				const safe = (state.profile.name || 'jeoweb').replace(/[^a-z0-9_-]+/gi, '_');
				const stamp = new Date().toISOString().slice(0,10);
				a.href = URL.createObjectURL(new Blob([blob], { type: 'text/plain' }));
				a.download = `${safe}-${stamp}.jeo`; a.click();
				URL.revokeObjectURL(a.href);
				showRecoveryCodes(recoveryCodes, safe);
				return true;
			} catch (err) {
				if (window.JeoToast) JeoToast.error(String(err.message || err));
				else alert(String(err.message || err));
				return false;
			}
		}

		async function copyBackup() {
			const pw = prompt('Enter a passphrase to encrypt your save (≥ 5 chars).');
			if (!pw) return;
			try {
				const { blob, recoveryCodes } = await JeoAccount.exportBlob(pw);
				await navigator.clipboard.writeText(blob);
				if (window.JeoToast) JeoToast.success('Encrypted save copied to clipboard.');
				else alert('Encrypted save copied to clipboard.');
				showRecoveryCodes(recoveryCodes, 'jeoweb');
			} catch (err) {
				if (window.JeoToast) JeoToast.error(String(err.message || err));
				else alert(String(err.message || err));
			}
		}

		function showRecoveryCodes(codes, safeName) {
			if (!Array.isArray(codes) || codes.length === 0) return;
			const m = document.createElement('div');
			m.className = 'jeo-recovery-modal';
			m.innerHTML = `
				<div class="jrm-card">
					<div class="jrm-title">🛟 Your recovery codes were rotated</div>
					<div class="jrm-sub">Each export generates a fresh set of single-use codes. Save these somewhere safe — they let you sign back in if you forget your passphrase.</div>
					<div class="jrm-grid">
						${codes.map((c, i) => `<div class="jrm-code"><span>${String(i+1).padStart(2,'0')}</span><code>${c}</code></div>`).join('')}
					</div>
					<div class="jrm-actions">
						<button class="jrm-btn jrm-ghost" data-act="copy">Copy all</button>
						<button class="jrm-btn" data-act="dl">Download .txt</button>
						<button class="jrm-btn jrm-primary" data-act="close">I've saved them</button>
					</div>
				</div>`;
			document.body.appendChild(m);
			m.onclick = (e) => {
				const act = e.target.dataset?.act;
				if (act === 'copy') {
					navigator.clipboard.writeText(codes.map((c, i) => `${i+1}. ${c}`).join('\n'));
					e.target.textContent = 'Copied ✓';
				} else if (act === 'dl') {
					const text = `Jeoweb recovery codes\nGenerated ${new Date().toLocaleString()}\n\n` + codes.map((c, i) => `${String(i+1).padStart(2,'0')}.  ${c}`).join('\n');
					const a = document.createElement('a');
					a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
					a.download = `${safeName}-recovery-codes.txt`; a.click();
					URL.revokeObjectURL(a.href);
				} else if (act === 'close' || e.target === m) {
					m.remove();
				}
			};
		}

		async function deleteAccount() {
			const ok = prompt('Type DELETE in caps to confirm permanent account deletion.\n\nThis will wipe all your settings, favorites, saves, and the encrypted account data on this device. The .jeo file you downloaded earlier will still work elsewhere.');
			if (ok !== 'DELETE') return;
			await JeoAccount.deleteAccount();
			if (window.JeoToast) JeoToast.success('Account deleted on this device.');
			setTimeout(() => window.location.reload(), 600);
		}

		function openMenu(state) {
			document.querySelectorAll('.jeo-header-menu').forEach(n => n.remove());
			const m = document.createElement('div');
			m.className = 'jeo-header-menu';
			const bk = backupLabel(JeoAccount.getBackupAgeDays());
			m.innerHTML = `
				<div class="who">Signed in as <strong></strong></div>
				<div class="backup-status${bk.stale ? ' stale' : ''}"></div>
				<button data-act="download">⬇ Download .jeo backup</button>
				<button data-act="export">Copy encrypted save</button>
				<button data-act="lock">🔒 Lock now</button>
				<button class="danger" data-act="logout">Log out (forget device)</button>
				<button class="danger" data-act="delete">🗑 Delete account on this device…</button>`;
			m.querySelector('strong').textContent = state.profile.name;
			m.querySelector('.backup-status').textContent = bk.text;
			document.body.appendChild(m);
			m.onclick = async (e) => {
				const act = e.target.dataset?.act; if (!act) return;
				if (act === 'logout') {
					if (!confirm('Log out and forget this device?\n\nMake sure you have downloaded a .jeo backup — without it you cannot sign back in.')) return;
					await JeoAccount.signOut({ forgetDevice: true });
					m.remove(); window.location.reload();
				} else if (act === 'download') {
					if (await downloadBackup(state)) dismissBackupBanner();
					m.remove();
				} else if (act === 'export') {
					await copyBackup();
					m.remove();
				} else if (act === 'lock') {
					JeoAccount.lock();
					m.remove();
				} else if (act === 'delete') {
					m.remove();
					await deleteAccount();
				}
			};
			setTimeout(() => {
				const off = (e) => { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('click', off); } };
				document.addEventListener('click', off);
			}, 0);
		}

		// ---- backup-reminder banner ----
		// Shown when last backup is >= 7 days ago (or never). Snoozed for 24h
		// after dismiss; suppressed for the rest of the session after download.
		const SNOOZE_KEY = 'jeo:backupBannerSnoozeUntil';
		let bannerEl = null;
		function dismissBackupBanner({ snoozeHours = 24 } = {}) {
			if (bannerEl) { bannerEl.remove(); bannerEl = null; }
			try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + snoozeHours * 3600_000)); } catch {}
		}
		function maybeShowBackupBanner(state) {
			if (!state) return;
			if (bannerEl) return;
			const snooze = parseInt(localStorage.getItem(SNOOZE_KEY) || '0', 10);
			if (Date.now() < snooze) return;
			const days = JeoAccount.getBackupAgeDays();
			if (Number.isFinite(days) && days < 7) return;

			const el = document.createElement('div');
			el.className = 'jeo-backup-banner';
			const never = !Number.isFinite(days);
			el.innerHTML = `
				<button class="jbb-close" aria-label="Dismiss">×</button>
				<div class="jbb-title">${never ? 'Back up your account' : 'Time to back up your save'}</div>
				<div class="jbb-body">
					${never
						? 'Your game progress is only on this device. <strong>Download a <code>.jeo</code> file</strong> so you can sign in on another computer — or recover if Jeoweb gets blocked.'
						: 'It\'s been over a week since your last backup. Download a fresh <strong><code>.jeo</code> file</strong> so newer save data is portable if this device or the site becomes unavailable.'}
				</div>
				<div class="jbb-actions">
					<button class="jbb-btn jbb-primary" data-act="download">Download .jeo</button>
					<button class="jbb-btn jbb-ghost" data-act="later">Remind me later</button>
				</div>`;
			document.body.appendChild(el);
			bannerEl = el;
			el.addEventListener('click', async (e) => {
				const act = e.target.dataset?.act || (e.target.classList?.contains('jbb-close') ? 'later' : null);
				if (act === 'download') {
					const ok = await downloadBackup(JeoAccount.getState() || state);
					if (ok) dismissBackupBanner({ snoozeHours: 24 * 365 }); // effectively for session; re-evaluates next load
				} else if (act === 'later') {
					dismissBackupBanner({ snoozeHours: 24 });
				}
			});
		}

		render(JeoAccount.getState());
		JeoAccount.onChange((state, info) => {
			render(state);
			maybeShowBackupBanner(state);
			if (info && info.locked) showLockScreen();
			else hideLockScreen();
		});
		// Initial check after a short delay so account-system has loaded from device.
		setTimeout(() => maybeShowBackupBanner(JeoAccount.getState()), 1500);

		// ---- inactivity lock UI ----
		let lockEl = null;
		function showLockScreen() {
			if (lockEl) return;
			lockEl = document.createElement('div');
			lockEl.className = 'jeo-lock-screen';
			lockEl.innerHTML = `
				<div class="jeo-lock-card">
					<h2>🔒 Locked</h2>
					<p>Your session locked after inactivity. Enter your passphrase to continue, or reload the page.</p>
					<form id="lockForm"><input type="password" id="lockPw" autocomplete="current-password" autofocus><button type="submit">Unlock</button></form>
					<button id="lockReload" style="margin-top:8px;background:transparent;color:#9aa0b4;border:1px solid rgba(255,255,255,0.1);">Sign out instead</button>
					<div id="lockErr" style="color:#ff8a8a;font-size:12px;margin-top:8px;min-height:14px"></div>
				</div>`;
			document.body.appendChild(lockEl);
			lockEl.querySelector('#lockForm').onsubmit = async (e) => {
				e.preventDefault();
				try {
					await JeoAccount.unlock(lockEl.querySelector('#lockPw').value);
					hideLockScreen();
				} catch (err) {
					lockEl.querySelector('#lockErr').textContent = String(err.message || err);
				}
			};
			lockEl.querySelector('#lockReload').onclick = async () => {
				await JeoAccount.signOut({ forgetDevice: true });
				window.location.reload();
			};
		}
		function hideLockScreen() { if (lockEl) { lockEl.remove(); lockEl = null; } }

		// ---- recovery-mode notice ----
		if (sessionStorage.getItem('jeo:force-passphrase-reset')) {
			sessionStorage.removeItem('jeo:force-passphrase-reset');
			setTimeout(() => {
				if (window.JeoToast) {
					JeoToast.warn('Signed in with a recovery code. Open the avatar menu → Download .jeo backup to set a new passphrase and rotate codes.', 12000);
				}
			}, 1200);
		}

		// ---- session-only mode ----
		if (sessionStorage.getItem('jeo:session-only')) {
			window.addEventListener('beforeunload', () => {
				try { JeoAccount.signOut({ forgetDevice: true }); } catch {}
			});
		}
	})();
	});
	