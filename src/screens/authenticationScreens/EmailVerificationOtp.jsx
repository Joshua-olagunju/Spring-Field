import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/useTheme";
import { useUser } from "../../../context/useUser";
import { API_BASE_URL } from "../../config/apiConfig";
import useStore from "../../store/useStore";
import AnimatedSecurityBackground from "../../../components/GeneralComponents/AnimatedSecurityBackground";
import PoweredByDriftTech from "../../../components/GeneralComponents/PoweredByDrifttech";
import { Icon } from "@iconify/react";

const EmailVerificationOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode } = useTheme();
  const { completeEmailVerification } = useUser();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    type: "",
    message: "",
    details: "",
  });
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // State for email verification data - initialized from location.state or localStorage
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("resident");
  const [userId, setUserId] = useState(null);
  const [tempToken, setTempToken] = useState(null);
  const [shouldAutoResend, setShouldAutoResend] = useState(false);

  // Refs for each OTP input
  const inputRefs = useRef([]);

  // Initialize user data from navigation state or Zustand store
  const emailVerificationData = useStore(
    (state) => state.emailVerificationData
  );

  useEffect(() => {
    // First try to get from location.state
    if (location.state?.email && location.state?.user_id) {
      setUserEmail(location.state.email);
      setUserId(location.state.user_id);
      setUserRole(location.state.role || "resident");
      setTempToken(location.state.tempToken);
      setShouldAutoResend(location.state.autoResend || false);
    } else {
      // If not in location.state, try Zustand store
      try {
        if (emailVerificationData) {
          const verificationData = emailVerificationData;
          setUserEmail(verificationData.email || "");
          setUserId(verificationData.user_id || null);
          setUserRole(verificationData.role || "resident");
          setTempToken(verificationData.tempToken || null);
          setShouldAutoResend(verificationData.source === "login");

          // Restore partially entered OTP if available
          if (
            verificationData.currentOtp &&
            verificationData.currentOtp.length <= 6
          ) {
            try {
              const restoredOtp = verificationData.currentOtp
                .split("")
                .concat(["", "", "", "", "", ""])
                .slice(0, 6);
              setOtp(restoredOtp);
            } catch (otpError) {
              console.warn("Error restoring OTP:", otpError);
            }
          }
        }
      } catch (error) {
        console.warn("Error parsing stored verification data:", error);
      }
    }
  }, [location.state, emailVerificationData]);

  // Focus on first input only when component mounts (runs once)
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Prevent back navigation and setup localStorage saving
  useEffect(() => {
    // Prevent back navigation to dashboard by replacing history
    window.history.replaceState(null, "", window.location.pathname);

    // Save current verification state to store periodically
    const saveVerificationState = () => {
      try {
        if (userEmail && userId) {
          const verificationData = {
            email: userEmail,
            user_id: userId,
            role: userRole,
            tempToken: tempToken,
            source: location.state?.source || "unknown",
            currentOtp: otp.join(""),
            timestamp: Date.now(),
          };
          useStore.getState().setEmailVerificationData(verificationData);
        }
      } catch (error) {
        console.warn("Error saving verification state:", error);
        // Don't crash the app if localStorage fails
      }
    };

    // Save state when user switches apps or page becomes hidden
    const handleVisibilityChange = () => {
      try {
        if (document.visibilityState === "hidden") {
          saveVerificationState();
        }
      } catch (error) {
        console.warn("Error in visibility change handler:", error);
        // Don't crash the app
      }
    };

    try {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("beforeunload", saveVerificationState);
    } catch (error) {
      console.warn("Error adding event listeners:", error);
    }

    return () => {
      try {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("beforeunload", saveVerificationState);
      } catch (error) {
        console.warn("Error removing event listeners:", error);
      }
    };
  }, [userEmail, userId, userRole, tempToken, otp, location.state]);

  // Auto-resend OTP if coming from login screen
  useEffect(() => {
    if (shouldAutoResend && userEmail && userId) {
      handleResendOtp();
      // Reset the flag after triggering to prevent multiple resends
      setShouldAutoResend(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoResend, userEmail, userId]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Save current OTP state to store as user types
    try {
      const storedData = useStore.getState().emailVerificationData;
      if (storedData) {
        const verificationData = storedData;
        verificationData.currentOtp = newOtp.join("");
        verificationData.timestamp = Date.now();
        useStore.getState().setEmailVerificationData(verificationData);
      }
    } catch (storageError) {
      console.warn("Error saving OTP state:", storageError);
    }

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, index) => {
        if (index < 6) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);

      // Focus on the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex((val) => !val);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const displayModal = (type, message, details = "") => {
    setModalContent({ type, message, details });
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
      if (type === "success") {
        // Redirect to appropriate dashboard based on user role
        const dashboardRoutes = {
          super: "/super-admin/dashboard",
          landlord: "/admin/dashboard",
          resident: "/dashboard",
          security: "/security/dashboard",
        };
        const route = dashboardRoutes[userRole] || "/dashboard";
        navigate(route, { state: { userId, userRole } });
      }
    }, 3000);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    // Validate that we have user data
    if (!userId || !userEmail) {
      setError("Session expired. Please sign up or login again.");
      console.error("❌ Missing user data for resend:", { userId, userEmail });
      return;
    }

    setResendLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/email-verification/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            email: userEmail,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage("New verification code sent successfully!");
        setResendTimer(60); // 60 second cooldown
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.message || "Failed to resend code. Please try again.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    // Validate that we have user data
    if (!userId || !userEmail) {
      setError("Session expired. Please sign up or login again.");
      console.error("❌ Missing user data:", { userId, userEmail });
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // API call to verify email OTP
      const response = await fetch(
        `${API_BASE_URL}/api/email-verification/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            email: userEmail,
            otp_code: otpCode,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Get the verified user data
        const verifiedUser = result.user || {
          id: userId,
          email: userEmail,
          role: userRole,
          email_verified_at: new Date().toISOString(),
        };

        // Clear store after successful email verification
        try {
          useStore.getState().clearEmailVerificationData();
        } catch (error) {
          console.warn("Error clearing localStorage:", error);
        }

        // Complete email verification in UserContext
        // This saves the auth token and marks user as authenticated
        completeEmailVerification(verifiedUser, result.token || tempToken);

        displayModal(
          "success",
          "Email Verified Successfully!",
          "Welcome! Redirecting to dashboard..."
        );
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Page Background */}
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

        {/* Form Container */}
        <div className="relative z-10 flex items-center justify-center min-h-screen py-10 px-4">
          <div className="w-full max-w-md">
            <div
              className={`${theme.background.card} rounded-[0.5rem] ${theme.shadow.sm} w-full px-12 pt-8 pb-6`}
            >
              {/* Header */}
              <div className="mb-8 flex flex-col items-center gap-2">
                <div className="mb-4">
                  <Icon
                    icon="mdi:email-check"
                    className="text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                  />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Verify Your Email
                </h2>
                <p
                  className={`${theme.text.secondary} text-sm text-center px-4`}
                >
                  We've sent a 6-digit verification code to
                </p>
                <p className={`${theme.text.primary} text-sm font-semibold`}>
                  {userEmail || "your email"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Input Fields */}
                <div>
                  <label
                    className={`block text-sm text-center font-semibold ${theme.text.primary} mb-4`}
                  >
                    Enter Verification Code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold ${
                          theme.background.input
                        } ${
                          theme.text.primary
                        } border-2 rounded-lg focus:outline-none transition-all ${
                          error
                            ? "border-red-500 focus:ring-2 focus:ring-red-500"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        }`}
                      />
                    ))}
                  </div>
                  {error && (
                    <p
                      className={`${theme.text.error} text-xs mt-3 text-center flex items-center justify-center gap-1`}
                    >
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {error}
                    </p>
                  )}
                  {successMessage && (
                    <p
                      className={`${theme.text.success} text-xs mt-3 text-center flex items-center justify-center gap-1`}
                    >
                      <Icon icon="mdi:check-circle" className="text-sm" />
                      {successMessage}
                    </p>
                  )}
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || resendLoading}
                    className={`text-sm ${
                      resendTimer > 0 || resendLoading
                        ? theme.text.tertiary + " cursor-not-allowed"
                        : theme.text.link + " hover:" + theme.text.linkHover
                    } flex items-center justify-center gap-1 mx-auto`}
                  >
                    {resendLoading ? (
                      <>
                        <Icon
                          icon="mdi:loading"
                          className="animate-spin text-sm"
                        />
                        Sending...
                      </>
                    ) : resendTimer > 0 ? (
                      <>
                        <Icon icon="mdi:timer-sand" className="text-sm" />
                        Resend code in {resendTimer}s
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:refresh" className="text-sm" />
                        Didn't receive code? Resend
                      </>
                    )}
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={otp.join("").length !== 6 || isLoading}
                  className={`w-full font-semibold text-[0.9rem] py-3 px-2 rounded-[0.3rem] text-white transition-all active:scale-95 ${
                    otp.join("").length === 6 && !isLoading
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
                      Verifying...
                    </span>
                  ) : (
                    "Verify Email"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Powered by DriftTech */}
        <div className="relative z-10 flex items-center justify-center px-4 pb-10">
          <PoweredByDriftTech />
        </div>

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
                    : modalContent.type === "warning"
                    ? "bg-yellow-100"
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
                      : modalContent.type === "warning"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                />
              </div>

              <h2
                className={`text-xl font-bold ${theme.text.primary} mb-2 text-center`}
              >
                {modalContent.type === "success"
                  ? "Success!"
                  : modalContent.type === "warning"
                  ? "Warning!"
                  : "Error!"}
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
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-500/50 flex items-center justify-center gap-2"
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

export default EmailVerificationOtp;
