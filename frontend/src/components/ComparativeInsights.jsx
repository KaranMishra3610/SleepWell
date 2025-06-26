// src/components/ComparativeInsights.jsx

import React from "react";
import "./ComparativeInsights.css"; // Make sure this file exists

const ComparativeInsights = ({ insights }) => {
  return (
    <div className="insights-container">
      <h2>🧠 Your Sleep Insights</h2>
      {insights?.length === 0 ? (
        <p className="loading-text">💤 No insights yet. Start logging to unlock personalized tips!</p>
      ) : (
        <ul className="insights-list">
          {insights.map((tip, idx) => (
            <li key={idx} className="insight-item">
              💡 {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComparativeInsights;
