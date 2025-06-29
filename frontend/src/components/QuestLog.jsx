import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './QuestLog.css';

const QuestLog = ({ companionId, onBack, token }) => {
  const [quests, setQuests] = useState([]);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const companionMeta = {
    tracker: { title: "🌙 Sleep Tracker Quests", color: "#4CAF50" },
    sage:    { title: "🧘 Sleep Sage Quests", color: "#9C27B0" },
    knight:  { title: "🛡 Sleep Knight Quests", color: "#2196F3" },
    healer:  { title: "🌿 Sleep Healer Quests", color: "#FF9800" },
  };

  const { title, color } = companionMeta[companionId] || {};

  useEffect(() => {
    const fetchQuestsAndXp = async () => {
      setLoading(true);
      setError("");
      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };
        const [questsRes, xpRes] = await Promise.all([
          axios.get(`http://127.0.0.1:5000/get_quests/${companionId}`, { headers }),
          axios.get("http://127.0.0.1:5000/get_xp", { headers })
        ]);

        setQuests(questsRes.data.quests || []);
        setXp(xpRes.data.xp || 0);
      } catch (err) {
        console.error("Failed to fetch quests or XP:", err);
        setError("Error loading quests.");
      } finally {
        setLoading(false);
      }
    };

    if (token && companionId) {
      fetchQuestsAndXp();
    }
  }, [token, companionId]);

  return (
    <div className="questlog-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2b2b50, #0d0d2b)',
      padding: '20px',
      color: 'white',
    }}>
      <button onClick={onBack} style={{
        background: 'transparent',
        border: `2px solid ${color}`,
        color,
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        marginBottom: '1rem',
      }}>← Back to Hub</button>

      <h1 style={{
        fontSize: '2.5rem',
        color,
        marginBottom: '1rem',
        textShadow: '0 0 10px rgba(255,255,255,0.1)'
      }}>{title}</h1>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#f0f0f0' }}>
        🎮 Total XP: <span style={{ color: '#FFD700' }}>{xp}</span>
      </h2>

      {loading && <p>Loading quests...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && quests.length === 0 && (
        <p style={{ color: '#ccc' }}>No quests available for this companion.</p>
      )}

      <div className="quest-list">
        {quests.map((quest) => (
          <div className="quest-card" key={quest.id}>
            <h3>{quest.title}</h3>
            <p>{quest.description || ""}</p>
            <div className="quest-footer">
              <span className="xp-tag">+{quest.xp} XP</span>
              <span className={`status ${quest.completed ? 'completed' : 'not-started'}`}>
                {quest.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestLog;
