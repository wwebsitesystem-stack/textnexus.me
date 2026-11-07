
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getDatabase, ref as dbRef, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

        // Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
            authDomain: "nexus-web-development-official.firebaseapp.com",
            projectId: "nexus-web-development-official",
            databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com" 
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        const container = document.getElementById('posts-list');
        const loadingState = document.getElementById('loading-state');
        const emptyState = document.getElementById('empty-state');

        // Helper: Format Timestamp
        function formatTime(timestamp) {
            if (!timestamp) return 'Just now';
            const date = new Date(timestamp);
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }

        // Listen for Updates
        onValue(dbRef(db, 'workspace_updates'), (snapshot) => {
            loadingState.classList.add('hidden');
            container.innerHTML = '';
            
            const data = snapshot.val();

            if (!data) {
                emptyState.classList.remove('hidden');
                emptyState.classList.add('flex');
                return;
            }

            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');

            // Convert to array and sort newest first
            const posts = Object.keys(data)
                .map(key => ({ id: key, ...data[key] }))
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            posts.forEach((post, index) => {
                const article = document.createElement('article');
                article.className = 'update-card bg-surface border border-border rounded-xl p-6 shadow-xl relative overflow-hidden';
                article.style.animationDelay = `${index * 0.05}s`; // Staggered fade in
                
                // Add brand color accent bar
                const accentBar = document.createElement('div');
                accentBar.className = 'absolute top-0 left-0 w-full h-1 bg-[var(--brand-color)] opacity-80';
                article.appendChild(accentBar);

                article.innerHTML += `
                    <div class="flex items-start justify-between gap-4 mb-4">
                        <h3 class="text-base font-bold text-textMain leading-tight">${post.title}</h3>
                        <span class="shrink-0 text-[10px] font-mono text-textMuted bg-surfaceHover px-2 py-1 rounded border border-border flex items-center gap-1.5">
                            <i class="ph ph-clock"></i> ${formatTime(post.timestamp)}
                        </span>
                    </div>
                    
                    <div class="text-sm text-textMuted leading-relaxed whitespace-pre-wrap mb-6 border-l-2 border-border pl-4">
                        ${post.content}
                    </div>
                    
                    <div class="flex items-center gap-2 border-t border-border pt-4">
                        <div class="w-6 h-6 rounded-full bg-surfaceHover border border-border flex items-center justify-center text-textMuted">
                            <i class="ph ph-user text-xs"></i>
                        </div>
                        <p class="text-xs text-textMuted font-medium">
                            Posted by <span class="text-textMain">${post.authorName || 'Nexus Admin'}</span>
                        </p>
                        ${post.authorEmail === 'brodywilliams0226@gmail.com' ? 
                            `<span class="ml-2 text-[9px] bg-[var(--brand-color)]/10 text-[var(--brand-color)] border border-[var(--brand-color)]/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">System Owner</span>` 
                            : ''
                        }
                    </div>
                `;
                container.appendChild(article);
            });
        });

        // Theme Sync
        const savedColor = localStorage.getItem('nexus-brand-color');
        if (savedColor) document.documentElement.style.setProperty('--brand-color', savedColor);
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'update-theme') {
                document.documentElement.style.setProperty('--brand-color', event.data.color);
            }
        });
    