
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Firebase Configuration provided by user
        const firebaseConfig = {
            apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
            authDomain: "nexus-web-development-official.firebaseapp.com",
            projectId: "nexus-web-development-official",
            storageBucket: "nexus-web-development-official.firebasestorage.app",
            messagingSenderId: "553556577139",
            appId: "1:553556577139:web:ea4469b06c2c01cc999306",
            measurementId: "G-S6K1M5PZLE"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // UI Elements
        const form = document.getElementById('suggestion-form');
        const submitBtn = document.getElementById('submit-btn');
        const statusMsg = document.getElementById('status-message');
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');

        // Note: Using Firestore as per strict environment guidelines for data persistence
        // Fallback appId if not injected by environment
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'nexus-web-development'; 

        function showStatus(message, isSuccess = true) {
            statusMsg.classList.remove('hidden', 'bg-green-900/20', 'border-green-800', 'text-green-400', 'bg-red-900/20', 'border-red-800', 'text-red-400');
            statusIcon.className = 'ph-fill text-lg ' + (isSuccess ? 'ph-check-circle' : 'ph-warning-circle');
            
            if (isSuccess) {
                statusMsg.classList.add('bg-green-900/20', 'border-green-800', 'text-green-400');
            } else {
                statusMsg.classList.add('bg-red-900/20', 'border-red-800', 'text-red-400');
            }
            
            statusText.textContent = message;
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                statusMsg.classList.add('hidden');
            }, 5000);
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const suggestionText = document.getElementById('suggestion').value.trim();
            if (!suggestionText) return;

            // UI Loading state
            submitBtn.disabled = true;
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = `<i class="ph ph-spinner animate-spin"></i> <span>Submitting...</span>`;
            statusMsg.classList.add('hidden');

            try {
                // Mandatory Authentication Check before DB writes
                if (!auth.currentUser) {
                    await signInAnonymously(auth);
                }

                // Mandatory Strict Path for Public Data in Firestore
                const suggestionsRef = collection(db, 'artifacts', appId, 'public', 'data', 'suggestions');
                
                await addDoc(suggestionsRef, {
                    text: suggestionText,
                    userId: auth.currentUser.uid,
                    timestamp: serverTimestamp()
                });

                showStatus("Failed to submit suggestion. Please try again later.");
                form.reset();

            } catch (error) {
                console.error("Error adding document: ", error);
                showStatus("Failed to submit suggestion. Please try again later.", false);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        });
    