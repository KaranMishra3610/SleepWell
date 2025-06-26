import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import Login from './components/Login.jsx';
import UserStats from './components/UserStats';
import UserStatsDetailed from './components/UserStatsDetailed';
import SleepLogger from './components/SleepLogger';
import AnalysisResults from './components/AnalysisResults';
import SleepScoreGraph from './components/SleepScoreGraph.jsx';
import SleepReminder from './components/SleepReminder.jsx';
import SleepAids from './components/SleepAids.jsx';
import MemoryCalm from './components/MiniGames/MemoryCalm';
import RoutineAdvisor from './components/RoutineAdvisor.jsx';
import ComparativeInsights from './components/ComparativeInsights.jsx'; // 🧠

const App = () => {
  const [user, setUser] = useState(null);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [results, setResults] = useState({});
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [insights, setInsights] = useState([]); // 🧠

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          await Promise.all([
            fetchSleepHistory(),
            fetchStreak(),
            fetchBadges(),
            fetchComparativeInsights(currentUser.uid) // ✅ pass UID here
          ]);
        } catch (error) {
          console.error("Initialization failed:", error);
        }
      }
    });
  }, []);

  const apiService = {
    async getAuthHeaders() {
      const idToken = await auth.currentUser.getIdToken();
      return { Authorization: `Bearer ${idToken}` };
    },
    async fetchData(endpoint) {
      const headers = await this.getAuthHeaders();
      const res = await axios.get(`http://127.0.0.1:5000${endpoint}`, { headers });
      return res.data;
    },
    async postData(endpoint, data, isFormData = false) {
      const headers = await this.getAuthHeaders();
      if (isFormData) headers['Content-Type'] = 'multipart/form-data';
      const res = await axios.post(`http://127.0.0.1:5000${endpoint}`, data, { headers });
      return res.data;
    }
  };

  const fetchSleepHistory = async () => {
    try {
      const data = await apiService.fetchData('/history');
      setSleepHistory(data);
    } catch (err) {
      console.error("Failed to fetch sleep history:", err);
    }
  };

  const fetchStreak = async () => {
    try {
      const data = await apiService.fetchData('/get_streak');
      setStreak(data.streak || 0);
    } catch (err) {
      console.error("Failed to fetch streak:", err);
    }
  };

  const fetchBadges = async () => {
    try {
      const data = await apiService.fetchData('/get_badges');
      setBadges(data.badges || []);
    } catch (err) {
      console.error("Failed to fetch badges:", err);
    }
  };

  const fetchComparativeInsights = async (uid) => {
    try {
      const data = await apiService.fetchData(`/get_insights?user_id=${uid}`);
      setInsights(data.insights || []);
    } catch (err) {
      console.error("Failed to fetch comparative insights:", err);
    }
  };

  const handleSleepAnalysis = async (formData, image) => {
    if (!user || !image || !formData.journal) {
      alert("Please provide journal entry and image.");
      return;
    }

    try {
      const form = new FormData();
      const processed = {
        ...formData,
        hours_slept: +formData.hours_slept,
        caffeine: +formData.caffeine,
        screen_time: +formData.screen_time
      };
      Object.entries(processed).forEach(([k, v]) => form.append(k, v));
      form.append('image', image);

      const data = await apiService.postData('/log', form, true);
      setResults(data);
      await Promise.all([
        fetchSleepHistory(),
        fetchStreak(),
        fetchBadges(),
        fetchComparativeInsights(user.uid)
      ]);
    } catch (err) {
      console.error("Sleep analysis failed:", err);
      alert("Analysis failed. Please check inputs.");
    }
  };

  const getSentimentStyle = (polarity) => {
    if (polarity > 0.2) return { color: "green", emoji: "😊" };
    if (polarity < -0.2) return { color: "red", emoji: "😟" };
    return { color: "gray", emoji: "😐" };
  };

  if (!user) return <Login onSuccess={() => window.location.reload()} />;

  return (
    <div className="app-container" style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: 30 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
          Sleep Wellness Dashboard
        </h1>
      </header>

      <section style={{ marginBottom: 30 }}>
        <UserStats streak={streak} badges={badges} />
        {sleepHistory.length > 0 && <UserStatsDetailed history={sleepHistory} />}
      </section>

      <section style={{ marginBottom: 30 }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: 25,
          borderRadius: 12,
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{ marginBottom: 20, color: '#495057' }}>📝 Log Your Sleep</h2>
          <SleepLogger onAnalyze={handleSleepAnalysis} />
        </div>
      </section>

      {Object.keys(results).length > 0 && (
        <section style={{ marginBottom: 30 }}>
          <AnalysisResults results={results} getSentimentStyle={getSentimentStyle} />
        </section>
      )}

      {sleepHistory.length > 0 && (
        <section style={{ marginBottom: 30 }}>
          <div style={{
            backgroundColor: '#fff',
            padding: 25,
            borderRadius: 12,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: 20, color: '#495057' }}>📊 Sleep Trends</h2>
            <SleepScoreGraph history={sleepHistory} />
          </div>
        </section>
      )}

      <section style={{ marginBottom: 30 }}>
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20
        }}>
          <h2 style={{ marginBottom: 15, color: '#1565c0' }}>🧠 Your Sleep Insights</h2>
          <ComparativeInsights insights={insights} />
        </div>
      </section>

      <section style={{ marginBottom: 30 }}>
        <div style={{
          backgroundColor: '#fff3e0',
          padding: 25,
          borderRadius: 12,
          border: '1px solid #ffe0b2'
        }}>
          <h2 style={{ marginBottom: 20, color: '#ef6c00' }}>🛏️ Optimize Your Sleep Routine</h2>
          <RoutineAdvisor />
        </div>
      </section>

      <section>
        <div style={{
          backgroundColor: '#e8f5e9',
          padding: 25,
          borderRadius: 12
        }}>
          <h2 style={{ marginBottom: 20, color: '#2e7d32' }}>🧠 Relax with Memory Calm</h2>
          <MemoryCalm />
        </div>
      </section>
    </div>
  );
};

export default App;
