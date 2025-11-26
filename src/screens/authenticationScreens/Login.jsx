import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/useTheme";
import { useUser } from "../../../context/useUser";
import AnimatedSecurityBackground from "../../../components/GeneralComponents/AnimatedSecurityBackground";
import PoweredByDriftTech from "../../../components/GeneralComponents/PoweredByDrifttech";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

const Motion = motion;

const Login = () => {
  const navigate = useNavigate();

  const { theme, isDarkMode } = useTheme();
  const { login: userLogin, isAuthenticated } = useUser();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    type: "",
    message: "",
    details: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // PWA Install Banner State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPwaBanner, setShowPwaBanner] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("android");

  // Check if app is already installed
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      setShowPwaBanner(false);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowPwaBanner(false);
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
  const handlePwaInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInfoModal(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPwaBanner(false);
    }

    setDeferredPrompt(null);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (id === "email") {
      if (value.trim() === "") {
        setErrors((prev) => ({ ...prev, email: "" }));
      } else if (!validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (id === "password") {
      // No validation for password on login screen
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  // Redirect if already authenticated - with validation checks
  useEffect(() => {
    if (isAuthenticated) {
      // Get user data from context or localStorage
      const userData = localStorage.getItem("userData");

      if (userData) {
        try {
          const user = JSON.parse(userData);

          // All checks already passed in UserContext checkAuthStatus
          // which prevents isAuthenticated from being true if email is not verified

          // Route to appropriate dashboard based on user role
          let redirectPath = "/dashboard";
          switch (user.role) {
            case "super":
              redirectPath = "/super-admin/dashboard";
              break;
            case "landlord":
              redirectPath = "/admin/dashboard";
              break;
            case "resident":
              redirectPath = "/dashboard";
              break;
            case "security":
              redirectPath = "/security/dashboard";
              break;
            default:
              redirectPath = "/dashboard";
          }

          navigate(redirectPath, { replace: true });
        } catch (error) {
          console.error("Error parsing user data:", error);
          navigate("/dashboard", { replace: true });
        }
      }
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const isValid =
      formData.email.trim() !== "" && formData.password.trim() !== "";

    setIsFormValid(isValid);
  }, [formData]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const displayModal = (type, message, details = "") => {
    setModalContent({ type, message, details });
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);

    try {
      // Use UserContext login function
      const result = await userLogin(formData.email, formData.password);

      if (result.success) {
        // Check if email needs verification
        if (result.needsVerification) {
          // Store verification state in localStorage for persistence
          const verificationData = {
            email: result.user.email,
            user_id: result.user.id,
            role: result.user.role,
            tempToken: result.token,
            source: "login",
          };
          localStorage.setItem(
            "emailVerificationData",
            JSON.stringify(verificationData)
          );

          displayModal(
            "warning",
            "Email Not Verified",
            "Your email hasn't been verified yet. We'll redirect you to verify it now."
          );

          setTimeout(() => {
            navigate("/email-verification", {
              replace: true,
              state: {
                email: result.user.email,
                user_id: result.user.id,
                role: result.user.role,
                autoResend: true,
                tempToken: result.token,
              },
            });
          }, 2000);
          setFormData({ email: "", password: "" });
        } else {
          // Email is verified, show success
          displayModal(
            "success",
            "Login Successful",
            "Redirecting to your dashboard..."
          );
          setFormData({ email: "", password: "" });
          // The useEffect will handle navigation since isAuthenticated is now true
        }
      } else {
        displayModal(
          "error",
          "Login Failed",
          result.message || "Please check your credentials and try again."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      displayModal(
        "error",
        "Login Failed",
        "Something went wrong. Please check your connection or try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Page Background - Professional Security Design */}
      <div
        className="fixed inset-0 min-h-screen w-screen overflow-y-auto overflow-x-hidden"
        style={{
          background: isDarkMode
            ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))"
            : "linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246), rgb(249, 250, 251))",
        }}
      >
        {/* Animated Background */}
        <AnimatedSecurityBackground />

        {/* PWA Install Banner - Top */}
        <AnimatePresence>
          {showPwaBanner && !isInstalled && (
            <Motion.div
              className="fixed top-0 left-0 right-0 z-[999] px-4 pt-4"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <Motion.div
                className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-2xl overflow-hidden"
                initial={{ scale: 0.95 }}
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
                        scale: [1, 1.15, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 3,
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
                    {/* Install Button with Glowing Animation */}
                    <Motion.button
                      onClick={handlePwaInstallClick}
                      className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-sm sm:text-base shadow-lg flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        boxShadow: [
                          "0 4px 20px rgba(255,255,255,0.4)",
                          "0 6px 35px rgba(255,255,255,0.7)",
                          "0 4px 20px rgba(255,255,255,0.4)",
                        ],
                      }}
                      transition={{
                        boxShadow: {
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }}
                    >
                      <Icon
                        icon="mdi:download"
                        className="text-lg sm:text-xl"
                      />
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
                      onClick={() => setShowPwaBanner(false)}
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
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <div className="relative z-10 flex items-center justify-center min-h-screen py-10 px-4">
          <div className="w-full max-w-md">
            <div
              className={`${theme.background.card} rounded-[0.5rem] ${theme.shadow.sm} w-full px-12 pt-8 pb-6`}
            >
              {/* Welcome Text */}
              <div className="mb-8 flex flex-col items-center gap-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Welcome Back !
                </h2>
                <p className={`${theme.text.secondary} text-sm`}>
                  Sign in to your account to continue
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className={`block text-sm text-start font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded">
                      <Icon
                        icon="mdi:email-outline"
                        className="text-white text-sm"
                      />
                    </div>
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p
                      className={`${theme.text.error} text-xs mt-2 ml-1 flex items-center gap-1`}
                    >
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className={`block text-sm text-start font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded">
                      <Icon
                        icon="mdi:lock-outline"
                        className="text-white text-sm"
                      />
                    </div>
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 placeholder:text-[0.8rem] ${
                        theme.background.input
                      } ${
                        theme.text.primary
                      } border rounded-[0.3rem] focus:outline-none transition-all ${
                        errors.password
                          ? "focus:ring-red-500 bg-red-50"
                          : `focus:${theme.brand.primaryRing}`
                      }`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <Icon
                        icon={showPassword ? "mdi:eye" : "mdi:eye-off"}
                        className={`text-[1rem] ${theme.text.tertiary}`}
                      />
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      className={`${theme.text.error} text-xs mt-2 ml-1 flex items-center gap-1`}
                    >
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end -mt-2">
                  <a
                    href="/forgot-password"
                    className={`text-sm ${theme.text.link} text-[0.8rem] underline hover:${theme.text.linkHover}  `}
                  >
                    Forgot Password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className={`w-full font-semibold text-[0.9rem] py-3 px-2 rounded-[0.3rem] text-white transition-all active:scale-95 ${
                    isFormValid && !isLoading
                      ? "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                      : theme.button.disabled
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon
                        icon="mdi:loading"
                        className="animate-spin text-white"
                      />
                      Signing In...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Sign Up Link */}
                <div
                  className={`text-center mt-8 pt-6 border-t ${theme.border.secondary}`}
                >
                  <p className={`text-sm ${theme.text.secondary}`}>
                    Don't have an account?{" "}
                    <a
                      href="/signup-otp"
                      className={`${theme.text.link} text-[0.8rem] hover:${theme.text.linkHover} underline  `}
                    >
                      Create Account
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Powered by DriftTech */}
        <div className="relative z-10 flex items-center justify-center px-4 pb-10">
          <PoweredByDriftTech />
        </div>

        {/* PWA Info Modal */}
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
                            Navigate to SpringField Estate in a supported
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div
              className={`${theme.background.card} w-full max-w-sm rounded-2xl ${theme.shadow.large} relative p-6`}
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  modalContent.type === "success"
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                <Icon
                  icon={
                    modalContent.type === "success"
                      ? "mdi:check-circle"
                      : "mdi:alert-circle"
                  }
                  className={`text-3xl ${
                    modalContent.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                />
              </div>

              <h2
                className={`text-xl font-bold ${theme.text.primary} mb-2 text-center`}
              >
                {modalContent.type === "success" ? "Success!" : "Error!"}
              </h2>

              <p className={`text-sm ${theme.text.secondary} mb-6 text-center`}>
                {modalContent.message}
              </p>

              {modalContent.details && (
                <p
                  className={`text-xs ${theme.text.secondary} mb-4 text-center opacity-80`}
                >
                  {modalContent.details}
                </p>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:check" />
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
