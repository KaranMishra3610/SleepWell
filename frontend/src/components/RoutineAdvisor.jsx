import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase'; // adjust if needed

const RoutineAdvisor = () => {
  const [inputs, setInputs] = useState({
    wakeUp: '',
    screenTime: '',
    caffeineTime: '',
    workoutTime: '',
    lateMeal: 'no'
  });

  const [tip, setTip] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const getRoutineTip = async () => {
    try {
      const idToken = await auth.currentUser.getIdToken(); // 🔐 fix: fetch token here
      const res = await axios.post(
        'http://127.0.0.1:5000/routine_tip',
        inputs,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setTip(res.data.tip);
    } catch (err) {
      console.error('Failed to fetch tip', err);
      setTip("⚠️ Failed to get routine tip. Please check inputs.");
    }
  };

  return (
    <div style={{
      background: '#f1f8e9',
      padding: 25,
      borderRadius: 12,
      border: '1px solid #c5e1a5',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{
        marginBottom: 20,
        fontSize: '1.5rem',
        color: '#33691e'
      }}>
        🧭 Optimize Your Sleep Routine
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ color: '#2e7d32' }}>Wake-up Time:</label>
        <input
          type="time"
          name="wakeUp"
          value={inputs.wakeUp}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={{ color: '#2e7d32' }}>Screen Time After 9 PM (hours):</label>
        <input
          type="number"
          name="screenTime"
          value={inputs.screenTime}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={{ color: '#2e7d32' }}>Last Caffeine Intake:</label>
        <input
          type="time"
          name="caffeineTime"
          value={inputs.caffeineTime}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={{ color: '#2e7d32' }}>Workout Time:</label>
        <input
          type="time"
          name="workoutTime"
          value={inputs.workoutTime}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={{ color: '#2e7d32' }}>Ate Heavy Meal Close to Bedtime?</label>
        <select
          name="lateMeal"
          value={inputs.lateMeal}
          onChange={handleChange}
          style={{ ...inputStyle, padding: '8px' }}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>

        <button
          onClick={getRoutineTip}
          style={{
            marginTop: 15,
            backgroundColor: '#66bb6a',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Get Tip
        </button>
      </div>

      {tip && (
        <div style={{
          backgroundColor: '#fffde7',
          border: '1px solid #fbc02d',
          padding: '15px 20px',
          borderRadius: 10,
          marginTop: 20,
          color: '#795548',
          fontSize: '1rem',
          lineHeight: 1.4
        }}>
          {tip}
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #cfd8dc',
  fontSize: '1rem',
  outline: 'none'
};

export default RoutineAdvisor;
