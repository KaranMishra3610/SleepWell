import React from 'react';

const UserStats = ({ streak, badges }) => {
  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* Streak Display */}
      <div style={{
        backgroundColor: '#f1f8e9',
        padding: '20px',
        borderRadius: '12px',
        flex: '1',
        minWidth: '250px',
        textAlign: 'center',
        border: '2px solid #aed581',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔥</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#33691e' }}>
          {streak} Day{streak !== 1 ? 's' : ''}
        </div>
        <div style={{ fontSize: '1rem', color: '#558b2f', marginTop: '5px' }}>
          Current Sleep Streak
        </div>
      </div>

      {/* Badges Display */}
      {badges.length > 0 && (
        <div style={{
          backgroundColor: '#fffde7',
          padding: '20px',
          borderRadius: '12px',
          flex: '2',
          minWidth: '300px',
          border: '2px solid #fbc02d',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            color: '#f57f17',
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.25rem'
          }}>
            🏅 Your Achievements
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px'
          }}>
            {badges.map((badge, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  border: '1px solid #ffe082',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#424242'
                }}
              >
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✅</span>
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStats;
