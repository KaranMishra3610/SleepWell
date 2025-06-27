import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';

const RoutineAgent = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoutineTips = async () => {
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      const token = await user.getIdToken();
      const res = await axios.get("http://127.0.0.1:5000/optimize_routine_agent", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const tipsData = res.data.tips;
      if (!tipsData || tipsData.length === 0) {
        setTips(["No routine tips available at the moment. Keep logging your habits!"]);
      } else if (typeof tipsData === 'string') {
        // GPT-2 might return a big string if misconfigured
        setTips(tipsData.split(/[\n•\-]+/).map(t => t.trim()).filter(Boolean));
      } else {
        setTips(tipsData);
      }
    } catch (err) {
      console.error("Error fetching routine tips:", err);
      setError("⚠️ Unauthorized or failed to fetch tips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutineTips();
  }, []);

  return (
    <div style={{
      backgroundColor: '#fff8e1',
      border: '1px solid #ffe082',
      padding: 20,
      borderRadius: 10,
      marginTop: 20
    }}>
      <h3 style={{ color: '#f57c00' }}>🧠 Routine Optimization Tips</h3>
      {loading ? (
        <p>⏳ Loading personalized tips...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <ul style={{
          paddingLeft: 20,
          color: '#333',
          lineHeight: 1.6,
          fontSize: '1rem'
        }}>
          {tips.map((tip, index) => (
            <li key={index} style={{ marginBottom: 8 }}>✅ {tip}</li>
          ))}
        </ul>
      )}
      <button onClick={fetchRoutineTips} style={{
        marginTop: 12,
        backgroundColor: '#f57c00',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: 6,
        cursor: 'pointer'
      }}>
        🔄 Refresh Tips
      </button>
    </div>
  );
};

export default RoutineAgent;
