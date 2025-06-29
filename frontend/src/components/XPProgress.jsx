// components/XPProgress.jsx
import React, { useEffect, useState } from 'react';
import './XPProgress.css'; // style separately

const XPProgress = ({ token }) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (!token) return;
    fetch('http://127.0.0.1:5000/get_xp', {
  headers: { Authorization: `Bearer ${token}` }
})
      .then(res => res.json())
      .then(data => {
        setXp(data.xp || 0);
        setLevel(Math.floor((data.xp || 0) / 100) + 1);
      });
  }, [token]);

  const current = xp % 100;
  const percent = Math.min((current / 100) * 100, 100);

  return (
    <div className="xp-container">
      <div className="xp-label">Level {level}</div>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="xp-count">{current} / 100 XP</div>
    </div>
  );
};

export default XPProgress;
