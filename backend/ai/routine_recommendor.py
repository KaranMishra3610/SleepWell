from transformers import pipeline
import torch

# Load local model (flan-t5-base)
generator = pipeline(
    "text2text-generation",
    model="google/flan-t5-base",
    device=0 if torch.cuda.is_available() else -1
)

def generate_custom_routine_tip(data, past_feedback=None):
    for key in ["wakeUp", "screenTime", "caffeineTime", "workoutTime", "lateMeal"]:
        data.setdefault(key, "")

    screen_time = data.get("screenTime", "")
    caffeine_time = data.get("caffeineTime", "")
    late_meal = data.get("lateMeal", "")
    wake_time = data.get("wakeUp", "")
    workout_time = data.get("workoutTime", "")

    feedback_text = ""
    if past_feedback:
        examples = []
        for fb in past_feedback[:3]:
            tip = fb.get("tip", "")
            inputs = fb.get("inputs", {})
            examples.append(f"Inputs: {inputs}\nHelpful Tip: {tip}\n")
        feedback_text = "\n---\nPrevious helpful tips:\n" + "\n".join(examples)

    prompt = (
        "You are a highly analytical sleep wellness expert.\n"
        "Evaluate the user's routine and suggest exactly 3 improvements.\n"
        "ONLY suggest tips for suboptimal habits. No praise, no summaries.\n"
        "Avoid stating obvious facts. Focus on what should be improved.\n"
        f"{feedback_text}\n\n"
        "Current routine:\n"
        f"- Wake-up time: {wake_time}\n"
        f"- Screen time after 9PM (in hours): {screen_time}\n"
        f"- Last caffeine intake time: {caffeine_time}\n"
        f"- Workout time: {workout_time}\n"
        f"- Heavy meal close to bedtime: {late_meal}\n\n"
        "Sleep Improvement Tips:"
    )

    try:
        result = generator(prompt, max_new_tokens=250)[0]["generated_text"]
        tips_raw = result.split("Tips:")[-1]
        tips = [line.strip("•- ").strip() for line in tips_raw.split("\n") if len(line.strip()) > 10]
        return "\n".join(tips[:3]) if tips else "No major issues found in current routine."

    except Exception as e:
        print("⚠️ Local LLM generation failed:", e)

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
