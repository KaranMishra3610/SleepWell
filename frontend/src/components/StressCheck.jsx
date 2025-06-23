import React, { useState } from 'react';
import axios from 'axios';

function StressCheck() {
  const [text, setText] = useState('');
  const [stress, setStress] = useState(null);

  const handleCheck = async () => {
    const res = await axios.post('http://localhost:5000/api/stress', { text });
    setStress(res.data.stress_level);
  };

  return (
    <div className="card">
      <h2>Stress Detection</h2>
      <textarea onChange={e => setText(e.target.value)} placeholder="Describe your current feelings..."></textarea>
      <button onClick={handleCheck}>Analyze Stress</button>
      {stress && <p>Detected Stress Level: {stress}</p>}
    </div>
  );
}

export default StressCheck;
