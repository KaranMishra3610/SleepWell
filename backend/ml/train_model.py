import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load and train
data = pd.read_csv('ml/sample_sleep_data.csv')
X = data[['hours_slept', 'screen_time', 'caffeine', 'stress_level']]
y = data['sleep_score']

model = RandomForestRegressor()
model.fit(X, y)
joblib.dump(model, 'ml/sleep_model.pkl')

print("Model trained and saved.")