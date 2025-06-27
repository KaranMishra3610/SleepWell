import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

const RoutinePreferencesForm = ({ onRoutineGenerated }) => {
  const [form, setForm] = useState({
    wake_up_time: '07:00',
    sleep_hours: 8,
    custom_blocks: [
      { start: '09:00', end: '10:00', activity: '🍳 Breakfast & Morning Prep' },
      { start: '10:00', end: '13:00', activity: '📚 Study' }
    ]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlockChange = (index, field, value) => {
    const updatedBlocks = [...form.custom_blocks];
    updatedBlocks[index][field] = value;
    setForm((prev) => ({ ...prev, custom_blocks: updatedBlocks }));
  };

  const addCustomBlock = () => {
    setForm((prev) => ({
      ...prev,
      custom_blocks: [...prev.custom_blocks, { start: '', end: '', activity: '' }]
    }));
  };

  const submitForm = async () => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const res = await axios.post(
        "http://127.0.0.1:5000/generate_routine_from_preferences",
        form,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onRoutineGenerated(res.data.routine);
    } catch (err) {
      console.error("Routine generation failed", err);
      alert("Failed to generate routine");
    }
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#f1f8e9", borderRadius: 8, color: "#333" }}>
      <h3 style={{ marginBottom: 15, color: '#2e7d32' }}>📋 Build Your Own Routine</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label>
          Wake-up Time:
          <input
            type="time"
            name="wake_up_time"
            value={form.wake_up_time}
            onChange={handleChange}
          />
        </label>

        <label>
          Sleep Duration (hrs):
          <input
            type="number"
            name="sleep_hours"
            value={form.sleep_hours}
            onChange={handleChange}
          />
        </label>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4 style={{ marginBottom: 10, color: '#2e7d32' }}>🕒 Your Custom Activity Blocks</h4>
        {form.custom_blocks.map((block, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <input
              type="time"
              value={block.start}
              onChange={(e) => handleBlockChange(i, 'start', e.target.value)}
            />
            <input
              type="time"
              value={block.end}
              onChange={(e) => handleBlockChange(i, 'end', e.target.value)}
            />
            <input
              type="text"
              placeholder="Activity label (e.g., 📚 Study)"
              value={block.activity}
              onChange={(e) => handleBlockChange(i, 'activity', e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        ))}

        <button
          onClick={addCustomBlock}
          style={{
            background: '#aed581',
            color: '#1b5e20',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          ➕ Add Activity
        </button>
      </div>

      <button
        onClick={submitForm}
        style={{
          marginTop: 20,
          background: '#388e3c',
          color: '#fff',
          padding: '10px 18px',
          border: 'none',
          borderRadius: 4,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        ✅ Generate Routine
      </button>
    </div>
  );
};

export default RoutinePreferencesForm;
