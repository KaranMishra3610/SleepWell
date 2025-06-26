from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import tempfile
import firebase_admin_init
from ai.routine_recommendor import generate_custom_routine_tip
from firebase_admin import auth as firebase_auth, exceptions

from ml.sleep_model import predict_sleep_score
from ml.predictor import predict_next_score

from db.firestore import (
    store_sleep_log, get_sleep_logs,
    set_user_sleep_reminder, get_user_sleep_reminder,
    get_suggested_sleep_time,
    store_fcm_token, get_fcm_token,
    send_push_notification,
    get_streak, get_user_badges
)

from ai.stress_detector import detect_stress
from ai.sentiment_analyzer import analyze_sentiment
from ai.tips_generator import generate_tips

# 🧠 Import insights blueprint
from routes.insights import insights_bp

app = Flask(__name__)
CORS(app)

# -------------------- 🔐 AUTH --------------------

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

# ================== CORE FEATURES ===================

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

# ================== SLEEP REMINDER ROUTES ===================

@app.route('/set_reminder', methods=['POST'])
def set_reminder():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    preferred_time = request.json.get("preferred_sleep_time")
    if not preferred_time:
        return jsonify({"error": "preferred_sleep_time is required"}), 400

    set_user_sleep_reminder(user_id, preferred_time)

    token = get_fcm_token(user_id)
    if token:
        send_push_notification(token, "Reminder Set ✅", f"Sleep reminder set for {preferred_time}")

    return jsonify({"message": "Reminder time set successfully."})

@app.route('/get_reminder', methods=['GET'])
def get_reminder():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    sleep_time = get_user_sleep_reminder(user_id)
    return jsonify({"preferred_sleep_time": sleep_time or None})

@app.route('/get_smart_reminder', methods=['GET'])
def get_smart_reminder():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    suggested_time = get_suggested_sleep_time(user_id)
    return jsonify({"suggested_time": suggested_time or None})

# ================== 🔔 FCM SUPPORT ===================

@app.route('/store_fcm_token', methods=['POST'])
def save_fcm_token():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    token = request.json.get("token")
    if not token:
        return jsonify({"error": "FCM token required"}), 400

    store_fcm_token(user_id, token)
    return jsonify({"message": "Token saved successfully."})

@app.route('/trigger_fcm', methods=['POST', 'OPTIONS'])
@cross_origin()
def trigger_fcm():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    token = get_fcm_token(user_id)
    if not token:
        return jsonify({"error": "No FCM token registered"}), 400

    send_push_notification(token, "⏰ Sleep Reminder", "It's time to wind down and sleep well.")
    return jsonify({"message": "Push notification sent!"})

# ================== 🔥 STREAK TRACKING ===================

@app.route('/get_streak', methods=['GET'])
def fetch_streak():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    streak = get_streak(user_id)
    return jsonify({"streak": streak})

# ================== 🏅 BADGE SYSTEM ===================

@app.route('/get_badges', methods=['GET'])
def fetch_badges():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    badges = get_user_badges(user_id)
    return jsonify({"badges": badges or []})

@app.route('/routine_tip', methods=['POST'])
def routine_tip():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    tip = generate_custom_routine_tip(data)
    return jsonify({"tip": tip})

# ================== 💡 REGISTER BLUEPRINTS ===================

app.register_blueprint(insights_bp)

# ================== RUN APP ===================

if __name__ == '__main__':
    app.run(debug=True)
