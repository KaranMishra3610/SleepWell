import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CompanionsHub = ({ onSelect }) => {
  const [xp, setXp] = useState(0);
  const [selectedCompanion, setSelectedCompanion] = useState(null);

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

  // SVG Icons for each companion
  const TrackerIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" fill="#4CAF50" fillOpacity="0.2" stroke="#4CAF50" strokeWidth="2"/>
      <path d="M16 24L20 28L32 16" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="12" r="2" fill="#4CAF50"/>
      <circle cx="36" cy="24" r="2" fill="#4CAF50"/>
      <circle cx="24" cy="36" r="2" fill="#4CAF50"/>
      <circle cx="12" cy="24" r="2" fill="#4CAF50"/>
    </svg>
  );

  const SageIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" fill="#9C27B0" fillOpacity="0.2" stroke="#9C27B0" strokeWidth="2"/>
      <path d="M24 8L26.5 18.5L37 16L28.5 24L37 32L26.5 29.5L24 40L21.5 29.5L11 32L19.5 24L11 16L21.5 18.5L24 8Z" fill="#9C27B0"/>
      <circle cx="24" cy="24" r="4" fill="#9C27B0" fillOpacity="0.5"/>
    </svg>
  );

  const KnightIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" fill="#2196F3" fillOpacity="0.2" stroke="#2196F3" strokeWidth="2"/>
      <path d="M24 6L28 14H36L30 20L32 28L24 24L16 28L18 20L12 14H20L24 6Z" fill="#2196F3"/>
      <rect x="22" y="28" width="4" height="12" fill="#2196F3"/>
      <circle cx="24" cy="18" r="2" fill="white"/>
    </svg>
  );

  const HealerIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" fill="#FF9800" fillOpacity="0.2" stroke="#FF9800" strokeWidth="2"/>
      <path d="M24 10V38M10 24H38" stroke="#FF9800" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="6" fill="none" stroke="#FF9800" strokeWidth="2"/>
      <path d="M18 18L30 30M30 18L18 30" stroke="#FF9800" strokeWidth="1" strokeOpacity="0.5"/>
    </svg>
  );

  const companions = [
    {
      id: 'tracker',
      name: 'Sleep Tracker',
      role: 'Data Analyst',
      description: 'Track your sleep patterns, view detailed statistics, and monitor your progress over time with comprehensive analytics.',
      borderColor: '#4CAF50',
      bgGradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
      icon: <TrackerIcon />,
      features: ['Sleep Pattern Analysis', 'Progress Tracking', 'Detailed Statistics', 'Trend Visualization']
    },
    {
      id: 'sage',
      name: 'Sleep Sage',
      role: 'Wisdom Keeper',
      description: 'Log your sleep experiences, get personalized insights, and receive expert advice from years of sleep wisdom.',
      borderColor: '#9C27B0',
      bgGradient: 'linear-gradient(135deg, #9C27B0 0%, #8E24AA 100%)',
      icon: <SageIcon />,
      features: ['Personal Insights', 'Expert Advice', 'Sleep Logging', 'Wisdom Sharing']
    },
    {
      id: 'knight',
      name: 'Sleep Knight',
      role: 'Guardian',
      description: 'Set sleep reminders and maintain consistent bedtime routines with unwavering dedication to your rest.',
      borderColor: '#2196F3',
      bgGradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      icon: <KnightIcon />,
      features: ['Sleep Reminders', 'Routine Management', 'Consistency Tracking', 'Schedule Protection']
    },
    {
      id: 'healer',
      name: 'Sleep Healer',
      role: 'Wellness Guide',
      description: 'Access sleep aids, relaxation tools, and bedtime stories to heal your mind and improve your rest quality.',
      borderColor: '#FF9800',
      bgGradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      icon: <HealerIcon />,
      features: ['Sleep Aids', 'Relaxation Tools', 'Bedtime Stories', 'Wellness Guidance']
    },
  ];

  const handleCompanionSelect = (companionId) => {
    setSelectedCompanion(companionId);
    setTimeout(() => {
      onSelect(companionId);
    }, 300);
  };

  const currentLevel = Math.floor(xp / 100);
  const xpInCurrentLevel = xp % 100;
  const xpToNextLevel = 100 - xpInCurrentLevel;

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    flexDirection: 'column',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  };

  const backgroundPattern = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
    pointerEvents: 'none'
  };

  const hubContainerStyle = {
    width: '100%',
    maxWidth: '1200px',
    position: 'relative',
    zIndex: 1,
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    marginBottom: '1rem',
    textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
    background: 'linear-gradient(45deg, #fff, #f0f0f0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 'bold',
    letterSpacing: '1px'
  };

  const subtitleStyle = {
    fontSize: '1.3rem',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '2rem',
    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    fontWeight: '300'
  };

  const xpContainerStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '25px 30px',
    margin: '30px auto',
    maxWidth: '500px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)'
  };

  const xpTitleStyle = {
    fontSize: '1.4rem',
    marginBottom: '15px',
    color: '#fff',
    fontWeight: '600'
  };

  const progressBarStyle = {
    width: '100%',
    height: '16px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '10px',
    position: 'relative'
  };

  const progressFillStyle = {
    height: '100%',
    background: 'linear-gradient(90deg, #4CAF50, #45a049)',
    width: `${xpInCurrentLevel}%`,
    borderRadius: '12px',
    transition: 'width 0.3s ease',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
  };

  const progressTextStyle = {
    fontSize: '1rem',
    opacity: 0.9,
    fontWeight: '500'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    marginTop: '40px',
    padding: '0 10px'
  };

  const getCardStyle = (companion) => ({
    background: selectedCompanion === companion.id 
      ? 'rgba(255, 255, 255, 0.25)' 
      : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(15px)',
    border: `2px solid ${companion.borderColor}`,
    borderRadius: '20px',
    padding: '30px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    textAlign: 'left',
    boxShadow: selectedCompanion === companion.id
      ? `0 20px 40px rgba(0,0,0,0.3), 0 0 0 4px ${companion.borderColor}40`
      : '0 10px 30px rgba(0,0,0,0.2)',
    transform: selectedCompanion === companion.id ? 'translateY(-10px) scale(1.02)' : 'translateY(0)',
    position: 'relative',
    overflow: 'hidden'
  });

  const cardOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%)',
    pointerEvents: 'none'
  };

  const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
  };

  const companionNameStyle = {
    fontSize: '1.6rem',
    margin: '0 0 5px 0',
    color: '#fff',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  };

  const roleStyle = {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
    fontWeight: '500',
    fontStyle: 'italic'
  };

  const descriptionStyle = {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: '1.6',
    marginBottom: '20px'
  };

  const featuresStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '15px'
  };

  const featureTagStyle = {
    background: 'rgba(255,255,255,0.2)',
    padding: '4px 12px',
    borderRadius: '15px',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(255,255,255,0.3)'
  };

  return (
    <div style={containerStyle}>
      <div style={backgroundPattern}></div>
      
      <div style={hubContainerStyle}>
        <h1 style={titleStyle}>
          🌙 Choose Your Sleep Companion
        </h1>
        <p style={subtitleStyle}>
          Select a companion to guide your sleep wellness journey
        </p>

        {/* Enhanced XP Display */}
        <div style={xpContainerStyle}>
          <h3 style={xpTitleStyle}>
            ⭐ Level {currentLevel} • {xp.toLocaleString()} XP
          </h3>
          <div style={progressBarStyle}>
            <div style={progressFillStyle}></div>
          </div>
          <p style={progressTextStyle}>
            {xpToNextLevel} XP to Level {currentLevel + 1}
          </p>
        </div>

        {/* Enhanced Companion Cards */}
        <div style={gridStyle}>
          {companions.map((companion) => (
            <div
              key={companion.id}
              style={getCardStyle(companion)}
              onClick={() => handleCompanionSelect(companion.id)}
              onMouseEnter={(e) => {
                if (selectedCompanion !== companion.id) {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = `0 15px 35px rgba(0,0,0,0.25), 0 0 0 2px ${companion.borderColor}60`;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCompanion !== companion.id) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                }
              }}
            >
              <div style={cardOverlayStyle}></div>
              
              <div style={cardHeaderStyle}>
                {companion.icon}
                <div>
                  <h2 style={companionNameStyle}>{companion.name}</h2>
                  <h4 style={roleStyle}>{companion.role}</h4>
                </div>
              </div>
              
              <p style={descriptionStyle}>{companion.description}</p>
              
              <div style={featuresStyle}>
                {companion.features.map((feature, index) => (
                  <span key={index} style={featureTagStyle}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanionsHub;
