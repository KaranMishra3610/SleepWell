# ai/routine_recommendor.py

import os
import requests
from dotenv import load_dotenv

# Load Hugging Face API token
load_dotenv()
HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
HF_TOKEN = os.getenv("HF_API_TOKEN")
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

def generate_custom_routine_tip(data):
    prompt = (
        "You are a highly analytical sleep wellness expert.\n"
        "Your job is to evaluate the user's current routine and suggest exactly 3 improvements "
        "they can make to get better sleep.\n"
        "ONLY suggest tips where the user's routine is not optimal. "
        "Do NOT repeat any input. "
        "Avoid praise. Just give clear, constructive suggestions.\n"
        "Be specific, practical, and avoid stating obvious facts.\n\n"
        f"- Wake-up time: {data.get('wakeUp', '')}\n"
        f"- Screen time after 9PM (in hours): {data.get('screenTime', '')}\n"
        f"- Last caffeine intake time: {data.get('caffeineTime', '')}\n"
        f"- Workout time: {data.get('workoutTime', '')}\n"
        f"- Heavy meal close to bedtime: {data.get('lateMeal', '')}\n\n"
        "Sleep Improvement Tips:"
    )

    try:
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 200,
                "temperature": 0.7,
                "top_p": 0.9
            }
        }
        resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=15)
        resp.raise_for_status()

        output = resp.json()[0]["generated_text"]
        tips_raw = output.split("Tips:")[-1]
        tips = [line.strip("•- ").strip() for line in tips_raw.split("\n") if len(line.strip()) > 10]
        return "\n".join(tips[:3]) if tips else "No major issues found in current routine."

    except Exception as e:
        print("⚠️ LLM generation failed:", e)

        # Fallback: evaluate and suggest changes using static rules
        fallback = []
        try:
            if float(data.get("screenTime", 0)) > 1.5:
                fallback.append("Reduce screen exposure after 9 PM to improve melatonin levels.")
        except:
            pass

        try:
            if int(data.get("caffeineTime", "00:00").split(":")[0]) >= 16:
                fallback.append("Avoid caffeine after 4 PM to support restful sleep.")
        except:
            pass

        if data.get("lateMeal", "").lower() in ["yes", "true", "y"]:
            fallback.append("Avoid heavy meals at least 2 hours before bed.")

        if not fallback:
            fallback.append("Current routine seems balanced. Maintain consistency.")
        return "\n".join(fallback)
