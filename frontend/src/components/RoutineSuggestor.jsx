import React, { useState } from 'react';
import axios from 'axios';

const RoutineSuggestor = () => {
  const [routine, setRoutine] = useState('');
  const [input, setInput] = useState({
    hours_slept: 6,
    stress_level: 5,
  });

  const fetchRoutine = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/routine', input);
      setRoutine(response.data.routine);
    } catch (error) {
      console.error('Error fetching routine:', error);
      setRoutine('Failed to fetch routine');
    }
  };

  return (
    <div>
      <h2>Sleep Routine Recommender</h2>
      <label>
        Hours Slept:
        <input
          type="number"
          value={input.hours_slept}
          onChange={(e) => setInput({ ...input, hours_slept: Number(e.target.value) })}
        />
      </label>
      <br />
      <label>
        Stress Level (1-10):
        <input
          type="number"
          value={input.stress_level}
          onChange={(e) => setInput({ ...input, stress_level: Number(e.target.value) })}
        />
      </label>
      <br />
      <button onClick={fetchRoutine}>Suggest Routine</button>
      {routine && <p><strong>Routine:</strong> {routine}</p>}
    </div>
  );
};

export default RoutineSuggestor;
