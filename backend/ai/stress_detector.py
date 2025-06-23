from deepface import DeepFace

def detect_stress(image_path):
    analysis = DeepFace.analyze(img_path=image_path, actions=['emotion'], enforce_detection=False)
    emotion = analysis[0]['dominant_emotion']
    stress_indicators = ['angry', 'disgust', 'fear', 'sad']
    stress_level = "High" if emotion in stress_indicators else "Low"
    return {"emotion": emotion, "stress_level": stress_level}
