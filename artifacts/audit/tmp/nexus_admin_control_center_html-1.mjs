
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getDatabase, ref as dbRef, onValue, update, remove, push, serverTimestamp, set } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

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
        let modalCallback = null;

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
        const globalMaintenanceBtn = document.getElementById('global-maintenance-btn');
        const maintBtnText = document.getElementById('maint-btn-text');
        const maintenanceBadge = document.getElementById('maintenance-badge');
        const userSearchInput = document.getElementById('user-search-input');
        const purgeAllSitesBtn = document.getElementById('purge-all-sites-btn');
        const clearAuditBtn = document.getElementById('clear-audit-btn');
        
        // Custom Toast Helper
        function showToast(msg, type = 'success') {
            const toast = document.getElementById('toast');
            const toastMsg = document.getElementById('toast-msg');
            const toastIcon = document.getElementById('toast-icon');
            
            toastMsg.textContent = msg;
            toastIcon.innerHTML = type === 'success' ? '<i class="ph ph-check-circle text-emerald-400"></i>' : '<i class="ph ph-warning-circle text-red-400"></i>';
            
            toast.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }

        // Custom Modal Helper
        function openModal(title, desc, onConfirm) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-desc').textContent = desc;
            modalCallback = onConfirm;
            document.getElementById('custom-modal').classList.remove('hidden');
            document.getElementById('custom-modal').classList.add('flex');
        }

        document.getElementById('modal-cancel-btn').addEventListener('click', () => {
            document.getElementById('custom-modal').classList.add('hidden');
            document.getElementById('custom-modal').classList.remove('flex');
            modalCallback = null;
        });

        document.getElementById('modal-confirm-btn').addEventListener('click', () => {
            if (modalCallback) modalCallback();
            document.getElementById('custom-modal').classList.add('hidden');
            document.getElementById('custom-modal').classList.remove('flex');
            modalCallback = null;
        });

        // Audit Logger
        async function logAudit(action, details) {
            if (!currentUser) return;
            try {
                await push(dbRef(db, 'nexus/audit_logs'), {
                    timestamp: Date.now(),
                    adminEmail: currentUser.email || 'Unknown',
                    action,
                    details
                });
            } catch (e) {
                console.error("Audit log error:", e);
            }
        }

        adminLoginBtn.addEventListener('click', async () => {
            try {
                if (auth.currentUser) await signOut(auth);
                await signInWithPopup(auth, new GoogleAuthProvider());
            } catch (err) {
                console.error("Authentication failed", err);
                authErrorMsg.textContent = "Google Sign-In failed or was cancelled.";
                authErrorMsg.classList.remove('hidden');
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
                    authErrorMsg.textContent = `Access Denied: ${user.email} is not authorized.`;
                    authErrorMsg.classList.remove('hidden');
                    adminLoginBtn.innerHTML = `<i class="ph ph-arrows-left-right text-sm"></i> Switch Account`;
                } else {
                    authErrorMsg.classList.add('hidden');
                    adminLoginBtn.innerHTML = `<i class="ph ph-google-logo text-sm"></i> Authenticate Google Account`;
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
                    lastLogin: Date.now(),
                    role: isOwner ? 'Owner' : (user.role || 'User')
                });
            }

            listenToSystem();
            listenToUsers();
            listenToAiSites();
            listenToChats();
            listenToAuditLogs();
            listenToUpdates();
        });

        ownerSaveCreditsBtn.addEventListener('click', async () => {
            if (!currentUser || !isOwner) return;
            const newCredits = parseInt(ownerCreditInput.value);
            if (isNaN(newCredits)) return showToast("Please enter a valid number.", "error");
            await update(dbRef(db, `nexus/users/${currentUser.uid}`), { credits: newCredits });
            await logAudit("Update Owner Credits", `Set personal credits to ${newCredits}`);
            showToast("Your credits have been updated!");
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
            logAudit("Admin Login Unlocked", "Successfully entered admin passcode.");
            showToast("Welcome to Nexus Admin Control Center");
        });

        reLockBtn.addEventListener('click', () => {
            sessionStorage.removeItem('nexus_admin_unlocked');
            lockScreen.classList.remove('hidden');
            logAudit("Admin Locked", "Manual panel lock triggered.");
        });

        // Global Power Controls
        globalAirdropBtn.addEventListener('click', () => {
            if (!isOwner) return;
            openModal("Global Credit Airdrop", "Are you sure you want to award +1,000 credits to ALL registered users?", async () => {
                const snapshot = await new Promise(resolve => {
                    onValue(dbRef(db, 'nexus/users'), resolve, { onlyOnce: true });
                });
                const users = snapshot.val();
                if (!users) return showToast("No users found.", "error");

                const updates = {};
                Object.keys(users).forEach(uid => {
                    const currentCredits = users[uid].credits ?? 10000;
                    updates[`nexus/users/${uid}/credits`] = currentCredits + 1000;
                });
                await update(dbRef(db), updates);
                await logAudit("Global Airdrop", "Awarded +1,000 credits to all users.");
                showToast("Successfully airdropped +1,000 credits to all users!");
            });
        });

        globalMaintenanceBtn.addEventListener('click', async () => {
            if (!isOwner) return;
            const currentMaint = globalMaintenanceBtn.dataset.active === 'true';
            const newState = !currentMaint;
            await update(dbRef(db, 'nexus/system'), { maintenanceMode: newState });
            await logAudit("Maintenance Mode", `Toggled maintenance mode to ${newState}`);
            showToast(`Maintenance mode is now ${newState ? 'ENABLED' : 'DISABLED'}`);
        });

        function listenToSystem() {
            onValue(dbRef(db, 'nexus/system'), (snapshot) => {
                const data = snapshot.val() || {};
                const isMaint = !!data.maintenanceMode;
                globalMaintenanceBtn.dataset.active = isMaint;
                if (isMaint) {
                    maintenanceBadge.classList.remove('hidden');
                    maintBtnText.textContent = "Disable Maintenance";
                    globalMaintenanceBtn.classList.add('text-amber-400');
                } else {
                    maintenanceBadge.classList.add('hidden');
                    maintBtnText.textContent = "Enable Maintenance";
                    globalMaintenanceBtn.classList.remove('text-amber-400');
                }
            });
        }

        window.switchAdminTab = (tabName, btn) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
            btn.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.remove('hidden');
        };

        // Users & Credits Tab
        function listenToUsers() {
            onValue(dbRef(db, 'nexus/users'), (snapshot) => {
                const data = snapshot.val();
                cachedUsers = data || {};
                renderUsers();
            });
        }

        userSearchInput.addEventListener('input', renderUsers);

        function renderUsers() {
            const data = cachedUsers;
            const tbody = document.getElementById('user-table-body');
            tbody.innerHTML = '';

            if (!data || Object.keys(data).length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-textMuted">No users found.</td></tr>`;
                document.getElementById('stat-total-users').textContent = '0';
                document.getElementById('stat-banned').textContent = '0';
                return;
            }

            const query = userSearchInput.value.toLowerCase();
            const users = Object.keys(data).map(k => ({ uid: k, ...data[k] }))
                .filter(u => (u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query)));

            document.getElementById('stat-total-users').textContent = Object.keys(data).length;
            document.getElementById('stat-banned').textContent = Object.values(data).filter(u => u.isBanned).length;

            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-textMuted">No matching users found.</td></tr>`;
                return;
            }

            users.forEach(u => {
                const isTargetOwner = (u.email === OWNER_EMAIL);
                const disableControls = !isOwner;
                const userCredits = u.credits ?? 10000;

                const row = document.createElement('tr');
                row.className = 'hover:bg-surfaceHover/50 transition-colors';
                row.innerHTML = `
                    <td class="py-4 px-6 flex items-center gap-3">
                        <img alt="" src="${u.photoURL || 'https://placehold.co/100'}" class="w-9 h-9 rounded-full object-cover border border-border" onerror="this.src='https://placehold.co/100'">
                        <div class="flex flex-col">
                            <span class="font-medium text-textMain text-sm">${u.name}</span>
                            <span class="text-xs font-mono text-textMuted">${u.email}</span>
                        </div>
                    </td>
                    <td class="py-4 px-6 font-mono text-xs">
                        <div class="flex items-center gap-2">
                            <input type="number" id="credits-${u.uid}" value="${userCredits}" class="w-24 bg-background border border-border rounded px-2 py-1 text-amber-400 font-bold outline-none focus:border-textMuted" ${disableControls ? 'disabled' : ''}>
                            <button onclick="window.saveUserCredits('${u.uid}')" ${disableControls ? 'disabled' : ''} class="px-2.5 py-1 rounded bg-surfaceHover border border-border text-textMain hover:bg-border disabled:opacity-30">Set</button>
                            <button onclick="window.resetCredits('${u.uid}')" ${disableControls ? 'disabled' : ''} class="px-2.5 py-1 rounded bg-surfaceHover border border-border text-textMuted hover:text-textMain disabled:opacity-30">Reset</button>
                        </div>
                    </td>
                    <td class="py-4 px-6">
                        <select onchange="window.changeRole('${u.uid}', this.value)" ${disableControls ? 'disabled' : ''} class="bg-background border border-border text-textMain text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-textMuted disabled:opacity-50">
                            <option value="User" ${u.role === 'User' ? 'selected' : ''}>User</option>
                            <option value="Admin" ${u.role === 'Admin' ? 'selected' : ''}>Admin</option>
                            <option value="Owner" ${u.role === 'Owner' ? 'selected' : ''}>Owner</option>
                        </select>
                    </td>
                    <td class="py-4 px-6">
                        ${u.isBanned 
                            ? '<span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">Banned</span>' 
                            : '<span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>'
                        }
                    </td>
                    <td class="py-4 px-6 text-right">
                        <button onclick="window.toggleBan('${u.uid}', ${!!u.isBanned})" ${disableControls ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg text-xs font-medium border ${u.isBanned ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'} disabled:opacity-30 transition-colors">
                            ${u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        window.saveUserCredits = async (uid) => {
            if (!isOwner) return;
            const val = parseInt(document.getElementById(`credits-${uid}`).value);
            if (isNaN(val)) return showToast("Invalid amount.", "error");
            await update(dbRef(db, `nexus/users/${uid}`), { credits: val });
            await logAudit("Update User Credits", `Set credits for UID ${uid} to ${val}`);
            showToast("Credits successfully updated.");
        };

        window.resetCredits = async (uid) => {
            if (!isOwner) return;
            await update(dbRef(db, `nexus/users/${uid}`), { credits: 10000 });
            await logAudit("Reset User Credits", `Reset credits for UID ${uid} to default (10,000)`);
            showToast("Credits reset to default (10,000).");
        };

        window.changeRole = async (uid, role) => {
            if (!isOwner) return;
            await update(dbRef(db, `nexus/users/${uid}`), { role });
            await logAudit("Change User Role", `Changed role for UID ${uid} to ${role}`);
            showToast(`Role updated to ${role}.`);
        };

        window.toggleBan = async (uid, currentStatus) => {
            if (!isOwner) return;
            const newStatus = !currentStatus;
            openModal(newStatus ? "Ban User Account" : "Unban User Account", `Are you sure you want to ${newStatus ? 'ban' : 'unban'} this user?`, async () => {
                await update(dbRef(db, `nexus/users/${uid}`), { isBanned: newStatus });
                await logAudit("Toggle User Ban", `User UID ${uid} ban status set to ${newStatus}`);
                showToast(`User successfully ${newStatus ? 'banned' : 'unbanned'}.`);
            });
        };

        // AI Sites Tab
        function listenToAiSites() {
            onValue(dbRef(db, 'nexus/ai_sites'), (snapshot) => {
                const data = snapshot.val();
                const tbody = document.getElementById('site-table-body');
                tbody.innerHTML = '';

                if (!data) {
                    tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-textMuted">No AI sites generated yet.</td></tr>`;
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
                        <td class="py-4 px-6 font-mono text-xs text-amber-400">${s.subdomain}.textnexus.me</td>
                        <td class="py-4 px-6 text-xs text-textMuted max-w-xs truncate">${s.prompt}</td>
                        <td class="py-4 px-6 text-xs text-textMuted">${new Date(s.createdAt).toLocaleDateString()}</td>
                        <td class="py-4 px-6 text-right">
                            <button aria-label="Delete AI site" onclick="window.deleteAiSite('${s.id}')" ${!isOwner ? 'disabled' : ''} class="p-1.5 rounded bg-surfaceHover text-textMuted hover:text-red-400 disabled:opacity-30 transition-colors">
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
            openModal("Delete AI Site", "Are you sure you want to delete this AI site record?", async () => {
                await remove(dbRef(db, `nexus/ai_sites/${id}`));
                await logAudit("Delete AI Site", `Deleted AI site record ID ${id}`);
                showToast("AI site deleted.");
            });
        };

        purgeAllSitesBtn.addEventListener('click', () => {
            if (!isOwner) return;
            openModal("Purge All AI Sites", "WARNING: This will delete ALL generated AI sites across the platform. Continue?", async () => {
                await remove(dbRef(db, 'nexus/ai_sites'));
                await logAudit("Purge AI Sites", "Purged all AI sites from the database.");
                showToast("All AI sites purged successfully.");
            });
        });

        // Chats Tab
        function listenToChats() {
            onValue(dbRef(db, 'nexus/chats'), (snapshot) => {
                const data = snapshot.val();
                const tbody = document.getElementById('chat-table-body');
                tbody.innerHTML = '';
                if (!data) {
                    tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-textMuted">No channels created.</td></tr>`;
                    document.getElementById('stat-chats').textContent = '0';
                    return;
                }

                const chats = Object.keys(data).map(k => ({ id: k, ...data[k] }));
                document.getElementById('stat-chats').textContent = chats.length;

                chats.forEach(c => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-surfaceHover/50 transition-colors';
                    row.innerHTML = `
                        <td class="py-4 px-6 font-medium text-textMain text-sm">${c.name || 'Untitled'}</td>
                        <td class="py-4 px-6 font-mono text-xs text-amber-400">${c.inviteCode || 'N/A'}</td>
                        <td class="py-4 px-6 text-xs text-textMuted">${c.creatorEmail || 'Unknown'}</td>
                        <td class="py-4 px-6">
                            ${c.isDisabled 
                                ? '<span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Disabled</span>' 
                                : '<span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>'
                            }
                        </td>
                        <td class="py-4 px-6 text-right flex items-center justify-end gap-2">
                            <button onclick="window.toggleChatState('${c.id}', ${!!c.isDisabled})" ${!isOwner ? 'disabled' : ''} class="px-2.5 py-1 rounded bg-surfaceHover border border-border text-xs text-textMuted hover:text-textMain disabled:opacity-30 transition-colors">
                                ${c.isDisabled ? 'Enable' : 'Disable'}
                            </button>
                            <button aria-label="Delete chat" onclick="window.deleteChat('${c.id}')" ${!isOwner ? 'disabled' : ''} class="p-1.5 rounded bg-surfaceHover text-textMuted hover:text-red-400 disabled:opacity-30 transition-colors">
                                <i class="ph ph-trash text-sm"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            });
        }

        window.toggleChatState = async (chatId, currentDisabled) => {
            if (!isOwner) return;
            const newState = !currentDisabled;
            await update(dbRef(db, `nexus/chats/${chatId}`), { isDisabled: newState });
            await logAudit("Toggle Chat State", `Chat channel ${chatId} disabled status set to ${newState}`);
            showToast(`Channel successfully ${newState ? 'disabled' : 'enabled'}.`);
        };

        window.deleteChat = async (chatId) => {
            if (!isOwner) return;
            openModal("Delete Channel", "Are you sure you want to delete this chat channel?", async () => {
                await remove(dbRef(db, `nexus/chats/${chatId}`));
                await logAudit("Delete Channel", `Deleted chat channel ID ${chatId}`);
                showToast("Chat channel deleted.");
            });
        };

        // Audit Trail Tab
        function listenToAuditLogs() {
            onValue(dbRef(db, 'nexus/audit_logs'), (snapshot) => {
                const data = snapshot.val();
                const tbody = document.getElementById('audit-table-body');
                tbody.innerHTML = '';
                if (!data) {
                    tbody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-textMuted">No security audit logs recorded.</td></tr>`;
                    return;
                }

                const logs = Object.keys(data).map(k => ({ id: k, ...data[k] })).sort((a, b) => b.timestamp - a.timestamp);

                logs.forEach(l => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-surfaceHover/50 transition-colors text-xs font-mono';
                    row.innerHTML = `
                        <td class="py-3 px-6 text-textMuted">${new Date(l.timestamp).toLocaleString()}</td>
                        <td class="py-3 px-6 text-textMain">${l.adminEmail}</td>
                        <td class="py-3 px-6 text-amber-400 font-semibold">${l.action}</td>
                        <td class="py-3 px-6 text-textMuted">${l.details}</td>
                    `;
                    tbody.appendChild(row);
                });
            });
        }

        clearAuditBtn.addEventListener('click', () => {
            if (!isOwner) return;
            openModal("Clear Audit Logs", "Are you sure you want to clear all security audit logs?", async () => {
                await remove(dbRef(db, 'nexus/audit_logs'));
                showToast("Audit logs cleared.");
            });
        });

        // Updates & Broadcast Tab
        const adminUpdateTitle = document.getElementById('admin-update-title');
        const adminUpdateContent = document.getElementById('admin-update-content');
        const adminPublishBtn = document.getElementById('admin-publish-btn');
        const adminUpdatesList = document.getElementById('admin-updates-list');

        adminPublishBtn.addEventListener('click', async () => {
            if (!currentUser || !isOwner) return;
            const title = adminUpdateTitle.value.trim();
            const content = adminUpdateContent.value.trim();
            if (!title || !content) return showToast("Please fill in both title and content.", "error");

            await push(dbRef(db, 'nexus/updates'), {
                title,
                content,
                author: currentUser.displayName || 'Owner',
                timestamp: serverTimestamp()
            });

            adminUpdateTitle.value = '';
            adminUpdateContent.value = '';
            await logAudit("Publish Update", `Published workspace announcement: ${title}`);
            showToast("Announcement published successfully!");
        });

        function listenToUpdates() {
            onValue(dbRef(db, 'nexus/updates'), (snapshot) => {
                const data = snapshot.val();
                adminUpdatesList.innerHTML = '';
                if (!data) {
                    adminUpdatesList.innerHTML = `<p class="text-xs text-textMuted text-center py-6">No workspace announcements posted.</p>`;
                    return;
                }

                const updates = Object.keys(data).map(k => ({ id: k, ...data[k] })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                updates.forEach(u => {
                    const item = document.createElement('div');
                    item.className = 'bg-background border border-border p-4 rounded-xl flex items-start justify-between gap-4';
                    item.innerHTML = `
                        <div class="flex flex-col gap-1">
                            <h4 class="text-sm font-semibold text-textMain">${u.title}</h4>
                            <p class="text-xs text-textMuted leading-relaxed">${u.content}</p>
                            <span class="text-[10px] text-textMuted font-mono mt-1">Posted by ${u.author || 'Owner'}</span>
                        </div>
                        <button aria-label="Delete update" onclick="window.deleteUpdate('${u.id}')" ${!isOwner ? 'disabled' : ''} class="p-1.5 rounded bg-surfaceHover text-textMuted hover:text-red-400 disabled:opacity-30 transition-colors shrink-0">
                            <i class="ph ph-trash text-sm"></i>
                        </button>
                    `;
                    adminUpdatesList.appendChild(item);
                });
            });
        }

        window.deleteUpdate = async (id) => {
            if (!isOwner) return;
            await remove(dbRef(db, `nexus/updates/${id}`));
            await logAudit("Delete Announcement", `Deleted announcement ID ${id}`);
            showToast("Announcement deleted.");
        };
    