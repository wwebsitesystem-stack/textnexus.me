
        // GOOGLE-ONLY ACCOUNT (FIREBASE AUTH)
        (() => {
            const card = document.getElementById('accountCard');
            const signInBtn = document.getElementById('accountSignin');
            const signOutBtn = document.getElementById('accountSignout');
            const userBox = document.getElementById('accountUser');
            const avatar = document.getElementById('accountAvatar');
            const initials = document.getElementById('accountInitials');
            const nameEl = document.getElementById('accountName');
            const emailEl = document.getElementById('accountEmail');
            const statusEl = document.getElementById('accountStatus');
            if (!card || !signInBtn || !signOutBtn || !userBox || !nameEl || !emailEl || !statusEl) return;

            const firebaseConfig = {
                apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
                authDomain: "nexus-web-development-official.firebaseapp.com",
                projectId: "nexus-web-development-official",
                databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com"
            };

            let auth = null;
            let googleProvider = null;
            let signInWithGoogle = null;
            let getGoogleRedirectResult = null;
            let signOutUser = null;

            function setStatus(message, kind = '') {
                statusEl.textContent = message || '';
                statusEl.dataset.kind = kind;
            }

            function initialFor(value) {
                const first = Array.from((value || 'N').trim())[0] || 'N';
                return first.toUpperCase();
            }

            function showSignedOut() {
                card.dataset.state = 'signed-out';
                signInBtn.hidden = false;
                signInBtn.setAttribute('aria-label', 'Sign in with Google');
                userBox.hidden = true;
                avatar.hidden = true;
                avatar.removeAttribute('src');
                initials.hidden = false;
            }

            function showSignedIn(user) {
                const name = user.displayName || (user.email ? user.email.split('@')[0] : 'Nexus member');
                card.dataset.state = 'signed-in';
                signInBtn.hidden = true;
                userBox.hidden = false;
                nameEl.textContent = name;
                emailEl.textContent = user.email || 'Signed in with Google';
                initials.textContent = initialFor(name);
                initials.hidden = false;
                avatar.hidden = true;
                if (user.photoURL) {
                    avatar.onload = () => { avatar.hidden = false; initials.hidden = true; };
                    avatar.onerror = () => { avatar.hidden = true; initials.hidden = false; };
                    avatar.src = user.photoURL;
                }
            }

            function friendlyAuthError(error) {
                const code = error?.code || '';
                if (code.includes('popup-closed') || code.includes('cancelled-popup-request')) return 'Google sign-in was closed.';
                if (code.includes('popup-blocked')) return 'Allow pop-ups, then try Google sign-in again.';
                if (code.includes('redirect-cancelled')) return 'Google sign-in was cancelled.';
                if (code.includes('web-storage-unsupported')) return 'Your browser is blocking the storage needed for sign-in. Allow cookies and try again.';
                if (code.includes('unauthorized-domain')) return 'This domain is not authorized for Google sign-in in Firebase.';
                if (code.includes('operation-not-allowed')) return 'Google sign-in is not enabled in Firebase.';
                if (code.includes('network-request-failed')) return 'Network error. Try Google sign-in again.';
                return error?.message || 'Google sign-in failed. Try again.';
            }

            const authReady = (async () => {
                const [{ initializeApp, getApps }, authModule] = await Promise.all([
                    import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js'),
                    import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js')
                ]);
                const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
                auth = authModule.getAuth(app);
                googleProvider = new authModule.GoogleAuthProvider();
                googleProvider.setCustomParameters({ prompt: 'select_account' });
                signInWithGoogle = authModule.signInWithRedirect;
                getGoogleRedirectResult = authModule.getRedirectResult;
                signOutUser = authModule.signOut;
                authModule.onAuthStateChanged(auth, (user) => {
                    if (user) showSignedIn(user);
                    else showSignedOut();
                });
                getGoogleRedirectResult(auth).catch((error) => {
                    console.error('Google redirect sign-in failed:', error);
                    setStatus(friendlyAuthError(error), 'error');
                });
            })().catch((error) => {
                console.error('Google account could not initialise:', error);
                setStatus('Google sign-in could not load. Refresh and try again.', 'error');
            });

            signInBtn.addEventListener('click', async () => {
                setStatus('');
                signInBtn.disabled = true;
                try {
                    if (!auth) await authReady;
                    if (!auth) throw new Error('Google sign-in could not load. Refresh and try again.');
                    setStatus('Redirecting to Google...');
                    await signInWithGoogle(auth, googleProvider);
                } catch (error) {
                    setStatus(friendlyAuthError(error), 'error');
                } finally {
                    signInBtn.disabled = false;
                }
            });

            signOutBtn.addEventListener('click', async () => {
                if (!auth || !signOutUser) return;
                signOutBtn.disabled = true;
                setStatus('Signing out...');
                try {
                    await signOutUser(auth);
                    setStatus('Signed out.');
                } catch (error) {
                    setStatus(error?.message || 'Could not sign out. Try again.', 'error');
                } finally {
                    signOutBtn.disabled = false;
                }
            });
        })();
    