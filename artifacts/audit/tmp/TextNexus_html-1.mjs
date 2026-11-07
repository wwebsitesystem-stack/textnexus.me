
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getDatabase, ref as dbRef, push, set, onValue, serverTimestamp, off, update, remove, get } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
        import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
            authDomain: "nexus-web-development-official.firebaseapp.com",
            projectId: "nexus-web-development-official",
            databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com",
            storageBucket: "nexus-web-development-official.appspot.com"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);
        const storage = getStorage(app);

        let currentUser = null;
        let activeChatId = 'global';
        let currentChatData = null;
        let currentMessagesListener = null;
        let pendingFile = null;

        const messagesContainer = document.getElementById('messages-container');
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const loginWarning = document.getElementById('login-warning');
        const chatTitle = document.getElementById('current-chat-title');
        const inviteCodeDisplay = document.getElementById('invite-code-display');
        const codeValue = document.getElementById('code-value');
        const chatSettingsBtn = document.getElementById('chat-settings-btn');
        const chatList = document.getElementById('chat-list');
        const disabledNotice = document.getElementById('disabled-notice');
        const inputWrapper = document.getElementById('input-wrapper');
        const fileInput = document.getElementById('file-input');
        const attachBtn = document.getElementById('attach-btn');
        const filePreviewArea = document.getElementById('file-preview-area');
        const previewImg = document.getElementById('preview-img');
        const previewFileInfo = document.getElementById('preview-file-info');
        const previewFileName = document.getElementById('preview-file-name');

        // Modal Helpers
        window.openModal = (id) => document.getElementById(id).classList.remove('opacity-0', 'pointer-events-none');
        window.closeModal = (id) => document.getElementById(id).classList.add('opacity-0', 'pointer-events-none');

        // File Attachment Handling
        attachBtn.addEventListener('click', () => {
            if (!currentUser) return alert('Please log in first.');
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            pendingFile = file;

            filePreviewArea.classList.remove('hidden');
            previewImg.classList.add('hidden');
            previewFileInfo.classList.add('hidden');

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    previewImg.src = ev.target.result;
                    previewImg.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                previewFileName.textContent = file.name;
                previewFileInfo.classList.remove('hidden');
            }
        });

        window.clearAttachment = () => {
            pendingFile = null;
            fileInput.value = '';
            filePreviewArea.classList.add('hidden');
            previewImg.src = '';
            previewImg.classList.add('hidden');
            previewFileInfo.classList.add('hidden');
        };

        // Check Auth Status
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                messageInput.disabled = false;
                sendBtn.disabled = false;
                loginWarning.classList.add('hidden');
                messageInput.placeholder = `Message as ${user.displayName}...`;
            } else {
                messageInput.disabled = true;
                sendBtn.disabled = true;
                loginWarning.classList.remove('hidden');
                messageInput.placeholder = "Log in from sidebar to chat";
                clearAttachment();
            }
            listenToUserChats();
        });

        // Listen for joined/created group chats
        function listenToUserChats() {
            const chatsRef = dbRef(db, 'textnexus/chats');
            onValue(chatsRef, (snapshot) => {
                const data = snapshot.val();
                
                // Clear extra chats (preserve Global)
                const globalBtn = document.getElementById('btn-global');
                chatList.innerHTML = '';
                chatList.appendChild(globalBtn);

                if (!data) return;

                Object.keys(data).forEach(chatId => {
                    if (chatId === 'global') return;
                    const chat = data[chatId];
                    
                    // Show if user is owner or member
                    const isOwner = currentUser && (chat.createdBy === currentUser.uid || currentUser.email === 'brodywilliams0226@gmail.com');
                    const isMember = currentUser && chat.members && chat.members[currentUser.uid];

                    if (isOwner || isMember) {
                        const btn = document.createElement('button');
                        btn.onclick = () => loadChat(chatId, chat.name);
                        btn.className = `w-full text-left p-3 rounded-xl border border-transparent flex items-center gap-3 transition-colors ${activeChatId === chatId ? 'chat-active' : 'hover:bg-surfaceHover'}`;
                        btn.innerHTML = `
                            <div class="w-8 h-8 rounded-full bg-border flex items-center justify-center shrink-0 text-textMuted">
                                <i class="ph ph-users text-sm"></i>
                            </div>
                            <div class="flex-1 overflow-hidden">
                                <p class="text-sm font-medium text-textMain truncate">${chat.name}</p>
                                <p class="text-[11px] text-textMuted truncate">Code: ${chat.code}</p>
                            </div>
                        `;
                        chatList.appendChild(btn);
                    }
                });
            });
        }

        // Load Active Chat
        window.loadChat = (chatId, title) => {
            activeChatId = chatId;
            chatTitle.textContent = title;
            messagesContainer.innerHTML = '<div class="text-center text-xs text-textMuted my-4"><i class="ph ph-spinner animate-spin text-lg"></i> Loading messages...</div>';
            
            if (currentMessagesListener) off(currentMessagesListener);

            const chatRef = dbRef(db, `textnexus/chats/${chatId}`);
            onValue(chatRef, (snapshot) => {
                currentChatData = snapshot.val();

                // Handle global or missing
                if (chatId === 'global') {
                    inviteCodeDisplay.classList.add('hidden');
                    chatSettingsBtn.classList.add('hidden');
                    inputWrapper.classList.remove('hidden');
                    disabledNotice.classList.add('hidden');
                } else if (currentChatData) {
                    inviteCodeDisplay.classList.remove('hidden');
                    codeValue.textContent = currentChatData.code;

                    // Owner permissions check
                    const isOwner = currentUser && (currentChatData.createdBy === currentUser.uid || currentUser.email === 'brodywilliams0226@gmail.com');
                    if (isOwner) chatSettingsBtn.classList.remove('hidden');
                    else chatSettingsBtn.classList.add('hidden');

                    // Disabled status check
                    if (currentChatData.disabled) {
                        inputWrapper.classList.add('hidden');
                        disabledNotice.classList.remove('hidden');
                    } else {
                        inputWrapper.classList.remove('hidden');
                        disabledNotice.classList.add('hidden');
                    }

                    // Update toggle button text in modal
                    document.getElementById('toggle-disable-btn').textContent = currentChatData.disabled ? 'Enable Chat' : 'Disable Chat';
                }

                // Render Messages
                const msgs = currentChatData && currentChatData.messages ? currentChatData.messages : {};
                messagesContainer.innerHTML = '';

                const sortedMsgs = Object.keys(msgs).map(k => ({ id: k, ...msgs[k] })).sort((a,b) => (a.timestamp||0) - (b.timestamp||0));

                if (sortedMsgs.length === 0) {
                    messagesContainer.innerHTML = '<div class="text-center text-xs text-textMuted my-4">No messages yet. Say hi!</div>';
                } else {
                    sortedMsgs.forEach(msg => {
                        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now';
                        let badgeHtml = '';
                        if (msg.email === 'brodywilliams0226@gmail.com') {
                            badgeHtml = `<span class="ml-2 text-[9px] uppercase tracking-wider bg-textMain/10 text-textMain border border-textMain/20 px-1.5 py-0.5 rounded-md font-bold">Owner</span>`;
                        }

                        const isMe = currentUser && msg.email === currentUser.email;

                        const msgDiv = document.createElement('div');
                        msgDiv.className = `flex items-start gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`;
                        
                        let attachmentHtml = '';
                        if (msg.fileUrl) {
                            if (msg.fileType && msg.fileType.startsWith('image/')) {
                                attachmentHtml = `
                                    <a href="${msg.fileUrl}" target="_blank" rel="noopener noreferrer" class="block mt-2">
                                        <img src="${msg.fileUrl}" alt="Uploaded image" class="max-w-full max-h-64 rounded-lg border border-border object-contain cursor-pointer hover:opacity-90 transition-opacity">
                                    </a>
                                `;
                            } else {
                                const iconClass = getFileIcon(msg.fileName);
                                attachmentHtml = `
                                    <a href="${msg.fileUrl}" target="_blank" rel="noopener noreferrer" download="${msg.fileName}" class="mt-2 flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3 hover:bg-surfaceHover transition-colors group/file">
                                        <i class="${iconClass} text-2xl text-textMuted group-hover/file:text-textMain transition-colors"></i>
                                        <div class="flex flex-col overflow-hidden">
                                            <span class="text-xs font-medium text-textMain truncate max-w-[200px]">${msg.fileName || 'Download File'}</span>
                                            <span class="text-[10px] text-textMuted">Click to download</span>
                                        </div>
                                        <i class="ph ph-download-simple text-textMuted ml-auto group-hover/file:text-textMain transition-colors"></i>
                                    </a>
                                `;
                            }
                        }

                        const bubbleBg = isMe ? 'bg-textMain text-background' : 'bg-background border border-border text-textMain';
                        const bubbleRadius = isMe ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm';

                        msgDiv.innerHTML = `
                            <img alt="" src="${msg.photoURL || 'https://placehold.co/100'}" class="w-8 h-8 rounded-full object-cover shrink-0 border border-border">
                            <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-xs font-medium text-textMain">${msg.name}</span>
                                    ${!isMe ? badgeHtml : ''}
                                    <span class="text-[10px] text-textMuted">${time}</span>
                                </div>
                                ${msg.text ? `<div class="${bubbleBg} px-4 py-2 ${bubbleRadius} text-sm leading-relaxed">${escapeHtml(msg.text)}</div>` : ''}
                                ${attachmentHtml}
                            </div>
                        `;
                        messagesContainer.appendChild(msgDiv);
                    });
                }
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
        };

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function getFileIcon(fileName) {
            if (!fileName) return 'ph ph-file';
            const ext = fileName.split('.').pop().toLowerCase();
            const icons = {
                pdf: 'ph ph-file-pdf text-red-400',
                doc: 'ph ph-file-doc text-blue-400',
                docx: 'ph ph-file-doc text-blue-400',
                xls: 'ph ph-file-xls text-green-400',
                xlsx: 'ph ph-file-xls text-green-400',
                ppt: 'ph ph-file-ppt text-orange-400',
                pptx: 'ph ph-file-ppt text-orange-400',
                zip: 'ph ph-file-zip text-yellow-400',
                rar: 'ph ph-file-zip text-yellow-400',
                mp3: 'ph ph-file-audio text-purple-400',
                wav: 'ph ph-file-audio text-purple-400',
                mp4: 'ph ph-file-video text-pink-400',
                mov: 'ph ph-file-video text-pink-400',
                txt: 'ph ph-file-text text-textMuted',
                json: 'ph ph-file-code text-yellow-300',
                js: 'ph ph-file-js text-yellow-300',
                html: 'ph ph-file-html text-orange-400',
                css: 'ph ph-file-css text-blue-400',
            };
            return icons[ext] || 'ph ph-file text-textMuted';
        }

        // Send Message
        const sendMessage = async () => {
            const text = messageInput.value.trim();
            if ((!text && !pendingFile) || !currentUser) return;
            if (currentChatData && currentChatData.disabled) return;

            const originalPlaceholder = messageInput.placeholder;
            messageInput.disabled = true;
            sendBtn.disabled = true;
            attachBtn.classList.add('opacity-50', 'pointer-events-none');

            let fileUrl = null;
            let fileName = null;
            let fileType = null;

            try {
                if (pendingFile) {
                    messageInput.placeholder = 'Uploading file...';
                    const safeName = `${Date.now()}_${pendingFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                    const path = `textnexus/uploads/${activeChatId}/${currentUser.uid}/${safeName}`;
                    const fileRef = storageRef(storage, path);
                    
                    await uploadBytes(fileRef, pendingFile);
                    fileUrl = await getDownloadURL(fileRef);
                    fileName = pendingFile.name;
                    fileType = pendingFile.type;
                }

                const msgData = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    name: currentUser.displayName?.split(' ')[0] || 'User',
                    photoURL: currentUser.photoURL,
                    timestamp: serverTimestamp()
                };

                if (text) msgData.text = text;
                if (fileUrl) {
                    msgData.fileUrl = fileUrl;
                    msgData.fileName = fileName;
                    msgData.fileType = fileType;
                }

                const msgRef = dbRef(db, `textnexus/chats/${activeChatId}/messages`);
                await push(msgRef, msgData);

                messageInput.value = '';
                clearAttachment();
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Failed to send message or upload file. Please try again.');
            } finally {
                messageInput.disabled = false;
                sendBtn.disabled = false;
                attachBtn.classList.remove('opacity-50', 'pointer-events-none');
                messageInput.placeholder = originalPlaceholder;
                messageInput.focus();
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

        // Create Group Chat Handler
        document.getElementById('confirm-create-btn').addEventListener('click', async () => {
            const name = document.getElementById('new-group-name').value.trim();
            if (!name || !currentUser) return;

            const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const newChatRef = push(dbRef(db, 'textnexus/chats'));

            await set(newChatRef, {
                name: name,
                code: inviteCode,
                createdBy: currentUser.uid,
                createdEmail: currentUser.email,
                disabled: false,
                members: {
                    [currentUser.uid]: true
                }
            });

            document.getElementById('new-group-name').value = '';
            closeModal('create-modal');
            loadChat(newChatRef.key, name);
        });

        // Join Group Chat Handler
        document.getElementById('confirm-join-btn').addEventListener('click', async () => {
            const codeInput = document.getElementById('join-code-input').value.trim().toUpperCase();
            if (!codeInput || !currentUser) return;

            const chatsRef = dbRef(db, 'textnexus/chats');
            const snapshot = await get(chatsRef);
            const chats = snapshot.val();

            let foundChatId = null;
            let foundChatName = '';

            if (chats) {
                Object.keys(chats).forEach(id => {
                    if (chats[id].code === codeInput) {
                        foundChatId = id;
                        foundChatName = chats[id].name;
                    }
                });
            }

            if (foundChatId) {
                await update(dbRef(db, `textnexus/chats/${foundChatId}/members`), {
                    [currentUser.uid]: true
                });
                document.getElementById('join-code-input').value = '';
                closeModal('join-modal');
                loadChat(foundChatId, foundChatName);
            } else {
                alert('Invalid invite code. Please try again.');
            }
        });

        // Toggle Disable Chat
        document.getElementById('toggle-disable-btn').addEventListener('click', async () => {
            if (!activeChatId || activeChatId === 'global') return;
            const newStatus = !currentChatData.disabled;
            await update(dbRef(db, `textnexus/chats/${activeChatId}`), { disabled: newStatus });
            closeModal('settings-chat-modal');
        });

        // Delete Chat
        document.getElementById('delete-chat-btn').addEventListener('click', async () => {
            if (!activeChatId || activeChatId === 'global') return;
            if (confirm('Are you sure you want to delete this chat? This cannot be undone.')) {
                await remove(dbRef(db, `textnexus/chats/${activeChatId}`));
                closeModal('settings-chat-modal');
                loadChat('global', 'Global Chat');
            }
        });

        // Initialize Global Chat
        loadChat('global', 'Global Chat');
    