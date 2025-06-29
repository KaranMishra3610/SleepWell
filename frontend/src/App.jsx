import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getFcmToken } from './utils/setupFCMToken'; // adjust the path if needed

import Login from './components/Login.jsx';
import CompanionsHub from './components/CompanionsHub.jsx';
import UserStats from './components/UserStats';
import UserStatsDetailed from './components/UserStatsDetailed';
import SleepLogger from './components/SleepLogger';
import AnalysisResults from './components/AnalysisResults';
import SleepScoreGraph from './components/SleepScoreGraph.jsx';
import SleepReminder from './components/SleepReminder.jsx';
import SleepAids from './components/SleepAids.jsx';
import MemoryCalm from './components/MiniGames/MemoryCalm';
import ComparativeInsights from './components/ComparativeInsights.jsx';
import VoiceJournal from './components/VoiceJournal.jsx';
import RoutineAdvisor from './components/RoutineAdvisor.jsx';
import BedtimeGenerator from './components/BedtimeGenerator.jsx';
import QuestLog from './components/QuestLog.jsx';
import XPProgress from './components/XPProgress.jsx';

const App = () => {
  const [user, setUser] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [results, setResults] = useState({});
  const [streak, setStreak] = useState(0);
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [badges, setBadges] = useState([]);
  const [insights, setInsights] = useState([]);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);

      // ✅ 1. Setup Firebase Cloud Messaging Token
     await getFcmToken(currentUser.uid);// <<--- ADD THIS LINE

      // ✅ 2. Get the ID token for API usage
      const token = await currentUser.getIdToken();
      setUserToken(token);

      try {
        await Promise.all([
          fetchSleepHistory(),
          fetchStreak(),
          fetchBadges(),
          fetchComparativeInsights(currentUser.uid)
        ]);
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  const apiService = {
    async getAuthHeaders() {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      const idToken = await auth.currentUser.getIdToken();
      return { Authorization: `Bearer ${idToken}` };
    },
    async fetchData(endpoint) {
      try {
        const headers = await this.getAuthHeaders();
        const res = await axios.get(`http://127.0.0.1:5000${endpoint}`, { headers });
        return res.data;
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
      }
    },
    async postData(endpoint, data, isFormData = false) {
      try {
        const headers = await this.getAuthHeaders();
        if (isFormData) headers['Content-Type'] = 'multipart/form-data';
        const res = await axios.post(`http://127.0.0.1:5000${endpoint}`, data, { headers });
        return res.data;
      } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error);
        throw error;
      }
    }
  };

  const fetchSleepHistory = async () => {
    try {
      const data = await apiService.fetchData('/history');
      setSleepHistory(data || []);
    } catch (err) {
      console.error("Failed to fetch sleep history:", err);
      setSleepHistory([]);
    }
  };

  const fetchStreak = async () => {
    try {
      const data = await apiService.fetchData('/get_streak');
      setStreak(data.streak || 0);
    } catch (err) {
      console.error("Failed to fetch streak:", err);
      setStreak(0);
    }
  };

  const fetchBadges = async () => {
    try {
      const data = await apiService.fetchData('/get_badges');
      setBadges(data.badges || []);
    } catch (err) {
      console.error("Failed to fetch badges:", err);
      setBadges([]);
    }
  };

  if (showQuestLog) {
    return (
      <QuestLog
        companionId={companion}
        onBack={() => setShowQuestLog(false)}
        token={userToken}
      />
    );
  }

  const fetchComparativeInsights = async (uid) => {
    try {
      const data = await apiService.fetchData(`/get_insights?user_id=${uid}`);
      setInsights(data.insights || []);
    } catch (err) {
      console.error("Failed to fetch comparative insights:", err);
      setInsights([]);
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) return <Login onSuccess={() => window.location.reload()} />;
  if (!companion) return <CompanionsHub onSelect={setCompanion} />;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      paddingTop: '20px',
      paddingBottom: '40px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px'
      }}>
        <header style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#2c3e50',
            margin: '0 0 15px 0'
          }}>
            Sleep Wellness Dashboard
          </h1>
          
          {/* XP Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <XPProgress token={userToken} />
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '15px', 
            flexWrap: 'wrap'
          }}>
            <strong style={{ fontSize: '1.1rem', color: '#666' }}>
              Active Companion: {companion?.toUpperCase()}
            </strong>
            <button 
              onClick={() => setShowQuestLog(true)} 
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              View Quests
            </button>
            <button 
              onClick={() => setCompanion(null)} 
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Change Companion
            </button>
          </div>
        </header>

        {companion === 'tracker' && (
          <div style={{ marginBottom: '30px' }}>
            <section style={{ marginBottom: '30px' }}>
              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <h2 style={{ 
                  marginBottom: '20px', 
                  color: '#495057',
                  fontSize: '1.5rem'
                }}>📊 Your Progress</h2>
                <UserStats streak={streak} badges={badges} />
              </div>
              
              {sleepHistory.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  padding: '25px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ 
                    marginBottom: '20px', 
                    color: '#495057',
                    fontSize: '1.5rem'
                  }}>📈 Detailed Statistics</h2>
                  <UserStatsDetailed history={sleepHistory} />
                </div>
              )}
            </section>

            <section>
              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  marginBottom: '20px', 
                  color: '#495057',
                  fontSize: '1.5rem'
                }}>📊 Sleep Trends</h2>
                <SleepScoreGraph history={sleepHistory} />
              </div>
            </section>
          </div>
        )}

        {companion === 'sage' && (
          <div style={{ marginBottom: '30px' }}>
            <section style={{ marginBottom: '30px' }}>
              <div style={{
                backgroundColor: '#f3e5f5',
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #d1c4e9',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  marginBottom: '20px', 
                  color: '#6a1b9a',
                  fontSize: '1.5rem'
                }}>🎤 Voice Journal</h2>
                <VoiceJournal onTranscription={setVoiceTranscript} />
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  marginBottom: '20px', 
                  color: '#495057',
                  fontSize: '1.5rem'
                }}>📝 Log Your Sleep</h2>
                <SleepLogger onAnalyze={handleSleepAnalysis} />
              </div>
            </section>

            {Object.keys(results).length > 0 && (
              <section style={{ marginBottom: '30px' }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '25px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <AnalysisResults results={results} getSentimentStyle={getSentimentStyle} />
                </div>
              </section>
            )}

            <section style={{ marginBottom: '30px' }}>
              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <RoutineAdvisor />
              </div>
            </section>

            <section>
              <div style={{
                backgroundColor: '#e3f2fd',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  marginBottom: '20px', 
                  color: '#1565c0',
                  fontSize: '1.5rem'
                }}>🧠 Your Sleep Insights</h2>
                <ComparativeInsights insights={insights} />
              </div>
            </section>
          </div>
        )}

        {companion === 'knight' && (
          <section>
            <div style={{
              backgroundColor: '#c8e6c9',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                marginBottom: '20px', 
                color: '#388e3c',
                fontSize: '1.5rem'
              }}>⏰ Sleep Reminder</h2>
              <SleepReminder />
            </div>
          </section>
        )}

        {companion === 'healer' && (
          <div style={{ marginBottom: '30px' }}>
            <section style={{ marginBottom: '30px' }}>
              <div style={{
                backgroundColor: '#ffecb3',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  marginBottom: '20px', 
                  color: '#f57f17',
                  fontSize: '1.5rem'
                }}>🛌 Sleep Aids</h2>
                <SleepAids />
              </div>
            </section>

            <section style={{ marginBottom: '30px' }}>
              <div style={{
                backgroundColor: '#f0f4c3',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  marginBottom: '20px', 
                  color: '#9e9d24',
                  fontSize: '1.5rem'
                }}>🌙 AI Bedtime Generator</h2>
                <BedtimeGenerator />
              </div>
            </section>

            <section>
              <div style={{
                backgroundColor: '#e8f5e9',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ 
                  marginBottom: '20px', 
                  color: '#2e7d32',
                  fontSize: '1.5rem'
                }}>🧠 Relax with Memory Calm</h2>
                <MemoryCalm />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;