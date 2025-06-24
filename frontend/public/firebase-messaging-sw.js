// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ✅ Your Firebase config (same as frontend)
firebase.initializeApp({
  apiKey: "AIzaSyANcgrZV79T9KMXo-NgRbA15DSU5Pm55RI",
  authDomain: "sleepwell-61da2.firebaseapp.com",
  projectId: "sleepwell-61da2",
  storageBucket: "sleepwell-61da2.appspot.com",
  messagingSenderId: "244281446027",
  appId: "1:244281446027:web:cda29c6a4c39e9406a8e8e",
  measurementId: "G-QZ1MXXLFZV"
});

const messaging = firebase.messaging();

// ✅ Optional: handle background notification clicks
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // redirect to your app
  );
});
