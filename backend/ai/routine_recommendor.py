# ai/routine_recommendor.py

import os
import requests
from dotenv import load_dotenv

load_dotenv()
HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
HF_TOKEN = os.getenv("HF_API_TOKEN")
headers = {"Authorization": f"Bearer {HF_TOKEN}"}


def generate_custom_routine_tip(data):
    # Ensure required fields exist
    for key in ["wakeUp", "screenTime", "caffeineTime", "workoutTime", "lateMeal"]:
        data.setdefault(key, "")

    screen_time = data.get("screenTime", "")
    caffeine_time = data.get("caffeineTime", "")
    late_meal = data.get("lateMeal", "")
    wake_time = data.get("wakeUp", "")
    workout_time = data.get("workoutTime", "")

    prompt = (
        "You are a highly analytical sleep wellness expert.\n"
        "Evaluate the user's routine and suggest exactly 3 improvements.\n"
        "ONLY suggest tips for suboptimal habits. No repetition or praise. Be constructive.\n"
        "Avoid stating obvious facts. Focus on what should be improved.\n\n"
        f"- Wake-up time: {wake_time}\n"
        f"- Screen time after 9PM (in hours): {screen_time}\n"
        f"- Last caffeine intake time: {caffeine_time}\n"
        f"- Workout time: {workout_time}\n"
        f"- Heavy meal close to bedtime: {late_meal}\n\n"
        "Sleep Improvement Tips:"
    )

    try:
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 250,
                "temperature": 0.7,
                "top_p": 0.9
            }
        }
        resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=45)
        resp.raise_for_status()

        output = resp.json()[0]["generated_text"]
        tips_raw = output.split("Tips:")[-1]
        tips = [line.strip("•- ").strip() for line in tips_raw.split("\n") if len(line.strip()) > 10]
        return "\n".join(tips[:3]) if tips else "No major issues found in current routine."

    except Exception as e:
        print("⚠️ LLM generation failed:", e)

        # ⚠️ Fallback suggestions based on logic
        fallback = []

        try:
            if float(screen_time) > 1.5:
                fallback.append("Reduce screen exposure after 9 PM to improve melatonin production.")
        except:
            pass

        try:
            if int(caffeine_time.split(":")[0]) >= 16:
                fallback.append("Avoid caffeine after 4 PM to prevent sleep disturbances.")
        except:
            pass

        if late_meal.lower() in ["yes", "true", "y"]:
            fallback.append("Avoid heavy meals at least 2 hours before going to bed.")

        if not fallback:
            fallback.append("Your current routine looks balanced. Keep it consistent.")

        return "\n".join(fallback)
