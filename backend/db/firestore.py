from firebase_admin import firestore, messaging
from datetime import datetime
import os

# Initialize Firebase safely
import firebase_admin_init

db = firestore.client()

# -------------------------
# 💤 Sleep Log Management
# -------------------------

def store_sleep_log(user_id, data):
    log = {
        "hours_slept": float(data.get("hours_slept", 0)),
        "caffeine": float(data.get("caffeine", 0)),
        "screen_time": float(data.get("screen_time", 0)),
        "stress_level": float(data.get("stress_level", 0)),
        "mood": data.get("mood", "neutral"),
        "journal": data.get("journal", ""),
        "timestamp": datetime.utcnow().isoformat()
    }
    if "sleep_score" in data:
        log["sleep_score"] = float(data["sleep_score"])
    db.collection('sleep_logs').document(user_id).collection('entries').add(log)

def get_sleep_logs(user_id):
    docs = db.collection('sleep_logs').document(user_id).collection('entries') \
        .order_by("timestamp").stream()
    logs = []
    for doc in docs:
        d = doc.to_dict()
        if "sleep_score" in d:
            logs.append({
                "hours_slept": float(d.get("hours_slept", 0)),
                "sleep_score": float(d.get("sleep_score", 0)),
                "timestamp": d.get("timestamp", "")
            })
    return logs

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
    """
    Stores the user's FCM token.
    """
    db.collection("users").document(user_id).set({
        "fcm_token": fcm_token
    }, merge=True)

def get_fcm_token(user_id):
    """
    Retrieves stored FCM token for the user.
    """
    doc = db.collection("users").document(user_id).get()
    if doc.exists:
        return doc.to_dict().get("fcm_token")
    return None

def send_push_notification(token, title, body):
    """
    Sends a push notification via Firebase Cloud Messaging.
    """
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        token=token
    )
    response = messaging.send(message)
    print("✅ Push sent:", response)
