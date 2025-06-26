# routes/insights.py

from flask import Blueprint, request, jsonify
from firebase_admin import firestore, auth as firebase_auth, exceptions
from flask_cors import cross_origin
from statistics import mean
import traceback

insights_bp = Blueprint('insights', __name__)
db = firestore.client()

# ✅ Verify Firebase token securely
def verify_token(req):
    auth_header = req.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    id_token = auth_header.split("Bearer ")[1]
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded['uid']
    except (firebase_auth.InvalidIdTokenError, exceptions.FirebaseError) as e:
        print("❌ Token verification failed:", e)
        return None

@insights_bp.route("/get_insights", methods=["GET", "OPTIONS"])
@cross_origin(origin='http://localhost:5173')  # ✅ Dev CORS
def get_insights():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        # ✅ Correct subcollection query based on structure: sleep_logs/{user_id}/entries
        docs = db.collection("sleep_logs").document(user_id).collection("entries") \
                 .order_by("timestamp", direction=firestore.Query.DESCENDING) \
                 .limit(14).stream()

        data = [doc.to_dict() for doc in docs]
        print(f"✅ Retrieved {len(data)} logs for user: {user_id}")

        if len(data) < 5:
            return jsonify({"message": "Not enough data to generate insights."})

        # Categorize scores based on habits
        high_caffeine_scores = []
        low_caffeine_scores = []
        high_screen_scores = []
        low_screen_scores = []

        for entry in data:
            score = entry.get("sleep_score")
            if score is None:
                continue

            caffeine = entry.get("caffeine", 0)
            screen_time = entry.get("screen_time", 0)

            if caffeine > 2:
                high_caffeine_scores.append(score)
            else:
                low_caffeine_scores.append(score)

            if screen_time > 2:
                high_screen_scores.append(score)
            else:
                low_screen_scores.append(score)

        insights = []

        if high_caffeine_scores and low_caffeine_scores:
            diff = mean(low_caffeine_scores) - mean(high_caffeine_scores)
            direction = "more" if diff > 0 else "less"
            insights.append(
                f"You sleep on average {abs(diff):.1f} points {direction} when your caffeine intake is low (≤ 2 units)."
            )

        if high_screen_scores and low_screen_scores:
            diff = mean(low_screen_scores) - mean(high_screen_scores)
            direction = "higher" if diff > 0 else "lower"
            insights.append(
                f"Your sleep score is {abs(diff):.1f} points {direction} on days with less than 2 hours of screen time after 9 PM."
            )

        return jsonify({"insights": insights or ["No strong correlations found. Keep tracking!"]})

    except Exception as e:
        print("❌ Insight generation failed:", e)
        traceback.print_exc()
        return jsonify({"error": "Something went wrong while generating insights."}), 500
