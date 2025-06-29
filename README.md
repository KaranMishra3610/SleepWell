#   SleepWell: Become the Dreamy One  

Welcome to **SleepWell**, a solo-developed, gamified well-being experience where you become **The Dreamy One** — a mindful sleeper assisted by four mystical companions.

>   Explore. Reflect. Rest. Repeat.

---

##   Core Gameplay: Quests, XP & Growth

SleepWell isn't simply logging your sleep — it's a gamified experience.

-  ️ Companion Quests: Each companion provides you with distinct sleep-related challenges
-   XP System: Quest completion rewards you with XP and allows you to level up 
-   Badges & Streaks: Develop habit and be rewarded  
-   Adaptive Insights: Understand which habits contribute to or detract from your sleep  

> Evolve wiser with The Sage, stronger with The Knight, calmer with The Healer, and more aware with The Tracker.

---

##  Choose Your Magical Companion

Every companion assists you in mastering a unique facet of sleep health:

---

###   The Tracker – Master of Patterns
> Assists in staying on top and marking progress in the long-term.

-   Sleep Score Graphs – Visualizes sleep trends based on your logs
-   Streak Counter – Monitors how frequently you stick to good habits
-   Badge System – Gets achievements for consistency and development
-   Emotion Pie Chart - A Pie Chart showing the emotion distribution. Emotion is analysed through the user's journal entry done at the sage. 
---

###   The Sage – Keeper of Reflection  
> Guides your inner self through thoughtful journaling and personalized feedback.

-   Sleep Logger – Log hours slept, caffeine/screen time, dreams  
-  ️ Voice Journal – Transcribe your voice using **Whisper AI (local)**  
-   Sleep Score Prediction – ML model evaluates sleep based on image, mood, journal entry 
-   Comparative Insights – Examine how your routines(specifically caffeine , screen time) impact your sleep
-   Routine Advisor – Receive tailored advice through a Hugging Face LLM
-   Feedback to Insights - Give Feedback to the suggestions given by the Routine Advisor for reinforcement learning.
-   Sentiment and Emotion analysis - Sentiment analysis done through HuggingFace Models and Webcam emotion recognition using DeepFace. 
---

###  ️The Knight – Guardian of Ritual
> Assists you in protecting your bedtime and establishing solid nighttime routines.

-   Sleep Reminders – Set bedtime reminders
-  ️ Supports Global Quest System – Finish rituals to earn XP
-   Level-Up Engine – XP from every companion assists in your growth

---

###  The Healer – Bringer of Calm
> Assists in helping you relax slowly and slide into serene sleep.

-  ️ Breathing Exercises – Unwind with guided breathing
-   Calm Sounds - Calming Sounds to help the user relax.
-   AI Bedtime Generator – Story or lullaby based on **age group **,**theme**
-   Memory Calm Game – Match relaxing pairs to soothe the mind

---

##  Tech Stack

Feature/Layer               Tools & Technologies Used 

- Frontend                React, Vite, Firebase Auth, HTML5 MediaRecorder, CSS3 
- Voice Input             Whisper AI (local inference for transcription) 
- Backend                 Flask, Firestore (Firebase DB), Firebase Admin SDK, Hugging Face Transformers 
- Push Notifications      Firebase Cloud Messaging (FCM) *(partially integrated)* 
- Image Processing        OpenCV for webcam image capture and preprocessing 
- Emotion Detection       Pretrained facial emotion classifier model (via OpenCV input) 
- Sentiment Analysis      Hugging Face transformers (on journal entries) 
- Sleep Score Prediction  Custom ML model that combines mood, journal sentiment, webcam emotion 
- Routine Tip Generation  Hugging Face LLM (transformers-based, uses prompt + user routine data) 
- Voice Recorder UI       MediaRecorder API for local audio capture in browser 
- Deployment              Frontend hosted via Netlify *(not latest version; final in demo video)* |
- Authentication          Firebase Authentication (email/password) 
- Token Handling          Firebase ID Token (Bearer auth for protected backend routes) 
- Quests & XP Engine      Firestore-based XP tracking, companion quests, badge system 

>  All AI/ML components (Whisper, emotion detection, sentiment analysis, score prediction) are computed locally, no external servers required except for optional Hugging Face inference.

---

## ⚠ Deployment Note

>  ‍  This was a hackathon solo project. Because of falling ill at the final stretch:
> -   The backend is not deployed yet, although works flawlessly locally
> -   The deployed frontend on Netlify is not the final version — CSS/UI tweaks will be visible in the final demo video

Live frontend (not final):
  [https://effulgent-sundae-e24053.netlify.app](https://effulgent-sundae-e24053.netlify.app)

---

##   Run Locally
###  Frontend
git clone https:/KaranMishra3610/github.com//sleepwell.git
cd frontend
npm install
npm run dev

###  Backend
cd backend
pip install -r requirements.txt
python app.py

You’ll also need:
-- Firebase service account key

-- Firebase project for Auth, FCM, Firestore

-- Hugging Face API key (for LLM-based tips)

-- Python packages: Whisper, OpenCV, transformers

## Future Scope
This was just the beginning. Here's what could be added next:
-- Backend Deployment with live endpoints

-- Final UI Enhancements – animations, transitions

-- More Mini-Games – rhythm-based or calming puzzles

-- PWA Support – installable mobile app with vibration/audio

-- LLM Companion Dialogues – emotional support through smart conversations

## Learnings
-- This individual project challenged me to merge bleeding-edge tech with emotional UX design within real-world limitations. Here are some takeaways:

-- Full-Stack Product Thinking – Architecting a wellness app from ground up, start to finish

-- ML + UX Integration – Mapping ML predictions to actual user interactions and feedback

-- Natural Language Prompt Engineering – Engineered prompts that provide actionable recommendations from LLMs

-- Whisper AI Integration – Applied Whisper locally to transcribe voice input for journaling

-- Webcam-Based Emotion Detection – Recorded real-time emotional context with OpenCV + pretrained models

-- Sentiment & Mood Modeling – Examined journal entries and mood through various NLP techniques

-- Firebase Auth & Secure Token Handling – Implemented secure backend routes with ID token verification

-- XP & Quest Systems – Built game-inspired systems that monitor user behavior and activity

-- State Management & UI Feedback Loops – Managed async data flows between backend, ML, and frontend layers

-- Rapid Solo Prototyping – Had to provide a full-featured experience under a time constraint and while ill

-- This project wasn't merely about creating features — it was about crafting a wellness experience that feels fun, individual, and transformative.



## Built With Heart
 ‍  Solo Developer Project
Created with curiosity, care,sleep deprivation and a little caffeine.

SleepWell — Because the search for good sleep should be an adventure. ✨
