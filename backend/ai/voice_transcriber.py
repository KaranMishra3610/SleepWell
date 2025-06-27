# backend/ai/voice_transcriber.py

import whisper
import os
import tempfile

# Load Whisper model only once
model = whisper.load_model("base")  # use "tiny", "base", or "small" for faster inference

def transcribe_audio(file_path):
    try:
        result = model.transcribe(file_path)
        return result.get("text", "").strip()
    except Exception as e:
        print("❌ Transcription failed:", e)
        return ""
