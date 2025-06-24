import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { auth, messaging } from '../firebase';
import { getToken } from 'firebase/messaging';
import reminderSound from '../assets/reminder.mp3';

const SleepReminder = ({ user }) => {
  const [preferredTime, setPreferredTime] = useState('');
  const [userInteracted, setUserInteracted] = useState(false);
  const [suggestedTime, setSuggestedTime] = useState('');
  const [showModal, setShowModal] = useState(false);
  const audioRef = useRef(null);
  const lastAlertRef = useRef(null);
  const VAPID_KEY = import.meta.env.VITE_VAPID_KEY;

  // 🔄 Fetch reminder + smart suggestion
  useEffect(() => {
    if (!user) return;

    const fetchReminder = async () => {
      const idToken = await auth.currentUser.getIdToken();
      const res = await axios.get('http://127.0.0.1:5000/get_reminder', {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.data?.preferred_sleep_time) {
        setPreferredTime(res.data.preferred_sleep_time);
      }
    };

    const fetchSuggestion = async () => {
      const idToken = await auth.currentUser.getIdToken();
      try {
        const res = await axios.get('http://127.0.0.1:5000/get_smart_reminder', {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (res.data?.suggested_time) {
          setSuggestedTime(res.data.suggested_time);
        }
      } catch (err) {
        console.warn("ℹ️ Smart suggestion not available.");
      }
    };

    fetchReminder();
    fetchSuggestion();
  }, [user]);

  // ✅ FCM token registration with explicit service worker
  useEffect(() => {
    if (!user || !VAPID_KEY) return;

    const registerFCMToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn("🔒 Notification permission denied.");
          return;
        }

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (!token) {
          console.warn("❌ No FCM token received.");
          return;
        }

        const idToken = await auth.currentUser.getIdToken();
        await axios.post('http://127.0.0.1:5000/store_fcm_token', {
          token
        }, {
          headers: { Authorization: `Bearer ${idToken}` }
        });

        console.log("✅ FCM token sent to backend.");
      } catch (err) {
        console.error("❌ Error getting/sending FCM token:", err.message);
      }
    };

    registerFCMToken();
  }, [user, VAPID_KEY]);

  // 🧠 Detect user click to enable sound
  useEffect(() => {
    const markInteracted = () => setUserInteracted(true);
    window.addEventListener('click', markInteracted, { once: true });
    return () => window.removeEventListener('click', markInteracted);
  }, []);

  // ⏰ Trigger local + push reminder
  useEffect(() => {
    if (!preferredTime || !userInteracted) return;

    const interval = setInterval(async () => {
      const now = new Date();
      const [h, m] = preferredTime.split(':').map(Number);
      const isTimeMatch = now.getHours() === h && now.getMinutes() === m;
      const lastAlert = lastAlertRef.current;

      if (isTimeMatch && (!lastAlert || now - lastAlert > 60000)) {
        // 🔊 Sound
        audioRef.current?.play().catch(err => {
          console.warn("🔇 Audio blocked:", err.message);
        });

        // 🌙 Modal
        setShowModal(true);

        // 📬 Push
        try {
          const idToken = await auth.currentUser.getIdToken();
          await axios.post("http://127.0.0.1:5000/trigger_fcm", {}, {
            headers: { Authorization: `Bearer ${idToken}` }
          });
          console.log("✅ FCM push triggered.");
        } catch (err) {
          console.error("❌ Push trigger failed:", err.message);
        }

        lastAlertRef.current = new Date();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [preferredTime, userInteracted]);

  // 💾 Save preferred time
  const saveReminder = async () => {
    const idToken = await auth.currentUser.getIdToken();
    await axios.post('http://127.0.0.1:5000/set_reminder', {
      preferred_sleep_time: preferredTime
    }, {
      headers: { Authorization: `Bearer ${idToken}` }
    });
    alert('Reminder time updated!');
  };

  return (
    <div className="card">
      <h3>Sleep Reminder:</h3>
      <label>
        Set Reminder Time:
        <input
          type="time"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
        />
        <button onClick={saveReminder} style={{ marginLeft: 10 }}>
          Save Reminder
        </button>
      </label>

      {suggestedTime && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setPreferredTime(suggestedTime)}>
            💡 Use Smart Suggestion ({suggestedTime})
          </button>
        </div>
      )}

      <div style={{ marginTop: '10px' }}>
        <button onClick={() => audioRef.current?.play()}>🔊 Test Sound</button>
      </div>

      {/* 🔊 Audio */}
      <audio ref={audioRef} src={reminderSound} preload="auto" />

      {/* 🌙 Modal */}
      {showModal && (
        <div className="modal-overlay show">
          <div className="modal-content">
            <h2>🧘 Time to Wind Down</h2>
            <p>
              Put your phone away, dim the lights, and take deep breaths. <br />
              Consider journaling or calming music to help prepare for sleep.
            </p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepReminder;
