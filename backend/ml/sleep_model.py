import joblib
import os

# Dynamically build the path to sleep_model.pkl (same folder)
model_path = os.path.join(os.path.dirname(__file__), 'sleep_model.pkl')
model = joblib.load(model_path)

def predict_sleep_score(data):
    features = [[
        float(data['hours_slept']),
        float(data['screen_time']),
        float(data['caffeine']),
        float(data['stress_level'])
    ]]
    return round(model.predict(features)[0], 2)
