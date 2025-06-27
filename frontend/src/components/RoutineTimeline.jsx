
// src/components/RoutineTimeline.jsx
import React from 'react';

const RoutineTimeline = ({ routine }) => {
  if (!routine || routine.length === 0) return <p>No routine generated yet.</p>;

  return (
    <div style={{ marginTop: 20, background: '#fffde7', padding: 20, borderRadius: 10 }}>
      <h3>🗓️ Your Personalized Daily Routine</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {routine.map((item, index) => (
          <li key={index} style={{ margin: '10px 0', padding: '10px', background: '#f0f4c3', borderRadius: 6 }}>
            <strong>{item.time}</strong>: {item.activity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoutineTimeline;
