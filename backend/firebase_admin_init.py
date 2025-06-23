import firebase_admin
from firebase_admin import credentials

# Avoid re-initializing if already initialized
if not firebase_admin._apps:
    cred = credentials.Certificate('firebase/sleepwell-61da2-firebase-adminsdk-fbsvc-7f29ca27b4.json')
    firebase_admin.initialize_app(cred)
