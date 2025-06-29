import React, { useState, useRef } from 'react';

const VoiceJournal = ({ onTranscription }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        sendToBackend(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      setError("Microphone access denied or not available");
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      // Stop all tracks to release microphone
      const tracks = mediaRecorderRef.current.stream?.getTracks();
      tracks?.forEach(track => track.stop());
    }
  };

  const sendToBackend = async (blob) => {
    setLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("file", blob, "journal.webm");

    try {
      const res = await fetch("http://localhost:5000/transcribe_audio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setTranscribedText(data.text || "No transcription available");
      onTranscription && onTranscription(data.text);
    } catch (err) {
      console.error("Transcription error:", err);
      setError("Failed to transcribe audio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🎙️ Voice Journal</h3>

      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      <div style={styles.buttonContainer}>
        <button 
          onClick={recording ? stopRecording : startRecording}
          style={{
            ...styles.recordButton,
            ...(recording ? styles.recordButtonActive : {})
          }}
          disabled={loading}
        >
          {recording ? "⏹ Stop Recording" : "🎤 Start Recording"}
        </button>
      </div>

      {loading && (
        <div style={styles.loading}>
          🔄 Transcribing audio...
        </div>
      )}

      {audioBlob && !loading && (
        <div style={styles.audioContainer}>
          <audio 
            controls 
            src={URL.createObjectURL(audioBlob)} 
            style={styles.audioPlayer}
          />
        </div>
      )}

      {transcribedText && (
        <div style={styles.transcriptionContainer}>
          <strong style={styles.transcriptionLabel}>📝 Transcribed Text:</strong>
          <p style={styles.transcriptionText}>{transcribedText}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    margin: '1rem 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  title: {
    fontSize: '1.4rem',
    color: '#2c3e50',
    marginBottom: '1rem',
    textAlign: 'center',
    fontWeight: '600',
  },
  error: {
    backgroundColor: '#fee',
    color: '#d32f2f',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    border: '1px solid #ffcdd2',
  },
  buttonContainer: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  recordButton: {
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '160px',
  },
  recordButtonActive: {
    backgroundColor: '#dc3545',
    animation: 'pulse 1.5s infinite',
  },
  loading: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
    padding: '1rem',
    fontSize: '0.9rem',
  },
  audioContainer: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  audioPlayer: {
    width: '100%',
    maxWidth: '300px',
    borderRadius: '8px',
  },
  transcriptionContainer: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  transcriptionLabel: {
    color: '#495057',
    fontSize: '1rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  transcriptionText: {
    color: '#343a40',
    lineHeight: '1.5',
    margin: '0',
    fontSize: '0.95rem',
  },
};

export default VoiceJournal;