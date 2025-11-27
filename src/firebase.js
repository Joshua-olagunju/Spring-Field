// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import useStore from "./store/useStore";

// Your web app's Firebase configuration
// Uses environment variables for production deployment
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDhhXqDiOx_6QujQp4uPxY2poXzTMygulk",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "notification-3e1ff.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "notification-3e1ff",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "notification-3e1ff.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "273002087588",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:273002087588:web:89fe7bbc074671ce8c9231",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZFPEBC7ECZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export async function requestNotificationPermission() {
  try {
    // Requesting notification permission

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      // Notification permission denied
      return null;
    }

    // Notification permission granted

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey:
        import.meta.env.VITE_FIREBASE_VAPID_KEY ||
        "BGDB_4SHiLJH1mOsYkUvZ3CNs5YxBFBe3fKGGYxkl7QW7PzKd4hy_zXO_4fcqydRIQDaZ4YW2kvqVV07na2SMkw",
    });

    if (token) {
      // FCM Token obtained
      return token;
    } else {
      // No registration token available
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    return null;
  }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback) {
  onMessage(messaging, (payload) => {
    // Foreground message received
    callback(payload);
  });
}

/**
 * Save FCM token to Laravel backend
 * @param {string} token - FCM token
 * @returns {Promise<boolean>} Success status
 */
export async function saveFcmTokenToBackend(token) {
  try {
    const authToken = useStore.getState().authToken;
    const apiUrl =
      import.meta.env.VITE_API_BASE_URL || "http://192.168.145.118:8000";

    // Saving FCM token to backend

    const response = await fetch(`${apiUrl}/api/save-fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcm_token: token }),
    });

    if (response.ok) {
      // FCM token saved to backend
      return true;
    } else {
      console.error("❌ Failed to save FCM token:", await response.text());
      return false;
    }
  } catch (error) {
    console.error("❌ Error saving FCM token:", error);
    return false;
  }
}

export { app, analytics, messaging };
