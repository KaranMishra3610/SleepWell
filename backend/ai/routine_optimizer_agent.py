# backend/ai/routine_optimizer_agent.py

from datetime import datetime
from statistics import mean

USE_LLM = True

try:
    from transformers import pipeline
    summarizer = pipeline("text-generation", model="gpt2", tokenizer="gpt2") if USE_LLM else None
except Exception:
    summarizer = None

def analyze_routine_logs(routine_logs):
    if not routine_logs:
        return ["Not enough routine data to provide suggestions yet."]

    suggestions = []

    screen_time_after_9 = [log.get("screenTime", 0) for log in routine_logs if isinstance(log.get("screenTime"), (int, float))]
    caffeine_after_7 = [log.get("caffeineTime", "") for log in routine_logs if "caffeineTime" in log]
    workout_times = [log.get("workoutTime", "") for log in routine_logs if "workoutTime" in log]
    late_meals = [log.get("lateMeal", "") for log in routine_logs if "lateMeal" in log]
    wake_up_times = [log.get("wakeUp", "") for log in routine_logs if "wakeUp" in log]
    sleep_scores = [log.get("sleep_score") for log in routine_logs if log.get("sleep_score") is not None]

    # Sleep Score Insight
    if sleep_scores:
        avg_score = mean(sleep_scores)
        if avg_score < 75:
            suggestions.append(f"Your average sleep score is {avg_score:.1f}, which is below ideal. Let’s fine-tune your routine!")
        else:
            suggestions.append(f"Great! Your average sleep score is {avg_score:.1f}. Just a few tweaks can help even more!")

    # Screen Time
    if screen_time_after_9 and mean(screen_time_after_9) > 3:
        suggestions.append("You’re averaging over 3 hours of screen time at night. Cutting back can boost melatonin levels.")

    # Caffeine
    late_caffeine_count = sum(1 for t in caffeine_after_7 if t and int(t.split(":")[0]) >= 19)
    if late_caffeine_count > len(caffeine_after_7) / 2:
        suggestions.append("Try avoiding caffeine after 7 PM to help your body unwind naturally.")

    # Late Meals
    late_meal_count = sum(1 for t in late_meals if t and int(t.split(":")[0]) >= 21)
    if late_meal_count > len(late_meals) / 2:
        suggestions.append("Eating late at night can disrupt sleep. Aim to finish dinner by 8:30 PM.")

    # Workouts
    if all(not time for time in workout_times):
        suggestions.append("Light exercise during the day helps regulate your body clock and sleep better.")

    # Wake-Up Variability
    try:
        wake_hours = [int(t.split(":")[0]) for t in wake_up_times if t]
        if max(wake_hours) - min(wake_hours) > 2:
            suggestions.append("Your wake-up time varies a lot. Keeping it consistent helps your circadian rhythm.")
    except:
        pass

    if not suggestions:
        return ["Your routine looks great! Keep up the consistent healthy habits. 😴"]

    return suggestions


def personalize_with_llm(tips):
    if not summarizer or not tips:
        return tips

    prompt = "Convert the following health tips into friendly and motivational advice:\n" + "\n".join(f"- {tip}" for tip in tips)

    try:
        result = summarizer(prompt, max_length=180, do_sample=True, temperature=0.7)[0]['generated_text']
        lines = result.split("\n")
        filtered = [line.strip(" -•") for line in lines if line.strip() and not line.lower().startswith("convert")]
        return filtered or tips
    except Exception as e:
        print("LLM generation failed:", e)
        return tips


def generate_optimized_routine_tips(routine_logs):
    raw_tips = analyze_routine_logs(routine_logs)
    return personalize_with_llm(raw_tips) if USE_LLM else raw_tips
