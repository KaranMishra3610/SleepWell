from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import tempfile
import firebase_admin_init
from datetime import datetime
from ai.bedtime_generator import generate_bedtime_story
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
    get_streak, get_user_badges,
    store_voice_journal,
    get_user_routine_history,
    save_tip_feedback, get_helpful_tips_and_inputs,
    award_xp, get_xp,
    get_user_quests, mark_quest_completed,
    get_user_quests_by_companion  # ✅ NEW
)
from ai.stress_detector import detect_stress
from ai.sentiment_analyzer import analyze_sentiment
from ai.tips_generator import generate_tips
from ai.voice_transcriber import transcribe_audio
from routes.insights import insights_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})


# ------------------ AUTH ------------------ #

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

# ------------------ ANALYSIS ------------------ #

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
        "stress_level_numeric": stress_result.get("stress_level_numeric"),
        "stress_level_label": stress_result.get("stress_level_label")
    }

# ------------------ ROUTES ------------------ #

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
    award_xp(user_id, 25)

    # ✅ Auto quest checks
    from db.firestore import get_sleep_logs, get_streak
    if len(get_sleep_logs(user_id)) >= 1:
        mark_quest_completed(user_id, "log_sleep_once")
    if get_streak(user_id) >= 3:
        mark_quest_completed(user_id, "log_3_nights")

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

@app.route('/submit_tip_feedback', methods=['POST'])
def submit_tip_feedback():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    tip = data.get("tip")
    feedback = data.get("feedback")
    inputs = data.get("inputs", {})
    if not tip or feedback not in ["helpful", "not helpful"]:
        return jsonify({"error": "Invalid input"}), 400
    save_tip_feedback(user_id, tip, feedback, inputs)
    if feedback == "helpful":
        award_xp(user_id, 10)
    return jsonify({"message": "Feedback recorded"})

# ------------------ REMINDERS ------------------ #

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

# ------------------ FCM PUSH ------------------ #

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

# ------------------ GAMIFICATION ------------------ #

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

@app.route('/get_xp', methods=['GET'])
def fetch_xp():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"xp": get_xp(user_id)})

# ------------------ QUEST SYSTEM ------------------ #

@app.route('/get_quests', methods=['GET'])
def get_quests():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"quests": get_user_quests(user_id)})

@app.route('/get_quests/<companion>', methods=['GET'])
def get_quests_by_companion(companion):
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"quests": get_user_quests_by_companion(user_id, companion)})

@app.route('/complete_quest', methods=['POST'])
def complete_quest():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    quest_id = data.get("quest_id")
    if not quest_id:
        return jsonify({"error": "Quest ID is required"}), 400
    success = mark_quest_completed(user_id, quest_id)
    if not success:
        return jsonify({"message": "Quest already completed or invalid ID"}), 200
    return jsonify({"message": f"Quest '{quest_id}' marked as completed and XP awarded."})

@app.route('/api/quest_progress', methods=['POST', 'OPTIONS'])
@cross_origin()
def quest_progress():
    if request.method == 'OPTIONS':
        return '', 200  # preflight check success

    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    quest_name = data.get("quest")

    if not quest_name:
        return jsonify({"error": "Missing quest name"}), 400

    success = mark_quest_completed(user_id, quest_name)
    if not success:
        return jsonify({"message": "Quest already completed or invalid"}), 200
    return jsonify({"message": f"Quest '{quest_name}' marked as completed and XP awarded."})

# ------------------ VOICE JOURNAL ------------------ #

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
    award_xp(user_id, 15)

    # ✅ Auto quest
    mark_quest_completed(user_id, "complete_voice_journal")

    return jsonify({
        "transcript": transcript,
        "sentiment": sentiment,
        "emotion": stress_result.get("emotion"),
        "stress_level_numeric": stress_result.get("stress_level_numeric"),
        "stress_level_label": stress_result.get("stress_level_label")
    })

# ------------------ ROUTINE AGENT ------------------ #

@app.route('/optimize_routine_agent', methods=['GET'])
def optimize_routine_agent():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    history = get_user_routine_history(user_id, limit=10)
    tips = generate_custom_routine_tip({}, past_feedback=history)
    return jsonify({"tips": tips})

@app.route('/routine_tip', methods=['POST'])
def routine_tip():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    feedback = get_helpful_tips_and_inputs(user_id)
    tip = generate_custom_routine_tip(data, past_feedback=feedback)
    return jsonify({"tip": tip})

# ------------------ STORY / LULLABY ------------------ #

@app.route('/bedtime_content', methods=['GET'])
def get_bedtime_content():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    style = request.args.get("style", "story")
    age_group = request.args.get("age", "young")
    theme = request.args.get("theme", "dreams")
    
    # ✅ Mark quest complete on story generation
    mark_quest_completed(user_id, "generate_bedtime_story")

    content = generate_bedtime_story(style=style, age_group=age_group, theme=theme)
    return jsonify({"content": content})


@app.route('/mark_sleep_healer_used', methods=['POST'])
def mark_sleep_healer_used():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # Mark the use_sleep_healer quest complete
    success = mark_quest_completed(user_id, "use_sleep_healer")
    if not success:
        return jsonify({"message": "Quest already completed or invalid"}), 200
    return jsonify({"message": "Sleep Healer quest completed and XP awarded!"})

# ------------------ BLUEPRINTS ------------------ #

app.register_blueprint(insights_bp)

# ------------------ START APP ------------------ #

if __name__ == '__main__':
    app.run(debug=True)