// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhhXqDiOx_6QujQp4uPxY2poXzTMygulk",
  authDomain: "notification-3e1ff.firebaseapp.com",
  projectId: "notification-3e1ff",
  storageBucket: "notification-3e1ff.firebasestorage.app",
  messagingSenderId: "273002087588",
  appId: "1:273002087588:web:89fe7bbc074671ce8c9231",
  measurementId: "G-ZFPEBC7ECZ",
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
    console.log("🔔 Requesting notification permission...");

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    console.log("✅ Notification permission granted");

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey:
        "BGDB_4SHiLJH1mOsYkUvZ3CNs5YxBFBe3fKGGYxkl7QW7PzKd4hy_zXO_4fcqydRIQDaZ4YW2kvqVV07na2SMkw",
    });

    if (token) {
      console.log("📱 FCM Token:", token);
      return token;
    } else {
      console.log("⚠️ No registration token available");
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
    console.log("📬 Foreground message received:", payload);
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
    const authToken = localStorage.getItem("token");
    const apiUrl =
      import.meta.env.VITE_API_BASE_URL || "http://192.168.145.118:8000";

    console.log("💾 Saving FCM token to:", apiUrl);

    const response = await fetch(`${apiUrl}/api/save-fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcm_token: token }),
    });

    if (response.ok) {
      console.log("✅ FCM token saved to backend");
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
