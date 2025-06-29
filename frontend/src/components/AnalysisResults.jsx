import React from 'react';

const AnalysisResults = ({ results, getSentimentStyle }) => {
  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #e9ecef',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const headerStyle = {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#495057',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  // Normalize stress score between 0–10 and cap extremes
  const getNormalizedStress = (value) => {
    const val = Math.min(10, Math.max(0, value)); // ensure 0 ≤ val ≤ 10
    return val.toFixed(1);
  };

  return (
    <div>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '25px',
        color: '#2c3e50',
        fontSize: '2rem'
      }}>
        📊 Analysis Results
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px'
      }}>

        {/* Sleep Tips */}
        {results.tips && (
          <div style={cardStyle}>
            <h3 style={headerStyle}>💡 Personalized Sleep Tips</h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {results.tips.map((tip, idx) => (
                <li key={idx} style={{
                  padding: '10px',
                  marginBottom: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  borderLeft: '4px solid #28a745'
                }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Routine */}
        {results.routine && (
          <div style={cardStyle}>
            <h3 style={headerStyle}>🌙 Recommended Routine</h3>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              margin: 0,
              padding: '15px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              color: '#1976d2'
            }}>
              {results.routine}
            </p>
          </div>
        )}

        {/* Sentiment Analysis */}
        {results.sentiment && (
          <div style={cardStyle}>
            <h3 style={headerStyle}>🎭 Mood Analysis</h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2rem' }}>
                {getSentimentStyle(results.sentiment.polarity).emoji}
              </div>
              <div>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: getSentimentStyle(results.sentiment.polarity).color
                }}>
                  {results.sentiment.mood}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  Polarity: {results.sentiment.polarity.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detected Emotion */}
        {results.emotion && (
          <div style={cardStyle}>
            <h3 style={headerStyle}>😊 Facial Emotion Detection</h3>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: '#fff3e0',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f57c00'
              }}>
                {results.emotion}
              </div>
            </div>
          </div>
        )}

        {/* Stress Level */}
        {(results.stress_level_numeric !== undefined && results.stress_level_label) && (
          <div style={cardStyle}>
            <h3 style={headerStyle}>📊 Stress Level Assessment</h3>
            <div style={{
              textAlign: 'center',
              padding: '20px'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: results.stress_level_numeric > 7 ? '#dc3545' :
                       results.stress_level_numeric > 4 ? '#ffc107' : '#28a745'
              }}>
                {getNormalizedStress(results.stress_level_numeric)}/10
              </div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginTop: '10px',
                color: '#495057'
              }}>
                {results.stress_level_label}
              </div>
              <div style={{
                width: '100%',
                height: '10px',
                backgroundColor: '#e9ecef',
                borderRadius: '5px',
                marginTop: '15px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(100, (results.stress_level_numeric / 10) * 100)}%`,
                  height: '100%',
                  backgroundColor: results.stress_level_numeric > 7 ? '#dc3545' :
                                  results.stress_level_numeric > 4 ? '#ffc107' : '#28a745',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Raw Results (Collapsible) */}
      <details style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <summary style={{
          cursor: 'pointer',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#495057'
        }}>
          🔍 View Raw Analysis Data
        </summary>
        <pre style={{
          backgroundColor: '#ffffff',
          padding: '15px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '0.9rem',
          border: '1px solid #dee2e6'
        }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default AnalysisResults;
