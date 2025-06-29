// src/utils/logQuestProgress.js
import { getAuth } from "firebase/auth";

export const logQuestProgress = async (questName) => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      console.warn("User not logged in. Cannot log quest progress.");
      return;
    }

    const token = await user.getIdToken();

    const res = await fetch("http://127.0.0.1:5000/api/quest_progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Firebase Auth token
      },
      body: JSON.stringify({ quest: questName }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Server responded with ${res.status}: ${msg}`);
    }

    console.log("✅ Quest progress logged successfully");
  } catch (error) {
    console.error("❌ Failed to log quest progress:", error);
  }
};
