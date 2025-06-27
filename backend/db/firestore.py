from firebase_admin import firestore, messaging
from datetime import datetime, timedelta
import os

# Initialize Firebase safely
import firebase_admin_init

db = firestore.client()

# -------------------------
# 💤 Sleep Log Management
# -------------------------

def store_sleep_log(user_id, data):
    log = {
        "user_id": user_id,
        "hours_slept": float(data.get("hours_slept", 0)),
        "caffeine": float(data.get("caffeine", 0)),
        "screen_time": float(data.get("screen_time", 0)),
        "stress_level": float(data.get("stress_level", 0)),
        "mood": data.get("mood", "neutral"),
        "journal": data.get("journal", ""),
        "timestamp": datetime.utcnow().isoformat()
    }

    # Routine-related fields (store in lowercase for consistency)
    for key in ["wakeUp", "screenTime", "caffeineTime", "workoutTime", "lateMeal"]:
        if key in data:
            log[key.lower()] = data[key]

    if "sleep_score" in data:
        log["sleep_score"] = float(data["sleep_score"])

    db.collection('sleep_logs').document(user_id).collection('entries').add(log)

    update_streak(user_id)
    evaluate_and_award_badges(user_id)

def get_sleep_logs(user_id):
    docs = db.collection('sleep_logs').document(user_id).collection('entries') \
        .order_by("timestamp").stream()
    logs = []
    for doc in docs:
        d = doc.to_dict()
        logs.append({
            "hours_slept": float(d.get("hours_slept", 0)),
            "sleep_score": float(d.get("sleep_score", 0)),
            "timestamp": d.get("timestamp", ""),
            "screen_time": float(d.get("screen_time", 0)),
            "caffeine": float(d.get("caffeine", 0)),
            "mood": d.get("mood", "Unknown"),
        })
    return logs

# -------------------------
# 🔥 Streak Tracking
# -------------------------

def update_streak(user_id):
    entries = db.collection('sleep_logs').document(user_id).collection('entries') \
        .order_by("timestamp", direction=firestore.Query.DESCENDING).limit(10).stream()

    dates = []
    for doc in entries:
        ts = doc.to_dict().get("timestamp")
        if ts:
            try:
                dt = datetime.fromisoformat(ts).date()
                dates.append(dt)
            except:
                continue

    if not dates:
        return

    dates = sorted(list(set(dates)), reverse=True)

    streak = 1
    for i in range(1, len(dates)):
        if (dates[i - 1] - dates[i]).days == 1:
            streak += 1
        else:
            break

    db.collection("users").document(user_id).set({
        "current_streak": streak
    }, merge=True)

def get_streak(user_id):
    doc = db.collection("users").document(user_id).get()
    if doc.exists:
        return doc.to_dict().get("current_streak", 0)
    return 0

# -------------------------
# 🏅 Badge System
# -------------------------

def evaluate_and_award_badges(user_id):
    logs_ref = db.collection('sleep_logs').document(user_id).collection('entries')
    logs = [doc.to_dict() for doc in logs_ref.stream()]
    badges = set()

    current_streak = get_streak(user_id)
    if current_streak >= 3:
        badges.add("3-Day Streak Champ")
    if current_streak >= 7:
        badges.add("Weekly Streak Hero")

    if len(logs) >= 5:
        badges.add("Consistent Logger")

    for log in logs:
        if float(log.get("hours_slept", 0)) >= 8:
            badges.add("Full 8 Hours Achiever")
        if float(log.get("sleep_score", 0)) >= 90:
            badges.add("High Sleep Score 💤")

    db.collection("users").document(user_id).set({
        "badges": list(badges)
    }, merge=True)

def get_user_badges(user_id):
    doc = db.collection("users").document(user_id).get()
    if doc.exists:
        return doc.to_dict().get("badges", [])
    return []

# -------------------------
# ⏰ Sleep Reminder Support
# -------------------------

def set_user_sleep_reminder(user_id, sleep_time_str):
    db.collection('users').document(user_id).set({
        "preferred_sleep_time": sleep_time_str
    }, merge=True)

def get_user_sleep_reminder(user_id):
    doc = db.collection('users').document(user_id).get()
    if doc.exists:
        return doc.to_dict().get("preferred_sleep_time", None)
    return None

def get_suggested_sleep_time(user_id):
    logs = db.collection('sleep_logs').document(user_id).collection('entries') \
        .order_by("timestamp", direction=firestore.Query.DESCENDING).limit(7).stream()

    sleep_times = []
    for doc in logs:
        d = doc.to_dict()
        ts = d.get("timestamp")
        if ts:
            try:
                dt = datetime.fromisoformat(ts)
                sleep_times.append(dt)
            except:
                continue

    if not sleep_times:
        return None

    avg_hour = int(sum(t.hour for t in sleep_times) / len(sleep_times))
    avg_minute = int(sum(t.minute for t in sleep_times) / len(sleep_times))
    return f"{avg_hour:02d}:{avg_minute:02d}"

# -------------------------
# 🔔 FCM Push Notification Support
# -------------------------

def store_fcm_token(user_id, fcm_token):
    db.collection("users").document(user_id).set({
        "fcm_token": fcm_token
    }, merge=True)

def get_fcm_token(user_id):
    doc = db.collection("users").document(user_id).get()
    if doc.exists:
        return doc.to_dict().get("fcm_token")
    return None

def send_push_notification(token, title, body):
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        token=token
    )
    response = messaging.send(message)

# -------------------------
# 🎙 Voice Journal Support
# -------------------------

def store_voice_journal(user_id, transcript_text, metadata=None):
    doc = {
        "text": transcript_text,
        "timestamp": firestore.SERVER_TIMESTAMP,
    }
    if metadata:
        doc.update(metadata)

    db.collection("voice_journals").document(user_id).collection("entries").add(doc)

# -------------------------
# 🤖 Routine Optimization Agent Support
# -------------------------

def get_user_routine_history(user_id, limit=10):
    """
    Fetch recent routine inputs (screen time, caffeine time, etc.) for AI agent.
    """
    entries = db.collection("sleep_logs").document(user_id).collection("entries") \
        .order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).stream()

    history = []
    for doc in entries:
        d = doc.to_dict()
        history.append({
            "wake_up": d.get("wake_up", ""),
            "screen_time": d.get("screen_time", ""),
            "caffeine_time": d.get("caffeine_time", ""),
            "workout_time": d.get("workout_time", ""),
            "late_meal": d.get("late_meal", ""),
            "sleep_score": d.get("sleep_score", None),
            "hours_slept": d.get("hours_slept", None),
            "timestamp": d.get("timestamp", "")
        })

    return history

def store_generated_routine(user_id, routine):
    db.collection("users").document(user_id).collection("routines").add({
        "routine": routine,
        "timestamp": firestore.SERVER_TIMESTAMP
    })

def get_latest_generated_routine(user_id):
    docs = db.collection("users").document(user_id).collection("routines") \
        .order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1).stream()
    for doc in docs:
        return doc.to_dict().get("routine")
    return None