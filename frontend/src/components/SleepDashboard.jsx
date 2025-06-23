import React, { useState } from 'react';
import axios from 'axios';
import SleepScoreGraph from './SleepScoreGraph';

function SleepDashboard() {
  const [data, setData] = useState({
    hours_slept: 7,
    screen_time: 3,
    caffeine: 1,
    stress_level: 2
  });

  const [score, setScore] = useState(null);

  const handlePredict = async () => {
    const res = await axios.post('http://localhost:5000/api/predict', data);
    setScore(res.data.sleep_score);
  };

  return (
    <div className="card">
      <h2>Sleep Score Predictor</h2>
      <input type="number" placeholder="Hours Slept" onChange={e => setData({...data, hours_slept: e.target.value})} />
      <input type="number" placeholder="Screen Time (hrs)" onChange={e => setData({...data, screen_time: e.target.value})} />
      <input type="number" placeholder="Caffeine (cups)" onChange={e => setData({...data, caffeine: e.target.value})} />
      <input type="number" placeholder="Stress Level (1-5)" onChange={e => setData({...data, stress_level: e.target.value})} />
      <button onClick={handlePredict}>Get Sleep Score</button>
      {score && <p>Your Sleep Score: {score}</p>}
      <SleepScoreGraph value={score} />
    </div>
  );
}

export default SleepDashboard;
