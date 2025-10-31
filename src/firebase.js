// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";          // ← added for authentication
import { getFirestore } from "firebase/firestore"; // ← added for Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBLofdZMyAkYctJR7e9zLeetDw2NO4aazo",
  authDomain: "student-s-freelance-hub.firebaseapp.com",
  projectId: "student-s-freelance-hub",
  storageBucket: "student-s-freelance-hub.firebasestorage.app",
  messagingSenderId: "210837430271",
  appId: "1:210837430271:web:162f68aed2aa6b63ef51ca",
  measurementId: "G-7YTEPHTMZ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
const auth = getAuth(app); // Firebase Authentication
const db = getFirestore(app); // Firestore database

// Export them for use in other files
export { auth, db };
export default app;
