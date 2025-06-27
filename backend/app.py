from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import tempfile
import firebase_admin_init
from datetime import datetime

from ai.routine_recommendor import generate_custom_routine_tip
from ai.routine_optimizer_agent import generate_optimized_routine_tips
from firebase_admin import auth as firebase_auth, exceptions
from ml.sleep_model import predict_sleep_score
from ml.predictor import predict_next_score
from db.firestore import (
    store_sleep_log, get_sleep_logs,
    set_user_sleep_reminder, get_user_sleep_reminder,
    get_suggested_sleep_time,
    store_fcm_token, get_fcm_token,
    send_push_notification,
    get_streak, get_user_badges,
    store_voice_journal,
    get_user_routine_history,
    store_generated_routine, get_latest_generated_routine
)
from ai.stress_detector import detect_stress
from ai.sentiment_analyzer import analyze_sentiment
from ai.tips_generator import generate_tips
from ai.voice_transcriber import transcribe_audio
from routes.insights import insights_bp

app = Flask(__name__)
CORS(app)

# 🔐 AUTH
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

# ================== CORE ANALYSIS ===================

def analyze_sleep_data(data, image):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        image.save(tmp.name)
        stress_result = detect_stress(tmp.name)

    sentiment = analyze_sentiment(data["journal"])
    stress_level_numeric = float(stress_result.get("stress_level_numeric", 0))

    data["emotion"] = stress_result.get("emotion")
    data["stress_level"] = stress_level_numeric
    data["sentiment"] = sentiment

    for field in ["wakeUp", "screenTime", "caffeineTime", "workoutTime", "lateMeal"]:
        data.setdefault(field, "")

    sleep_score = predict_sleep_score(data)
    routine = generate_custom_routine_tip(data)
    tips = generate_tips(data)

    return {
        "sleep_score": sleep_score,
        "routine": routine,
        "tips": tips,
        "sentiment": sentiment,
        "emotion": stress_result.get("emotion"),
        "stress_level_numeric": stress_level_numeric,
        "stress_level_label": stress_result.get("stress_level_label")
    }

# ================== ROUTES ===================

@app.route('/log', methods=['POST'])
def log_data():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.form.to_dict()
    image = request.files.get("image")
    for key in ["hours_slept", "stress_level", "caffeine", "screen_time"]:
        data[key] = float(data.get(key, 0))
    if not image or not data.get("journal", "").strip():
        return jsonify({"error": "Image and journal are required"}), 400
    result = analyze_sleep_data(data, image)
    data.update(result)
    store_sleep_log(user_id, data)
    return jsonify(result)

@app.route('/analyze', methods=['POST'])
def analyze_with_image():
    data = request.form.to_dict()
    image = request.files.get("image")
    for key in ["hours_slept", "stress_level", "caffeine", "screen_time"]:
        data[key] = float(data.get(key, 0))
    if not image or not data.get("journal", "").strip():
        return jsonify({"error": "Image and journal are required"}), 400
    return jsonify(analyze_sleep_data(data, image))

@app.route('/history', methods=['GET'])
def fetch_logs():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(get_sleep_logs(user_id))

@app.route('/predict_next', methods=['POST'])
def predict():
    logs = request.json.get("logs")
    return jsonify({"predicted_score": predict_next_score(logs)})

# ================== REMINDERS ===================

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
    return jsonify({"preferred_sleep_time": get_user_sleep_reminder(user_id)})

@app.route('/get_smart_reminder', methods=['GET'])
def get_smart_reminder():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"suggested_time": get_suggested_sleep_time(user_id)})

# ================== PUSH NOTIFICATIONS ===================

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

# ================== GAMIFICATION ===================

@app.route('/get_streak', methods=['GET'])
def fetch_streak():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"streak": get_streak(user_id)})

@app.route('/get_badges', methods=['GET'])
def fetch_badges():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"badges": get_user_badges(user_id)})

# ================== VOICE JOURNAL ===================

@app.route('/voice_journal', methods=['POST'])
def voice_journal():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    audio = request.files.get("audio")
    if not audio:
        return jsonify({"error": "No audio file provided"}), 400
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        audio.save(tmp.name)
        transcript = transcribe_audio(tmp.name)
    if not transcript:
        return jsonify({"error": "Transcription failed"}), 500
    sentiment = analyze_sentiment(transcript)
    stress_result = detect_stress(None, text_input=transcript)
    store_voice_journal(user_id, transcript, metadata={
        "sentiment": sentiment,
        "emotion": stress_result.get("emotion"),
        "stress_level": stress_result.get("stress_level_numeric"),
        "stress_label": stress_result.get("stress_level_label")
    })
    return jsonify({
        "transcript": transcript,
        "sentiment": sentiment,
        "emotion": stress_result.get("emotion"),
        "stress_level_numeric": stress_result.get("stress_level_numeric"),
        "stress_level_label": stress_result.get("stress_level_label")
    })

# ================== ROUTINE AGENT + ROUTINE TIP ===================

@app.route('/optimize_routine_agent', methods=['GET'])
def optimize_routine_agent():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    history = get_user_routine_history(user_id, limit=10)
    tips = generate_optimized_routine_tips(history)
    return jsonify({"tips": tips})

@app.route('/routine_tip', methods=['POST'])  # ✅ RESTORED
def routine_tip():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    tip = generate_custom_routine_tip(data)
    return jsonify({"tip": tip})

@app.route('/generate_routine_from_preferences', methods=['POST'])
def generate_user_defined_routine():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    try:
        activity_blocks = data.get('activity_blocks', [])

        if not activity_blocks:
            return jsonify({"error": "No activity blocks provided"}), 400

        routine = []
        for block in activity_blocks:
            start = block.get("start")
            end = block.get("end")
            label = block.get("activity")
            if not start or not end or not label:
                return jsonify({"error": "Each block must have start, end, and activity"}), 400

            # Validate time format
            try:
                datetime.strptime(start, "%H:%M")
                datetime.strptime(end, "%H:%M")
            except ValueError:
                return jsonify({"error": f"Invalid time format for block: {start} - {end}"}), 400

            routine.append({
                "time": f"{start} - {end}",
                "activity": label
            })

        store_generated_routine(user_id, routine)
        return jsonify({"routine": routine})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/load_latest_routine', methods=['GET'])
def load_latest_routine():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    routine = get_latest_generated_routine(user_id)
    if not routine:
        return jsonify({"error": "No routine found"}), 404
    return jsonify({"routine": routine})

# ================== BLUEPRINTS ===================
app.register_blueprint(insights_bp)

# ================== RUN ===================
if __name__ == '__main__':
    app.run(debug=True)
