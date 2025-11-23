/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDhhXqDiOx_6QujQp4uPxY2poXzTMygulk",
  authDomain: "notification-3e1ff.firebaseapp.com",
  projectId: "notification-3e1ff",
  messagingSenderId: "273002087588",
  appId: "1:273002087588:web:89fe7bbc074671ce8c9231",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("📬 Background message received:", payload);

  const notificationTitle = payload.notification?.title || "SpringField Estate";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: payload.data?.tag || "default",
    data: payload.data,
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event.notification);

  event.notification.close();

  // Open the app when notification is clicked
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});
