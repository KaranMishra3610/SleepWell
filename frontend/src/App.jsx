import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getFcmToken } from './utils/setupFCMToken';

// Component imports
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

// Theme configurations
const themes = {
  default: {
    name: '🌙 Moonlight',
    dashboard: '#f8f9fa',
    card: '#ffffff',
    text: '#495057',
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#28a745',
    shadow: 'rgba(0,0,0,0.1)',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  dark: {
    name: '🌚 Midnight',
    dashboard: '#1a1a1a',
    card: '#2d2d2d',
    text: '#e9ecef',
    primary: '#4dabf7',
    secondary: '#adb5bd',
    accent: '#51cf66',
    shadow: 'rgba(0,0,0,0.3)',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
  },
  ocean: {
    name: '🌊 Ocean Breeze',
    dashboard: '#e3f2fd',
    card: '#ffffff',
    text: '#0d47a1',
    primary: '#1976d2',
    secondary: '#42a5f5',
    accent: '#00acc1',
    shadow: 'rgba(25,118,210,0.15)',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  forest: {
    name: '🌲 Forest Calm',
    dashboard: '#f1f8e9',
    card: '#ffffff',
    text: '#2e7d32',
    primary: '#388e3c',
    secondary: '#66bb6a',
    accent: '#4caf50',
    shadow: 'rgba(56,142,60,0.15)',
    gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
  },
  sunset: {
    name: '🌅 Warm Sunset',
    dashboard: '#fff3e0',
    card: '#ffffff',
    text: '#bf360c',
    primary: '#f57c00',
    secondary: '#ff9800',
    accent: '#ff5722',
    shadow: 'rgba(245,124,0,0.15)',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)'
  },
  lavender: {
    name: '💜 Lavender Dreams',
    dashboard: '#f3e5f5',
    card: '#ffffff',
    text: '#4a148c',
    primary: '#7b1fa2',
    secondary: '#9c27b0',
    accent: '#e91e63',
    shadow: 'rgba(123,31,162,0.15)',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
};

const App = () => {
  // State management
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
  const [currentTheme, setCurrentTheme] = useState('default');

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('sleepAppTheme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when changed
  const handleThemeChange = (themeKey) => {
    setCurrentTheme(themeKey);
    localStorage.setItem('sleepAppTheme', themeKey);
  };

  // Get current theme object
  const theme = themes[currentTheme];

  // Authentication and initialization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Setup FCM token for notifications
        await getFcmToken(currentUser.uid);
        
        // Get user token for API calls
        const token = await currentUser.getIdToken();
        setUserToken(token);

        // Initialize user data
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

  // API service for authenticated requests
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
        const response = await axios.get(`http://127.0.0.1:5000${endpoint}`, { headers });
        return response.data;
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
      }
    },

    async postData(endpoint, data, isFormData = false) {
      try {
        const headers = await this.getAuthHeaders();
        if (isFormData) {
          headers['Content-Type'] = 'multipart/form-data';
        }
        const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, data, { headers });
        return response.data;
      } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error);
        throw error;
      }
    }
  };

  // Data fetching functions
  const fetchSleepHistory = async () => {
    try {
      const data = await apiService.fetchData('/history');
      setSleepHistory(data || []);
    } catch (error) {
      console.error("Failed to fetch sleep history:", error);
      setSleepHistory([]);
    }
  };

  const fetchStreak = async () => {
    try {
      const data = await apiService.fetchData('/get_streak');
      setStreak(data.streak || 0);
    } catch (error) {
      console.error("Failed to fetch streak:", error);
      setStreak(0);
    }
  };

  const fetchBadges = async () => {
    try {
      const data = await apiService.fetchData('/get_badges');
      setBadges(data.badges || []);
    } catch (error) {
      console.error("Failed to fetch badges:", error);
      setBadges([]);
    }
  };

  const fetchComparativeInsights = async (uid) => {
    try {
      const data = await apiService.fetchData(`/get_insights?user_id=${uid}`);
      setInsights(data.insights || []);
    } catch (error) {
      console.error("Failed to fetch comparative insights:", error);
      setInsights([]);
    }
  };

  // Sleep analysis handler
  const handleSleepAnalysis = async (formData, image) => {
    if (!user || !image || !formData.journal) {
      alert("Please provide journal entry and image.");
      return;
    }

    try {
      const form = new FormData();
      const processedData = {
        ...formData,
        hours_slept: +formData.hours_slept,
        caffeine: +formData.caffeine,
        screen_time: +formData.screen_time
      };
      
      Object.entries(processedData).forEach(([key, value]) => {
        form.append(key, value);
      });
      form.append('image', image);

      const data = await apiService.postData('/log', form, true);
      setResults(data);
      
      // Refresh user data after analysis
      await Promise.all([
        fetchSleepHistory(),
        fetchStreak(),
        fetchBadges(),
        fetchComparativeInsights(user.uid)
      ]);
    } catch (error) {
      console.error("Sleep analysis failed:", error);
      alert("Analysis failed. Please check inputs.");
    }
  };

  // Utility function for sentiment styling
  const getSentimentStyle = (polarity) => {
    if (polarity > 0.2) return { color: theme.accent, emoji: "😊" };
    if (polarity < -0.2) return { color: "#e74c3c", emoji: "😟" };
    return { color: theme.secondary, emoji: "😐" };
  };

  // Render quest log if active
  if (showQuestLog) {
    return (
      <QuestLog
        companionId={companion}
        onBack={() => setShowQuestLog(false)}
        token={userToken}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: theme.secondary,
        backgroundColor: theme.dashboard
      }}>
        Loading your sleep dashboard...
      </div>
    );
  }

  // Authentication guards
  if (!user) {
    return <Login onSuccess={() => window.location.reload()} />;
  }
  
  if (!companion) {
    return <CompanionsHub onSelect={setCompanion} />;
  }

  // Main dashboard styles
  const dashboardStyle = {
    minHeight: '100vh',
    backgroundColor: theme.dashboard,
    paddingTop: '20px',
    paddingBottom: '40px',
    transition: 'all 0.3s ease'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px',
    backgroundColor: theme.card,
    padding: '30px',
    borderRadius: '12px',
    boxShadow: `0 2px 10px ${theme.shadow}`,
    border: currentTheme === 'dark' ? `1px solid #444` : 'none'
  };

  const sectionStyle = {
    backgroundColor: theme.card,
    padding: '25px',
    borderRadius: '12px',
    boxShadow: `0 2px 10px ${theme.shadow}`,
    marginBottom: '20px',
    border: currentTheme === 'dark' ? `1px solid #444` : 'none'
  };

  const sectionTitleStyle = {
    marginBottom: '20px',
    color: theme.text,
    fontSize: '1.5rem'
  };

  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  };

  const themeDropdownStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: `2px solid ${theme.primary}`,
    backgroundColor: theme.card,
    color: theme.text,
    fontSize: '0.9rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={dashboardStyle}>
      <div style={containerStyle}>
        {/* Header Section */}
        <header style={headerStyle}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: theme.text,
            margin: '0 0 15px 0',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            background: theme.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🌙 Sleep Wellness Dashboard
          </h1>
          
          {/* Theme Selector */}
          <div style={{ 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <label style={{ 
              fontSize: '1rem', 
              color: theme.text,
              fontWeight: '500'
            }}>
              🎨 Theme:
            </label>
            <select 
              value={currentTheme} 
              onChange={(e) => handleThemeChange(e.target.value)}
              style={themeDropdownStyle}
            >
              {Object.entries(themes).map(([key, themeObj]) => (
                <option key={key} value={key} style={{ backgroundColor: theme.card, color: theme.text }}>
                  {themeObj.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* XP Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <XPProgress token={userToken} />
          </div>
          
          {/* Navigation Controls */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '15px', 
            flexWrap: 'wrap'
          }}>
            <strong style={{ 
              fontSize: '1.1rem', 
              color: theme.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✨ Active Companion: <span style={{ color: theme.primary }}>{companion?.toUpperCase()}</span>
            </strong>
            
            <button 
              onClick={() => setShowQuestLog(true)} 
              style={{ 
                ...buttonStyle,
                backgroundColor: theme.accent,
                color: 'white'
              }}
            >
              🎯 View Quests
            </button>
            
            <button 
              onClick={() => setCompanion(null)} 
              style={{ 
                ...buttonStyle,
                backgroundColor: theme.primary,
                color: 'white'
              }}
            >
              🔄 Change Companion
            </button>
          </div>
        </header>

        {/* Tracker Companion Content */}
        {companion === 'tracker' && (
          <div>
            {/* Progress Section */}
            <section style={{ marginBottom: '30px' }}>
              <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>📊 Your Progress</h2>
                <UserStats streak={streak} badges={badges} />
              </div>
              
              {sleepHistory.length > 0 && (
                <div style={sectionStyle}>
                  <h2 style={sectionTitleStyle}>📈 Detailed Statistics</h2>
                  <UserStatsDetailed history={sleepHistory} />
                </div>
              )}
            </section>

            {/* Sleep Trends Section */}
            <section>
              <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>📊 Sleep Trends</h2>
                <SleepScoreGraph history={sleepHistory} />
              </div>
            </section>
          </div>
        )}

        {/* Sage Companion Content */}
        {companion === 'sage' && (
          <div>
            {/* Voice Journal Section */}
            <section style={{ marginBottom: '30px' }}>
              <div style={{
                ...sectionStyle,
                backgroundColor: currentTheme === 'lavender' ? theme.dashboard : 
                               currentTheme === 'dark' ? '#3d2a4d' : '#f3e5f5',
                border: currentTheme === 'dark' ? '1px solid #6a1b9a' : 
                        `1px solid ${currentTheme === 'lavender' ? theme.primary : '#d1c4e9'}`
              }}>
                <h2 style={{ 
                  ...sectionTitleStyle,
                  color: currentTheme === 'lavender' ? theme.text : '#6a1b9a'
                }}>🎤 Voice Journal</h2>
                <VoiceJournal onTranscription={setVoiceTranscript} />
              </div>
            </section>

            {/* Sleep Logger Section */}
            <section style={{ marginBottom: '30px' }}>
              <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>📝 Log Your Sleep</h2>
                <SleepLogger onAnalyze={handleSleepAnalysis} />
              </div>
            </section>

            {/* Analysis Results Section */}
            {Object.keys(results).length > 0 && (
              <section style={{ marginBottom: '30px' }}>
                <div style={sectionStyle}>
                  <AnalysisResults 
                    results={results} 
                    getSentimentStyle={getSentimentStyle} 
                  />
                </div>
              </section>
            )}

            {/* Routine Advisor Section */}
            <section style={{ marginBottom: '30px' }}>
              <div style={sectionStyle}>
                <RoutineAdvisor />
              </div>
            </section>

            {/* Sleep Insights Section */}
            <section>
              <div style={{
                ...sectionStyle,
                backgroundColor: currentTheme === 'ocean' ? theme.dashboard : 
                               currentTheme === 'dark' ? '#1e3a5f' : '#e3f2fd'
              }}>
                <h2 style={{ 
                  ...sectionTitleStyle,
                  color: currentTheme === 'ocean' ? theme.text : '#1565c0'
                }}>🧠 Your Sleep Insights</h2>
                <ComparativeInsights insights={insights} />
              </div>
            </section>
          </div>
        )}

        {/* Knight Companion Content */}
        {companion === 'knight' && (
          <section>
            <div style={{
              ...sectionStyle,
              backgroundColor: currentTheme === 'forest' ? theme.dashboard : 
                             currentTheme === 'dark' ? '#2d4a2d' : '#c8e6c9'
            }}>
              <h2 style={{ 
                ...sectionTitleStyle,
                color: currentTheme === 'forest' ? theme.text : '#388e3c'
              }}>⏰ Sleep Reminder</h2>
              <SleepReminder />
            </div>
          </section>
        )}

        {/* Healer Companion Content */}
        {companion === 'healer' && (
          <div>
            {/* Sleep Aids Section */}
            <section style={{ marginBottom: '30px' }}>
              <div style={{
                ...sectionStyle,
                backgroundColor: currentTheme === 'sunset' ? theme.dashboard : 
                               currentTheme === 'dark' ? '#4a3a1a' : '#ffecb3'
              }}>
                <h2 style={{ 
                  ...sectionTitleStyle,
                  color: currentTheme === 'sunset' ? theme.text : '#f57f17'
                }}>🛌 Sleep Aids</h2>
                <SleepAids />
              </div>
            </section>

            {/* AI Bedtime Generator Section */}
            <section style={{ marginBottom: '30px' }}>
              <div style={{
                ...sectionStyle,
                backgroundColor: currentTheme === 'sunset' ? theme.card : 
                               currentTheme === 'dark' ? '#3a3a1a' : '#f0f4c3'
              }}>
                <h2 style={{ 
                  ...sectionTitleStyle,
                  color: currentTheme === 'sunset' ? theme.text : '#9e9d24'
                }}>🌙 AI Bedtime Generator</h2>
                <BedtimeGenerator />
              </div>
            </section>

            {/* Memory Calm Game Section */}
            <section>
              <div style={{
                ...sectionStyle,
                backgroundColor: currentTheme === 'forest' ? theme.card : 
                               currentTheme === 'dark' ? '#1a2e1a' : '#e8f5e9'
              }}>
                <h2 style={{ 
                  ...sectionTitleStyle,
                  color: currentTheme === 'forest' ? theme.text : '#2e7d32'
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
