from transformers import pipeline
import torch

# Load improved deterministic local text generation pipeline
generator = pipeline(
    "text2text-generation",
    model="google/flan-t5-large",
    device=0 if torch.cuda.is_available() else -1,
    model_kwargs={"temperature": 0.7, "do_sample": False}
)

# Disallowed phrases to prevent bad suggestions
DISALLOWED_PHRASES = [
    "drink a cup of coffee before bed",
    "consume caffeine before sleep",
    "have coffee before sleeping",
    "caffeine before bed",
    "energy drink before bed",
    "take a nap right before bed",
    "exercise vigorously before sleep"
]

def generate_tips(data, past_feedback=None):
    def safe(val):
        return str(val) if val else "None"

    journal = data.get("journal", "").lower()
    mood = data.get("mood", "neutral").lower()
    emotion = data.get("emotion", "unknown").lower()
    sentiment = data.get("sentiment", {})
    polarity = sentiment.get("polarity", 0.0)
    sentiment_mood = sentiment.get("mood", "unknown").lower()

    hours_slept = safe(data.get("hours_slept", 0))
    screen_time = safe(data.get("screen_time", 0))
    caffeine = safe(data.get("caffeine", 0))
    screen_time_after_9 = safe(data.get("screenTime", ""))
    caffeine_time = safe(data.get("caffeineTime", ""))
    workout_time = safe(data.get("workoutTime", ""))
    late_meal = safe(data.get("lateMeal", ""))

    feedback_text = ""
    if past_feedback:
        examples = []
        for fb in past_feedback[:3]:
            tip = fb.get("tip", "")
            inputs = fb.get("inputs", {})
            examples.append(f"User inputs: {inputs}\nHelpful tip: {tip}\n")
        feedback_text = "\n---\nPreviously effective tips:\n" + "\n".join(examples)

    illness_detected = any(w in journal for w in ["sick", "ill", "fever", "unwell", "cold"])
    stress_detected = any(w in journal for w in ["stress", "tired", "burnout", "anxious", "overwhelmed"])

    illness_note = ""
    if illness_detected:
        illness_note += "\nNote: The user mentioned feeling physically sick. Emphasize rest, hydration, and gentle care."
    if stress_detected:
        illness_note += "\nNote: The user seems emotionally stressed. Offer calming and grounding advice."

    # Improved prompt to encourage diversity
    prompt = (
        "You are a thoughtful and empathetic sleep wellness coach.\n"
        "Generate exactly 3 DIFFERENT and DIVERSE sleep improvement tips. Each tip must focus on a different aspect of sleep hygiene.\n"
        "Categories to choose from: environment, routine, relaxation, timing, diet, technology, physical comfort.\n"
        "Avoid repeating similar advice. Make each tip unique and actionable.\n"
        "Avoid suggesting caffeine, naps near bedtime, or heavy workouts late at night.\n"
        f"{feedback_text}\n"
        "User Profile:\n"
        f"- Hours slept: {hours_slept}\n"
        f"- Screen time: {screen_time} hours\n"
        f"- Caffeine intake: {caffeine} cups\n"
        f"- Mood: {mood}\n"
        f"- Emotion (face): {emotion}\n"
        f"- Sentiment (journal): {sentiment_mood} (Polarity: {polarity})\n"
        f"- Journal: \"{journal}\"\n"
        f"{illness_note}\n"
        "Provide 3 distinct sleep tips (one per line):\n"
        "1. "
    )

    max_attempts = 3
    attempt = 0
    
    while attempt < max_attempts:
        try:
            # Try different temperature values for more diversity
            temp = 0.7 + (attempt * 0.2)  # 0.7, 0.9, 1.1
            
            # Update generator temperature
            generator.model.config.temperature = temp
            generator.model.config.do_sample = True if temp > 0.8 else False
            
            result = generator(prompt, max_new_tokens=200, num_return_sequences=1)[0]["generated_text"]
            print(f"🧪 Raw LLM Output (attempt {attempt + 1}):", result)

            tips = []
            seen = set()

            # Parse the output more intelligently
            # First try to split by numbered items (1. 2. 3. etc.)
            import re
            
            # Split by numbers followed by periods or common delimiters
            numbered_items = re.split(r'(?:^|\s)(\d+\.)', result.strip())
            
            # If that doesn't work well, try splitting by newlines and periods
            if len(numbered_items) < 4:  # Should have at least 4 parts if 3 numbered items
                # Try splitting by sentence endings and numbers
                potential_tips = re.split(r'(?:\d+\.|\n|;\s)', result.strip())
            else:
                # Use numbered items (skip first empty element and number markers)
                potential_tips = [numbered_items[i] for i in range(2, len(numbered_items), 2)]
            
            print(f"🔍 Found {len(potential_tips)} potential tips: {potential_tips}")
            
            for raw_tip in potential_tips:
                if not raw_tip:
                    continue
                    
                # Clean the tip
                clean = raw_tip.strip("•-1234567890. ").strip()
                
                # Remove category prefixes like "Relaxation:", "Timing:", etc.
                if ":" in clean:
                    parts = clean.split(":", 1)
                    if len(parts) > 1:
                        clean = parts[1].strip()
                
                # Skip if too short or empty
                if not clean or len(clean) < 15:
                    continue
                    
                # Check for disallowed phrases
                if any(p.lower() in clean.lower() for p in DISALLOWED_PHRASES):
                    print(f"🚫 Skipped disallowed: {clean}")
                    continue
                
                # Simple duplicate detection
                clean_lower = clean.lower().strip()
                is_duplicate = False
                
                for existing_tip in tips:
                    existing_lower = existing_tip.lower().strip()
                    
                    # Check for exact matches
                    if clean_lower == existing_lower:
                        is_duplicate = True
                        break
                    
                    # Check for high similarity (>60% word overlap for more lenient matching)
                    clean_words = set(clean_lower.split())
                    existing_words = set(existing_lower.split())
                    
                    if len(clean_words) > 3 and len(existing_words) > 3:  # Only for substantial tips
                        overlap = len(clean_words & existing_words)
                        similarity = overlap / min(len(clean_words), len(existing_words))
                        if similarity > 0.6:
                            is_duplicate = True
                            break
                
                if not is_duplicate:
                    tips.append(clean)
                    print(f"✅ Added tip {len(tips)}: {clean}")
                    if len(tips) == 3:
                        break
                else:
                    print(f"🔄 Skipped duplicate: {clean}")

            if len(tips) >= 3:
                return tips[:3]
            else:
                print(f"⚠️ Only got {len(tips)} unique tips on attempt {attempt + 1}")
                attempt += 1

        except Exception as e:
            print(f"⚠️ LLM attempt {attempt + 1} failed:", e)
            attempt += 1

    # If all attempts failed, use enhanced fallback logic
    print("⚠️ All LLM attempts failed, using enhanced fallback")
    return generate_fallback_tips(data, journal, hours_slept, screen_time, caffeine, illness_detected, stress_detected)

