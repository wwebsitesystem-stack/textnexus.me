
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getDatabase, ref as dbRef, onValue, off, update, remove, push, serverTimestamp, get, set, increment, query, limitToLast } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

        const app = initializeApp({
            apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
            authDomain: "nexus-web-development-official.firebaseapp.com",
            projectId: "nexus-web-development-official",
            databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com"
        });
        const auth = getAuth(app);
        const db = getDatabase(app);

        const ADMIN_PASSCODE = "022614";
        const OWNER_EMAILS = ["brodywilliams0226@gmail.com", "imcrabfr@gmail.com"];
        const DEFAULT_CREDITS = 10000;

        // Every place the site stores data. Users are merged from all of them.
        const P = {
            tnUsers: 'textnexus/users',
            legacyUsers: 'nexus/users',
            tlUsers: 'textylabs/users',
            userSites: 'users',
            chats: 'textnexus/chats',
            aiSites: 'textnexus/ai_sites',
            updates: 'workspace_updates',
            audit: 'nexus/audit_logs',
            maintenance: 'nexus/system/maintenance',
            maintTime: 'maintenance/targetTime',
            theme: 'system/theme'
        };
        const DATA_ROOTS = ['textnexus', 'nexus', 'textylabs', 'pinkping', 'pinkping_groups', 'pinkping_messages', 'users', 'workspace_updates', 'system', 'maintenance'];

        // ================= state =================
        let me = null, isOwner = false, subscribed = false;
        const raw = { tnUsers: {}, legacyUsers: {}, tlUsers: {}, userSites: {}, chats: {}, aiSites: {}, updates: {}, audit: {} };
        const sys = { maintenance: false, maintTime: null, theme: null };
        let users = [], usersById = new Map(), chats = [], sites = [], messages = [];
        const view = { filter: 'all', sort: 'lastSeen' };
        let openDrawer = null; // { type, id }

        // ================= helpers =================
        const $ = (id) => document.getElementById(id);
        const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const fmt = (n) => Number(n || 0).toLocaleString();
        const entries = (o) => Object.entries(o || {}).filter(([, v]) => v && typeof v === 'object');
        const has = (needle, ...f) => !needle || f.some(x => String(x ?? '').toLowerCase().includes(needle));
        const num = (v) => (typeof v === 'number' && isFinite(v)) ? v : null;
        const isStaffRole = (r) => r === 'Admin' || r === 'Owner';
        const safeHttp = (u) => /^https?:\/\//i.test(String(u || '')) ? String(u) : null;

        function ago(ts) {
            if (!num(ts)) return '—';
            const s = Math.max(0, (Date.now() - ts) / 1000);
            if (s < 60) return 'just now';
            if (s < 3600) return `${Math.floor(s / 60)}m ago`;
            if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
            if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
            if (s < 86400 * 365) return `${Math.floor(s / 86400 / 30)}mo ago`;
            return `${Math.floor(s / 86400 / 365)}y ago`;
        }
        const full = (ts) => num(ts) ? new Date(ts).toLocaleString() : '';

        function avatar(u, cls = '') {
            const src = safeHttp(u?.photoURL);
            const initial = esc((u?.name || u?.email || '?').trim().charAt(0).toUpperCase() || '?');
            return src
                ? `<img class="avatar ${cls}" src="${esc(src)}" alt="" referrerpolicy="no-referrer" data-initial="${initial}">`
                : `<span class="avatar ${cls}">${initial}</span>`;
        }
        // Broken photos fall back to an initial bubble.
        document.addEventListener('error', e => {
            const img = e.target;
            if (img.tagName === 'IMG' && img.classList.contains('avatar')) {
                const span = document.createElement('span');
                span.className = img.className;
                span.textContent = img.dataset.initial || '?';
                img.replaceWith(span);
            }
        }, true);

        function roleBadge(role) {
            if (role === 'Owner') return '<span class="badge owner">Owner</span>';
            if (role === 'Admin') return '<span class="badge admin">Admin</span>';
            return '<span class="badge">User</span>';
        }

        function toast(msg, type = 'ok') {
            const el = document.createElement('div');
            el.className = `toast glass ${type}`;
            el.innerHTML = `<i class="ph ${type === 'err' ? 'ph-warning-circle' : type === 'info' ? 'ph-info' : 'ph-check-circle'}"></i><span>${esc(msg)}</span>`;
            $('toasts').appendChild(el);
            setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3200);
        }

        async function run(fn, okMsg) {
            try { await fn(); if (okMsg) toast(okMsg); return true; }
            catch (err) {
                console.error(err);
                toast(/permission/i.test(err?.message || err?.code || '') ? 'Permission denied by database rules.' : (err?.message || 'Something went wrong.'), 'err');
                return false;
            }
        }

        async function audit(action, details) {
            if (!me) return;
            try { await push(dbRef(db, P.audit), { timestamp: serverTimestamp(), adminEmail: me.email, action, details }); }
            catch (e) { console.warn('audit failed', e); }
        }

        // Promise-based modal (replaces confirm/prompt/alert).
        function dialog({ title, body = '', confirm = 'Confirm', danger = false, input = null, alertOnly = false }) {
            return new Promise(resolve => {
                const root = $('modal-root');
                root.innerHTML = `<div class="backdrop modal-wrap"><div class="modal-box" role="dialog" aria-modal="true">
                    <div class="modal-title">${esc(title)}</div>
                    <div class="modal-subtitle">${esc(body)}</div>
                    ${input ? `<input class="input" id="m-input" type="${input.type || 'text'}" value="${esc(input.value ?? '')}" placeholder="${esc(input.placeholder || '')}">` : ''}
                    <div class="modal-btn-group">
                        ${alertOnly ? '' : '<button class="btn" id="m-cancel">Cancel</button>'}
                        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="m-ok">${esc(confirm)}</button>
                    </div></div></div>`;
                const done = (v) => { root.innerHTML = ''; document.removeEventListener('keydown', onKey, true); resolve(v); };
                const ok = () => done(input ? $('m-input').value : true);
                const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(null); } if (e.key === 'Enter') { e.preventDefault(); ok(); } };
                document.addEventListener('keydown', onKey, true);
                $('m-ok').onclick = ok;
                if ($('m-cancel')) $('m-cancel').onclick = () => done(null);
                root.querySelector('.backdrop').onclick = (e) => { if (e.target.classList.contains('backdrop')) done(null); };
                setTimeout(() => (input ? $('m-input') : $('m-ok')).focus(), 20);
            });
        }

        function downloadFile(name, text, type) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([text], { type }));
            a.download = name; a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        }
        const csv = (rows) => rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const today = () => new Date().toISOString().slice(0, 10);

        // ================= data model =================
        function rebuild() {
            const map = new Map();
            const get = (uid) => {
                if (!map.has(uid)) map.set(uid, { uid, name: '', email: '', photoURL: '', credits: null, role: 'User', isBanned: false, lastSeen: null, msgCount: 0, lastMsg: null, chats: new Map(), sites: [], sources: new Set(), raw: {} });
                return map.get(uid);
            };
            const fill = (u, src) => {
                if (!u.name && (src.name || src.displayName || src.username)) u.name = src.name || src.displayName || src.username;
                if (!u.email && src.email) u.email = src.email;
                if (!u.photoURL && (src.photoURL || src.photoUrl || src.avatar)) u.photoURL = src.photoURL || src.photoUrl || src.avatar;
            };
            const seen = (u, ts) => { if (num(ts) && (!u.lastSeen || ts > u.lastSeen)) u.lastSeen = ts; };

            // TextNexus users = source of truth for credits / role / ban.
            for (const [uid, d] of entries(raw.tnUsers)) {
                const u = get(uid);
                u.sources.add('textnexus'); u.raw.textnexus = d; fill(u, d);
                if (d.credits !== undefined) u.credits = Number(d.credits);
                if (d.role) u.role = d.role;
                u.isBanned = !!d.isBanned;
                seen(u, d.lastLogin); seen(u, d.lastSeen);
            }
            for (const [uid, d] of entries(raw.legacyUsers)) {
                const u = get(uid);
                u.sources.add('nexus'); u.raw.nexus = d; fill(u, d);
                if (!raw.tnUsers[uid]?.role && d.role) u.role = d.role;
                if (d.isBanned) u.isBanned = true;
                seen(u, d.lastLogin);
            }
            for (const [uid, d] of entries(raw.tlUsers)) {
                const u = get(uid);
                u.sources.add('textylabs'); u.raw.textylabs = d; fill(u, d);
                seen(u, d.lastLogin); seen(u, d.lastSeen);
            }

            // Chats + messages.
            chats = []; messages = [];
            for (const [id, c] of entries(raw.chats)) {
                const msgs = entries(c.messages).map(([mid, m]) => ({ id: mid, chatId: id, ...m }));
                msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                const name = id === 'global' ? 'Global' : (c.name || 'Unnamed chat');
                const memberIds = Object.keys(c.members || {});
                chats.push({ id, name, code: c.code || c.inviteCode || '', createdBy: c.createdBy || '', createdEmail: c.createdEmail || c.creatorEmail || '', disabled: !!(c.disabled ?? c.isDisabled), members: memberIds, msgs, last: msgs.length ? msgs[msgs.length - 1].timestamp : null, raw: c });
                for (const m of msgs) {
                    messages.push({ ...m, chatName: name });
                    if (!m.uid) continue;
                    const u = get(m.uid);
                    u.sources.add('chat'); fill(u, m);
                    u.msgCount++; seen(u, m.timestamp);
                    if (num(m.timestamp) && (!u.lastMsg || m.timestamp > u.lastMsg.timestamp)) u.lastMsg = { ...m, chatName: name };
                    u.chats.set(id, name);
                }
                for (const uid of memberIds) { const u = get(uid); u.sources.add('chat'); u.chats.set(id, name); }
                if (c.createdBy) { const u = get(c.createdBy); fill(u, { email: c.createdEmail }); u.chats.set(id, name); }
            }
            messages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            // Sites: per-user records + global list, merged by subdomain/time.
            const siteMap = new Map();
            const addSite = (s, path, uid) => {
                const key = `${String(s.subdomain || '').toLowerCase()}|${s.createdAt || ''}`;
                const cur = siteMap.get(key) || { paths: [], uid: null };
                Object.assign(cur, { ...s, ...cur, model: cur.model || s.model, url: cur.url || s.url, expiresAt: cur.expiresAt || s.expiresAt, userEmail: cur.userEmail || s.userEmail, prompt: cur.prompt || s.prompt, subdomain: cur.subdomain || s.subdomain, createdAt: cur.createdAt || s.createdAt });
                cur.paths.push(path);
                if (uid) cur.uid = uid;
                siteMap.set(key, cur);
            };
            for (const [uid, d] of entries(raw.userSites)) {
                for (const [sid, s] of entries(d.sites)) addSite(s, `${P.userSites}/${uid}/sites/${sid}`, uid);
            }
            for (const [id, s] of entries(raw.aiSites)) addSite(s, `${P.aiSites}/${id}`, null);
            sites = [...siteMap.values()].map((s, i) => ({ ...s, key: String(i) }));
            const emailToUid = new Map();
            for (const u of map.values()) if (u.email) emailToUid.set(u.email.toLowerCase(), u.uid);
            for (const s of sites) {
                const uid = s.uid || (s.userEmail && emailToUid.get(s.userEmail.toLowerCase()));
                if (uid) { s.uid = uid; const u = get(uid); u.sites.push(s); if (!s.userEmail) s.userEmail = u.email; seen(u, s.createdAt); }
            }
            sites.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            for (const u of map.values()) {
                if (OWNER_EMAILS.includes(u.email)) u.role = 'Owner';
            }
            users = [...map.values()];
            usersById = map;
        }

        const credits = (u) => u.credits ?? DEFAULT_CREDITS;

        // ================= tabs =================
        const TABS = [
            { id: 'overview', label: 'Overview', icon: 'ph-squares-four' },
            { id: 'users', label: 'Users', icon: 'ph-users', count: () => users.length },
            { id: 'chats', label: 'Chats', icon: 'ph-chats-circle', count: () => chats.length },
            { id: 'sites', label: 'AI Sites', icon: 'ph-globe-simple', count: () => sites.length },
            { id: 'updates', label: 'Updates', icon: 'ph-megaphone', count: () => Object.keys(raw.updates).length },
            { id: 'system', label: 'System', icon: 'ph-gear-six' },
            { id: 'data', label: 'Data', icon: 'ph-database' },
            { id: 'audit', label: 'Audit log', icon: 'ph-scroll' }
        ];
        let tab = 'overview';
        try { tab = localStorage.getItem('nexus_admin_tab') || 'overview'; } catch {}
        if (!TABS.some(t => t.id === tab)) tab = 'overview';

        function renderTabs() {
            $('tabs').innerHTML = TABS.map(t => `<button class="nav-item ${t.id === tab ? 'active' : ''}" data-tab="${t.id}"><i class="ph ${t.icon}"></i>${t.label}${t.count ? `<span class="nav-count">${fmt(t.count())}</span>` : ''}</button>`).join('');
        }
        function switchTab(id) {
            tab = id;
            try { localStorage.setItem('nexus_admin_tab', id); } catch {}
            document.querySelectorAll('section.view').forEach(s => s.classList.toggle('hidden', s.id !== `view-${id}`));
            renderTabs();
            if (id === 'data' && subscribed && !$('d-path').value) loadPath('textnexus/users');
        }
        document.addEventListener('click', e => {
            const t = e.target.closest('[data-tab],[data-goto]');
            if (t) switchTab(t.dataset.tab || t.dataset.goto);
        });

        // ================= render: overview =================
        function stat(label, value, icon, sub = '') {
            return `<div class="glass stat"><div class="stat-label">${label}<i class="ph ${icon}"></i></div><div class="stat-value">${value}</div>${sub ? `<div class="stat-sub">${sub}</div>` : ''}</div>`;
        }
        function renderOverview() {
            const week = Date.now() - 7 * 864e5, day = Date.now() - 864e5;
            const active = users.filter(u => u.lastSeen > week).length;
            const msgs24 = messages.filter(m => m.timestamp > day).length;
            const circulating = users.filter(u => u.credits !== null).reduce((s, u) => s + (u.credits || 0), 0);
            $('stat-grid').innerHTML = [
                stat('Users', fmt(users.length), 'ph-users', `${fmt(users.filter(u => isStaffRole(u.role)).length)} staff`),
                stat('Active 7d', fmt(active), 'ph-pulse', users.length ? `${Math.round(active / users.length * 100)}% of users` : ''),
                stat('Messages', fmt(messages.length), 'ph-chat-text', `${fmt(msgs24)} in last 24h`),
                stat('Chats', fmt(chats.length), 'ph-chats-circle', `${fmt(chats.filter(c => c.disabled).length)} disabled`),
                stat('AI Sites', fmt(sites.length), 'ph-globe-simple'),
                stat('Banned', fmt(users.filter(u => u.isBanned).length), 'ph-prohibit'),
                stat('Credits', fmt(circulating), 'ph-coins', 'in circulation')
            ].join('');

            // 14-day message chart
            const days = [];
            for (let i = 13; i >= 0; i--) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i); days.push({ start: d.getTime(), n: 0, label: d.toLocaleDateString(undefined, { day: 'numeric' }) }); }
            const tomorrow = new Date(days[days.length - 1].start); tomorrow.setDate(tomorrow.getDate() + 1);
            for (const m of messages) {
                if (!num(m.timestamp) || m.timestamp < days[0].start || m.timestamp >= tomorrow.getTime()) continue;
                for (let i = days.length - 1; i >= 0; i--) if (m.timestamp >= days[i].start) { days[i].n++; break; }
            }
            const max = Math.max(1, ...days.map(d => d.n));
            $('chart-total').textContent = `${fmt(days.reduce((s, d) => s + d.n, 0))} total`;
            $('msg-chart').innerHTML = days.map(d => `<div class="bar" title="${new Date(d.start).toLocaleDateString()}: ${d.n}"><div class="bar-fill" style="height:${d.n / max * 100}%"><span class="bar-tip">${d.n}</span></div><span class="bar-label">${d.label}</span></div>`).join('');

            const top = users.filter(u => u.credits !== null).sort((a, b) => b.credits - a.credits).slice(0, 6);
            $('ov-top').innerHTML = top.length ? top.map(u => `<li class="clickable" data-user="${esc(u.uid)}">${avatar(u, 'sm')}<span class="grow truncate">${esc(u.name || u.email || u.uid)}</span><span class="mono gold">${fmt(u.credits)}</span></li>`).join('') : '<li class="t2">No credit records yet.</li>';

            $('ov-messages').innerHTML = messages.length ? messages.slice(0, 8).map(m => msgHTML(m, { showChat: true, deletable: false })).join('') : '<div class="empty"><i class="ph ph-chat-slash"></i>No messages yet.</div>';

            const recent = [...users].filter(u => u.lastSeen).sort((a, b) => b.lastSeen - a.lastSeen).slice(0, 8);
            $('ov-recent').innerHTML = recent.length ? recent.map(u => `<li class="clickable" data-user="${esc(u.uid)}">${avatar(u, 'sm')}<div class="grow"><div class="truncate" style="font-weight:500">${esc(u.name || 'Unknown')}</div><div class="mono t2 truncate" style="font-size:10px">${esc(u.email)}</div></div><span class="mono t2" style="font-size:10px">${ago(u.lastSeen)}</span></li>`).join('') : '<li class="t2">No activity yet.</li>';
        }

        function msgHTML(m, { showChat = false, deletable = true } = {}) {
            const u = usersById.get(m.uid) || { name: m.name, email: m.email, photoURL: m.photoURL };
            const file = safeHttp(m.fileUrl);
            const isImg = file && /^image\//.test(m.fileType || '');
            return `<div class="msg" data-chat="${esc(m.chatId)}" data-msg="${esc(m.id)}">
                <span data-user="${esc(m.uid || '')}" style="cursor:pointer">${avatar({ ...u, name: m.name || u.name }, 'sm')}</span>
                <div class="msg-body">
                    <div class="msg-meta"><b>${esc(m.name || u.name || 'User')}</b>${showChat ? `<span class="t3">in</span><span>${esc(m.chatName)}</span>` : ''}<span class="mono t3" title="${esc(full(m.timestamp))}">${ago(m.timestamp)}</span></div>
                    ${m.text ? `<div class="msg-text">${esc(m.text)}</div>` : ''}
                    ${isImg ? `<a href="${esc(file)}" target="_blank" rel="noopener"><img class="msg-img" src="${esc(file)}" alt=""></a>` : file ? `<a class="msg-file" href="${esc(file)}" target="_blank" rel="noopener"><i class="ph ph-paperclip"></i>${esc(m.fileName || 'Attachment')}</a>` : ''}
                </div>
                ${deletable ? `<button class="btn btn-icon btn-danger msg-del" data-action="del-msg" title="Delete message"><i class="ph ph-trash"></i></button>` : ''}
            </div>`;
        }

        // ================= render: users =================
        function renderUsers() {
            const body = $('u-body');
            if (body.contains(document.activeElement) && document.activeElement.matches('.credit-input, select')) return; // don't clobber editing
            const needle = $('u-search').value.trim().toLowerCase();
            const week = Date.now() - 7 * 864e5;
            const list = users
                .filter(u => has(needle, u.name, u.email, u.uid))
                .filter(u => view.filter === 'all'
                    || (view.filter === 'active' && u.lastSeen > week)
                    || (view.filter === 'banned' && u.isBanned)
                    || (view.filter === 'staff' && isStaffRole(u.role))
                    || (view.filter === 'nocredits' && u.credits === null));
            const sorters = {
                lastSeen: (a, b) => (b.lastSeen || 0) - (a.lastSeen || 0),
                name: (a, b) => (a.name || a.email || '').localeCompare(b.name || b.email || ''),
                credits: (a, b) => credits(b) - credits(a),
                creditsAsc: (a, b) => credits(a) - credits(b),
                messages: (a, b) => b.msgCount - a.msgCount
            };
            list.sort(sorters[view.sort]);
            $('u-count').textContent = `${list.length} of ${users.length}`;
            if (!list.length) { body.innerHTML = `<tr><td colspan="8" class="empty"><i class="ph ph-user-circle-dashed"></i>${users.length ? 'No users match.' : 'No users found.'}</td></tr>`; return; }

            body.innerHTML = list.map(u => {
                const isMe = me && u.uid === me.uid;
                return `<tr class="clickable" data-uid="${esc(u.uid)}">
                    <td><div class="row" style="min-width:220px">${avatar(u)}<div class="grow"><div class="row" style="gap:6px"><span class="truncate" style="font-weight:500">${esc(u.name || 'Unknown')}</span>${isMe ? '<span class="badge">You</span>' : ''}</div><div class="mono t2 truncate" style="font-size:11px">${esc(u.email || u.uid)}</div></div></div></td>
                    <td data-stop><div class="row" style="gap:4px">
                        <button class="btn btn-icon btn-sm" data-action="adjust" data-delta="-1000" title="−1,000">−</button>
                        <input type="number" class="input credit-input" value="${u.credits ?? ''}" placeholder="${DEFAULT_CREDITS}">
                        <button class="btn btn-icon btn-sm" data-action="adjust" data-delta="1000" title="+1,000">+</button>
                        <button class="btn btn-sm" data-action="save-credits">Set</button>
                    </div></td>
                    <td data-stop>${OWNER_EMAILS.includes(u.email) ? roleBadge('Owner') : `<select class="input" data-action="role" style="padding:6px 28px 6px 10px;font-size:12px">${['User', 'Admin', 'Owner'].map(r => `<option ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select>`}</td>
                    <td>${u.isBanned ? '<span class="badge bad">Banned</span>' : '<span class="badge ok">Active</span>'}</td>
                    <td class="mono">${fmt(u.msgCount)}</td>
                    <td class="mono">${fmt(u.sites.length)}</td>
                    <td class="mono t2" style="white-space:nowrap" title="${esc(full(u.lastSeen))}">${ago(u.lastSeen)}</td>
                    <td class="right" data-stop><button class="btn btn-sm ${u.isBanned ? '' : 'btn-danger'}" data-action="ban" ${isMe || OWNER_EMAILS.includes(u.email) ? 'disabled' : ''}>${u.isBanned ? 'Unban' : 'Ban'}</button></td>
                </tr>`;
            }).join('');
        }

        // ---- user actions (shared by table + drawer) ----
        async function setCredits(uid, value) {
            const v = parseInt(value, 10);
            if (isNaN(v) || v < 0) { toast('Enter a whole number ≥ 0.', 'err'); return false; }
            const u = usersById.get(uid);
            const before = u?.credits ?? 'none';
            const extra = (u?.email && !raw.tnUsers[uid]?.email) ? { email: u.email, name: u.name || 'User' } : {};
            const ok = await run(() => update(dbRef(db, `${P.tnUsers}/${uid}`), { credits: v, ...extra }), `Credits set to ${fmt(v)}.`);
            if (ok) audit('UPDATE_USER_CREDITS', `${u?.email || uid}: ${before} → ${v}`);
            return ok;
        }
        async function toggleBan(uid) {
            const u = usersById.get(uid); if (!u) return;
            const next = !u.isBanned;
            const ok = await dialog({ title: next ? 'Ban this user?' : 'Unban this user?', body: next ? `${u.email || uid} won't be able to send messages.` : `${u.email || uid} will be able to send messages again.`, confirm: next ? 'Ban' : 'Unban', danger: next });
            if (!ok) return;
            if (await run(() => update(dbRef(db, `${P.tnUsers}/${uid}`), { isBanned: next }), next ? 'User banned.' : 'User unbanned.'))
                audit('TOGGLE_BAN', `${u.email || uid} banned=${next}`);
        }
        async function setRole(uid, role, revert) {
            const u = usersById.get(uid); if (!u) return;
            if (role !== 'User' && !(await dialog({ title: `Make ${role}?`, body: `${u.email || uid} will be marked as ${role}.`, confirm: `Make ${role}` }))) return revert?.();
            if (await run(() => update(dbRef(db, `${P.tnUsers}/${uid}`), { role }), `Role set to ${role}.`)) audit('CHANGE_USER_ROLE', `${u.email || uid}: ${u.role} → ${role}`);
            else revert?.();
        }

        $('u-search').addEventListener('input', renderUsers);
        $('u-sort').addEventListener('change', e => { view.sort = e.target.value; renderUsers(); });
        $('u-chips').addEventListener('click', e => {
            const c = e.target.closest('[data-filter]'); if (!c) return;
            view.filter = c.dataset.filter;
            $('u-chips').querySelectorAll('.chip').forEach(x => x.classList.toggle('active', x === c));
            renderUsers();
        });
        const uBody = $('u-body');
        uBody.addEventListener('input', e => {
            if (!e.target.classList.contains('credit-input')) return;
            const u = usersById.get(e.target.closest('tr').dataset.uid);
            e.target.classList.toggle('dirty', String(u?.credits ?? '') !== e.target.value);
        });
        uBody.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.target.classList.contains('credit-input')) { const uid = e.target.closest('tr').dataset.uid, v = e.target.value; e.target.blur(); setCredits(uid, v); }
        });
        uBody.addEventListener('change', e => {
            if (e.target.dataset.action !== 'role') return;
            const sel = e.target, uid = sel.closest('tr').dataset.uid, prev = usersById.get(uid)?.role || 'User';
            sel.blur();
            setRole(uid, sel.value, () => { sel.value = prev; });
        });
        uBody.addEventListener('click', e => {
            const row = e.target.closest('tr[data-uid]'); if (!row) return;
            const uid = row.dataset.uid;
            const btn = e.target.closest('[data-action]');
            if (btn && btn.tagName === 'BUTTON') {
                const input = row.querySelector('.credit-input');
                if (btn.dataset.action === 'adjust') {
                    const base = input.value === '' ? (usersById.get(uid)?.credits ?? DEFAULT_CREDITS) : (parseInt(input.value, 10) || 0);
                    input.value = Math.max(0, base + Number(btn.dataset.delta));
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                } else if (btn.dataset.action === 'save-credits') setCredits(uid, input.value);
                else if (btn.dataset.action === 'ban') toggleBan(uid);
                return;
            }
            if (e.target.closest('[data-stop]')) return;
            openUser(uid);
        });
        $('u-export').addEventListener('click', () => {
            const rows = [['uid', 'name', 'email', 'credits', 'role', 'banned', 'messages', 'sites', 'chats', 'lastActive', 'sources']];
            users.forEach(u => rows.push([u.uid, u.name, u.email, u.credits ?? '', u.role, u.isBanned, u.msgCount, u.sites.length, [...u.chats.values()].join('; '), u.lastSeen ? new Date(u.lastSeen).toISOString() : '', [...u.sources].join(' ')]));
            downloadFile(`nexus-users-${today()}.csv`, csv(rows), 'text/csv');
        });

        // ================= drawers =================
        function openUser(uid) { if (!uid) return; openDrawer = { type: 'user', id: uid }; renderDrawer(true); }
        function openChat(id) { openDrawer = { type: 'chat', id }; renderDrawer(true); }
        function closeDrawer() { openDrawer = null; $('drawer-root').innerHTML = ''; }

        function jsonTree(value, key, path, depth = 0) {
            if (value !== null && typeof value === 'object') {
                const keys = Object.keys(value);
                const shown = keys.slice(0, 300);
                return `<details ${depth < 1 ? 'open' : ''}><summary><span class="k">${esc(key)}</span><span class="t3">{${keys.length}}</span>${path !== null ? `<button class="go" data-path="${esc(path)}">open</button>` : ''}</summary><div class="children">${shown.map(k => jsonTree(value[k], k, path !== null ? (path ? `${path}/${k}` : k) : null, depth + 1)).join('')}${keys.length > 300 ? `<div class="leaf t3">… ${keys.length - 300} more</div>` : ''}</div></details>`;
            }
            const cls = typeof value === 'string' ? 's' : typeof value === 'number' ? 'n' : 'b';
            const shown = typeof value === 'string' && value.length > 400 ? value.slice(0, 400) + '…' : value;
            return `<div class="leaf"><span class="k">${esc(key)}</span>: <span class="${cls}">${esc(JSON.stringify(shown))}</span></div>`;
        }

        function renderDrawer(fresh = false) {
            if (!openDrawer) return;
            const root = $('drawer-root');
            const scroll = fresh ? 0 : (root.querySelector('.drawer-body')?.scrollTop || 0);
            root.innerHTML = openDrawer.type === 'user' ? userDrawer(openDrawer.id) : chatDrawer(openDrawer.id);
            const drawer = root.querySelector('.drawer');
            if (drawer && !fresh) drawer.style.animation = 'none';
            const bodyEl = root.querySelector('.drawer-body'); if (bodyEl) bodyEl.scrollTop = scroll;
        }

        const notFound = (what) => `<div class="backdrop" data-close><div class="drawer"><div class="drawer-head"><span class="grow">${what} not found</span><button class="btn btn-icon" data-close aria-label="Close"><i class="ph ph-x"></i></button></div></div></div>`;

        function userDrawer(uid) {
            const u = usersById.get(uid);
            if (!u) return notFound('User');
            const isProtected = OWNER_EMAILS.includes(u.email) || (me && me.uid === uid);
            const userMsgs = messages.filter(m => m.uid === uid).slice(0, 40);
            const rawPaths = { textnexus: P.tnUsers, nexus: P.legacyUsers, textylabs: P.tlUsers };
            return `<div class="backdrop" data-close><div class="drawer">
                <div class="drawer-head">${avatar(u, 'lg')}<div class="grow"><div class="row" style="gap:8px;flex-wrap:wrap"><span style="font-size:16px;font-weight:600">${esc(u.name || 'Unknown')}</span>${roleBadge(u.role)}${u.isBanned ? '<span class="badge bad">Banned</span>' : ''}</div><div class="mono t2" style="font-size:11px;margin-top:2px">${esc(u.email || 'no email')}</div></div><button class="btn btn-icon" data-close aria-label="Close"><i class="ph ph-x"></i></button></div>
                <div class="drawer-body">
                    <div class="drawer-section">
                        <span class="panel-title">Credits</span>
                        <div class="row" style="flex-wrap:wrap">
                            <input type="number" class="input credit-input" id="dr-credits" value="${u.credits ?? ''}" placeholder="${DEFAULT_CREDITS}" style="width:140px">
                            <button class="btn btn-primary" data-action="dr-save">Set</button>
                            ${[-1000, 1000, 5000].map(d => `<button class="btn btn-sm" data-action="dr-add" data-delta="${d}">${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}</button>`).join('')}
                            <button class="btn btn-sm" data-action="dr-reset">Reset</button>
                        </div>
                        ${u.credits === null ? `<span class="hint">No credit record yet — AI Creator gives ${fmt(DEFAULT_CREDITS)} on first visit.</span>` : ''}
                    </div>
                    <div class="drawer-section">
                        <span class="panel-title">Account</span>
                        <div class="row" style="flex-wrap:wrap">
                            ${OWNER_EMAILS.includes(u.email) ? '' : `<select class="input" id="dr-role">${['User', 'Admin', 'Owner'].map(r => `<option ${u.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select>`}
                            <button class="btn ${u.isBanned ? '' : 'btn-danger'}" data-action="dr-ban" ${isProtected ? 'disabled' : ''}><i class="ph ${u.isBanned ? 'ph-user-check' : 'ph-prohibit'}"></i>${u.isBanned ? 'Unban' : 'Ban user'}</button>
                            <button class="btn" data-action="dr-copy"><i class="ph ph-copy"></i>Copy UID</button>
                        </div>
                        <dl class="kv">
                            <dt>uid</dt><dd class="mono">${esc(u.uid)}</dd>
                            <dt>last active</dt><dd>${u.lastSeen ? `${ago(u.lastSeen)} · ${esc(full(u.lastSeen))}` : '—'}</dd>
                            <dt>messages</dt><dd>${fmt(u.msgCount)}</dd>
                            <dt>found in</dt><dd>${[...u.sources].map(s => `<span class="badge src">${esc(s)}</span>`).join(' ')}</dd>
                        </dl>
                    </div>
                    <div class="drawer-section">
                        <span class="panel-title">Chats · ${u.chats.size}</span>
                        ${u.chats.size ? `<div class="chips">${[...u.chats].map(([id, name]) => `<button class="chip" data-open-chat="${esc(id)}">${esc(name)}</button>`).join('')}</div>` : '<span class="hint">Not in any chats.</span>'}
                    </div>
                    <div class="drawer-section">
                        <span class="panel-title">AI sites · ${u.sites.length}</span>
                        ${u.sites.length ? u.sites.map(siteLine).join('') : '<span class="hint">No sites built.</span>'}
                    </div>
                    <div class="drawer-section" style="padding:18px 0 0">
                        <span class="panel-title" style="padding:0 20px">Recent messages · ${fmt(u.msgCount)}</span>
                        <div>${userMsgs.length ? userMsgs.map(m => msgHTML(m, { showChat: true })).join('') : '<div class="hint" style="padding:0 20px 18px">No messages.</div>'}</div>
                    </div>
                    <div class="drawer-section">
                        <span class="panel-title">Raw records</span>
                        <div class="jt">${Object.entries(u.raw).map(([src, d]) => jsonTree(d, `${rawPaths[src]}/${u.uid}`, null, 1)).join('') || '<span class="hint">No stored profile — seen only through chat activity.</span>'}</div>
                    </div>
                </div>
            </div></div>`;
        }

        function siteLine(s) {
            const sub = String(s.subdomain || '');
            const url = safeHttp(s.url) || (/^[a-z0-9-]+$/i.test(sub) ? `https://${sub}.textnexus.me` : null);
            return `<div class="row" style="align-items:flex-start"><i class="ph ph-globe-simple t2" style="margin-top:2px"></i><div class="grow"><div>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener" class="mono">${esc(sub || url)}</a>` : esc(sub)}</div><div class="hint truncate">${esc(s.prompt || '')}</div></div><span class="mono t2" style="font-size:10px">${ago(s.createdAt)}</span></div>`;
        }

        function chatDrawer(id) {
            const c = chats.find(x => x.id === id);
            if (!c) return notFound('Chat');
            const creator = usersById.get(c.createdBy);
            return `<div class="backdrop" data-close><div class="drawer">
                <div class="drawer-head"><span class="avatar lg" style="background:rgba(255,255,255,.08);color:#fff"><i class="ph ph-${id === 'global' ? 'globe' : 'users-three'}"></i></span><div class="grow"><div class="row" style="gap:8px"><span style="font-size:16px;font-weight:600">${esc(c.name)}</span>${c.disabled ? '<span class="badge bad">Disabled</span>' : '<span class="badge ok">Active</span>'}</div><div class="mono t2" style="font-size:11px;margin-top:2px">${c.code ? `code ${esc(c.code)} · ` : ''}${fmt(c.msgs.length)} messages</div></div><button class="btn btn-icon" data-close aria-label="Close"><i class="ph ph-x"></i></button></div>
                <div class="drawer-body">
                    <div class="drawer-section">
                        <div class="row" style="flex-wrap:wrap">
                            ${id !== 'global' ? `<button class="btn" data-action="chat-toggle">${c.disabled ? 'Enable chat' : 'Disable chat'}</button>` : ''}
                            <button class="btn" data-action="chat-clear"><i class="ph ph-broom"></i>Clear messages</button>
                            ${id !== 'global' ? `<button class="btn btn-danger" data-action="chat-delete"><i class="ph ph-trash"></i>Delete chat</button>` : ''}
                        </div>
                        <dl class="kv">
                            <dt>created by</dt><dd>${creator ? `<a href="#" data-user="${esc(creator.uid)}">${esc(creator.name || creator.email)}</a>` : esc(c.createdEmail || '—')}</dd>
                            <dt>members</dt><dd>${c.members.length ? c.members.map(uid => { const m = usersById.get(uid); return `<a href="#" data-user="${esc(uid)}" class="badge src" style="margin:0 4px 4px 0;text-decoration:none">${esc(m?.name || m?.email || uid.slice(0, 8))}</a>`; }).join('') : (id === 'global' ? 'Everyone' : '—')}</dd>
                        </dl>
                    </div>
                    <div>${c.msgs.length ? [...c.msgs].reverse().slice(0, 300).map(m => msgHTML({ ...m, chatName: c.name })).join('') : '<div class="empty"><i class="ph ph-chat-slash"></i>No messages.</div>'}</div>
                </div>
            </div></div>`;
        }

        $('drawer-root').addEventListener('click', async e => {
            if (e.target.matches('[data-close]') || e.target.closest('button[data-close]')) return closeDrawer();
            const userLink = e.target.closest('[data-user]');
            if (userLink && userLink.dataset.user) { e.preventDefault(); return openUser(userLink.dataset.user); }
            const chatLink = e.target.closest('[data-open-chat]');
            if (chatLink) return openChat(chatLink.dataset.openChat);
            const btn = e.target.closest('button[data-action]'); if (!btn) return;
            const a = btn.dataset.action;
            if (a === 'del-msg') return deleteMessage(btn.closest('.msg'));

            if (openDrawer?.type === 'user') {
                const uid = openDrawer.id, u = usersById.get(uid), input = $('dr-credits');
                if (a === 'dr-save') setCredits(uid, input.value);
                if (a === 'dr-add') {
                    const base = input.value === '' ? (u?.credits ?? DEFAULT_CREDITS) : (parseInt(input.value, 10) || 0);
                    input.value = Math.max(0, base + Number(btn.dataset.delta)); input.classList.add('dirty');
                }
                if (a === 'dr-reset') setCredits(uid, DEFAULT_CREDITS);
                if (a === 'dr-ban') toggleBan(uid);
                if (a === 'dr-copy') navigator.clipboard?.writeText(uid).then(() => toast('UID copied.', 'info'));
            } else if (openDrawer?.type === 'chat') {
                chatAction(openDrawer.id, a);
            }
        });
        $('drawer-root').addEventListener('change', e => {
            if (e.target.id !== 'dr-role') return;
            const uid = openDrawer.id, prev = usersById.get(uid)?.role || 'User', sel = e.target;
            sel.blur();
            setRole(uid, sel.value, () => { sel.value = prev; });
        });
        $('drawer-root').addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.target.id === 'dr-credits') { const v = e.target.value; e.target.blur(); setCredits(openDrawer.id, v); }
        });

        async function deleteMessage(el) {
            if (!el) return;
            const chatId = el.dataset.chat, msgId = el.dataset.msg;
            const m = messages.find(x => x.chatId === chatId && x.id === msgId);
            if (!(await dialog({ title: 'Delete message?', body: m?.text ? `"${m.text.slice(0, 200)}"` : 'This message will be removed for everyone.', confirm: 'Delete', danger: true }))) return;
            if (await run(() => remove(dbRef(db, `${P.chats}/${chatId}/messages/${msgId}`)), 'Message deleted.'))
                audit('DELETE_MESSAGE', `${m?.email || m?.uid || '?'} in ${m?.chatName || chatId}: ${(m?.text || '').slice(0, 80)}`);
        }

        async function chatAction(id, a) {
            const c = chats.find(x => x.id === id); if (!c) return;
            if (a === 'chat-toggle') {
                const next = !c.disabled;
                if (await run(() => update(dbRef(db, `${P.chats}/${id}`), { disabled: next }), next ? 'Chat disabled.' : 'Chat enabled.')) audit('TOGGLE_CHAT', `${c.name} disabled=${next}`);
            } else if (a === 'chat-clear') {
                if (!(await dialog({ title: `Clear all messages in ${c.name}?`, body: `${fmt(c.msgs.length)} messages will be deleted permanently.`, confirm: 'Clear', danger: true }))) return;
                if (await run(() => remove(dbRef(db, `${P.chats}/${id}/messages`)), 'Messages cleared.')) audit('CLEAR_CHAT', `${c.name}: ${c.msgs.length} messages`);
            } else if (a === 'chat-delete') {
                if (!(await dialog({ title: `Delete ${c.name}?`, body: 'The chat, its members and all messages will be removed permanently.', confirm: 'Delete', danger: true }))) return;
                if (await run(() => remove(dbRef(db, `${P.chats}/${id}`)), 'Chat deleted.')) { audit('DELETE_CHAT', `${c.name} (${c.code || id})`); closeDrawer(); }
            }
        }

        // ================= render: chats =================
        function renderChats() {
            const needle = $('c-search').value.trim().toLowerCase();
            const list = chats.filter(c => has(needle, c.name, c.code, c.createdEmail)).sort((a, b) => (b.last || 0) - (a.last || 0));
            $('c-count').textContent = `${list.length} of ${chats.length}`;
            $('c-body').innerHTML = list.length ? list.map(c => `
                <tr class="clickable" data-chat-id="${esc(c.id)}">
                    <td><div class="row"><span class="avatar sm" style="background:rgba(255,255,255,.08);color:#fff"><i class="ph ph-${c.id === 'global' ? 'globe' : 'users-three'}"></i></span><span style="font-weight:500">${esc(c.name)}</span></div></td>
                    <td class="mono">${esc(c.code || '—')}</td>
                    <td class="mono t2" style="font-size:11px">${esc(c.createdEmail || (c.id === 'global' ? 'system' : '—'))}</td>
                    <td class="mono">${c.id === 'global' ? '—' : fmt(c.members.length)}</td>
                    <td class="mono">${fmt(c.msgs.length)}</td>
                    <td class="mono t2" title="${esc(full(c.last))}">${ago(c.last)}</td>
                    <td>${c.disabled ? '<span class="badge bad">Disabled</span>' : '<span class="badge ok">Active</span>'}</td>
                    <td class="right"><i class="ph ph-caret-right t2"></i></td>
                </tr>`).join('') : `<tr><td colspan="8" class="empty"><i class="ph ph-chats-circle"></i>${chats.length ? 'No chats match.' : 'No chats yet.'}</td></tr>`;
        }
        $('c-search').addEventListener('input', renderChats);
        $('c-body').addEventListener('click', e => { const r = e.target.closest('[data-chat-id]'); if (r) openChat(r.dataset.chatId); });

        // ================= render: sites =================
        function renderSites() {
            const needle = $('s-search').value.trim().toLowerCase();
            const list = sites.filter(s => has(needle, s.subdomain, s.userEmail, s.prompt, s.model));
            $('s-count').textContent = `${list.length} of ${sites.length}`;
            $('s-body').innerHTML = list.length ? list.map(s => {
                const sub = String(s.subdomain || '');
                const url = safeHttp(s.url) || (/^[a-z0-9-]+$/i.test(sub) ? `https://${sub}.textnexus.me` : null);
                const expired = num(s.expiresAt) && s.expiresAt < Date.now();
                return `<tr data-key="${s.key}">
                    <td class="mono" style="white-space:nowrap">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(sub || url)} <i class="ph ph-arrow-up-right t2"></i></a>` : esc(sub || '—')}</td>
                    <td>${s.uid ? `<a href="#" data-user="${esc(s.uid)}" class="mono" style="font-size:11px">${esc(s.userEmail || s.uid)}</a>` : `<span class="mono t2" style="font-size:11px">${esc(s.userEmail || 'unknown')}</span>`}</td>
                    <td class="mono t2" style="font-size:11px">${esc(s.model || '—')}</td>
                    <td style="max-width:320px"><button class="truncate t2" style="max-width:320px;display:block;text-align:left" data-action="prompt">${esc(s.prompt || '—')}</button></td>
                    <td class="mono t2" title="${esc(full(s.createdAt))}">${ago(s.createdAt)}</td>
                    <td class="mono ${expired ? 'red' : 't2'}" style="font-size:11px">${num(s.expiresAt) ? (expired ? 'expired' : new Date(s.expiresAt).toLocaleDateString()) : '—'}</td>
                    <td class="right"><button class="btn btn-icon btn-danger" data-action="del-site" title="Delete record"><i class="ph ph-trash"></i></button></td>
                </tr>`;
            }).join('') : `<tr><td colspan="7" class="empty"><i class="ph ph-globe-simple"></i>${sites.length ? 'No sites match.' : 'No AI sites built yet.'}</td></tr>`;
        }
        $('s-search').addEventListener('input', renderSites);
        $('s-body').addEventListener('click', async e => {
            const userLink = e.target.closest('[data-user]');
            if (userLink) { e.preventDefault(); return openUser(userLink.dataset.user); }
            const btn = e.target.closest('[data-action]'); if (!btn) return;
            const s = sites.find(x => x.key === btn.closest('tr').dataset.key); if (!s) return;
            if (btn.dataset.action === 'prompt') return dialog({ title: s.subdomain || 'Prompt', body: s.prompt || '—', confirm: 'Close', alertOnly: true });
            if (!(await dialog({ title: 'Delete site record?', body: `${s.subdomain} will be removed from the database (${s.paths.length} record${s.paths.length > 1 ? 's' : ''}). The deployed site itself is not taken down.`, confirm: 'Delete', danger: true }))) return;
            const updates = Object.fromEntries(s.paths.map(p => [p, null]));
            if (await run(() => update(dbRef(db), updates), 'Site record deleted.')) audit('DELETE_AI_SITE', `${s.subdomain} by ${s.userEmail || '?'}`);
        });

        // ================= render: updates =================
        function renderPreview() {
            $('up-count').textContent = $('up-content').value.length;
            $('pv-title').textContent = $('up-title').value || 'Title';
            $('pv-content').textContent = $('up-content').value || "What's new…";
            $('pv-time').textContent = new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            $('pv-author').textContent = me?.displayName || 'Nexus Admin';
        }
        ['up-title', 'up-content'].forEach(id => $(id).addEventListener('input', renderPreview));
        $('up-content').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('up-post').click(); });
        $('up-post').addEventListener('click', async () => {
            const title = $('up-title').value.trim(), content = $('up-content').value.trim();
            if (!title || !content) return toast('Add a title and content.', 'err');
            if (!(await dialog({ title: 'Post this update?', body: `"${title}" will appear on everyone's Updates page.`, confirm: 'Post' }))) return;
            const btn = $('up-post'); btn.disabled = true;
            if (await run(() => push(dbRef(db, P.updates), { title, content, timestamp: serverTimestamp(), authorName: me.displayName || 'Nexus Admin', authorEmail: me.email }), 'Update posted.')) {
                audit('PUBLISH_UPDATE', title);
                $('up-title').value = ''; $('up-content').value = ''; renderPreview();
            }
            btn.disabled = false;
        });
        function renderUpdates() {
            const list = entries(raw.updates).map(([id, u]) => ({ id, ...u })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            $('up-total').textContent = `${list.length} published`;
            $('up-list').innerHTML = list.length ? list.map(u => `
                <div class="msg" data-id="${esc(u.id)}" style="padding:16px 20px">
                    <div class="msg-body">
                        <div class="row" style="justify-content:space-between"><b style="font-size:13px">${esc(u.title)}</b><span class="mono t3" style="font-size:10px" title="${esc(full(u.timestamp))}">${ago(u.timestamp)}</span></div>
                        <div class="msg-text t2" style="margin-top:6px">${esc(u.content)}</div>
                        <div class="hint" style="margin-top:8px">by ${esc(u.authorName || 'Nexus Admin')}</div>
                    </div>
                    <button class="btn btn-icon btn-danger msg-del" data-action="del-update" title="Delete"><i class="ph ph-trash"></i></button>
                </div>`).join('') : '<div class="empty"><i class="ph ph-megaphone"></i>No updates posted.</div>';
        }
        $('up-list').addEventListener('click', async e => {
            const btn = e.target.closest('[data-action="del-update"]'); if (!btn) return;
            const id = btn.closest('[data-id]').dataset.id, title = raw.updates[id]?.title || id;
            if (!(await dialog({ title: 'Delete update?', body: `"${title}" will be removed from the Updates page.`, confirm: 'Delete', danger: true }))) return;
            if (await run(() => remove(dbRef(db, `${P.updates}/${id}`)), 'Update deleted.')) audit('DELETE_UPDATE', title);
        });

        // ================= system =================
        function renderSystem() {
            $('maint-switch').classList.toggle('on', sys.maintenance);
            $('maint-banner').classList.toggle('hidden', !sys.maintenance);
            $('maint-time-current').textContent = num(sys.maintTime) ? new Date(sys.maintTime).toLocaleString() : 'not set';
            $('theme-current').textContent = sys.theme || 'default';
            const myU = me && usersById.get(me.uid);
            if (document.activeElement !== $('my-credits')) $('my-credits').value = myU?.credits ?? '';
        }
        $('maint-switch').addEventListener('click', async () => {
            const next = !sys.maintenance;
            if (!(await dialog({ title: next ? 'Turn maintenance flag on?' : 'Turn maintenance flag off?', confirm: next ? 'Turn on' : 'Turn off', danger: next }))) return;
            if (await run(() => set(dbRef(db, P.maintenance), next), `Maintenance ${next ? 'on' : 'off'}.`)) audit('TOGGLE_MAINTENANCE', `maintenance=${next}`);
        });
        $('maint-time-save').addEventListener('click', async () => {
            const v = $('maint-time').value; if (!v) return toast('Pick a date and time.', 'err');
            const ts = new Date(v).getTime();
            if (await run(() => set(dbRef(db, P.maintTime), ts), 'Countdown saved.')) audit('SET_MAINTENANCE_TIME', new Date(ts).toISOString());
        });
        $('maint-time-clear').addEventListener('click', async () => {
            if (await run(() => remove(dbRef(db, P.maintTime)), 'Countdown cleared.')) audit('SET_MAINTENANCE_TIME', 'cleared');
        });
        $('theme-save').addEventListener('click', async () => {
            const v = $('theme-input').value.trim(); if (!v) return toast('Enter a theme name.', 'err');
            if (!/^[\w\-./]+$/.test(v) || v.includes('..')) return toast('Theme name can only contain letters, numbers, - _ . /', 'err');
            if (await run(() => set(dbRef(db, P.theme), v), `Theme set to ${v}.`)) audit('SET_THEME', v);
        });
        $('theme-reset').addEventListener('click', async () => {
            if (await run(() => set(dbRef(db, P.theme), 'default'), 'Theme reset.')) audit('SET_THEME', 'default');
        });
        $('my-credits-save').addEventListener('click', () => me && setCredits(me.uid, $('my-credits').value));

        // ================= airdrop =================
        $('airdrop-btn').addEventListener('click', async () => {
            const targets = users.filter(u => !u.isBanned);
            const v = await dialog({ title: 'Credit airdrop', body: `Credits to add to each of ${fmt(targets.length)} non-banned users.`, confirm: 'Airdrop', input: { type: 'number', value: '1000' } });
            if (v === null) return;
            const amt = parseInt(v, 10);
            if (isNaN(amt) || amt <= 0) return toast('Enter a positive number.', 'err');
            if (!targets.length) return toast('No eligible users.', 'info');
            // increment() is atomic per user, so concurrent spends aren't lost.
            const upd = {};
            targets.forEach(u => { upd[`${P.tnUsers}/${u.uid}/credits`] = u.credits === null ? DEFAULT_CREDITS + amt : increment(amt); });
            if (await run(() => update(dbRef(db), upd), `+${fmt(amt)} credits sent to ${fmt(targets.length)} users.`)) audit('GLOBAL_AIRDROP', `+${amt} to ${targets.length} users`);
        });

        // ================= data explorer =================
        let currentData = null, currentPath = '';
        $('d-roots').innerHTML = DATA_ROOTS.map(r => `<button class="chip" data-root="${r}">${r}</button>`).join('');
        $('d-roots').addEventListener('click', e => { const b = e.target.closest('[data-root]'); if (b) loadPath(b.dataset.root); });
        $('d-go').addEventListener('click', () => loadPath($('d-path').value));
        $('d-path').addEventListener('keydown', e => { if (e.key === 'Enter') loadPath($('d-path').value); });
        $('d-tree').addEventListener('click', e => { const b = e.target.closest('[data-path]'); if (b) { e.preventDefault(); loadPath(b.dataset.path); } });
        $('d-crumbs').addEventListener('click', e => { const b = e.target.closest('[data-path]'); if (b) loadPath(b.dataset.path); });
        $('d-copy').addEventListener('click', () => { if (currentData !== null) navigator.clipboard?.writeText(JSON.stringify(currentData, null, 2)).then(() => toast('JSON copied.', 'info')); });
        $('d-download').addEventListener('click', () => { if (currentData !== null) downloadFile(`${(currentPath || 'root').replace(/\//g, '_')}-${today()}.json`, JSON.stringify(currentData, null, 2), 'application/json'); });

        async function loadPath(path) {
            path = String(path || '').trim().replace(/^\/+|\/+$/g, '');
            if (/[.#$\[\]]/.test(path)) return toast('Paths cannot contain . # $ [ ]', 'err');
            currentPath = path;
            $('d-path').value = path;
            $('d-roots').querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.root === path));
            const parts = path ? path.split('/') : [];
            $('d-crumbs').innerHTML = `<button data-path="">root</button>` + parts.map((p, i) => `<span class="t3">/</span><button data-path="${esc(parts.slice(0, i + 1).join('/'))}">${esc(p)}</button>`).join('');
            $('d-tree').innerHTML = '<div class="empty"><i class="ph ph-spinner"></i>Loading…</div>';
            try {
                const snap = await get(dbRef(db, path || '/'));
                currentData = snap.val();
                const size = currentData === null ? 0 : JSON.stringify(currentData).length;
                $('d-meta').textContent = currentData && typeof currentData === 'object' ? `${fmt(Object.keys(currentData).length)} keys · ${(size / 1024).toFixed(1)} KB` : '';
                $('d-tree').innerHTML = currentData === null ? '<div class="empty"><i class="ph ph-empty"></i>Nothing stored here.</div>' : jsonTree(currentData, path.split('/').pop() || 'root', path, 0);
            } catch (err) {
                currentData = null;
                $('d-meta').textContent = '';
                $('d-tree').innerHTML = `<div class="empty"><i class="ph ph-lock"></i>${esc(/permission/i.test(err.message) ? 'Permission denied — your database rules block reading this path.' : err.message)}</div>`;
            }
        }

        // ================= audit =================
        function renderAudit() {
            const all = entries(raw.audit).map(([id, l]) => ({ id, ...l })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            const sel = $('a-filter'), cur = sel.value;
            const actions = [...new Set(all.map(l => l.action).filter(Boolean))].sort();
            sel.innerHTML = '<option value="">All actions</option>' + actions.map(a => `<option>${esc(a)}</option>`).join('');
            sel.value = actions.includes(cur) ? cur : '';
            const needle = $('a-search').value.trim().toLowerCase();
            const list = all.filter(l => (!sel.value || l.action === sel.value) && has(needle, l.adminEmail, l.details, l.action));
            $('a-count').textContent = `${list.length} of ${all.length}`;
            const tone = (a = '') => /DELETE|BAN|CLEAR/.test(a) ? 'bad' : /CREDIT|AIRDROP/.test(a) ? 'owner' : '';
            $('a-body').innerHTML = list.length ? list.map(l => `<tr>
                <td class="mono t2" style="white-space:nowrap" title="${esc(full(l.timestamp))}">${ago(l.timestamp)}</td>
                <td class="mono" style="font-size:11px">${esc(l.adminEmail)}</td>
                <td><span class="badge ${tone(l.action)}">${esc(l.action)}</span></td>
                <td class="t2">${esc(l.details)}</td></tr>`).join('') : `<tr><td colspan="4" class="empty"><i class="ph ph-scroll"></i>${all.length ? 'No entries match.' : 'No audit entries yet.'}</td></tr>`;
        }
        $('a-search').addEventListener('input', renderAudit);
        $('a-filter').addEventListener('change', renderAudit);
        $('a-export').addEventListener('click', () => {
            const rows = [['timestamp', 'admin', 'action', 'details']];
            entries(raw.audit).map(([, l]) => l).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).forEach(l => rows.push([num(l.timestamp) ? new Date(l.timestamp).toISOString() : '', l.adminEmail, l.action, l.details]));
            downloadFile(`nexus-audit-${today()}.csv`, csv(rows), 'text/csv');
        });

        // ================= global clicks / keys =================
        document.addEventListener('click', e => {
            if (e.target.closest('#drawer-root, #u-body, #s-body')) return;
            const u = e.target.closest('[data-user]');
            if (u && u.dataset.user) { e.preventDefault(); openUser(u.dataset.user); }
        });
        document.addEventListener('keydown', e => {
            if ($('modal-root').innerHTML) return;
            if (e.key === 'Escape') { if (openDrawer) closeDrawer(); else document.activeElement?.blur(); return; }
            if (e.target.matches('input,textarea,select') || e.ctrlKey || e.metaKey || e.altKey) return;
            if (!$('lock').classList.contains('hidden')) return;
            if (/^[1-8]$/.test(e.key)) switchTab(TABS[+e.key - 1].id);
            else if (e.key === '/') { const s = document.querySelector(`#view-${tab} [data-search]`); if (s) { e.preventDefault(); s.focus(); } }
            else if (e.key.toLowerCase() === 'l') lock();
        });

        // ================= render scheduling =================
        let pending = false;
        function renderAll() {
            if (pending) return;
            pending = true;
            requestAnimationFrame(() => {
                pending = false;
                rebuild();
                renderTabs(); renderOverview(); renderUsers(); renderChats(); renderSites(); renderUpdates(); renderAudit(); renderSystem();
                if (openDrawer) {
                    const active = document.activeElement;
                    if (!(active && $('drawer-root').contains(active) && active.matches('input,select'))) renderDrawer();
                }
            });
        }
        setInterval(() => { if (subscribed) renderAll(); }, 60000);

        // ================= subscriptions =================
        const unsubs = [];
        function subscribe() {
            if (subscribed) return;
            subscribed = true;
            const listen = (r, onData, label) => {
                const cb = s => { onData(s.val()); renderAll(); };
                onValue(r, cb, err => {
                    console.warn(label, err.message);
                    if (/permission/i.test(err.message)) toast(`No read access to ${label}. Check database rules.`, 'err');
                });
                unsubs.push(() => off(r, 'value', cb));
            };
            listen(dbRef(db, P.tnUsers), v => raw.tnUsers = v || {}, P.tnUsers);
            listen(dbRef(db, P.legacyUsers), v => raw.legacyUsers = v || {}, P.legacyUsers);
            listen(dbRef(db, P.tlUsers), v => raw.tlUsers = v || {}, P.tlUsers);
            listen(dbRef(db, P.userSites), v => raw.userSites = v || {}, P.userSites);
            listen(dbRef(db, P.chats), v => raw.chats = v || {}, P.chats);
            listen(dbRef(db, P.aiSites), v => raw.aiSites = v || {}, P.aiSites);
            listen(dbRef(db, P.updates), v => raw.updates = v || {}, P.updates);
            listen(query(dbRef(db, P.audit), limitToLast(500)), v => raw.audit = v || {}, P.audit);
            listen(dbRef(db, P.maintenance), v => sys.maintenance = !!v, P.maintenance);
            listen(dbRef(db, P.maintTime), v => sys.maintTime = v, P.maintTime);
            listen(dbRef(db, P.theme), v => sys.theme = v, P.theme);

            const connRef = dbRef(db, '.info/connected');
            const connCb = s => {
                const on = s.val() === true;
                $('conn-dot').className = `pulse-dot ${on ? '' : 'off'}`;
                $('conn-label').textContent = on ? 'LIVE · REALTIME DATABASE' : 'OFFLINE · RECONNECTING';
            };
            onValue(connRef, connCb);
            unsubs.push(() => off(connRef, 'value', connCb));
            if (tab === 'data' && !$('d-path').value) loadPath('textnexus/users');
        }
        function unsubscribe() {
            unsubs.splice(0).forEach(fn => fn());
            subscribed = false;
        }
        $('refresh-btn').addEventListener('click', () => { unsubscribe(); subscribe(); if (currentPath || tab === 'data') loadPath(currentPath); toast('Reloading data…', 'info'); });

        // ================= auth gate =================
        async function chooseAccount() {
            try {
                if (auth.currentUser) await signOut(auth);
                await signInWithPopup(auth, new GoogleAuthProvider());
            } catch (err) {
                if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') $('gate-auth-msg').textContent = err.message;
            }
        }
        $('gate-google').addEventListener('click', chooseAccount);
        $('gate-switch').addEventListener('click', chooseAccount);
        function lock() {
            sessionStorage.removeItem('nexus_admin_unlocked');
            closeDrawer();
            $('lock').classList.remove('hidden');
            setTimeout(() => $('gate-pass-input').focus(), 30);
        }
        $('lock-btn').addEventListener('click', lock);

        $('gate-pass').addEventListener('submit', e => {
            e.preventDefault();
            if ($('gate-pass-input').value.trim() !== ADMIN_PASSCODE) {
                $('gate-pass-msg').textContent = 'Incorrect passcode.';
                $('gate-pass-input').select();
                return;
            }
            $('gate-pass-msg').textContent = '';
            $('gate-pass-input').value = '';
            sessionStorage.setItem('nexus_admin_unlocked', 'true');
            $('lock').classList.add('hidden');
            audit('UNLOCK_PANEL', 'Unlocked admin panel');
        });

        onAuthStateChanged(auth, (user) => {
            me = user;
            isOwner = !!user && OWNER_EMAILS.includes(user.email);
            $('me-name').textContent = user?.displayName || user?.email || '—';
            $('me-avatar').innerHTML = user ? avatar({ name: user.displayName, email: user.email, photoURL: user.photoURL }) : '';

            if (!isOwner) {
                unsubscribe();
                sessionStorage.removeItem('nexus_admin_unlocked');
                $('lock').classList.remove('hidden');
                $('gate-pass').classList.add('hidden');
                $('gate-signin').classList.remove('hidden');
                $('gate-auth-msg').textContent = user ? `${user.email} is not an owner account.` : '';
                $('gate-google').innerHTML = user ? '<i class="ph ph-arrows-left-right"></i> Switch account' : '<i class="ph ph-google-logo"></i> Continue with Google';
                return;
            }
            $('gate-signin').classList.add('hidden');
            $('gate-pass').classList.remove('hidden');
            $('gate-identity').textContent = `✓ ${user.email}`;
            if (sessionStorage.getItem('nexus_admin_unlocked') === 'true') $('lock').classList.add('hidden');
            else setTimeout(() => $('gate-pass-input').focus(), 30);

            update(dbRef(db, `${P.legacyUsers}/${user.uid}`), { uid: user.uid, name: user.displayName || 'Owner', email: user.email, photoURL: user.photoURL || '', lastLogin: Date.now() }).catch(() => {});
            subscribe();
            renderPreview();
        });

        switchTab(tab);
        renderPreview();
    