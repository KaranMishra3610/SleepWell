import React, { useState, useEffect } from 'react';
import './BedtimeGenerator.css';
import { logQuestProgress } from '../utils/logQuestProgress';
import { getAuth } from "firebase/auth";
const BedtimeGenerator = () => {
  const [style, setStyle] = useState('story');
  const [theme, setTheme] = useState('space');
  const [age, setAge] = useState('young');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Load saved favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bedtimeFavorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const saveFavorites = (items) => {
    localStorage.setItem('bedtimeFavorites', JSON.stringify(items));
  };

 const fetchContent = async () => {
  setLoading(true);
  setContent('');
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error("User not logged in");

    const token = await user.getIdToken();

    const res = await fetch(`http://127.0.0.1:5000/bedtime_content?style=${style}&age=${age}&theme=${theme}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Add auth header
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();

    if (data?.content) {
      setContent(data.content);
      speakContent(data.content);
      await logQuestProgress("generate_bedtime_story");
    } else {
      throw new Error("No 'content' in response");
    }
  } catch (error) {
    console.error("Error fetching bedtime content:", error);
    setContent("Oops! Something went wrong. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  const speakContent = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    synth.speak(utterance);
  };

  const handleReplay = () => {
    if (content) {
      speakContent(content);
    }
  };

  const handleSaveFavorite = () => {
    const newItem = {
      style,
      theme,
      age,
      content,
      timestamp: new Date().toISOString()
    };
    const updated = [newItem, ...favorites];
    setFavorites(updated);
    saveFavorites(updated);
  };

  const themeImages = {
    space: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=800&q=80',
    animals: 'https://images.unsplash.com/photo-1601758123927-1984e4f0b1b1?auto=format&fit=crop&w=800&q=80',
    dreams: 'https://images.unsplash.com/photo-1533907650686-70576141c030?auto=format&fit=crop&w=800&q=80',
    nature: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
  };

  const renderFormattedContent = (text) => {
    const [title, ...rest] = text.split('\n');
    return (
      <>
        <h3 className="story-title">{title}</h3>
        <p>{rest.join('\n')}</p>
      </>
    );
  };

  return (
    <div className="bedtime-container">
      <h2>🌙 Bedtime {style === 'story' ? 'Story' : 'Lullaby'} Generator</h2>

      <div className="selectors">
        <div className="toggle-group">
          <label>Style:</label>
          <button className={style === 'story' ? 'active' : ''} onClick={() => setStyle('story')}>Story</button>
          <button className={style === 'lullaby' ? 'active' : ''} onClick={() => setStyle('lullaby')}>Lullaby</button>
        </div>

        <div className="toggle-group">
          <label>Age:</label>
          <button className={age === 'young' ? 'active' : ''} onClick={() => setAge('young')}>Young</button>
          <button className={age === 'older' ? 'active' : ''} onClick={() => setAge('older')}>Older</button>
        </div>

        <div className="toggle-group">
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="space">Space</option>
            <option value="animals">Animals</option>
            <option value="dreams">Dreams</option>
            <option value="nature">Nature</option>
          </select>
        </div>
      </div>

      <button className="generate-btn" onClick={fetchContent} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {content && (
        <div className="content-card">
          <img src={themeImages[theme]} alt={theme} className="theme-image" />
          {renderFormattedContent(content)}
          <div className="action-buttons">
            <button className="replay-btn" onClick={handleReplay}>🔊 Replay</button>
            <button className="save-btn" onClick={handleSaveFavorite}>📖 Save to Favorites</button>
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="favorites-list">
          <h3>⭐ Your Favorites</h3>
          {favorites.map((item, idx) => (
            <div className="favorite-item" key={idx}>
              {renderFormattedContent(item.content)}
              <small>🕒 {new Date(item.timestamp).toLocaleString()}</small>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BedtimeGenerator;
