import React, { useState } from 'react';
import axios from 'axios';

function SleepForm() {
  const [form, setForm] = useState({
    hours_slept: '',
    screen_time: '',
    caffeine: '',
    stress_level: ''
  });
  const [score, setScore] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/log', form);
    setScore(res.data.sleep_score);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log Your Sleep Data</h2>
      <input
        type="number"
        placeholder="Hours Slept"
        value={form.hours_slept}
        onChange={e => setForm({ ...form, hours_slept: e.target.value })}
      />
      <input
        type="number"
        placeholder="Screen Time (hrs)"
        value={form.screen_time}
        onChange={e => setForm({ ...form, screen_time: e.target.value })}
      />
      <input
        type="number"
        placeholder="Caffeine Intake (cups)"
        value={form.caffeine}
        onChange={e => setForm({ ...form, caffeine: e.target.value })}
      />
      <input
        type="number"
        placeholder="Stress Level (1-10)"
        value={form.stress_level}
        onChange={e => setForm({ ...form, stress_level: e.target.value })}
      />
      <button type="submit">Submit</button>

      {score && <p>Your predicted sleep score: {score}</p>}
    </form>
  );
}

export default SleepForm;
