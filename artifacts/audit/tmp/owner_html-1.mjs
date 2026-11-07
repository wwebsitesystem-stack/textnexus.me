
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getDatabase, ref as dbRef, onValue, update, remove, push, serverTimestamp, get, set } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
            authDomain: "nexus-web-development-official.firebaseapp.com",
            projectId: "nexus-web-development-official",
            databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com" 
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);

        const ADMIN_PASSCODE = "022614"; 
        const OWNER_EMAIL = "brodywilliams0226@gmail.com";

        let currentUser = null;
        let isOwner = false;
        let cachedUsers = {};

        const lockScreen = document.getElementById('password-lock-screen');
        const loginSection = document.getElementById('admin-login-section');
        const lockForm = document.getElementById('lock-form');
        const passInput = document.getElementById('admin-password-input');
        const errorMsg = document.getElementById('lock-error-msg');
        const authErrorMsg = document.getElementById('auth-error-msg');
        const adminLoginBtn = document.getElementById('admin-login-btn');
        const reLockBtn = document.getElementById('re-lock-btn');
        const ownerCreditInput = document.getElementById('owner-credit-input');
        const ownerSaveCreditsBtn = document.getElementById('owner-save-credits-btn');
        const globalAirdropBtn = document.getElementById('global-airdrop-btn');
        const userSearchInput = document.getElementById('user-search-input');
        const maintenanceToggleBtn = document.getElementById('maintenance-toggle-btn');
        const maintenanceThumb = document.getElementById('maintenance-thumb');

        async function logAudit(action, details) {
            if (!currentUser) return;
            await push(dbRef(db, 'nexus/audit_logs'), {
                timestamp: serverTimestamp(),
                adminEmail: currentUser.email,
                action,
                details
            });
        }

        adminLoginBtn.addEventListener('click', async () => {
            try {
                if (auth.currentUser) await signOut(auth);
                await signInWithPopup(auth, new GoogleAuthProvider());
            } catch (err) {
                console.error("Authentication failed", err);
            }
        });

        onAuthStateChanged(auth, async (user) => {
            currentUser = user;
            isOwner = (user?.email === OWNER_EMAIL);

            if (!isOwner) {
                sessionStorage.removeItem('nexus_admin_unlocked');
                lockScreen.classList.remove('hidden');
                lockForm.classList.add('hidden');
                loginSection.classList.remove('hidden');

                if (user) {
                    authErrorMsg.textContent = `Access Denied: ${user.email} is not authorized for executive privileges.`;
                    authErrorMsg.classList.remove('hidden');
                    adminLoginBtn.innerHTML = `<i class="ph ph-arrows-left-right text-sm"></i> Switch Account`;
                } else {
                    authErrorMsg.classList.add('hidden');
                    adminLoginBtn.innerHTML = `<i class="ph ph-google-logo text-sm"></i> Authenticate with Google`;
                }
            } else {
                loginSection.classList.add('hidden');
                lockForm.classList.remove('hidden');

                if (sessionStorage.getItem('nexus_admin_unlocked') === 'true') {
                    lockScreen.classList.add('hidden');
                }

                onValue(dbRef(db, `nexus/users/${user.uid}/credits`), (snapshot) => {
                    const val = snapshot.val();
                    if (val !== null) ownerCreditInput.value = val;
                }, { onlyOnce: true });
            }

            if (user) {
                const userRef = dbRef(db, `nexus/users/${user.uid}`);
                await update(userRef, {
                    uid: user.uid,
                    name: user.displayName || 'Anonymous',
                    email: user.email,
                    photoURL: user.photoURL || 'https://placehold.co/100',
                    lastLogin: Date.now()
                });
            }

            listenToUsers();
            listenToAiSites();
            listenToChats();
            listenToAuditLogs();
            listenToUpdates();
            listenToMaintenanceMode();
        });

        ownerSaveCreditsBtn.addEventListener('click', async () => {
            if (!currentUser || !isOwner) return;
            const newCredits = parseInt(ownerCreditInput.value);
            if (isNaN(newCredits)) return alert("Please enter a valid number.");
            await update(dbRef(db, `nexus/users/${currentUser.uid}`), { credits: newCredits });
            await logAudit("UPDATE_OWNER_CREDITS", `Set own credits to ${newCredits}`);
            alert("Your credits have been updated!");
        });

        globalAirdropBtn.addEventListener('click', async () => {
            if (!isOwner) return;
            if (!confirm("Are you sure you want to add +1,000 credits to ALL registered users?")) return;
            
            const snapshot = await get(dbRef(db, 'nexus/users'));
            if (!snapshot.exists()) return alert("No users found.");
            
            const updates = {};
            snapshot.forEach((child) => {
                const userData = child.val();
                const currentCredits = userData.credits ?? 10000;
                updates[`nexus/users/${child.key}/credits`] = currentCredits + 1000;
            });

            await update(dbRef(db), updates);
            await logAudit("GLOBAL_AIRDROP", "Airdropped +1,000 credits to all platform users");
            alert("Successfully airdropped +1,000 credits to all users!");
        });

        // Maintenance Mode Toggle & Gatekeeper Logic
        let isMaintenanceActive = false;
        function listenToMaintenanceMode() {
            onValue(dbRef(db, 'nexus/system/maintenance'), async (snapshot) => {
                isMaintenanceActive = !!snapshot.val();
                if (isMaintenanceActive) {
                    maintenanceToggleBtn.classList.remove('bg-border');
                    maintenanceToggleBtn.classList.add('bg-blue-600');
                    maintenanceThumb.classList.add('translate-x-4');

                    if (currentUser) {
                        if (!isOwner) {
                            const userSnap = await get(dbRef(db, `nexus/users/${currentUser.uid}/role`));
                            const role = userSnap.val();
                            if (role !== 'Admin' && role !== 'Owner') {
                                window.location.href = 'nexus_maintenance.html';
                            }
                        }
                    } else {
                        window.location.href = 'nexus_maintenance.html';
                    }
                } else {
                    maintenanceToggleBtn.classList.add('bg-border');
                    maintenanceToggleBtn.classList.remove('bg-blue-600');
                    maintenanceThumb.classList.remove('translate-x-4');
                }
            });
        }

        maintenanceToggleBtn.addEventListener('click', async () => {
            if (!isOwner) return;
            const nextState = !isMaintenanceActive;
            await set(dbRef(db, 'nexus/system/maintenance'), nextState);
            await logAudit("TOGGLE_MAINTENANCE", `Set system maintenance mode to ${nextState}`);
        });

        lockForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (passInput.value.trim() !== ADMIN_PASSCODE) {
                errorMsg.textContent = "Incorrect passcode.";
                errorMsg.classList.remove('hidden');
                return;
            }
            sessionStorage.setItem('nexus_admin_unlocked', 'true');
            lockScreen.classList.add('hidden');
            errorMsg.classList.add('hidden');
            passInput.value = '';
            logAudit("UNLOCK_PANEL", "Unlocked Administrative Control Panel");
        });

        reLockBtn.addEventListener('click', () => {
            sessionStorage.removeItem('nexus_admin_unlocked');
            lockScreen.classList.remove('hidden');
        });

        window.switchAdminTab = (tabName, btn) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
            btn.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.remove('hidden');
        };

        function renderUsersTable() {
            const tbody = document.getElementById('user-table-body');
            tbody.innerHTML = '';

            const usersArr = Object.keys(cachedUsers).map(k => ({ uid: k, ...cachedUsers[k] }));
            const filterText = userSearchInput.value.toLowerCase();
            const filtered = usersArr.filter(u => (u.name?.toLowerCase().includes(filterText) || u.email?.toLowerCase().includes(filterText)));

            document.getElementById('stat-total-users').textContent = usersArr.length;
            document.getElementById('stat-banned').textContent = usersArr.filter(u => u.isBanned).length;

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-12 text-center text-textMuted">No users found matching parameters.</td></tr>`;
                return;
            }

            filtered.forEach(u => {
                const disableControls = !isOwner;
                const userCredits = u.credits ?? 10000;

                const row = document.createElement('tr');
                row.className = 'hover:bg-surfaceHover/50 transition-colors';
                row.innerHTML = `
                    <td class="py-4 px-6 flex items-center gap-3">
                        <img alt="" src="${u.photoURL || 'https://placehold.co/100'}" class="w-10 h-10 rounded-2xl object-cover border border-border shadow-sm">
                        <div class="flex flex-col">
                            <span class="font-semibold text-textMain text-sm">${u.name}</span>
                            <span class="text-[11px] font-mono text-textMuted">${u.email}</span>
                        </div>
                    </td>
                    <td class="py-4 px-6 font-mono text-xs">
                        <div class="flex items-center gap-2">
                            <input type="number" id="credits-${u.uid}" value="${userCredits}" class="w-24 bg-background border border-border rounded-xl px-3 py-1.5 text-amber-400 font-bold outline-none focus:border-blue-500 shadow-inner" ${disableControls ? 'disabled' : ''}>
                            <button onclick="window.saveUserCredits('${u.uid}')" ${disableControls ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl bg-surfaceHover border border-border text-textMain hover:bg-border disabled:opacity-30">Set</button>
                            <button onclick="window.resetCredits('${u.uid}')" ${disableControls ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl bg-surfaceHover border border-border text-textMuted hover:text-textMain disabled:opacity-30">Reset</button>
                        </div>
                    </td>
                    <td class="py-4 px-6">
                        <select onchange="window.changeRole('${u.uid}', this.value)" ${disableControls ? 'disabled' : ''} class="bg-background border border-border text-textMain text-xs rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 disabled:opacity-50">
                            <option value="User" ${u.role === 'User' ? 'selected' : ''}>User</option>
                            <option value="Admin" ${u.role === 'Admin' ? 'selected' : ''}>Admin</option>
                            <option value="Owner" ${u.role === 'Owner' ? 'selected' : ''}>Owner</option>
                        </select>
                    </td>
                    <td class="py-4 px-6">
                        ${u.isBanned 
                            ? '<span class="px-3 py-1 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/25">Banned</span>' 
                            : '<span class="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">Active</span>'
                        }
                    </td>
                    <td class="py-4 px-6 text-right">
                        <button onclick="window.toggleBan('${u.uid}', ${!!u.isBanned})" ${disableControls ? 'disabled' : ''} class="px-3.5 py-1.5 rounded-xl text-xs font-semibold border ${u.isBanned ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-red-500/10 border-red-500/25 text-red-400'} disabled:opacity-30 shadow-sm">
                            ${u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function listenToUsers() {
            onValue(dbRef(db, 'nexus/users'), (snapshot) => {
                cachedUsers = snapshot.val() || {};
                renderUsersTable();
            });
        }

        userSearchInput.addEventListener('input', renderUsersTable);

        window.saveUserCredits = async (uid) => {
            if (!isOwner) return;
            const val = parseInt(document.getElementById(`credits-${uid}`).value);
            if (isNaN(val)) return alert("Invalid amount.");
            await update(dbRef(db, `nexus/users/${uid}`), { credits: val });
            await logAudit("UPDATE_USER_CREDITS", `Updated credits for user ${uid} to ${val}`);
            alert("Credits successfully updated.");
        };

        window.resetCredits = async (uid) => {
            if (!isOwner) return;
            await update(dbRef(db, `nexus/users/${uid}`), { credits: 10000 });
            await logAudit("RESET_USER_CREDITS", `Reset credits for user ${uid} to default (10,000)`);
            alert("Credits reset to default (10,000).");
        };

        window.changeRole = async (uid, role) => {
            if (!isOwner) return;
            await update(dbRef(db, `nexus/users/${uid}`), { role });
            await logAudit("CHANGE_USER_ROLE", `Changed role for user ${uid} to ${role}`);
        };

        window.toggleBan = async (uid, currentStatus) => {
            if (!isOwner) return;
            const nextStatus = !currentStatus;
            await update(dbRef(db, `nexus/users/${uid}`), { isBanned: nextStatus });
            await logAudit("TOGGLE_BAN", `Set banned status for user ${uid} to ${nextStatus}`);
        };

        function listenToAiSites() {
            onValue(dbRef(db, 'nexus/ai_sites'), (snapshot) => {
                const data = snapshot.val();
                const tbody = document.getElementById('site-table-body');
                tbody.innerHTML = '';
                if (!data) {
                    tbody.innerHTML = `<tr><td colspan="5" class="py-12 text-center text-textMuted">No AI subdomains deployed yet.</td></tr>`;
                    document.getElementById('stat-total-sites').textContent = '0';
                    return;
                }
                const sites = Object.keys(data).map(k => ({ id: k, ...data[k] }));
                document.getElementById('stat-total-sites').textContent = sites.length;
                sites.forEach(s => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-surfaceHover/50 transition-colors';
                    row.innerHTML = `
                        <td class="py-4 px-6 font-mono text-xs text-textMain">${s.userEmail || 'Anonymous'}</td>
                        <td class="py-4 px-6 font-mono text-xs text-blue-400 font-bold">${s.subdomain}.textnexus.me</td>
                        <td class="py-4 px-6 text-xs text-textMuted max-w-xs truncate">${s.prompt}</td>
                        <td class="py-4 px-6 text-xs text-textMuted">${new Date(s.createdAt).toLocaleDateString()}</td>
                        <td class="py-4 px-6 text-right">
                            <button aria-label="Delete AI site" onclick="window.deleteAiSite('${s.id}')" ${!isOwner ? 'disabled' : ''} class="p-2 rounded-xl bg-surfaceHover text-textMuted hover:text-red-400 disabled:opacity-30 shadow-sm">
                                <i class="ph ph-trash text-sm"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            });
        }

        window.deleteAiSite = async (id) => {
            if (!isOwner) return;
            if (confirm("Purge this deployment record?")) {
                await remove(dbRef(db, `nexus/ai_sites/${id}`));
                await logAudit("DELETE_AI_SITE", `Purged deployment ID: ${id}`);
            }
        };

        function listenToChats() {
            onValue(dbRef(db, 'nexus/chats'), (snapshot) => {
                const data = snapshot.val();
                const tbody = document.getElementById('chat-table-body');
                tbody.innerHTML = '';
                if (!data) {
                    tbody.innerHTML = `<tr><td colspan="5" class="py-12 text-center text-textMuted">No active chat channels found.</td></tr>`;
                    document.getElementById('stat-chats').textContent = '0';
                    return;
                }
                const chats = Object.keys(data).map(k => ({ id: k, ...data[k] }));
                document.getElementById('stat-chats').textContent = chats.length;
                chats.forEach(c => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-surfaceHover/50 transition-colors';
                    row.innerHTML = `
                        <td class="py-4 px-6 font-medium text-textMain text-sm">${c.name || 'Unnamed Chat'}</td>
                        <td class="py-4 px-6 font-mono text-xs text-purple-400">${c.inviteCode || 'N/A'}</td>
                        <td class="py-4 px-6 font-mono text-xs text-textMuted">${c.creatorEmail || 'Unknown'}</td>
                        <td class="py-4 px-6">
                            ${c.isDisabled ? '<span class="px-3 py-1 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/25">Disabled</span>' : '<span class="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">Active</span>'}
                        </td>
                        <td class="py-4 px-6 text-right flex items-center justify-end gap-2">
                            <button onclick="window.toggleChat('${c.id}', ${!!c.isDisabled})" ${!isOwner ? 'disabled' : ''} class="px-3.5 py-1.5 rounded-xl bg-surfaceHover text-xs text-textMain hover:bg-border disabled:opacity-30 shadow-sm">
                                ${c.isDisabled ? 'Enable' : 'Disable'}
                            </button>
                            <button aria-label="Delete chat" onclick="window.deleteChat('${c.id}')" ${!isOwner ? 'disabled' : ''} class="p-2 rounded-xl bg-surfaceHover text-textMuted hover:text-red-400 disabled:opacity-30 shadow-sm">
                                <i class="ph ph-trash text-sm"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            });
        }

        window.toggleChat = async (id, currentStatus) => {
            if (!isOwner) return;
            const nextStatus = !currentStatus;
            await update(dbRef(db, `nexus/chats/${id}`), { isDisabled: nextStatus });
            await logAudit("TOGGLE_CHAT", `Set chat channel ${id} disabled state to ${nextStatus}`);
        };

        window.deleteChat = async (id) => {
            if (!isOwner) return;
            if (confirm("Delete this chat channel?")) {
                await remove(dbRef(db, `nexus/chats/${id}`));
                await logAudit("DELETE_CHAT", `Deleted chat channel ${id}`);
            }
        };

        function listenToAuditLogs() {
            onValue(dbRef(db, 'nexus/audit_logs'), (snapshot) => {
                const data = snapshot.val();
                const tbody = document.getElementById('audit-table-body');
                tbody.innerHTML = '';
                if (!data) {
                    tbody.innerHTML = `<tr><td colspan="4" class="py-12 text-center text-textMuted">No security audit logs recorded yet.</td></tr>`;
                    return;
                }
                const logs = Object.keys(data).map(k => ({ id: k, ...data[k] })).sort((a,b) => b.timestamp - a.timestamp);
                logs.forEach(l => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-surfaceHover/50 transition-colors';
                    row.innerHTML = `
                        <td class="py-3.5 px-6 font-mono text-[11px] text-textMuted">${new Date(l.timestamp).toLocaleString()}</td>
                        <td class="py-3.5 px-6 font-mono text-xs text-textMain">${l.adminEmail}</td>
                        <td class="py-3.5 px-6"><span class="px-2.5 py-1 rounded-xl text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">${l.action}</span></td>
                        <td class="py-3.5 px-6 text-xs text-textMuted">${l.details}</td>
                    `;
                    tbody.appendChild(row);
                });
            });
        }

        document.getElementById('admin-publish-btn').addEventListener('click', async () => {
            if (!isOwner) return;
            const title = document.getElementById('admin-update-title').value.trim();
            const content = document.getElementById('admin-update-content').value.trim();
            if (!title || !content) return alert("Please fill in both title and content.");

            await push(dbRef(db, 'nexus/updates'), {
                title, content, createdAt: serverTimestamp(), author: currentUser.displayName || 'Owner'
            });
            document.getElementById('admin-update-title').value = '';
            document.getElementById('admin-update-content').value = '';
            await logAudit("PUBLISH_UPDATE", `Published announcement: "${title}"`);
            alert("Announcement broadcasted successfully!");
        });

        function listenToUpdates() {
            onValue(dbRef(db, 'nexus/updates'), (snapshot) => {
                const data = snapshot.val();
                const container = document.getElementById('admin-updates-list');
                container.innerHTML = '';
                if (!data) {
                    container.innerHTML = `<p class="text-xs text-textMuted text-center py-4">No platform updates broadcasted yet.</p>`;
                    return;
                }
                const updates = Object.keys(data).map(k => ({ id: k, ...data[k] })).sort((a,b) => b.createdAt - a.createdAt);
                updates.forEach(u => {
                    const card = document.createElement('div');
                    card.className = 'bg-background border border-border p-4.5 rounded-2xl flex items-start justify-between gap-4 shadow-sm';
                    card.innerHTML = `
                        <div class="flex flex-col gap-1">
                            <h4 class="text-xs font-semibold text-textMain">${u.title}</h4>
                            <p class="text-xs text-textMuted">${u.content}</p>
                            <span class="text-[10px] text-textMuted font-mono mt-1">${new Date(u.createdAt).toLocaleString()} by ${u.author}</span>
                        </div>
                        <button aria-label="Delete update" onclick="window.deleteUpdate('${u.id}')" ${!isOwner ? 'disabled' : ''} class="p-2 rounded-xl bg-surfaceHover text-textMuted hover:text-red-400 disabled:opacity-30 shrink-0 shadow-sm">
                            <i class="ph ph-trash text-sm"></i>
                        </button>
                    `;
                    container.appendChild(card);
                });
            });
        }

        window.deleteUpdate = async (id) => {
            if (!isOwner) return;
            if (confirm("Delete this broadcast update?")) {
                await remove(dbRef(db, `nexus/updates/${id}`));
                await logAudit("DELETE_UPDATE", `Deleted broadcast announcement ID: ${id}`);
            }
        };
    