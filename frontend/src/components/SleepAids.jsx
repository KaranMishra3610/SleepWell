// src/components/SleepAids.jsx
import React, { useRef, useState } from 'react';
import calmMusic from '../assets/calm_music.mp3';

const SleepAids = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f3e5f5',
      padding: '25px',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <h3 style={{ fontSize: '1.5rem', color: '#6a1b9a', marginBottom: '10px' }}>
        🎵 <strong>Sleep Aid: Calming Music</strong>
      </h3>
      <p style={{ color: '#4a148c', marginBottom: '20px' }}>
        Relax your mind before sleep with soothing sounds.
      </p>
      <button 
        onClick={toggleMusic}
        style={{
          backgroundColor: '#1976d2',
          color: '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {isPlaying ? '⏸️ Pause Music' : '▶️ Play Music'}
      </button>
      <audio ref={audioRef} src={calmMusic} loop preload="auto" />
    </div>
  );
};

export default SleepAids;
