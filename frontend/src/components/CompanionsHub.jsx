import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CompanionsHub.css';

const CompanionsHub = ({ onSelect }) => {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const fetchXP = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get('/get_xp', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setXp(res.data.xp || 0);
      } catch (err) {
        console.error("Failed to fetch XP", err);
      }
    };
    fetchXP();
  }, []);

  const companions = [
    {
      id: 'tracker',
      name: 'Sleep Tracker',
      role: 'Data Analyst',
      description: 'Track your sleep patterns, view detailed statistics, and monitor your progress over time.',
      borderColor: '#4CAF50',
    },
    {
      id: 'sage',
      name: 'Sleep Sage',
      role: 'Wisdom Keeper',
      description: 'Log your sleep experiences, get personalized insights, and receive expert advice.',
      borderColor: '#9C27B0',
    },
    {
      id: 'knight',
      name: 'Sleep Knight',
      role: 'Guardian',
      description: 'Set sleep reminders and maintain consistent bedtime routines.',
      borderColor: '#2196F3',
    },
    {
      id: 'healer',
      name: 'Sleep Healer',
      role: 'Wellness Guide',
      description: 'Access sleep aids, relaxation tools, and bedtime stories to improve your rest.',
      borderColor: '#FF9800',
    },
  ];

  return (
    <div
      className="companions-hub-wrapper"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        flexDirection: 'column',
        color: 'white'
      }}
    >
      <div className="hub-container" style={{ width: '100%', maxWidth: '1000px' }}>
        <h1
          style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          🌙 Choose Your Sleep Companion
        </h1>
        <p className="hub-subtitle">
          Select a companion to guide your sleep wellness journey
        </p>

        {/* XP Display */}
        <div
          className="xp-bar"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '10px 20px',
            margin: '20px 0',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          <h3>🌟 XP: {xp} | Level {Math.floor(xp / 100)}</h3>
          <progress
            value={xp % 100}
            max="100"
            style={{ width: '100%', height: '12px', borderRadius: '6px' }}
          />
          <p style={{ fontSize: '0.9rem', marginTop: '4px', opacity: 0.8 }}>
            {100 - (xp % 100)} XP to next level
          </p>
        </div>

        {/* Companion Cards */}
        <div className="companions-grid">
          {companions.map((companion) => (
            <div
              key={companion.id}
              className="companion-card"
              style={{ borderColor: companion.borderColor }}
              onClick={() => onSelect(companion.id)}
            >
              <h2>{companion.name}</h2>
              <h4>{companion.role}</h4>
              <p>{companion.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanionsHub;
