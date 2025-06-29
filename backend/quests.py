# quests.py

QUEST_LIST = [
    {
        "id": "log_sleep_once",
        "companion": "sage",
        "title": "Log your sleep once",
        "description": "Complete one sleep log using the Sage.",
        "xp": 25,
        "type": "single"
    },
    {
        "id": "log_3_sleeps",
        "companion": "tracker",
        "title": "Log sleep 3 times",
        "description": "Log your sleep on 3 different days.",
        "xp": 50,
        "type": "milestone"
    },
    {
        "id": "play_memory_calm",
        "companion": "healer",
        "title": "Play Memory Calm",
        "description": "Play the relaxing Memory Calm game once.",
        "xp": 25,
        "type": "single"
    },
    {
        "id": "set_sleep_reminder",
        "companion": "knight",
        "title": "Set a sleep reminder",
        "description": "Configure your preferred bedtime with the Knight.",
        "xp": 20,
        "type": "single"
    },
    {
        "id": "generate_story",
        "companion": "healer",
        "title": "Generate a bedtime story",
        "description": "Use the AI Bedtime Generator to create a story or lullaby.",
        "xp": 30,
        "type": "repeatable"
    }
]

def get_all_quests():
    return QUEST_LIST

def get_quests_by_companion(companion):
    return [q for q in QUEST_LIST if q["companion"] == companion]
