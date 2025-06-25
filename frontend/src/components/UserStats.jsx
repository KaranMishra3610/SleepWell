import React from 'react';

const UserStats = ({ streak, badges }) => {
  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* Streak Display */}
      <div style={{
        backgroundColor: '#e0f7fa',
        padding: '20px',
        borderRadius: '12px',
        flex: '1',
        minWidth: '250px',
        textAlign: 'center',
        border: '2px solid #00acc1'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔥</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00695c' }}>
          {streak} Day{streak !== 1 ? 's' : ''}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#00695c', marginTop: '5px' }}>
          Current Sleep Streak
        </div>
      </div>

      {/* Badges Display */}
      {badges.length > 0 && (
        <div style={{
          backgroundColor: '#fff3e0',
          padding: '20px',
          borderRadius: '12px',
          flex: '2',
          minWidth: '300px',
          border: '2px solid #ff9800'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: '#e65100',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
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
                  fontSize: '0.95rem',
                  border: '1px solid #ffcc02',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
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