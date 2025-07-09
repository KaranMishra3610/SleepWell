# SleepWell: Become the Dreamy One  

Welcome to *SleepWell*, a solo-developed system where all AI runs locally, offering a gamified well-being experience where you become **The Dreamy One** — a mindful sleeper assisted by four mystical companions.

> Explore. Reflect. Rest. Repeat.

---

## TL;DR for Judges

- **SleepWell** is a solo-built, full-stack wellness experience that turns sleep improvement into a magical adventure — complete with quests, XP, calming rituals, bedtime stories, and AI insights.

- **Local AI-first: All core ML**  including webcam emotion recognition (OpenCV + DeepFace), journal sentiment analysis (Hugging Face), and a custom sleep score model — runs fully offline in both branches, ensuring privacy and responsiveness. Only the routine advisor LLM differs between branches (local vs Hugging Face API).

- **LLM-Powered Routine Advisor**: Get personalized tips from a smart language AI (Hugging Face API in main branch, local FLAN-T5 in offline branch)

- **Gamified Companions**: Choose between four mystical guides — The Sage, The Knight, The Healer, and The Tracker — each unlocking unique quests, habit tracking, breathing tools, calming games, and reflective journaling.

> A deeply integrated blend of AI, emotional intelligence, and habit-forming UX — made by one developer under time pressure and while unwell.

---

## Core Gameplay: Quests, XP & Growth

SleepWell isn’t just a sleep tracker — it’s built to motivate through quests, XP, and habit-reinforcing rewards.

- ️ Companion Quests: Each companion provides you with distinct sleep-related challenges  
- XP System: Quest completion rewards you with XP and allows you to level up  
- Badges & Streaks: Develop habit and be rewarded  
- Adaptive Insights: Understand which habits contribute to or detract from your sleep  

<br>

> Evolve wiser with The Sage, stronger with The Knight, calmer with The Healer, and more aware with The Tracker.

---

## Choose Your Magical Companion

Every companion assists you in mastering a unique facet of sleep health:

---

### The Tracker – Master of Patterns
> Assists in staying on top and marking progress in the long-term.

- Sleep Score Graphs – Visualizes sleep trends based on your logs  
- Streak Counter – Monitors how frequently you stick to good habits  
- Badge System – Gets achievements for consistency and development  
- Emotion Pie Chart – Visualizes emotional trends from the user’s journal entries, powered by The Sage’s insights.

---

### The Sage – Keeper of Reflection  
> Guides your inner self through thoughtful journaling and personalized feedback.

- Sleep Logger – Log hours slept, caffeine/screen time, dreams  
- Sleep Score Prediction – Custom AI model estimates your sleep quality based on details like hours slept, caffeine intake, and other habits  
- Comparative Insights – Examine how your routines (specifically caffeine, screen time) impact your sleep  
- Routine Advisor – Get personalized advice powered by a smart language AI (runs via Hugging Face)  
- Feedback to Insights – Provide feedback to suggestions given by the Routine Advisor for reinforcement learning  
- Sentiment and Emotion Analysis – Sentiment analysis done through Hugging Face models and webcam emotion recognition using DeepFace

---

### The Knight – Guardian of Ritual  
> Assists you in protecting your bedtime and establishing solid nighttime routines.

- Sleep Reminders – Set bedtime reminders  
- Supports Global Quest System – Finish rituals to earn XP  
- Level-Up Engine – XP from every companion assists in your growth  

---

### The Healer – Bringer of Calm  
> Assists in helping you relax slowly and slide into serene sleep.

- Breathing Exercises – Unwind with guided breathing  
- Calm Sounds – Calming sounds to help the user relax  
- AI Bedtime Generator – Story or lullaby based on **age group** and **theme**  
- Memory Calm Game – Match relaxing pairs to soothe the mind  

---

## Tech Stack

