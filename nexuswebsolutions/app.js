import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
  authDomain: "nexus-web-development-official.firebaseapp.com",
  databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com",
  projectId: "nexus-web-development-official",
  storageBucket: "nexus-web-development-official.firebasestorage.app",
  messagingSenderId: "553556577139",
  appId: "1:553556577139:web:bc86f60395c0f32d999306",
  measurementId: "G-KYSK367Y02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// UI Elements
const loginBtn = document.getElementById('login-btn');
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const adminEmailSpan = document.getElementById('admin-email');
const generateBtn = document.getElementById('generate-btn');
const statusOutput = document.getElementById('status-output');

// Admin Email Check
const ADMIN_EMAIL = "brodywilliams0226@gmail.com";

// Handle Login
loginBtn.addEventListener('click', () => {
  signInWithPopup(auth, provider).catch(error => alert(error.message));
});

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user && user.email === ADMIN_EMAIL) {
    loginSection.style.display = 'none';
    adminPanel.style.display = 'block';
    adminEmailSpan.innerText = user.email;
  } else if (user) {
    alert("Access Denied: You are not the administrator.");
    auth.signOut();
  } else {
    loginSection.style.display = 'block';
    adminPanel.style.display = 'none';
  }
});

// Handle AI Generation
generateBtn.addEventListener('click', async () => {
  const prompt = document.getElementById('site-prompt').value;
  const subdomain = document.getElementById('subdomain-name').value;

  if (!prompt || !subdomain) return alert("Please fill out both fields.");

  statusOutput.innerText = "Processing... Cloudflare AI is writing the code...";

  try {
    // Your Cloudflare Worker URL
    const workerUrl = "https://throbbing-hill-3378.brodywilliams0226.workers.dev"; 
    
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, subdomain })
    });

    const result = await response.json();
    
    if (result.error) {
      statusOutput.innerText = `Error: ${result.error}`;
    } else {
      statusOutput.innerText = `Success! AI Generated the code for ${result.subdomain}:\n\n${result.code}`;
    }
  } catch (error) {
    statusOutput.innerText = "Error connecting to backend.";
    console.error(error);
  }
});
