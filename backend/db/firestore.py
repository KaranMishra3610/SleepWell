from firebase_admin import firestore
from datetime import datetime
import os

# Initialize Firebase safely
import firebase_admin_init  # Ensures one-time initialization

db = firestore.client()

def store_sleep_log(user_id, data):
    """
    Stores a sleep log for the authenticated user with timestamp.
    Includes sleep_score if it's present in the data.
    """
    log = {
        "hours_slept": float(data.get("hours_slept", 0)),
        "caffeine": float(data.get("caffeine", 0)),
        "screen_time": float(data.get("screen_time", 0)),
        "stress_level": float(data.get("stress_level", 0)),
        "mood": data.get("mood", "neutral"),
        "journal": data.get("journal", ""),
        "timestamp": datetime.utcnow().isoformat()
    }

    # If sleep_score is provided (from /analyze), store it
    if "sleep_score" in data:
        log["sleep_score"] = float(data["sleep_score"])

    db.collection('sleep_logs').document(user_id).collection('entries').add(log)

def get_sleep_logs(user_id):
    """
    Fetches sleep logs ordered by timestamp for the user.
    Only essential fields are returned for graphing.
    """
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
