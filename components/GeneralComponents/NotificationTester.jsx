import { useState } from "react";
import { useTheme } from "../../context/useTheme";
import { useNotifications } from "../../hooks/useNotifications";
import { Icon } from "@iconify/react";
import useStore from "../../src/store/useStore";

/**
 * NotificationTester Component
 * A component to test push notifications
 * Use this in development to test FCM integration
 */
const NotificationTester = () => {
  const { theme } = useTheme();
  const { permissionGranted, fcmToken, initializeNotifications } =
    useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error, info

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setMessage("");

    const token = await initializeNotifications();

    if (token) {
      setMessage("Notifications enabled successfully!");
      setMessageType("success");
    } else {
      setMessage("Failed to enable notifications. Please check permissions.");
      setMessageType("error");
    }

    setIsLoading(false);
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const authToken = useStore.getState().authToken;
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/api/test-notification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Test notification sent! Check your device.");
        setMessageType("success");
      } else {
        setMessage(`Failed: ${data.message}`);
        setMessageType("error");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    }

    setIsLoading(false);
  };

  return (
    <div
      className={`max-w-2xl mx-auto p-6 rounded-xl ${theme.background.card} ${theme.shadow.large}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon
          icon="mdi:bell-ring"
          className={`text-3xl ${theme.text.primary}`}
        />
        <h2 className={`text-2xl font-bold ${theme.text.primary}`}>
          Notification Tester
        </h2>
      </div>

      {/* Status */}
      <div className={`mb-6 p-4 rounded-lg ${theme.background.input}`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon
            icon={permissionGranted ? "mdi:check-circle" : "mdi:alert-circle"}
            className={`text-xl ${
              permissionGranted ? "text-green-600" : "text-orange-600"
            }`}
          />
          <span className={`font-semibold ${theme.text.primary}`}>
            Status: {permissionGranted ? "Enabled" : "Disabled"}
          </span>
        </div>

        {fcmToken && (
          <div className="mt-3">
            <p className={`text-sm ${theme.text.secondary} mb-1`}>FCM Token:</p>
            <code
              className={`text-xs ${theme.text.secondary} bg-black/10 dark:bg-white/10 p-2 rounded block overflow-x-auto`}
            >
              {fcmToken.substring(0, 50)}...
            </code>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-3 mb-6">
        {!permissionGranted && (
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${theme.button.primary} hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
          >
            <Icon icon="mdi:bell-plus" className="text-xl" />
            {isLoading ? "Enabling..." : "Enable Notifications"}
          </button>
        )}

        <button
          onClick={handleTestNotification}
          disabled={isLoading || !permissionGranted}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
            permissionGranted
              ? `${theme.button.primary} hover:scale-105 active:scale-95`
              : theme.button.disabled
          } flex items-center justify-center gap-2`}
        >
          <Icon icon="mdi:bell-ring" className="text-xl" />
          {isLoading ? "Sending..." : "Send Test Notification"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            messageType === "success"
              ? "bg-green-100 dark:bg-green-900/30 border border-green-600"
              : messageType === "error"
              ? "bg-red-100 dark:bg-red-900/30 border border-red-600"
              : "bg-blue-100 dark:bg-blue-900/30 border border-blue-600"
          }`}
        >
          <Icon
            icon={
              messageType === "success"
                ? "mdi:check-circle"
                : messageType === "error"
                ? "mdi:alert-circle"
                : "mdi:information"
            }
            className={`text-2xl ${
              messageType === "success"
                ? "text-green-600"
                : messageType === "error"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          />
          <p
            className={`text-sm ${
              messageType === "success"
                ? "text-green-800 dark:text-green-200"
                : messageType === "error"
                ? "text-red-800 dark:text-red-200"
                : "text-blue-800 dark:text-blue-200"
            }`}
          >
            {message}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div
        className={`mt-6 p-4 rounded-lg border ${theme.border.secondary} ${theme.background.input}`}
      >
        <h3 className={`font-semibold ${theme.text.primary} mb-2`}>
          Testing Instructions:
        </h3>
        <ol
          className={`text-sm ${theme.text.secondary} space-y-1 list-decimal list-inside`}
        >
          <li>Click "Enable Notifications" to request permission</li>
          <li>Allow notifications in the browser prompt</li>
          <li>Click "Send Test Notification" to test</li>
          <li>You should receive a notification immediately</li>
          <li>Try closing the app/tab to test background notifications</li>
        </ol>
      </div>
    </div>
  );
};

export default NotificationTester;
