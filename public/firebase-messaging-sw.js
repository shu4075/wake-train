// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
// We can use generic placeholders here or hardcode the project ID.
// For security, project info is public anyway for client side.
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "AUTH_DOMAIN",
  projectId: "PROJECT_ID", // It's fine if these are dummy for receiving messages, but wait, usually we need real ones.
  storageBucket: "STORAGE_BUCKET",
  messagingSenderId: "123456789",
  appId: "APP_ID",
};

// We will let the server push send generic web push if possible, or we might need the actual config.
// The user has FIREBASE_PROJECT_ID in Vercel. We need to pass them via URL params if possible, 
// or the user must inject them during build.
// Since we don't have the real ones, we use a trick: Next.js can't easily compile public files with env vars.
// We will just listen to the push event generically.

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const notificationTitle = data.notification?.title || data.title || "🚆 WakeTrain";
    const notificationOptions = {
      body: data.notification?.body || data.body || "まもなく到着します！",
      icon: '/icon-512x512.png',
      badge: '/icon-512x512.png',
      tag: 'train-alarm',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200, 100, 400],
    };

    event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
