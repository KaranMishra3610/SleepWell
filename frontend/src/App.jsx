import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SleepScoreGraph from './components/SleepScoreGraph';
import Login from './components/Login';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import WebcamCapture from './components/WebcamCapture';

const App = () => {
  const [formData, setFormData] = useState({
    hours_slept: '',
    mood: '',
    caffeine: '',
    screen_time: '',
    journal: ''
  });

  const [image, setImage] = useState(null);
  const [results, setResults] = useState({});
  const [sleepHistory, setSleepHistory] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchSleepHistory();
      }
    });
  }, []);

  const handleAnalyzeAndLog = async () => {
    if (!user || !image || !formData.journal) {
      alert("Please provide a journal entry and an image for analysis.");
      return;
    }

    try {
      const idToken = await auth.currentUser.getIdToken();
      const form = new FormData();

      Object.entries({
        ...formData,
        hours_slept: Number(formData.hours_slept),
        caffeine: Number(formData.caffeine),
        screen_time: Number(formData.screen_time)
      }).forEach(([key, value]) => form.append(key, value));

      form.append("image", image);

      const res = await axios.post('http://127.0.0.1:5000/log', form, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setResults(res.data);
      fetchSleepHistory();
    } catch (err) {
      console.error("Failed to analyze or log data", err);
      alert("Analysis failed. Make sure all inputs are valid.");
    }
  };

  const fetchSleepHistory = async () => {
    if (!user) return;
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await axios.get('http://127.0.0.1:5000/history', {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      setSleepHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const getSentimentStyle = (polarity) => {
    if (polarity > 0.2) return { color: "green", emoji: "😊" };
    if (polarity < -0.2) return { color: "red", emoji: "😟" };
    return { color: "gray", emoji: "😐" };
  };

  if (!user) {
    return <Login onSuccess={() => window.location.reload()} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Sleep Wellness Dashboard</h1>

      {/* INPUT FORM */}
      <label>Hours Slept:
        <input type="number" value={formData.hours_slept} onChange={(e) => setFormData({ ...formData, hours_slept: e.target.value })} />
      </label><br />
      <label>Screen Time (hrs):
        <input type="number" value={formData.screen_time} onChange={(e) => setFormData({ ...formData, screen_time: e.target.value })} />
      </label><br />
      <label>Caffeine Intake:
        <input type="number" value={formData.caffeine} onChange={(e) => setFormData({ ...formData, caffeine: e.target.value })} />
      </label><br />
      <label>Mood:
        <input type="text" value={formData.mood} onChange={(e) => setFormData({ ...formData, mood: e.target.value })} />
      </label><br />
      <label>Journal Entry:
        <textarea value={formData.journal} onChange={(e) => setFormData({ ...formData, journal: e.target.value })}></textarea>
      </label><br />
      <h3>Live Face Capture:</h3>
<WebcamCapture onCapture={(file) => setImage(file)} />


      <button onClick={handleAnalyzeAndLog} style={{ marginTop: 10 }}>Analyze & Save Sleep Log</button>

      <hr />

      {/* GRAPH & RESULTS */}
      {sleepHistory.length > 0 && <SleepScoreGraph history={sleepHistory} />}

      {results.tips && (
        <>
          <h3>Sleep Tips:</h3>
          <ul>{results.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}</ul>
        </>
      )}

      {results.routine && (
        <>
          <h3>Recommended Routine:</h3>
          <p>{results.routine}</p>
        </>
      )}

      {results.sentiment && (
        <>
          <h3>Sentiment Analysis:</h3>
          <p>
            Mood:{" "}
            <strong style={{ color: getSentimentStyle(results.sentiment.polarity).color }}>
              {results.sentiment.mood} {getSentimentStyle(results.sentiment.polarity).emoji}
            </strong>{" "}
            (Polarity: {results.sentiment.polarity.toFixed(2)})
          </p>
        </>
      )}

      {results.emotion && (
        <>
          <h3>Detected Emotion:</h3>
          <p>{results.emotion}</p>
        </>
      )}

      {(results.stress_level_numeric !== undefined && results.stress_level_label) && (
        <>
          <h3>Detected Stress Level:</h3>
          <p>
            {results.stress_level_numeric.toFixed(1)} / 10 – <strong>{results.stress_level_label}</strong>
          </p>
        </>
      )}

      <hr />
      <h3>Raw Results:</h3>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
};

export default App;
