import React, { useState } from 'react';
import axios from 'axios';

const Tips = () => {
  const [tips, setTips] = useState('');
  const [formData, setFormData] = useState({
    hours_slept: 6,
    mood: 'happy',
    stress_level: 5,
    screen_time: 2,
    caffeine: 0,
  });

  const fetchTips = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/tips', formData);
      setTips(response.data.tips);
    } catch (error) {
      console.error('Error fetching tips:', error);
      setTips('Failed to fetch tips');
    }
  };

  return (
    <div>
      <h2>Get Personalized Sleep Tips</h2>
      
      <label>Hours Slept:</label>
      <input
        type="number"
        value={formData.hours_slept}
        onChange={(e) => setFormData({ ...formData, hours_slept: Number(e.target.value) })}
      />
      <br />

      <label>Mood:</label>
      <input
        type="text"
        value={formData.mood}
        onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
      />
      <br />

      <label>Stress Level (1-10):</label>
      <input
        type="number"
        value={formData.stress_level}
        onChange={(e) => setFormData({ ...formData, stress_level: Number(e.target.value) })}
      />
      <br />

      <label>Screen Time (in hours):</label>
      <input
        type="number"
        value={formData.screen_time}
        onChange={(e) => setFormData({ ...formData, screen_time: Number(e.target.value) })}
      />
      <br />

      <label>Caffeine Intake (number of cups):</label>
      <input
        type="number"
        value={formData.caffeine}
        onChange={(e) => setFormData({ ...formData, caffeine: Number(e.target.value) })}
      />
      <br />

      <button onClick={fetchTips}>Get Tips</button>
      {tips && (
        <p><strong>Tips:</strong> {Array.isArray(tips) ? tips.join(' ') : tips}</p>
      )}
    </div>
  );
};

export default Tips;