def generate_fallback_tips(data, journal, hours_slept, screen_time, caffeine, illness_detected, stress_detected):
    """Generate fallback tips with better variety"""
    fallback = []
    
    # Sleep duration tips
    try:
        h = float(hours_slept)
        if h > 9:
            fallback.append("Try to limit sleep to 7–9 hours to avoid grogginess and maintain your natural sleep rhythm.")
        elif h < 6:
            fallback.append("Aim for at least 7 hours of sleep nightly to allow your body proper recovery time.")
        elif 6 <= h <= 9:
            fallback.append("Your sleep duration looks good! Try to maintain this consistent schedule.")
    except:
        fallback.append("Establish a consistent sleep schedule by going to bed and waking up at the same time daily.")

    # Screen time tips
    try:
        if float(screen_time) > 3:
            fallback.append("Create a 'digital sunset' by avoiding screens 1-2 hours before bedtime to reduce blue light exposure.")
        else:
            fallback.append("Consider using blue light filters on devices if you must use them in the evening.")
    except:
        fallback.append("Establish a relaxing pre-sleep routine without electronic devices.")

    # Caffeine tips
    try:
        if float(caffeine) > 2:
            fallback.append("Limit caffeine intake after 2 PM since it can stay in your system for 6-8 hours.")
        elif float(caffeine) > 0:
            fallback.append("Try switching to herbal tea in the afternoon to avoid late-day caffeine effects.")
        else:
            fallback.append("Stay hydrated throughout the day, but reduce fluid intake 2 hours before bed.")
    except:
        fallback.append("Monitor your caffeine intake and consider how it might affect your sleep quality.")

    # Mood/journal-based tips
    if any(word in journal for word in ["nightmare", "dream", "scared", "horrified", "anxious"]):
        fallback.append("Practice deep breathing exercises or progressive muscle relaxation before bed to calm your mind.")
    
    if stress_detected:
        fallback.append("Try journaling or meditation before bed to help process the day's stressors.")
    
    if illness_detected:
        fallback.append("Focus on extra rest and hydration while you recover - your body needs more sleep when fighting illness.")

    # Environment tips
    fallback.extend([
        "Keep your bedroom cool (65-68°F), dark, and quiet for optimal sleep conditions.",
        "Consider using blackout curtains or a white noise machine to improve your sleep environment.",
        "Try a warm bath or shower before bed to help your body temperature drop naturally.",
        "Practice gratitude by thinking of three positive things from your day as you fall asleep."
    ])

    # Remove duplicates and return 3 tips
    unique_tips = []
    seen_words = set()
    
    for tip in fallback:
        # Simple deduplication based on key words
        key_words = set(tip.lower().split()[:3])
        if not key_words.intersection(seen_words):
            unique_tips.append(tip)
            seen_words.update(key_words)
            if len(unique_tips) == 3:
                break
    
    # If still not enough, add generic tips
    while len(unique_tips) < 3:
        generic_tips = [
            "Maintain a consistent sleep schedule even on weekends.",
            "Create a calming bedtime ritual that signals to your body it's time to rest.",
            "Ensure your mattress and pillows are comfortable and supportive."
        ]
        for tip in generic_tips:
            if tip not in unique_tips:
                unique_tips.append(tip)
                if len(unique_tips) == 3:
                    break
    
    return unique_tips[:3]
