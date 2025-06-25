// src/components/UserStatsDetailed.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const UserStatsDetailed = ({ history }) => {
  if (!history || history.length === 0) {
    return <p style={{ textAlign: 'center', color: '#666' }}>No sleep history available yet.</p>;
  }

  const avg = (key) =>
    (history.reduce((sum, entry) => sum + (entry[key] || 0), 0) / history.length).toFixed(1);

  // Mood distribution calculation
  const moodCounts = {};
  history.forEach(h => {
    let mood = h.mood?.toLowerCase() || "Unknown";
    if (!mood || mood === '' || mood === null || mood === undefined) {
      mood = "Unknown";
      console.warn("⚠️ Missing mood in entry:", h);
    }
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  const sleepDuration = avg('hours_slept');
  const screenTime = avg('screen_time');
  const caffeine = avg('caffeine');
  const sleepScore = avg('sleep_score');

  const moodColors = [
    '#4caf50', // green
    '#ff9800', // orange
    '#f44336', // red
    '#2196f3', // blue
    '#9c27b0', // purple
    '#607d8b', // grey-blue
    '#cddc39'  // lime
  ];

  return (
    <div style={styles.card}>
      <h2 style={styles.header}>📊 Detailed Sleep Insights</h2>

      <p style={styles.statLine}>Average Sleep Score: <strong>{sleepScore}</strong></p>

      <div style={styles.bars}>
        <div style={styles.barContainer}>
          <label style={styles.label}>Sleep Duration</label>
          <progress value={sleepDuration} max="10" style={styles.progress} />
          <span style={styles.value}>{sleepDuration} hrs</span>
        </div>

        <div style={styles.barContainer}>
          <label style={styles.label}>Screen Time</label>
          <progress value={screenTime} max="12" style={styles.progress} />
          <span style={styles.value}>{screenTime} hrs</span>
        </div>

        <div style={styles.barContainer}>
          <label style={styles.label}>Caffeine Intake</label>
          <progress value={caffeine} max="10" style={styles.progress} />
          <span style={styles.value}>{caffeine} units</span>
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3 style={styles.header}>😊 Mood Distribution</h3>
        {Object.keys(moodCounts).length > 0 ? (
          <Pie
            data={{
              labels: Object.keys(moodCounts),
              datasets: [
                {
                  data: Object.values(moodCounts),
                  backgroundColor: moodColors.slice(0, Object.keys(moodCounts).length),
                }
              ]
            }}
            options={{
              plugins: {
                legend: {
                  labels: {
                    color: '#2c3e50',
                    font: { size: 14 }
                  }
                }
              }
            }}
          />
        ) : (
          <p style={{ color: '#999', textAlign: 'center' }}>
            No mood data available.
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#f9f9f9',
    color: '#2c3e50',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginTop: '40px'
  },
  header: {
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center'
  },
  bars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px'
  },
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  progress: {
    width: '100%',
    height: '18px',
    borderRadius: '10px',
    backgroundColor: '#e0e0e0'
  },
  value: {
    marginTop: '5px',
    fontStyle: 'italic'
  },
  statLine: {
    fontSize: '1.1rem',
    marginBottom: '20px',
    textAlign: 'center'
  }
};

export default UserStatsDetailed;
