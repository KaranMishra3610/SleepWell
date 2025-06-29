// src/components/SleepAids.jsx
import React, { useState, useEffect } from 'react';
import { logQuestProgress } from '../utils/logQuestProgress';

const breathingPhases = [
  { label: "Inhale", duration: 4000 },
  { label: "Hold", duration: 2000 },
  { label: "Exhale", duration: 4000 },
];

const SleepAids = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio("/music/relaxing.mp3"));

  const [breathingLabel, setBreathingLabel] = useState("Start");
  const [breathingStep, setBreathingStep] = useState(0);
  const [circleScale, setCircleScale] = useState(1);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingStarted, setBreathingStarted] = useState(false); // ensures quest logs once per session

  const toggleMusic = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.loop = true;
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!breathingActive) return;

    const phase = breathingPhases[breathingStep];
    setBreathingLabel(phase.label);

    if (phase.label === "Inhale") setCircleScale(1.5);
    if (phase.label === "Hold") setCircleScale(1.5);
    if (phase.label === "Exhale") setCircleScale(1.0);

    const timeout = setTimeout(() => {
      setBreathingStep((prev) => (prev + 1) % breathingPhases.length);
    }, phase.duration);

    return () => clearTimeout(timeout);
  }, [breathingStep, breathingActive]);

  const startBreathing = () => {
    setBreathingActive(true);
    setBreathingStep(0);
    if (!breathingStarted) {
      logQuestProgress("Complete a breathing session");
      setBreathingStarted(true);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🌙 Sleep Aids</h2>

      <div style={styles.section}>
        <h3>🎵 Relaxing Music</h3>
        <button onClick={toggleMusic} style={styles.button}>
          {isPlaying ? "Pause Music" : "Play Music"}
        </button>
      </div>

      <div style={styles.section}>
        <h3>🫁 Breathing Exercise</h3>
        <div style={styles.breathingContainer}>
          <div
            style={{
              ...styles.breathingCircle,
              transform: `scale(${circleScale})`,
              transition: 'transform 2s ease-in-out',
            }}
          />
          <div style={styles.breathingLabel}>{breathingLabel}</div>
        </div>
        {!breathingActive && (
          <button onClick={startBreathing} style={styles.button}>
            Start Breathing
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  heading: {
    fontSize: '1.8rem',
    marginBottom: 20,
    color: '#2c3e50',
  },
  section: {
    marginBottom: 30,
  },
  button: {
    padding: '10px 16px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  breathingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  breathingCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#81d4fa',
    borderRadius: '50%',
    marginBottom: 10,
  },
  breathingLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
  },
};

export default SleepAids;
