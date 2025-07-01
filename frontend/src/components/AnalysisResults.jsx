import React from 'react';

const AnalysisResults = ({ results, getSentimentStyle }) => {
  // Shared styles
  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #e9ecef',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const headerStyle = {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#2c3e50',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '2px solid #f8f9fa',
    paddingBottom: '8px'
  };

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '24px',
    marginBottom: '30px'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Main Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        padding: '20px',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
      }}>
        <h2 style={{
          fontSize: '2.2rem',
          fontWeight: '700',
          margin: '0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          📊 Analysis Results
        </h2>
        <p style={{
          fontSize: '1rem',
          margin: '8px 0 0 0',
          opacity: '0.9'
        }}>
          Your personalized sleep insights and recommendations
        </p>
      </div>

      <div style={containerStyle}>
        {/* Sleep Tips Section */}
        {results.tips && (
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            border: '1px solid #d4edda'
          }}>
            <h3 style={{
              ...headerStyle,
              color: '#155724',
              borderBottom: '2px solid rgba(21, 87, 36, 0.1)'
            }}>
              💡 Personalized Sleep Tips
            </h3>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {results.tips.map((tip, idx) => (
                  <li key={idx} style={{
                    padding: '12px 16px',
                    marginBottom: '10px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderLeft: '4px solid #28a745',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    transition: 'transform 0.2s ease'
                  }}>
                    <span style={{ fontWeight: '500' }}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Sentiment Analysis Section */}
        {results.sentiment && (
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            border: '1px solid #f0c4a3'
          }}>
            <h3 style={{
              ...headerStyle,
              color: '#8b4513',
              borderBottom: '2px solid rgba(139, 69, 19, 0.1)'
            }}>
              🎭 Mood Analysis
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                fontSize: '3rem',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}>
                {getSentimentStyle(results.sentiment.polarity).emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: getSentimentStyle(results.sentiment.polarity).color,
                  marginBottom: '4px'
                }}>
                  {results.sentiment.mood}
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#6c757d',
                  backgroundColor: '#f8f9fa',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  display: 'inline-block'
                }}>
                  Polarity: {results.sentiment.polarity.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Facial Emotion Detection Section */}
        {results.emotion && (
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
            border: '1px solid #e1bee7'
          }}>
            <h3 style={{
              ...headerStyle,
              color: '#6a1b9a',
              borderBottom: '2px solid rgba(106, 27, 154, 0.1)'
            }}>
              😊 Facial Emotion Detection
            </h3>
            <div style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#6a1b9a',
                textTransform: 'capitalize',
                letterSpacing: '1px'
              }}>
                {results.emotion}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#666',
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                Detected from your uploaded image
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Raw Results Section */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #dee2e6',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <details style={{ margin: 0 }}>
          <summary style={{
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: '600',
            padding: '20px 24px',
            color: '#495057',
            backgroundColor: '#e9ecef',
            borderBottom: '1px solid #dee2e6',
            transition: 'background-color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🔍 View Raw Analysis Data
            <span style={{
              fontSize: '0.8rem',
              color: '#6c757d',
              fontWeight: '400',
              marginLeft: 'auto'
            }}>
              Click to expand
            </span>
          </summary>
          <div style={{ padding: '20px' }}>
            <pre style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.9rem',
              border: '1px solid #dee2e6',
              margin: 0,
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              lineHeight: '1.4',
              color: '#2c3e50'
            }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default AnalysisResults;
