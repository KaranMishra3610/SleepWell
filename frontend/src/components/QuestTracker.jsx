import React, { useEffect, useState } from 'react';
import './QuestTracker.css';

const QuestTracker = ({ token }) => {
  const [quests, setQuests] = useState([]);

  const companionEmojis = {
    tracker: "🌙",
    sage: "🧘",
    knight: "🛡",
    healer: "🌿"
  };

  useEffect(() => {
    if (!token) return;
    fetch('/get_quests', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const activeQuests = (data.quests || []).filter(q => !q.completed);
        setQuests(activeQuests);
      })
      .catch(err => {
        console.error("Failed to load quests:", err);
      });
  }, [token]);

  return (
    <div className="quest-tracker">
      <h3>🧠 Active Quests</h3>
      <ul>
        {quests.map(q => (
          <li key={q.id}>
            <span>{companionEmojis[q.companion] || ""} {q.title}</span>
            <span className="xp-reward">+{q.xp} XP</span>
          </li>
        ))}
        {quests.length === 0 && (
          <li style={{ color: '#aaa', marginTop: '10px' }}>No active quests.</li>
        )}
      </ul>
    </div>
  );
};

export default QuestTracker;
