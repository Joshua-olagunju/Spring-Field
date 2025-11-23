import { useEffect, useState } from "react";
import {
  requestNotificationPermission,
  saveFcmTokenToBackend,
  onForegroundMessage,
} from "../firebase";

/**
 * Custom hook to handle push notifications
 * @returns {Object} Notification state and methods
 */
export function useNotifications() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [foregroundMessage, setForegroundMessage] = useState(null);

  // Request permission and get token
  const initializeNotifications = async () => {
    try {
      const token = await requestNotificationPermission();

      if (token) {
        setFcmToken(token);
        setPermissionGranted(true);

        // Save token to backend
        await saveFcmTokenToBackend(token);

        return token;
      } else {
        setPermissionGranted(false);
        return null;
      }
    } catch (error) {
      console.error("❌ Error initializing notifications:", error);
      return null;
    }
  };

  // Listen for foreground messages
  useEffect(() => {
    onForegroundMessage((payload) => {
      console.log("📬 Foreground notification:", payload);
      setForegroundMessage(payload);

      // Show notification using browser Notification API
      if (Notification.permission === "granted") {
        new Notification(payload.notification?.title || "SpringField Estate", {
          body: payload.notification?.body || "You have a new notification",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
        });
      }
    });
  }, []);

  return {
    permissionGranted,
    fcmToken,
    foregroundMessage,
    initializeNotifications,
  };
}
