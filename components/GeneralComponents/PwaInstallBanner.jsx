import { useState, useEffect } from "react";
import { useTheme } from "../../context/useTheme";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

const Motion = motion;

/**
 * PwaInstallBanner Component
 *
 * An animated banner that slides down from the top nav every 2 minutes
 * Shows for 20 seconds then slides back up
 * Features attractive gradient and animations
 */
const PwaInstallBanner = () => {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("android");

  // Check if app is already installed
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      console.log(
        "✅ PwaInstallBanner: App already installed (standalone mode)"
      );
      setIsInstalled(true);
      return;
    }

    console.log(
      "🔄 PwaInstallBanner: Waiting for beforeinstallprompt event..."
    );

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      console.log(
        "🎉 PwaInstallBanner: beforeinstallprompt event fired! Install is available."
      );
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowBanner(false);
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

  // Banner auto-show logic: Every 2 minutes, show for 20 seconds
  useEffect(() => {
    if (isInstalled) return;

    const showBannerCycle = () => {
      console.log("🎉 PWA Banner: Showing banner!");
      setShowBanner(true);

      // Hide after 20 seconds
      const hideTimer = setTimeout(() => {
        console.log("👋 PWA Banner: Hiding banner after 20 seconds");
        setShowBanner(false);
      }, 20000); // 20 seconds

      return hideTimer;
    };

    // Show immediately on first load (after 3 seconds)
    const initialTimer = setTimeout(() => {
      showBannerCycle();
    }, 3000);

    // Then show every 2 minutes
    const interval = setInterval(() => {
      showBannerCycle();
    }, 120000); // 2 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isInstalled]);

  // Handle install button click
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log(
        "ℹ️ PwaInstallBanner: No install prompt available. Showing manual instructions."
      );
      setShowInfoModal(true);
      return;
    }

    console.log("📥 PwaInstallBanner: Showing native install prompt...");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }

    setDeferredPrompt(null);
    setShowBanner(false);
  };

  // Manual close
  const handleClose = () => {
    setShowBanner(false);
  };

  // Don't render if app is installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Animated Banner */}
      <AnimatePresence>
        {showBanner && (
          <Motion.div
            className="fixed top-[72px] sm:top-[80px] left-0 right-0 z-[998] px-4"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Motion.div
              className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between p-4 sm:p-5">
                {/* Left: Icon and Text */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  {/* Animated Icon */}
                  <Motion.div
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5 sm:p-3"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Icon
                      icon="mdi:download-circle"
                      className="text-white text-3xl sm:text-4xl"
                    />
                  </Motion.div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <Motion.h3
                      className="text-white font-bold text-base sm:text-lg mb-1"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Install SpringField Estate
                    </Motion.h3>
                    <Motion.p
                      className="text-white/90 text-xs sm:text-sm"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Get quick access from your home screen
                    </Motion.p>
                  </div>
                </div>

                {/* Right: Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 ml-2">
                  {/* Install Button */}
                  <Motion.button
                    onClick={handleInstallClick}
                    className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-sm sm:text-base shadow-lg flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: [
                        "0 4px 20px rgba(255,255,255,0.3)",
                        "0 4px 30px rgba(255,255,255,0.5)",
                        "0 4px 20px rgba(255,255,255,0.3)",
                      ],
                    }}
                    transition={{
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <Icon icon="mdi:download" className="text-lg sm:text-xl" />
                    <span className="hidden sm:inline">Install</span>
                  </Motion.button>

                  {/* Info Button */}
                  <Motion.button
                    onClick={() => setShowInfoModal(true)}
                    className="bg-white/20 backdrop-blur-sm text-white p-2 sm:p-2.5 rounded-lg"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(255,255,255,0.3)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    title="Installation Instructions"
                  >
                    <Icon
                      icon="mdi:information"
                      className="text-xl sm:text-2xl"
                    />
                  </Motion.button>

                  {/* Close Button */}
                  <Motion.button
                    onClick={handleClose}
                    className="bg-white/20 backdrop-blur-sm text-white p-2 sm:p-2.5 rounded-lg"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(255,255,255,0.3)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    title="Close"
                  >
                    <Icon icon="mdi:close" className="text-xl sm:text-2xl" />
                  </Motion.button>
                </div>
              </div>

              {/* Progress Bar */}
              <Motion.div
                className="h-1 bg-white/30"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 20, ease: "linear" }}
              />
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <Motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoModal(false)}
            />

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

              {/* Tab Content - Scrollable */}
              <div className="p-6 overflow-y-auto flex-1">
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
                          Select "Add to Home screen"
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
                  </div>
                )}

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
                          Navigate to the SpringField Estate app in Safari.
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
                          bottom.
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
                          Scroll down and tap "Add to Home Screen".
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
                          Tap "Add" in the top-right corner.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                          Open Chrome or Edge
                        </h3>
                        <p className={theme.text.secondary}>
                          Navigate to SpringField Estate in a supported browser.
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
                          Look for Install Icon
                        </h3>
                        <p className={theme.text.secondary}>
                          Click the install icon (⊕) in the address bar.
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
                          Or Use Browser Menu
                        </h3>
                        <p className={theme.text.secondary}>
                          Click menu (⋮) → "Install SpringField Estate".
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
                          Click "Install" in the popup dialog.
                        </p>
                      </div>
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

export default PwaInstallBanner;
