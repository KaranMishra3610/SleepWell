import React, { useState } from 'react';
import WebcamCapture from './WebcamCapture.jsx';

const SleepLogger = ({ onAnalyze }) => {
  const [formData, setFormData] = useState({
    hours_slept: '',
    mood: '',
    caffeine: '',
    screen_time: '',
    journal: ''
  });
  const [image, setImage] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onAnalyze(formData, image);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '8px',
    transition: 'border-color 0.3s ease'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '15px',
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#333'
  };

  return (
    <div>
      {/* Sleep Data Form */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '25px'
      }}>
        <div>
          <label style={labelStyle}>
            💤 Hours Slept:
            <input 
              type="number" 
              min="0" 
              max="24" 
              step="0.5"
              value={formData.hours_slept} 
              onChange={(e) => handleInputChange('hours_slept', e.target.value)}
              style={inputStyle}
              placeholder="e.g., 7.5"
            />
          </label>

          <label style={labelStyle}>
            📱 Screen Time (hours):
            <input 
              type="number" 
              min="0" 
              max="24" 
              step="0.5"
              value={formData.screen_time} 
              onChange={(e) => handleInputChange('screen_time', e.target.value)}
              style={inputStyle}
              placeholder="e.g., 3"
            />
          </label>

          <label style={labelStyle}>
            ☕ Caffeine Intake (cups):
            <input 
              type="number" 
              min="0" 
              max="20"
              value={formData.caffeine} 
              onChange={(e) => handleInputChange('caffeine', e.target.value)}
              style={inputStyle}
              placeholder="e.g., 2"
            />
          </label>
        </div>

        <div>
          <label style={labelStyle}>
            😊 Current Mood:
            <input 
              type="text" 
              value={formData.mood} 
              onChange={(e) => handleInputChange('mood', e.target.value)}
              style={inputStyle}
              placeholder="e.g., tired, energetic, stressed"
            />
          </label>

          <label style={labelStyle}>
            📝 Journal Entry:
            <textarea 
              value={formData.journal} 
              onChange={(e) => handleInputChange('journal', e.target.value)}
              style={{
                ...inputStyle,
                height: '120px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              placeholder="How was your sleep? Any dreams or disturbances?"
            />
          </label>
        </div>
      </div>

      {/* Webcam Section */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '2px dashed #6c757d'
      }}>
        <h3 style={{ 
          margin: '0 0 15px 0', 
          color: '#495057',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📸 Face Capture for Emotion Analysis
        </h3>
        <WebcamCapture onCapture={(file) => setImage(file)} />
        {image && (
          <div style={{ marginTop: '10px', color: '#28a745', fontWeight: '500' }}>
            ✅ Image captured successfully
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={handleSubmit}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0,123,255,0.3)'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          🔍 Analyze & Save Sleep Log
        </button>
      </div>
    </div>
  );
};

export default SleepLogger;