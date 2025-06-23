import os
import requests
from dotenv import load_dotenv

load_dotenv()
token = os.getenv("HF_API_TOKEN")

HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
headers = {"Authorization": f"Bearer {token}"}

prompt = """
You are a friendly and empathetic sleep coach. 
Given the user's data below, generate exactly 3 concise, personalized tips to improve their sleep quality. 
Each tip should be on a new line. Do not include any introduction or summary.

User Data:
- Hours slept: 5
- Screen time: 8
- Caffeine intake: 3
- Mood: Sad
- Emotion: Angry
- Sentiment: Negative (Polarity: -0.7)
- Journal: "I'm tired and stressed all the time."

Tips:
"""

payload = {
    "inputs": prompt,
    "parameters": {
        "max_new_tokens": 150,
        "temperature": 0.7
    }
}

try:
    res = requests.post(HF_API_URL, headers=headers, json=payload, timeout=15)
    res.raise_for_status()
    output = res.json()[0]["generated_text"]

    # Extract only the part after "Tips:"
    if "Tips:" in output:
        tips_raw = output.split("Tips:")[1]
    else:
        tips_raw = output

    # Filter non-empty lines with decent length
    tips = [line.strip("•- ").strip() for line in tips_raw.split("\n") if len(line.strip()) > 10]

    print("\n=== Final Sleep Tips ===")
    for tip in tips[:3]:
        print("-", tip)

except Exception as e:
    print("❌ HuggingFace API call failed:", e)
    print("Raw Response:", res.text if 'res' in locals() else 'No response')
