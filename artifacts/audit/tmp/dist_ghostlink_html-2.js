
    // Receive live theme updates from the parent page
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'GHOSTLINK_NT_THEME') {
        const t = e.data.theme;
        const r = document.documentElement;
        if (t.bg)            r.style.setProperty('--bg',            t.bg);
        if (t.accent)        r.style.setProperty('--accent',        t.accent);
        if (t.accentGlow)    r.style.setProperty('--accent-glow',   t.accentGlow);
        if (t.textPrimary)   r.style.setProperty('--text-primary',  t.textPrimary);
        if (t.textDim)       r.style.setProperty('--text-dim',      t.textDim);
        if (t.border)        r.style.setProperty('--border',        t.border);
        if (t.cardBg)        r.style.setProperty('--card-bg',       t.cardBg);
        if (t.inputBg)       r.style.setProperty('--input-bg',      t.inputBg);
        if (t.font)          r.style.setProperty('--font',          t.font);
        if (t.bgImage)       r.style.setProperty('--bg-image',      t.bgImage);
        if (t.bgBlur)        r.style.setProperty('--bg-blur',       t.bgBlur);
        if (t.bgBrightness)  r.style.setProperty('--bg-brightness', t.bgBrightness);
        document.body.style.backgroundColor = t.bg || '';
        document.body.style.color = t.textPrimary || '';
        document.body.style.fontFamily = t.font || '';
        // Inject any custom font stylesheets sent from the parent
        if (t.customFontUrls && Array.isArray(t.customFontUrls)) {
          t.customFontUrls.forEach(function(url) {
            var linkId = 'nt-custom-font-' + url.replace(/[^a-z0-9]/gi, '-');
            if (!document.getElementById(linkId)) {
              var link = document.createElement('link');
              link.id = linkId;
              link.rel = 'stylesheet';
              link.href = url;
              document.head.appendChild(link);
            }
          });
        }
      }
    });
    // Tell the parent we are ready so it can push the current theme immediately
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'GHOSTLINK_NT_READY' }, '*');
    }

    function navigate(url) {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'navigate', url }, '*');
      } else {
        document.getElementById('loader').classList.add('show');
        window.location.href = url;
      }
    }
    (function() {
      const saved = localStorage.getItem('gl_search_engine');
      const sel = document.getElementById('engine');
      if (saved) {
        const opt = [...sel.options].find(o => o.value === saved);
        if (opt) sel.value = saved;
      }
      sel.addEventListener('change', () => localStorage.setItem('gl_search_engine', sel.value));
    })();
    document.getElementById('searchForm').onsubmit = e => {
      e.preventDefault();
      const q = document.getElementById('searchInput').value.trim();
      if (!q) return;
      const engine = document.getElementById('engine').value;
      const isUrl = /^https?:\/\//.test(q) || (/\./.test(q) && !/ /.test(q));
      navigate(isUrl ? (/^https?:\/\//.test(q) ? q : 'https://' + q) : engine + encodeURIComponent(q));
    };
    const DEFAULT_SHORTCUTS = [
      { label: 'YouTube',   url: 'https://www.youtube.com/@imcrab.online',   viewBox: '0 0 16 16', svg: '<path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>' },
      { label: 'GitHub',    url: 'https://github.com/immcrab/urban-octo-winner',    viewBox: '0 0 24 24', svg: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>' },
      { label: 'Twitter',   url: 'https://twitter.com',   viewBox: '0 0 24 24', svg: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' },
      { label: 'Reddit',    url: 'https://reddit.com',    viewBox: '0 0 16 16', svg: '<path d="M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z"/><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165"/>' },
      { label: 'Instagram', url: 'https://instagram.com', viewBox: '0 0 16 16', svg: '<path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.919c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>' },
    ];
    function getShortcuts() {
      try { return JSON.parse(localStorage.getItem('gl_shortcuts') || 'null') || DEFAULT_SHORTCUTS; }
      catch { return DEFAULT_SHORTCUTS; }
    }
    function saveShortcuts(list) { localStorage.setItem('gl_shortcuts', JSON.stringify(list)); }
    function renderShortcuts() {
      const container = document.getElementById('shortcuts');
      container.innerHTML = '';
      getShortcuts().forEach((s, i) => {
        const el = document.createElement('div');
        el.className = 'shortcut';
        el.style.animationDelay = (i * 0.04 + 0.04) + 's';
        // Use inline SVG if available (default shortcuts), else fall back to <img alt=""> for user-added favicons
        const iconHtml = s.svg
          ? `<svg viewBox="${s.viewBox || '0 0 24 24'}" fill="currentColor" stroke="none" class="shortcut-svg">${s.svg}</svg>`
          : `<img alt="" src="${s.icon}" onerror="this.style.display='none'">`;
        el.innerHTML = `
          <div class="shortcut-icon">${iconHtml}</div>
          <span class="shortcut-label">${s.label}</span>`;
        el.onclick = () => navigate(s.url);
        container.appendChild(el);
      });
    }
    renderShortcuts();

    // Listen for shortcut refresh from parent
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'GHOSTLINK_REFRESH_SHORTCUTS') {
        renderShortcuts();
      }
    });

    const closeModal = () => document.getElementById('addModal').classList.add('hidden');
    document.getElementById('cancelAdd').onclick = closeModal;
    document.getElementById('cancelAdd2').onclick = closeModal;
    document.getElementById('addModal').onclick = e => {
      if (e.target === document.getElementById('addModal')) closeModal();
    };
    document.getElementById('confirmAdd').onclick = () => {
      const label = document.getElementById('newLabel').value.trim();
      let url = document.getElementById('newUrl').value.trim();
      if (!label || !url) return;
      if (!/^https?:\/\//.test(url)) url = 'https://' + url;
      const icon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
      const list = getShortcuts();
      list.push({ label, url, icon });
      saveShortcuts(list);
      closeModal();
      document.getElementById('newLabel').value = '';
      document.getElementById('newUrl').value = '';
      renderShortcuts();
    };
  