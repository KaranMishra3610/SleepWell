import React, { useState, useEffect } from 'react';
import './MemoryCalm.css';
import { memoryItems } from './memoryData';
import { logQuestProgress } from '../../utils/logQuestProgress';


const shuffle = (array) => {
  let shuffled = [...array, ...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.map((item, index) => ({ ...item, id: index, flipped: false, matched: false }));
};

const MemoryCalm = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [matches, setMatches] = useState(0);
  const [completed, setCompleted] = useState(false); // track for quest log

  useEffect(() => {
    setCards(shuffle(memoryItems));
  }, []);

  const handleFlip = (card) => {
    if (disabled || card.flipped || card.matched) return;

    const newCards = cards.map(c => c.id === card.id ? { ...c, flipped: true } : c);
    const newFlipped = [...flipped, card];

    setCards(newCards);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      setTimeout(() => {
        const [a, b] = newFlipped;
        if (a.name === b.name) {
          setCards(prev => prev.map(c =>
            c.name === a.name ? { ...c, matched: true } : c
          ));
          const newMatchCount = matches + 1;
          setMatches(newMatchCount);
          if (newMatchCount === memoryItems.length && !completed) {
            logQuestProgress("Complete the Memory Calm game");
            setCompleted(true);
          }
        } else {
          setCards(prev => prev.map(c =>
            (c.id === a.id || c.id === b.id) ? { ...c, flipped: false } : c
          ));
        }
        setFlipped([]);
        setDisabled(false);
      }, 700);
    }
  };

  return (
    <div className="memory-game" style={{
      backgroundColor: '#f3f7fa',
      border: '1px solid #cfd8dc',
      borderRadius: 12,
      padding: 25,
      textAlign: 'center',
      color: '#37474f'
    }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: 10 }}>🧠 Memory Calm</h2>
      <p style={{ fontSize: '1rem', color: '#546e7a', marginBottom: 20 }}>
        Match calming icons to sharpen your focus and relax your mind.
      </p>

      <div className="grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
        gap: '15px',
        justifyContent: 'center',
        padding: '10px 0'
      }}>
        {cards.map(card => (
          <div
            key={card.id}
            className={`card ${card.flipped || card.matched ? 'flipped' : ''}`}
            onClick={() => handleFlip(card)}
            style={{
              backgroundColor: '#fff',
              border: '2px solid #b0bec5',
              borderRadius: 10,
              padding: 10,
              fontSize: '1.8rem',
              cursor: card.flipped || card.matched ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              userSelect: 'none',
              textAlign: 'center'
            }}
          >
            <div className="front">
              {card.flipped || card.matched ? card.emoji : "🌑"}
            </div>
          </div>
        ))}
      </div>

      {matches === memoryItems.length && (
        <p style={{
          marginTop: 20,
          fontSize: '1.1rem',
          backgroundColor: '#c8e6c9',
          color: '#2e7d32',
          padding: '10px 15px',
          borderRadius: 8,
          display: 'inline-block'
        }}>
          ✨ You completed the game! Feel the calm 🧘‍♀️
        </p>
      )}
    </div>
  );
};

export default MemoryCalm;
