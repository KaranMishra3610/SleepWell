from flask import Flask, request, jsonify
from flask_cors import CORS
from ml.sleep_model import predict_sleep_score
from ml.predictor import predict_next_score
from db.firestore import store_sleep_log, get_sleep_logs
from ai.stress_detector import detect_stress
from ai.sentiment_analyzer import analyze_sentiment
from ai.tips_generator import generate_tips
from ai.routine_recommendor import generate_routine
import tempfile
import firebase_admin_init
from firebase_admin import auth as firebase_auth, exceptions

app = Flask(__name__)
CORS(app)

def verify_token(req):
    auth_header = req.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    id_token = auth_header.split("Bearer ")[1]
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded['uid']
    except (firebase_auth.InvalidIdTokenError, exceptions.FirebaseError):
        return None

@app.route('/log', methods=['POST'])
def log_data():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.form.to_dict()
    image = request.files.get("image")
    for key in ["hours_slept", "stress_level", "caffeine", "screen_time"]:
        data[key] = float(data.get(key, 0))

    if not image or not data.get("journal"):
        return jsonify({"error": "Image and journal are required for stress analysis"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        image.save(tmp.name)
        stress_result = detect_stress(tmp.name)

    sentiment = analyze_sentiment(data["journal"])
    stress_level_numeric = float(stress_result.get("stress_level_numeric", 0))

    data["emotion"] = stress_result.get("emotion")
    data["stress_level"] = stress_level_numeric
    data["sentiment"] = sentiment

    sleep_score = predict_sleep_score(data)
    routine = generate_routine(data["hours_slept"], stress_level_numeric)
    tips = generate_tips(data)

    data["sleep_score"] = sleep_score

    store_sleep_log(user_id, data)

    return jsonify({
        "sleep_score": sleep_score,
        "routine": routine,
        "tips": tips,
        "sentiment": sentiment,
        "emotion": stress_result.get("emotion"),
        "stress_level_numeric": stress_level_numeric,
        "stress_level_label": stress_result.get("stress_level_label")
    })

@app.route('/analyze', methods=['POST'])
def analyze_with_image():
    data = request.form.to_dict()
    image = request.files.get("image")
    for key in ["hours_slept", "stress_level", "caffeine", "screen_time"]:
        data[key] = float(data.get(key, 0))

    if not image or not data.get("journal"):
        return jsonify({"error": "Image and journal are required"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        image.save(tmp.name)
        stress_result = detect_stress(tmp.name)

    sentiment = analyze_sentiment(data["journal"])
    stress_level_numeric = float(stress_result.get("stress_level_numeric", 0))

    data["emotion"] = stress_result.get("emotion")
    data["stress_level"] = stress_level_numeric
    data["sentiment"] = sentiment

    sleep_score = predict_sleep_score(data)
    routine = generate_routine(data["hours_slept"], stress_level_numeric)
    tips = generate_tips(data)

    return jsonify({
        "sleep_score": sleep_score,
        "routine": routine,
        "tips": tips,
        "sentiment": sentiment,
        "emotion": stress_result.get("emotion"),
        "stress_level_numeric": stress_level_numeric,
        "stress_level_label": stress_result.get("stress_level_label")
    })

@app.route('/history', methods=['GET'])
def fetch_logs():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    logs = get_sleep_logs(user_id)
    return jsonify(logs)

@app.route('/predict_next', methods=['POST'])
def predict():
    logs = request.json.get("logs")
    prediction = predict_next_score(logs)
    return jsonify({"predicted_score": prediction})

if __name__ == '__main__':
    app.run(debug=True)
