

    (function() {
        const ACHIEVEMENTS = [
            {
                id: 'w_user',
                emoji: '👻',
                name: 'W User',
                desc: 'Come back 10 times.',
                longDesc: 'You visited GhostLink 10+ times. W.',
                secret: false,
                hint: 'Visit GhostLink enough times...'
            },
            {
                id: 'loyal_user',
                emoji: '🔒',
                name: 'Loyal User',
                desc: 'Come back 100 times.',
                longDesc: 'You have visited GhostLink over 100 times. You\'re locked in.',
                secret: false,
                hint: 'Keep coming back...'
            },
            {
                id: 'holy_fan',
                emoji: '🙏',
                name: 'Holy Fan User',
                desc: 'Come back 1000 times.',
                longDesc: '1000 visits. Valid and you\'re probably not even in the discord.',
                secret: false,
                hint: 'Legendary loyalty required.'
            },
            {
                id: 'can_read',
                emoji: '📖',
                name: 'You can READ!',
                desc: 'Open the README.',
                longDesc: 'You actually CAN read! This generation isn\'t fried probably...',
                secret: false,
                hint: 'Find and open the README...'
            },
            {
                id: 'historian',
                emoji: '🏛️',
                name: 'Historian',
                desc: 'Browse the version history.',
                longDesc: 'Good for you ig, ball knowledge fr.',
                secret: false,
                hint: 'Look through the site\'s history...'
            },
            {
                id: 'bored_in_class',
                emoji: '🥱',
                name: 'Bored in Class',
                desc: 'Open Games 10 times.',
                longDesc: 'You opened the Games section 10+ times. Nice bro, this is lwk a lazy achievement.',
                secret: false,
                hint: 'Open Games enough times...'
            },
            {
                id: 'done_with_ts',
                emoji: '🎮',
                name: 'Done With Ts',
                desc: 'Open Games 100 times.',
                longDesc: 'You are slightly cooked. Get off the games😭',
                secret: false,
                hint: 'Keep opening Games...'
            },
            {
                id: 'f_student',
                emoji: '📉',
                name: 'F Student',
                desc: 'Open Games 1000 times.',
                longDesc: '1000 times. Your GPA is cooked lil bro💀',
                secret: false,
                hint: 'You are NOT opening games this much...'
            },
            {
                id: 'hacker',
                emoji: '💻',
                name: 'Hacker',
                desc: 'Modify the splash words.',
                longDesc: 'You added a custom typewriter word to the homescreen. Ik they weren\'t normal.',
                secret: false,
                hint: 'Mess with the homescreen words in Settings...'
            },
            {
                id: 'pro_hacker',
                emoji: '🧑‍💻',
                name: 'Pro-Hacker',
                desc: 'Modify every setting.',
                longDesc: 'You touched every single setting in GhostLink. Are you ok😭😭.',
                secret: true,
                hint: ''
            },
            {
                id: 'peak_education',
                emoji: '🎭',
                name: 'Peak Education',
                desc: 'Cloak the tab.',
                longDesc: 'You used Tab Cloaker to disguise GhostLink, tuffff.',
                secret: false,
                hint: 'Hide what you\'re doing in Settings...'
            },
            {
                id: 'lawyer',
                emoji: '⚖️',
                name: 'Lawyer Ahh',
                desc: 'Read all legal documents.',
                longDesc: 'You opened the ToS, Privacy Policy, and DMCA. Wannabe lawyer and w user.',
                secret: false,
                hint: 'Read every legal document...'
            },
            {
                id: 'russian_dolls',
                emoji: '🪆',
                name: 'Russian Dolls',
                desc: 'Visit GhostLink inside GhostLink.',
                longDesc: 'You loaded GhostLink in the proxy. But you can\'t nest it more sorry, scramjet does NOT do serviceworkers.',
                secret: false,
                hint: 'Use the GhostLink in a certain tool...'
            },
            {
                id: 'fourth_dimension',
                emoji: '🌀',
                name: '4th Dimension',
                desc: 'View the site in 3D.',
                longDesc: 'Viewed the site in 3d on a 2d plane from a 3d world. That\'s 4d, trust me bro😁',
                secret: false,
                hint: 'Look for a 3D option in 4Fun...'
            },
            {
                id: 'dark_web',
                emoji: '🌌',
                name: 'Dark Web',
                desc: 'Open the Ghost Network.',
                longDesc: 'You launched the Ghost Network visualizer. Most links are blocked lol.',
                secret: false,
                hint: 'Open GhostLink network...'
            },
            {
                id: 'colorblind',
                emoji: '🎨',
                name: 'Colorblind',
                desc: 'Set every color to the same value.',
                longDesc: 'Monochrome makes my eyes feel better too, trust.',
                secret: false,
                hint: 'Monochromatic beuty...'
            },
            {
                id: 'cute',
                emoji: '🩷',
                name: 'Cute <3',
                desc: 'Set accent and background to shades of pink.',
                longDesc: 'It\'s lowkenuinely pink 😝',
                secret: false,
                hint: 'Go pink in Settings...'
            },
            {
                id: 'batman',
                emoji: '🤵',
                name: 'Bruce Wayne',
                desc: 'Set colors to shades of grey and black.',
                longDesc: '\"I only work in black. And sometimes very, very dark grey\" -Batman',
                secret: false,
                hint: 'Go full dark in Settings...'
            },
            {
                id: 'mirror',
                emoji: '🪰',
                name: 'Mirror',
                desc: 'You\'re bugging lol',
                longDesc: 'You typed "mirror" on the homescreen and flipped everything. Cool loll.',
                secret: false,
                hint: 'Try typing something on the homescreen...'
            },
            {
                id: 'rip_xrevan',
                emoji: '🪦',
                name: 'R.I.P xRevan',
                desc: 'Og\'s know the lore',
                longDesc: 'I\'m not hacked anymore trust😅😅',
                secret: true,
                hint: 'rip xrevan...'
            },
            {
                id: 'go_to_sleep',
                emoji: '😴',
                name: 'Go to SLEEP',
                desc: 'Visit between 12–5 AM.',
                longDesc: 'Damn, you were up from 12-5AM. Did you have to start the Goon Grind early😭',
                secret: false,
                hint: 'Visit at an early morning hour...'
            },
            {
                id: 'eat_lunch',
                emoji: '🥪',
                name: 'Eat Lunch Gng',
                desc: 'Visit between 11 AM–2 PM.',
                longDesc: 'Why were you on GhostLink at lunchtime screenager.',
                secret: false,
                hint: 'Visit during midday...'
            },
            {
                id: 'thats_beautiful',
                emoji: '🏆',
                name: 'That\'s Beautiful',
                desc: 'Open the Achievements tab',
                longDesc: 'You found and opened Achievements. Is ts tuff😅',
                secret: false,
                hint: 'Why does this need a hint?'
            },
            {
                id: 'touched_grass',
                emoji: '🦗',
                name: 'Touched Grass',
                desc: 'Return after 72+ hours away.',
                longDesc: 'You were gone for 3+ days and came back, alive. You did it son.',
                secret: true,
                hint: ''
            },
            {
                id: 'secret_seeker',
                emoji: '🕵️',
                name: 'Niche',
                desc: 'Find your first secret achievement.',
                longDesc: 'You found a niche secret, but there\'s a LOT more...',
                secret: false,
                hint: 'Unlock any secret achievement...'
            },
            {
                id: 'ghostlink_sweat',
                emoji: '😜',
                name: 'GhostLink Sweat',
                desc: 'Unlock every non-secret achievement.',
                longDesc: 'You unlocked every non-secret achievement. Why. Just, why??',
                secret: false,
                hint: 'Unlock everything else first...'
            },
            {
                id: 'caught_4k',
                emoji: '📸',
                name: 'Caught in 4k',
                desc: 'You couldn\'t just do it at home😭😭',
                longDesc: 'You visited a freaky ahhh site through my proxy🥹🙏',
                secret: true,
                hint: ''
            },
            {
                id: 'degenerate_gambler',
                emoji: '🎰',
                name: 'Awww dangit',
                desc: 'Access a gambling site through the proxy.',
                longDesc: 'You tried to bet money through MY proxy. Your cooked broski✌️',
                secret: true,
                hint: ''
            },
            {
                id: 'galaxy_brain',
                emoji: '🔥',
                name: 'Burning CPUs',
                desc: 'Visit a school blocker\'s site through the proxy.',
                longDesc: 'You went to a school blocker through a proxy genius.',
                secret: false,
                hint: 'Try visiting a school filter site...'
            },
            {
                id: 'wannabe_dev',
                emoji: '🔍',
                name: 'Wannabe Dev',
                desc: 'Opened dev tools.',
                longDesc: 'Blud really thought inspecting the page and modifying sum text made you a web dev.',
                secret: false,
                hint: 'Try modyfying the page...'
            },
            {
                id: 'unemployed_boss',
                emoji: '📋',
                name: 'Unemployed Final Boss',
                desc: 'Click Initialize Systems 10 times.',
                longDesc: 'Amazing use of time to repeatedly click initialize systems.',
                secret: true,
                hint: ''
            },
            {
                id: 'fell_off',
                emoji: '📉',
                name: 'You Fell Off Lil Bro',
                desc: 'Rename the site to "67".',
                longDesc: 'You set the tab title to exactly "67". Cut ts out bro😭🙏',
                secret: true,
                hint: ''
            },
            {
                id: 'pure_genius',
                emoji: '🧨',
                name: 'Pure Genius',
                desc: 'Factory reset then open achievements.',
                longDesc: 'You factory reset. Now your achievements are gone loll.',
                secret: true,
                hint: ''
            }
        ];

        const STORE_KEY = 'gl_achievements';
        function loadUnlocked() {
            try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
            catch { return {}; }
        }
        function saveUnlocked(u) {
            localStorage.setItem(STORE_KEY, JSON.stringify(u));
        }
        function isUnlocked(id) {
            return !!loadUnlocked()[id];
        }
        function unlock(id) {
            const u = loadUnlocked();
            if (u[id]) return false;
            u[id] = Date.now();
            saveUnlocked(u);
            const a = ACHIEVEMENTS.find(x => x.id === id);
            if (a && window.showAchievementToast) {
                showAchievementToast(a.emoji, a.name, a.desc);
            }
            sessionStorage.removeItem('gl_hint_ids');
            if (a && a.secret && id !== 'secret_seeker') {
                const u3 = loadUnlocked();
                const anySecretBefore = ACHIEVEMENTS.filter(x => x.secret && x.id !== id).some(x => u3[x.id]);
                if (!anySecretBefore) unlock('secret_seeker');
            }
            const nonSweat = ACHIEVEMENTS.filter(a => a.id !== 'ghostlink_sweat' && !a.secret);
            const u2 = loadUnlocked();
            if (nonSweat.every(a => u2[a.id])) unlock('ghostlink_sweat');
            renderAchievements();
            return true;
        }

        const visitKey = 'gl_visit_count';
        const lastVisitKey = 'gl_last_visit';
        const now = Date.now();
        const lastVisit = parseInt(localStorage.getItem(lastVisitKey) || '0');
        const visits = parseInt(localStorage.getItem(visitKey) || '0') + 1;
        localStorage.setItem(visitKey, visits);
        localStorage.setItem(lastVisitKey, now);

        if (visits >= 10)   unlock('w_user');
        if (visits >= 100)  unlock('loyal_user');
        if (visits >= 1000) unlock('holy_fan');

        if (lastVisit > 0 && (now - lastVisit) >= 72 * 60 * 60 * 1000) unlock('touched_grass');

        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5)   unlock('go_to_sleep');
        if (hour >= 11 && hour < 14) unlock('eat_lunch');

        let _gamesNavCount = parseInt(sessionStorage.getItem('gl_games_nav') || '0');
        let _initSysCount  = parseInt(localStorage.getItem('gl_init_sys') || '0');
        let _settingsChanged = JSON.parse(sessionStorage.getItem('gl_settings_changed') || '{}');
        const ALL_SETTINGS = ['accent','font','textPrimary','textDim','bgColor','bgUrl','bgBlur','bgBright'];
        let _legalSeen = JSON.parse(localStorage.getItem('gl_legal_seen') || '[]');

        function normaliseHex(raw) {
            const s = raw.replace(/\s/g,'');
            if (s.startsWith('#') && s.length === 4) {
                return '#' + s[1]+s[1]+s[2]+s[2]+s[3]+s[3];
            }
            return s.toLowerCase();
        }
        window.__glAch = {
            onReadme() { unlock('can_read'); },
            onVersions() { unlock('historian'); },
            onGamesNav() {
                _gamesNavCount++;
                sessionStorage.setItem('gl_games_nav', _gamesNavCount);
                if (_gamesNavCount >= 10)   unlock('bored_in_class');
                if (_gamesNavCount >= 100)  unlock('done_with_ts');
                if (_gamesNavCount >= 1000) unlock('f_student');
            },
            onHacker() { unlock('hacker'); },
            onSettingChanged(key) {
                _settingsChanged[key] = true;
                sessionStorage.setItem('gl_settings_changed', JSON.stringify(_settingsChanged));
                if (ALL_SETTINGS.every(k => _settingsChanged[k])) unlock('pro_hacker');
            },
            onCloak() {
                const title = document.getElementById('cloak-title')?.value?.trim() || '';
                if (title && title.toLowerCase() !== 'ghostlink') {
                    unlock('peak_education');
                }
                if (title === '67') unlock('fell_off');
            },
            onLegal(tab) {
                if (!_legalSeen.includes(tab)) {
                    _legalSeen.push(tab);
                    localStorage.setItem('gl_legal_seen', JSON.stringify(_legalSeen));
                }
                if (['tos','privacy','dmca'].every(t => _legalSeen.includes(t))) unlock('lawyer');
            },
            onProxyUrl(url) {
                const lower = url.toLowerCase();
                const glDomains = ['ghostlink','virtuan4-max.github.io','jsdelivr.net/gh/virtuan4-max'];
                if (glDomains.some(d => lower.includes(d))) unlock('russian_dolls');
            },
            onRussianDolls() { unlock('russian_dolls'); },
            on3D() { unlock('fourth_dimension'); },
            onGhostNetwork() { unlock('dark_web'); },
            checkColors() {
                const style = getComputedStyle(document.documentElement);
                const accent = normaliseHex(style.getPropertyValue('--accent').trim());
                const bg     = normaliseHex(style.getPropertyValue('--bg').trim());
                const tPrim  = normaliseHex(style.getPropertyValue('--text-primary').trim());
                const tDim   = normaliseHex(style.getPropertyValue('--text-dim').trim());
                if (accent === bg && bg === tPrim && tPrim === tDim) unlock('colorblind');
                const toRGB = (hex) => ({
                    r: parseInt(hex.slice(1,3), 16),
                    g: parseInt(hex.slice(3,5), 16),
                    b: parseInt(hex.slice(5,7), 16)
                });
                const isPink = (hex) => {
                    if (!hex.startsWith('#') || hex.length < 7) return false;
                    const {r,g,b} = toRGB(hex);
                    return r > 150 && b > 80 && r > g + 40 && b > g - 20;
                };
                if (isPink(accent) && isPink(bg)) unlock('cute');
                const isGrey = (hex) => {
                    if (!hex.startsWith('#') || hex.length < 7) return false;
                    const {r,g,b} = toRGB(hex);
                    return Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b)) < 30;
                };
                if (isGrey(accent) && isGrey(bg)) unlock('batman');
            },
            onMirror() { unlock('mirror'); },
            onRipXrevan() { unlock('rip_xrevan'); },
            onAchievementsNav() {
                unlock('thats_beautiful');
                if (sessionStorage.getItem('gl_ach_pure_genius_pending')) {
                    sessionStorage.removeItem('gl_ach_pure_genius_pending');
                    unlock('pure_genius');
                }
                renderAchievements();
            },
            onInitSystems() {
                _initSysCount++;
                localStorage.setItem('gl_init_sys', _initSysCount);
                if (_initSysCount >= 10) unlock('unemployed_boss');
            },
            onCaught4k() { unlock('caught_4k'); },
            onDegenerateGambler() { unlock('degenerate_gambler'); },
            onGalaxyBrain() { unlock('galaxy_brain'); },
            onWannabeDev() { unlock('wannabe_dev'); },
            onResetSettings() {
                sessionStorage.setItem('gl_ach_pure_genius_pending', '1');
            }
        };
        const HINTS_TO_SHOW = 3;
        function getHintIds(lockedPublic) {
            const available = lockedPublic.map(a => a.id);
            if (available.length === 0) return [];
            let stored = [];
            try { stored = JSON.parse(sessionStorage.getItem('gl_hint_ids') || '[]'); } catch {}
            stored = stored.filter(id => available.includes(id));
            const remaining = available.filter(id => !stored.includes(id));
            while (stored.length < HINTS_TO_SHOW && remaining.length > 0) {
                const idx = Math.floor(Math.random() * remaining.length);
                stored.push(remaining.splice(idx, 1)[0]);
            }
            sessionStorage.setItem('gl_hint_ids', JSON.stringify(stored));
            return stored;
        }

        function renderAchievements() {
            const root = document.getElementById('achievements-render');
            if (!root) return;
            const unlocked = loadUnlocked();
            const publicAchievements = ACHIEVEMENTS.filter(a => !a.secret);
            const unlockedList = publicAchievements.filter(a => unlocked[a.id]);
            const lockedPublic = publicAchievements.filter(a => !unlocked[a.id]);
            const lockedSecret = ACHIEVEMENTS.filter(a => a.secret && !unlocked[a.id]);
            const unlockedSecrets = ACHIEVEMENTS.filter(a => a.secret && unlocked[a.id]);

            let html = `
                <div style="margin-bottom:28px;">
                    <h2 style="font-size:1.6rem; margin-bottom:6px; color:var(--text-primary);">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--accent)" stroke="none" style="vertical-align:middle; margin-right:8px; margin-bottom:3px;"><path d="M7 2h10v2H7zM5 4h14v2c0 3.31-2.24 6.1-5.29 6.84L13 15h3l1 5H7l1-5h3l-.71-2.16C7.24 12.1 5 9.31 5 6V4zM6 6c0 2.21 1.49 4.08 3.54 4.65L10 12h4l.46-1.35C16.51 10.08 18 8.21 18 6H6z"/></svg>
                        Achievements
                    </h2>
                    <p style="color:var(--text-dim); font-size:0.85rem;">${unlockedList.length} / ${publicAchievements.length} unlocked</p>
                </div>`;
            const pct = Math.round((unlockedList.length / publicAchievements.length) * 100);
            html += `
                <div style="background:var(--input-bg); border-radius:99px; height:6px; margin-bottom:32px; overflow:hidden; border:1px solid var(--border);">
                    <div style="background:var(--accent); height:100%; width:${pct}%; border-radius:99px; transition:width 0.5s ease; box-shadow:0 0 8px var(--accent-glow);"></div>
                </div>`;
            const ACH_GRID = `display:grid; grid-template-columns:repeat(5, 1fr); gap:clamp(6px,0.8vw,12px); margin-bottom:32px;`;
            const ACH_CARD_BASE = `border-radius:12px; padding:clamp(8px,1vw,14px) clamp(8px,1vw,14px); display:flex; flex-direction:column; align-items:flex-start; gap:clamp(5px,0.5vw,8px);`;
            const ACH_EMOJI = `font-size:clamp(1.1rem,2vw,2rem); line-height:1; flex-shrink:0;`;
            const ACH_TITLE = `font-size:clamp(0.6rem,0.9vw,0.88rem); font-weight:bold; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`;
            const ACH_DESC  = `font-size:clamp(0.55rem,0.75vw,0.75rem); line-height:1.45; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;`;
            const ACH_DATE  = `font-size:clamp(0.5rem,0.6vw,0.65rem); opacity:0.5; margin-top:4px;`;

            if (unlockedList.length > 0) {
                html += `<h3 style="font-size:0.7rem; letter-spacing:2px; text-transform:uppercase; color:var(--accent); margin-bottom:14px;">Unlocked</h3>`;
                html += `<div style="${ACH_GRID}">`;
                unlockedList.forEach(a => {
                    const ts = unlocked[a.id];
                    const dateStr = ts ? new Date(ts).toLocaleDateString() : '';
                    html += `
                        <div style="background:var(--card-bg); border:1px solid var(--accent); ${ACH_CARD_BASE} box-shadow:0 0 10px var(--accent-glow);">
                            <span style="${ACH_EMOJI}">${a.emoji}</span>
                            <div style="min-width:0; width:100%;">
                                <div style="${ACH_TITLE} color:var(--accent);">${a.name}</div>
                                <div style="${ACH_DESC} color:var(--text-dim);">${a.longDesc}</div>
                                ${dateStr ? `<div style="${ACH_DATE} color:var(--text-dim);">${dateStr}</div>` : ''}
                            </div>
                        </div>`;
                });
                html += `</div>`;
            }
            const hintIds = getHintIds(lockedPublic);
            const hints = hintIds.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);
            if (hints.length > 0) {
                html += `<h3 style="font-size:0.7rem; letter-spacing:2px; text-transform:uppercase; color:var(--text-dim); margin-bottom:14px;">Up Next</h3>`;
                html += `<div style="${ACH_GRID}">`;
                hints.forEach(a => {
                    html += `
                        <div style="background:var(--card-bg); border:1px solid var(--border); ${ACH_CARD_BASE} opacity:0.6;">
                            <span style="${ACH_EMOJI} filter:grayscale(1) brightness(0.3);">${a.emoji}</span>
                            <div style="min-width:0; width:100%;">
                                <div style="${ACH_TITLE} color:var(--text-primary);">${a.name}</div>
                                <div style="${ACH_DESC} color:var(--text-dim);">${a.hint}</div>
                            </div>
                        </div>`;
                });
                html += `</div>`;
            }
            const remainingPublic = lockedPublic.length - hints.length;
            const secretCount = lockedSecret.length;
            if (unlockedSecrets.length > 0) {
                html += `<h3 style="font-size:0.7rem; letter-spacing:2px; text-transform:uppercase; color:var(--text-dim); margin-bottom:14px; margin-top:8px;">Secret Achievements</h3>`;
                html += `<div style="${ACH_GRID}">`;
                unlockedSecrets.forEach(a => {
                    const ts = unlocked[a.id];
                    const dateStr = ts ? new Date(ts).toLocaleDateString() : '';
                    html += `
                        <div style="background:var(--card-bg); border:1px solid var(--accent); ${ACH_CARD_BASE} box-shadow:0 0 10px var(--accent-glow);">
                            <span style="${ACH_EMOJI}">${a.emoji}</span>
                            <div style="min-width:0; width:100%;">
                                <div style="${ACH_TITLE} color:var(--accent);">${a.name}</div>
                                <div style="${ACH_DESC} color:var(--text-dim);">${a.longDesc}</div>
                                ${dateStr ? `<div style="${ACH_DATE} color:var(--text-dim);">${dateStr}</div>` : ''}
                            </div>
                        </div>`;
                });
                html += `</div>`;
            }

            root.innerHTML = html;
        }
        document.addEventListener('DOMContentLoaded', () => {
            const sec = document.getElementById('achievements-content');
            if (sec && sec.style.display !== 'none') renderAchievements();
        });

    })();
    