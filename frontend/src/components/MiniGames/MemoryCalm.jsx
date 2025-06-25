import React, { useState, useEffect } from 'react';
import './MemoryCalm.css';
import { memoryItems } from './memoryData';

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
          setMatches(prev => prev + 1);
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
    <div className="memory-game">
      <h2>🧠 Memory Calm</h2>
      <p>Match calming icons to win and relax.</p>

      <div className="grid">
        {cards.map(card => (
          <div
            key={card.id}
            className={`card ${card.flipped || card.matched ? 'flipped' : ''}`}
            onClick={() => handleFlip(card)}
          >
            <div className="front">
              {card.flipped || card.matched ? card.emoji : "🌑"}
            </div>
          </div>
        ))}
      </div>

      {matches === memoryItems.length && (
        <p className="complete">✨ You completed the game! 🧘</p>
      )}
    </div>
  );
};

export default MemoryCalm;
