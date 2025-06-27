# ai/tips_generator.py

import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
HF_TOKEN = os.getenv("HF_API_TOKEN")
headers = {"Authorization": f"Bearer {HF_TOKEN}"}


def generate_tips(data):
    journal = data.get("journal", "").lower()
    mood = data.get("mood", "neutral").lower()
    emotion = data.get("emotion", "unknown").lower()
    sentiment = data.get("sentiment", {})
    polarity = sentiment.get("polarity", 0.0)
    sentiment_mood = sentiment.get("mood", "unknown").lower()

    # Enhanced prompt
    prompt = (
        "You are a friendly and empathetic sleep coach.\n"
        "Given the user's data below, generate exactly 3 personalized sleep tips.\n"
        "Be kind but informative. Do not repeat input facts. No intros or summaries.\n"
        "Make each tip specific to their situation. Mention nightmares or stress if applicable.\n\n"
        "User Data:\n"
        f"- Hours slept: {data.get('hours_slept', 0)}\n"
        f"- Screen time: {data.get('screen_time', 0)}\n"
        f"- Caffeine intake: {data.get('caffeine', 0)}\n"
        f"- Mood: {mood}\n"
        f"- Emotion: {emotion}\n"
        f"- Sentiment: {sentiment_mood} (Polarity: {polarity})\n"
        f"- Journal: \"{journal}\"\n\n"
        "Tips:"
    )

    try:
        payload = {"inputs": prompt, "parameters": {"max_new_tokens": 200, "temperature": 0.7}}
        resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=45)
        resp.raise_for_status()

        output = resp.json()[0]["generated_text"]
        tips_raw = output.split("Tips:")[-1]
        tips = [line.strip("•- ").strip() for line in tips_raw.split("\n") if len(line.strip()) > 10]
        return tips[:3] if tips else ["Keep up the good routine!"]

    except Exception as e:
        print("HF generate_tips failed:", e)

        # 🔁 Fallback logic (smarter)
        fallback = []

        hours = data.get("hours_slept", 0)
        if hours > 9:
            fallback.append("Try to limit sleep to 7–9 hours to avoid grogginess or sleep inertia.")
        elif hours < 6:
            fallback.append("Aim for at least 7 hours of sleep to feel more refreshed.")

        if data.get("screen_time", 0) > 3:
            fallback.append("Limit screen use before bed to reduce blue light disruption.")

        if data.get("caffeine", 0) > 1:
            fallback.append("Avoid caffeine after 2 PM to prevent it from affecting your sleep.")

        # Journal analysis
        if any(word in journal for word in ["nightmare", "dream", "scared", "horrified", "anxious"]):
            fallback.append("Try calming techniques before bed, like breathing exercises or gentle music.")

        if not fallback:
            fallback.append("Your current sleep habits look good! Stay consistent.")

        return fallback[:3]
