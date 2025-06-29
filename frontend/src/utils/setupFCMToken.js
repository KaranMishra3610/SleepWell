import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyANcgrZV79T9KMXo-NgRbA15DSU5Pm55RI",
  authDomain: "sleepwell-61da2.firebaseapp.com",
  projectId: "sleepwell-61da2",
  storageBucket: "sleepwell-61da2.appspot.com",
  messagingSenderId: "244281446027",
  appId: "1:244281446027:web:cda29c6a4c39e9406a8e8e",
  measurementId: "G-QZ1MXXLFZV"
};

// ✅ Only initialize if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const messaging = getMessaging(app);

export async function getFcmToken(userId) {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BMHdX8zHFttfMfxGDest2kivYy6PFw_70sPnAzS2BYOx7ZL9fWfHCcL1HZGBBfRi4JB9G7puDuXHzw0pqeX0MFQ"
    });

    if (token) {
      console.log("✅ FCM Token:", token);

      await fetch("https://your-backend-domain.com/store_fcm_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id: userId, fcm_token: token })
      });
    } else {
      console.warn("⚠️ No token available.");
    }
  } catch (err) {
    console.error("❌ getFcmToken error:", err);
  }
}

export function setupOnMessageListener() {
  onMessage(messaging, (payload) => {
    console.log("🔔 Foreground message:", payload);
  });
}
