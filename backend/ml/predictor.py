import numpy as np
from sklearn.ensemble import RandomForestRegressor

model = RandomForestRegressor()

def predict_next_score(logs):
    if len(logs) < 3:
        return 75  # fallback default score

    # Extract features and labels from logs
    X = []
    y = []
    for log in logs:
        X.append([
            float(log['hours_slept']),
            float(log['screen_time']),
            float(log['caffeine']),
            float(log['stress_level'])
        ])
        y.append(float(log['sleep_score']))

    model.fit(X, y)
    # Predict next based on latest log
    next_input = X[-1]
    return round(model.predict([next_input])[0], 2)