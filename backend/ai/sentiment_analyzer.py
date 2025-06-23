from transformers import pipeline

# Load emotion classification model
sentiment_pipeline = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=1
)

# Define which emotions are generally positive
POSITIVE_EMOTIONS = {"joy", "love", "surprise"}
NEGATIVE_EMOTIONS = {"anger", "fear", "sadness", "disgust"}

def analyze_sentiment(text):
    try:
        # Run through transformer model (truncate to 512 chars)
        result = sentiment_pipeline(text[:512])[0][0]  # Extract top label
        label = result["label"].lower()
        score = round(float(result["score"]), 2)

        # Format result
        mood = label.capitalize()  # e.g., joy → Joy

        if label in POSITIVE_EMOTIONS:
            polarity = score
        elif label in NEGATIVE_EMOTIONS:
            polarity = -score
        else:
            polarity = 0.0  # Neutral or undefined

        return {
            "mood": mood,
            "polarity": polarity
        }

    except Exception as e:
        print("Sentiment analysis failed:", e)
        return {
            "mood": "Unknown",
            "polarity": 0.0
        }
