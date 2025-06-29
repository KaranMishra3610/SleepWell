import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
HF_TOKEN = os.getenv("HF_API_TOKEN")
headers = {"Authorization": f"Bearer {HF_TOKEN}"}


def generate_tips(data, past_feedback=None):
    journal = data.get("journal", "").lower()
    mood = data.get("mood", "neutral").lower()
    emotion = data.get("emotion", "unknown").lower()
    sentiment = data.get("sentiment", {})
    polarity = sentiment.get("polarity", 0.0)
    sentiment_mood = sentiment.get("mood", "unknown").lower()

    screen_time_after_9 = data.get("screenTime", "")
    caffeine_time = data.get("caffeineTime", "")
    workout_time = data.get("workoutTime", "")
    late_meal = data.get("lateMeal", "")

    feedback_text = ""
    if past_feedback:
        examples = []
        for fb in past_feedback[:3]:
            tip = fb.get("tip", "")
            inputs = fb.get("inputs", {})
            examples.append(
                f"User inputs: {inputs}\nHelpful tip: {tip}\n"
            )
        feedback_text = "\n---\nPreviously effective tips:\n" + "\n".join(examples)

    prompt = (
        "You are a friendly and empathetic sleep coach.\n"
        "Given the user's current state, generate exactly 3 personalized sleep tips.\n"
        "Be kind but specific. Mention nightmares or stress if applicable. No praise or summaries.\n"
        "User Data:\n"
        f"- Hours slept: {data.get('hours_slept', 0)}\n"
        f"- Screen time duration: {data.get('screen_time', 0)}\n"
        f"- Screen time after 9PM: {screen_time_after_9}\n"
        f"- Caffeine intake (cups): {data.get('caffeine', 0)}\n"
        f"- Last caffeine intake time: {caffeine_time}\n"
        f"- Workout time: {workout_time}\n"
        f"- Had late meal?: {late_meal}\n"
        f"- Mood: {mood}\n"
        f"- Emotion: {emotion}\n"
        f"- Sentiment: {sentiment_mood} (Polarity: {polarity})\n"
        f"- Journal: \"{journal}\"\n\n"
        "Tips:"
    )

    try:
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 350,
                "temperature": 0.7,
                "top_k": 50,
                "top_p": 0.95
            }
        }
        resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=45)
        resp.raise_for_status()

        output = resp.json()[0]["generated_text"]
        tips_raw = output.split("Tips:")[-1]
        tips = [line.strip("•- ").strip() for line in tips_raw.split("\n") if len(line.strip()) > 10]
        return tips[:3] if tips else ["Keep up the good routine!"]

    except Exception as e:
        print("HF generate_tips failed:", e)

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

        if any(word in journal for word in ["nightmare", "dream", "scared", "horrified", "anxious"]):
            fallback.append("Try calming techniques before bed, like breathing exercises or gentle music.")

        if not fallback:
            fallback.append("Your current sleep habits look good! Stay consistent.")

        return fallback[:3]