| Feature/Layer          | Tools & Technologies Used                                      |
|-----------------------|---------------------------------------------------------------|
| Frontend              | React, Vite, Firebase Auth, CSS3                              |
| Backend               | Flask, Firestore (Firebase DB), Firebase Admin SDK, Hugging Face Transformers |
| Push Notifications    | Firebase Cloud Messaging (FCM) *(partially integrated)*       |
| Image Processing      | OpenCV for webcam image capture and preprocessing             |
| Emotion Detection     | Pretrained facial emotion classifier model (via OpenCV input) |
| Sentiment Analysis    | Hugging Face transformers (on journal entries)                |
| Sleep Score Prediction| Custom ML model combining mood, journal sentiment, webcam emotion |
| Routine Tip Generation| Zephyr-7B (Hugging Face API main branch) or FLAN-T5 (local)   |
| Deployment            | Frontend hosted via Netlify *(not latest version; final in demo video)* |
| Authentication        | Firebase Authentication (email/password)                      |
| Token Handling        | Firebase ID Token (Bearer auth for protected backend routes)  |
| Quests & XP Engine    | Firestore-based XP tracking, companion quests, badge system   |

> All AI/ML components (emotion detection, sentiment analysis, score prediction) are computed locally — no external servers required, except for the Routine Advisor in the main branch which uses Hugging Face inference.

---

## Live Frontend (not final):

[https://effulgent-sundae-e24053.netlify.app](https://effulgent-sundae-e24053.netlify.app)

---
## ⚠️ Judge Setup Note (Important)

Due to the use of local AI models and specific environment requirements, the backend may not run immediately without setup:

- Requires **Python 3.11.8** (to support certain model dependencies)
- Use of a **virtual environment is strongly recommended**

---
## Run Locally

### Frontend
git clone [(https://github.com/KaranMishra3610/SleepWell.git)](https://github.com/KaranMishra3610/SleepWell.git)
cd frontend  
npm install  
npm run dev


###  Backend
cd backend  
pip install -r requirements.txt  
python app.py

You’ll also need:  
- Firebase service account key  
- Firebase project for Auth, FCM, Firestore  
- Hugging Face API key (for LLM-based tips)  
- Python packages: OpenCV, transformers  

---

## Future Scope
This was just the beginning. Here's what could be added next:  
- Backend Deployment with live endpoints  
- Final UI Enhancements – animations, transitions  
- More Mini-Games – rhythm-based or calming puzzles  
- PWA Support – installable mobile app with vibration/audio  
- LLM Companion Dialogues – emotional support through smart conversations  

---

## Learnings
-- This individual project challenged me to merge bleeding-edge tech with emotional UX design within real-world limitations. Here are some takeaways:  

- Full-Stack Product Thinking – Architecting a wellness app from ground up, start to finish  
- ML + UX Integration – Mapping ML predictions to actual user interactions and feedback  
- Natural Language Prompt Engineering – Engineered prompts that provide actionable recommendations from LLMs  
- Webcam-Based Emotion Detection – Recorded real-time emotional context with OpenCV + pretrained models  
- Sentiment & Mood Modeling – Examined journal entries and mood through various NLP techniques  
- Firebase Auth & Secure Token Handling – Implemented secure backend routes with ID token verification  
- XP & Quest Systems – Built game-inspired systems that monitor user behavior and activity  
- State Management & UI Feedback Loops – Managed async data flows between backend, ML, and frontend layers  
- Rapid Solo Prototyping – Had to provide a full-featured experience under a time constraint and while ill  

- This project wasn't merely about creating features — it was about crafting a wellness experience that feels fun, individual, and transformative.

---

🎥 [Demo Video](https://www.youtube.com/watch?v=SEIdDIDyq8E&t=1s)  
🌐 [Live Frontend (limited)](https://effulgent-sundae-e24053.netlify.app)
---
## Built With Heart
 ‍  Solo Developer Project  
Created with curiosity, care, sleep deprivation and a little caffeine.

**SleepWell — Because the search for good sleep should be an adventure. ✨**
