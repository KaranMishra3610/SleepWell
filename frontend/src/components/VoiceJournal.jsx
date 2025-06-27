import React, { useState, useRef } from 'react';

const VoiceJournal = ({ onTranscription }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
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
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const sendToBackend = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob, "journal.webm");

    try {
      const res = await fetch("http://localhost:5000/transcribe_audio", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setTranscribedText(data.text);
      onTranscription && onTranscription(data.text);
    } catch (err) {
      console.error("Transcription error:", err);
    }
  };

  return (
    <div className="voice-journal">
      <h3>🎙️ Voice Journal</h3>

      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "⏹ Stop Recording" : "🎤 Start Recording"}
      </button>

      {audioBlob && (
        <audio controls src={URL.createObjectURL(audioBlob)} style={{ marginTop: "10px" }} />
      )}

      {transcribedText && (
        <div style={{ marginTop: "15px", padding: "10px", background: "#f4f4f4" }}>
          <strong>📝 Transcribed Text:</strong>
          <p>{transcribedText}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceJournal;
