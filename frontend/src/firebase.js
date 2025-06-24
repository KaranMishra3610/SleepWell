// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// ✅ Replace with environment variables for security if deploying
const firebaseConfig = {
  apiKey: "AIzaSyANcgrZV79T9KMXo-NgRbA15DSU5Pm55RI",
  authDomain: "sleepwell-61da2.firebaseapp.com",
  projectId: "sleepwell-61da2",
  storageBucket: "sleepwell-61da2.firebasestorage.app",
  messagingSenderId: "244281446027",
  appId: "1:244281446027:web:cda29c6a4c39e9406a8e8e",
  measurementId: "G-QZ1MXXLFZV"
};

// ✅ Initialize app
const app = initializeApp(firebaseConfig);

// ✅ Auth instance
const auth = getAuth(app);

// ✅ Messaging instance for push notifications
const messaging = getMessaging(app);

// ✅ Export all
export { auth, messaging, getToken, onMessage };
