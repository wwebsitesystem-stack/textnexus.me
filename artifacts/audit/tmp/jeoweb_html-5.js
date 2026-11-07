
	// Sounds toggle + changelog modal + extras
	document.addEventListener('DOMContentLoaded', () => {
		const soundsToggle = document.getElementById('soundsToggle');
		if (soundsToggle && window.JeoSounds) {
			soundsToggle.checked = window.JeoSounds.isEnabled();
			soundsToggle.addEventListener('change', () => {
				window.JeoSounds.setEnabled(soundsToggle.checked);
				if (soundsToggle.checked) window.JeoSounds.play('open');
			});
		}
		const cl = document.getElementById('changelogBtn');
		if (cl) cl.addEventListener('click', async () => {
			const existing = document.getElementById('jeoChangelog');
			if (existing) existing.remove();
			const modal = document.createElement('div');
			modal.id = 'jeoChangelog';
			modal.innerHTML = `<div class="jcl-card">
				<header><h3>📜 Recent changes</h3><button class="jcl-x" aria-label="Close">✕</button></header>
				<div class="jcl-body"><p class="settings-help">Loading…</p></div></div>`;
			document.body.appendChild(modal);
			modal.querySelector('.jcl-x').addEventListener('click', () => modal.remove());
			modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
			try {
				const r = await fetch('https://api.github.com/repos/Gotojeowebsite/jeoweb/commits?per_page=10');
				if (!r.ok) throw new Error('fetch failed');
				const data = await r.json();
				const list = data.map(c => `
					<li><div class="jcl-msg">${(c.commit.message || '').split('\n')[0].replace(/[<>"']/g, m => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}</div>
					<div class="jcl-meta">${new Date(c.commit.author.date).toLocaleString()} · ${c.commit.author.name}</div></li>`).join('');
				modal.querySelector('.jcl-body').innerHTML = `<ul class="jcl-list">${list}</ul>`;
			} catch (err) {
				modal.querySelector('.jcl-body').innerHTML = `<p class="settings-help">Could not load changelog: ${err.message}</p>`;
			}
		});
	});

	// Settings tab switcher (Sprint E)
	(function () {
		document.addEventListener('click', (e) => {
			const tab = e.target.closest('.settings-tab');
			if (!tab) return;
			const id = tab.dataset.tab;
			const root = tab.closest('.settings-modal-inner');
			if (!root) return;
			root.querySelectorAll('.settings-tab').forEach(t => {
				const on = t.dataset.tab === id;
				t.classList.toggle('active', on);
				t.setAttribute('aria-selected', on ? 'true' : 'false');
			});
			root.querySelectorAll('.settings-tab-pane').forEach(p => {
				const on = p.dataset.tab === id;
				p.classList.toggle('active', on);
				if (on) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
			});
		});
	})();
	