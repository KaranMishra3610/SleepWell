# ai/stress_detector.py

from deepface import DeepFace

def detect_stress(image_path):
    try:
        analysis = DeepFace.analyze(
            img_path=image_path,
            actions=['emotion'],
            enforce_detection=False
        )

        # Extract dominant emotion
        emotion_data = analysis[0]  # First face
        dominant_emotion = emotion_data.get('dominant_emotion', 'neutral')
        emotion_scores = emotion_data.get('emotion', {})

        # Stress-weighted score (sum of 'negative' emotion %)
        stress_emotions = ['angry', 'disgust', 'fear', 'sad']
        stress_score = sum([emotion_scores.get(e, 0) for e in stress_emotions])

        # Label
        if stress_score >= 60:
            level = "High"
        elif stress_score >= 30:
            level = "Moderate"
        else:
            level = "Low"

        return {
            "emotion": dominant_emotion,
            "stress_level_numeric": round(stress_score, 2),
            "stress_level_label": level
        }

    except Exception as e:
        print("❌ Stress detection failed:", e)
        return {
            "emotion": "unknown",
            "stress_level_numeric": 0.0,
            "stress_level_label": "Unknown"
        }
