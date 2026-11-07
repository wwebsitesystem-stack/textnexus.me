
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getDatabase, ref as dbRef, query, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

        // Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
            authDomain: "nexus-web-development-official.firebaseapp.com",
            projectId: "nexus-web-development-official",
            databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com" 
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);

        // UI Elements
        const container = document.getElementById('notifications-container');
        const loadingState = document.getElementById('loading-state');
        const emptyState = document.getElementById('empty-state');
        const authBanner = document.getElementById('auth-banner');
        const authBannerText = document.getElementById('auth-banner-text');
        const clearBtn = document.getElementById('clear-btn');

        let currentUser = null;

        // Watch Auth State to update the banner
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                authBanner.classList.replace('bg-[var(--brand-color)]/10', 'bg-surfaceHover');
                authBanner.classList.replace('border-[var(--brand-color)]/20', 'border-border');
                authBanner.querySelector('i').classList.replace('text-[var(--brand-color)]', 'text-textMuted');
                authBannerText.classList.replace('text-[var(--brand-color)]', 'text-textMuted');
                authBannerText.innerHTML = `Signed in as <strong>${user.email}</strong>. Receiving global and personal alerts.`;
            } else {
                authBanner.classList.replace('bg-surfaceHover', 'bg-[var(--brand-color)]/10');
                authBanner.classList.replace('border-border', 'border-[var(--brand-color)]/20');
                authBanner.querySelector('i').classList.replace('text-textMuted', 'text-[var(--brand-color)]');
                authBannerText.classList.replace('text-textMuted', 'text-[var(--brand-color)]');
                authBannerText.innerHTML = `Viewing Global notifications. Log in from the sidebar to receive personal alerts.`;
            }
        });

        // Listen for recent messages from Global Chat to act as notifications
        // We limit to the last 20 messages so it doesn't load the entire history
        const notificationsRef = query(dbRef(db, 'textnexus/chats/global/messages'), limitToLast(20));

        onValue(notificationsRef, (snapshot) => {
            // Hide loading state
            if(loadingState) loadingState.remove();
            
            const data = snapshot.val();
            
            if (!data) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');
            
            // Convert to array, map keys, and reverse so newest is at the top
            const notifications = Object.keys(data)
                .map(key => ({ id: key, ...data[key] }))
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            container.innerHTML = ''; // Clear container for fresh render

            notifications.forEach(msg => {
                // Don't show notifications for messages the user sent themselves
                if (currentUser && msg.email === currentUser.email) return;

                const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now';
                
                const notifDiv = document.createElement('div');
                notifDiv.className = 'notify-item group bg-surface border border-border rounded-xl p-4 flex items-start gap-4 hover:border-textMuted transition-colors cursor-pointer';
                
                notifDiv.innerHTML = `
                    <div class="relative shrink-0">
                        <img alt="" src="${msg.photoURL || 'https://placehold.co/100'}" class="w-10 h-10 rounded-full object-cover border border-border">
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center">
                            <div class="w-3 h-3 bg-[var(--brand-color)] rounded-full"></div>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-0.5">
                            <p class="text-sm font-medium text-textMain truncate">
                                ${msg.name} <span class="text-textMuted font-normal">sent a message in</span> Global
                            </p>
                            <span class="text-[11px] text-textMuted shrink-0 ml-4">${time}</span>
                        </div>
                        <p class="text-sm text-textMuted truncate">"${msg.text}"</p>
                    </div>
                `;

                container.appendChild(notifDiv);
            });

            // If all messages were from the current user, it might be empty
            if(container.children.length === 0) {
                emptyState.classList.remove('hidden');
            }
        });

        // "Mark all as read" functionality (Visual clear for the current session)
        clearBtn.addEventListener('click', () => {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            clearBtn.innerHTML = '<i class="ph ph-check"></i> Cleared';
            setTimeout(() => {
                clearBtn.innerHTML = '<i class="ph ph-checks"></i> Mark all as read';
            }, 2000);
        });

        // Theme sync listener
        const savedColor = localStorage.getItem('nexus-brand-color');
        if(savedColor) {
            document.documentElement.style.setProperty('--brand-color', savedColor);
        }
        
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'update-theme') {
                document.documentElement.style.setProperty('--brand-color', event.data.color);
            }
        });
    