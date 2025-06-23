# ai/tips_generator.py

import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
HF_TOKEN = os.getenv("HF_API_TOKEN")
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

def generate_tips(data):
    prompt = (
        "You are a friendly and empathetic sleep coach.\n"
        "Given the user's data below, generate exactly 3 concise, personalized tips to improve their sleep quality.\n"
        "Each tip should be on a new line. Do not include any introduction or summary.\n\n"
        "User Data:\n"
        f"- Hours slept: {data.get('hours_slept', 0)}\n"
        f"- Screen time: {data.get('screen_time', 0)}\n"
        f"- Caffeine intake: {data.get('caffeine', 0)}\n"
        f"- Mood: {data.get('mood', 'neutral')}\n"
        f"- Emotion: {data.get('emotion', 'unknown')}\n"
        f"- Sentiment: {data.get('sentiment', {}).get('mood', 'Unknown')} "
        f"(Polarity: {data.get('sentiment', {}).get('polarity', 0.0)})\n"
        f"- Journal: \"{data.get('journal', '')}\"\n\n"
        "Tips:"
    )

    try:
        payload = {"inputs": prompt, "parameters": {"max_new_tokens": 150, "temperature": 0.7}}
        resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=15)
        resp.raise_for_status()

        output = resp.json()[0]["generated_text"]

        # Extract after "Tips:"
        tips_raw = output.split("Tips:")[-1]
        tips = [line.strip("•- ").strip() for line in tips_raw.split("\n") if len(line.strip()) > 10]
        return tips[:3] if tips else ["Keep up the good routine!"]

    except Exception as e:
        print("HF generate_tips failed:", e)

        # Simple fallback logic
        fallback = []
        if data.get("hours_slept", 0) < 6:
            fallback.append("Try to get at least 7 hours of sleep tonight.")
        if data.get("screen_time", 0) > 4:
            fallback.append("Reduce screen time before bed to avoid blue light exposure.")
        if data.get("caffeine", 0) > 2:
            fallback.append("Avoid caffeine after lunch to help you fall asleep easier.")
        if not fallback:
            fallback.append("Your habits look great! Keep it up.")
        return fallback
