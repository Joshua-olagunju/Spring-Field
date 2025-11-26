import { useState, useEffect } from "react";
import { useTheme } from "../../context/useTheme";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

const Motion = motion;

/**
 * InstallPwaButton Component
 *
 * A reusable button that allows users to install the app as a PWA.
 * Features:
 * - Auto-hides when app is already installed
 * - Shows native install prompt on click
 * - Includes info modal with platform-specific instructions
 * - Fully themed and responsive
 */
const InstallPwaButton = ({
  className = "",
  style = {},
  buttonText = "Install App",
}) => {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("android"); // android, ios, desktop

  // Check if app is already installed
  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Handle install button click
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no prompt available, show info modal instead
      setShowInfoModal(true);
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  // Don't show button if app is already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Install Button */}
      <div className={`flex items-center gap-2 ${className}`} style={style}>
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${theme.button.primary} hover:scale-105 active:scale-95 shadow-lg`}
        >
          <Icon icon="mdi:download" className="text-xl" />
          <span>{buttonText}</span>
        </button>

        {/* Info Button */}
        <button
          onClick={() => setShowInfoModal(true)}
          className={`p-2.5 rounded-lg transition-all ${theme.background.input} ${theme.text.secondary} hover:${theme.background.hover} hover:scale-105 active:scale-95`}
          title="Installation Instructions"
        >
          <Icon icon="mdi:information" className="text-xl" />
        </button>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <Motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoModal(false)}
            />

            {/* Modal Content */}
            <Motion.div
              className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl ${theme.background.card} ${theme.shadow.large} border ${theme.border.primary}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between p-6 border-b ${theme.border.secondary}`}
              >
                <h2 className={`text-2xl font-bold ${theme.text.primary}`}>
                  Installation Instructions
                </h2>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className={`p-2 rounded-lg transition-colors ${theme.background.input} ${theme.text.secondary} hover:${theme.background.hover}`}
                >
                  <Icon icon="mdi:close" className="text-2xl" />
                </button>
              </div>

              {/* Tabs */}
              <div className={`flex border-b ${theme.border.secondary}`}>
                <button
                  onClick={() => setActiveTab("android")}
                  className={`flex-1 px-6 py-4 font-semibold transition-all ${
                    activeTab === "android"
                      ? `${theme.text.primary} border-b-2 border-blue-600`
                      : `${theme.text.secondary} hover:${theme.background.input}`
                  }`}
                >
                  <Icon icon="mdi:android" className="inline text-xl mr-2" />
                  Android
                </button>
                <button
                  onClick={() => setActiveTab("ios")}
                  className={`flex-1 px-6 py-4 font-semibold transition-all ${
                    activeTab === "ios"
                      ? `${theme.text.primary} border-b-2 border-blue-600`
                      : `${theme.text.secondary} hover:${theme.background.input}`
                  }`}
                >
                  <Icon icon="mdi:apple" className="inline text-xl mr-2" />
                  iOS
                </button>
                <button
                  onClick={() => setActiveTab("desktop")}
                  className={`flex-1 px-6 py-4 font-semibold transition-all ${
                    activeTab === "desktop"
                      ? `${theme.text.primary} border-b-2 border-blue-600`
                      : `${theme.text.secondary} hover:${theme.background.input}`
                  }`}
                >
                  <Icon icon="mdi:monitor" className="inline text-xl mr-2" />
                  Desktop
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Android Instructions */}
                {activeTab === "android" && (
                  <div className="space-y-4">
                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Open Chrome Browser
                        </h3>
                        <p className={theme.text.secondary}>
                          Navigate to the SpringField Estate app in Google
                          Chrome.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Tap the Menu Icon
                        </h3>
                        <p className={theme.text.secondary}>
                          Tap the three-dot menu icon (⋮) in the top-right
                          corner.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Select "Add to Home screen" or "Install app"
                        </h3>
                        <p className={theme.text.secondary}>
                          Choose the option to install the app on your device.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Confirm Installation
                        </h3>
                        <p className={theme.text.secondary}>
                          Tap "Add" or "Install" to add the app to your home
                          screen.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-6 p-4 rounded-lg border-l-4 border-blue-600 ${theme.background.input}`}
                    >
                      <p className={`text-sm ${theme.text.secondary}`}>
                        <Icon
                          icon="mdi:information"
                          className="inline text-lg mr-2"
                        />
                        You can also use the "Install App" button on the page if
                        available.
                      </p>
                    </div>
                  </div>
                )}

                {/* iOS Instructions */}
                {activeTab === "ios" && (
                  <div className="space-y-4">
                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Open Safari Browser
                        </h3>
                        <p className={theme.text.secondary}>
                          Navigate to the SpringField Estate app in Safari (PWA
                          installation only works in Safari on iOS).
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Tap the Share Button
                        </h3>
                        <p className={theme.text.secondary}>
                          Tap the Share icon (box with upward arrow) at the
                          bottom of the screen.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Select "Add to Home Screen"
                        </h3>
                        <p className={theme.text.secondary}>
                          Scroll down in the share menu and tap "Add to Home
                          Screen".
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Confirm and Add
                        </h3>
                        <p className={theme.text.secondary}>
                          Edit the name if desired, then tap "Add" in the
                          top-right corner.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-6 p-4 rounded-lg border-l-4 border-blue-600 ${theme.background.input}`}
                    >
                      <p className={`text-sm ${theme.text.secondary}`}>
                        <Icon
                          icon="mdi:information"
                          className="inline text-lg mr-2"
                        />
                        Note: PWA installation on iOS only works in Safari
                        browser, not Chrome or other browsers.
                      </p>
                    </div>
                  </div>
                )}

                {/* Desktop Instructions */}
                {activeTab === "desktop" && (
                  <div className="space-y-4">
                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Open Chrome, Edge, or Brave
                        </h3>
                        <p className={theme.text.secondary}>
                          Navigate to the SpringField Estate app in a supported
                          browser.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Look for the Install Icon
                        </h3>
                        <p className={theme.text.secondary}>
                          Click the install icon (⊕ or computer icon) in the
                          address bar, or use the "Install App" button.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Alternative: Use Browser Menu
                        </h3>
                        <p className={theme.text.secondary}>
                          Click the three-dot menu (⋮) → "Install SpringField
                          Estate" or "Create shortcut".
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-4 p-4 rounded-lg ${theme.background.input}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold mb-2 ${theme.text.primary}`}
                        >
                          Confirm Installation
                        </h3>
                        <p className={theme.text.secondary}>
                          Click "Install" in the popup dialog. The app will be
                          added to your applications.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-6 p-4 rounded-lg border-l-4 border-blue-600 ${theme.background.input}`}
                    >
                      <p className={`text-sm ${theme.text.secondary}`}>
                        <Icon
                          icon="mdi:information"
                          className="inline text-lg mr-2"
                        />
                        After installation, you can launch the app from your
                        Start Menu (Windows) or Applications folder (Mac).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className={`flex justify-end p-6 border-t ${theme.border.secondary}`}
              >
                <button
                  onClick={() => setShowInfoModal(false)}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all ${theme.button.primary} hover:scale-105 active:scale-95`}
                >
                  Got it!
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPwaButton;
