import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  requestNotificationPermission,
  saveFcmTokenToBackend,
} from "../../src/firebase";

const NotificationTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);

  const enableNotifications = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      console.log("🔔 Requesting notification permission...");
      setMessage("🔔 Requesting permission...");

      const fcmToken = await requestNotificationPermission();

      if (!fcmToken) {
        setMessage("❌ Permission denied");
        setIsLoading(false);
        setTimeout(() => setMessage(""), 5000);
        return;
      }

      console.log("💾 Saving FCM token to backend...");
      setMessage("💾 Saving token...");

      const saved = await saveFcmTokenToBackend(fcmToken);

      if (!saved) {
        setMessage("❌ Failed to save token");
        setIsLoading(false);
        setTimeout(() => setMessage(""), 5000);
        return;
      }

      setMessage("✅ Notifications enabled!");
      setIsEnabled(true);
      console.log("✅ Notifications enabled successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error("❌ Error:", error);
    }

    setIsLoading(false);
  };

  const sendTestNotification = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const authToken = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || "http://192.168.145.118:8000";

      console.log("📤 Sending test notification to:", apiUrl);
      setMessage("📤 Sending...");

      const response = await fetch(`${apiUrl}/api/test-notification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Notification sent!");
        console.log("✅ Test notification sent successfully!");
      } else {
        setMessage(`❌ ${data.message}`);
        console.error("❌ Failed:", data.message);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error("❌ Error sending notification:", error);
    }

    setIsLoading(false);
    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <div className="fixed bottom-24 right-4 z-[999] flex flex-col gap-2">
      {!isEnabled && (
        <button
          onClick={enableNotifications}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl font-bold transition-all ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-110 active:scale-95"
          } text-white`}
        >
          {isLoading ? (
            <>
              <Icon icon="mdi:loading" className="text-2xl animate-spin" />
              <span>Enabling...</span>
            </>
          ) : (
            <>
              <Icon icon="mdi:bell-check" className="text-2xl" />
              <span>Enable Notifications</span>
            </>
          )}
        </button>
      )}

      {isEnabled && (
        <button
          onClick={sendTestNotification}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl font-bold transition-all ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-110 active:scale-95"
          } text-white`}
        >
          {isLoading ? (
            <>
              <Icon icon="mdi:loading" className="text-2xl animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Icon icon="mdi:bell-ring" className="text-2xl" />
              <span>Test Notification</span>
            </>
          )}
        </button>
      )}

      {message && (
        <div
          className={`mt-2 px-4 py-2 rounded-lg shadow-lg ${
            message.startsWith("✅") ? "bg-green-500" : "bg-red-500"
          } text-white text-sm font-medium`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default NotificationTestButton;
