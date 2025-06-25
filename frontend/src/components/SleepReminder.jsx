// src/components/SleepReminder.jsx
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

  // Fetch saved and suggested reminder times
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
      } catch {
        console.warn("Smart suggestion not available.");
      }
    };

    fetchReminder();
    fetchSuggestion();
  }, [user]);

  // Register device for push notifications
  useEffect(() => {
    if (!user || !VAPID_KEY) return;

    const registerFCMToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (!token) return;

        const idToken = await auth.currentUser.getIdToken();
        await axios.post('http://127.0.0.1:5000/store_fcm_token', { token }, {
          headers: { Authorization: `Bearer ${idToken}` }
        });

        console.log("FCM token registered.");
      } catch (err) {
        console.error("FCM error:", err.message);
      }
    };

    registerFCMToken();
  }, [user, VAPID_KEY]);

  // Detect first user click (required for audio play)
  useEffect(() => {
    const markInteracted = () => setUserInteracted(true);
    window.addEventListener('click', markInteracted, { once: true });
    return () => window.removeEventListener('click', markInteracted);
  }, []);

  // Trigger reminders
  useEffect(() => {
    if (!preferredTime || !userInteracted) return;

    const interval = setInterval(async () => {
      const now = new Date();
      const [h, m] = preferredTime.split(':').map(Number);
      const isMatch = now.getHours() === h && now.getMinutes() === m;
      const last = lastAlertRef.current;

      if (isMatch && (!last || now - last > 60000)) {
        // Play sound
        audioRef.current?.play().catch(err => console.warn("Audio blocked:", err.message));
        setShowModal(true);

        // Push notification
        try {
          const idToken = await auth.currentUser.getIdToken();
          await axios.post("http://127.0.0.1:5000/trigger_fcm", {}, {
            headers: { Authorization: `Bearer ${idToken}` }
          });
        } catch (err) {
          console.error("Push trigger failed:", err.message);
        }

        lastAlertRef.current = new Date();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [preferredTime, userInteracted]);

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
    <div className="reminder-card">
      <h3>⏰ <strong>Sleep Reminder</strong></h3>

      <div className="form-group">
        <label htmlFor="time">Set Reminder Time:</label>
        <input
          id="time"
          type="time"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
        />
        <button onClick={saveReminder}>💾 Save Reminder</button>
      </div>

      {suggestedTime && (
        <div className="form-group">
          <button onClick={() => setPreferredTime(suggestedTime)}>
            💡 Use Smart Suggestion ({suggestedTime})
          </button>
        </div>
      )}

      <div className="form-group">
        <button onClick={() => audioRef.current?.play()}>
          🔊 Test Sound
        </button>
      </div>

      <audio ref={audioRef} src={reminderSound} preload="auto" />

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

      {/* Inline scoped styling */}
      <style>{`
        .reminder-card {
          background: #e3f2fd;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
        }

        h3 {
          color: #0d47a1;
          font-size: 1.6rem;
          margin-bottom: 16px;
        }

        .form-group {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
        }

        label {
          font-weight: 600;
          margin-bottom: 5px;
        }

        input[type="time"] {
          padding: 10px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        button {
          padding: 10px 20px;
          font-size: 1rem;
          background-color: #1976d2;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
        }

        button:hover {
          background-color: #1565c0;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-color: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          max-width: 90%;
          width: 400px;
        }
      `}</style>
    </div>
  );
};

export default SleepReminder;
