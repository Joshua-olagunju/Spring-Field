import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/useTheme";
import useStore from "../../store/useStore";
import { API_BASE_URL } from "../../config/apiConfig";
import AnimatedSecurityBackground from "../../../components/GeneralComponents/AnimatedSecurityBackground";
import PoweredByDriftTech from "../../../components/GeneralComponents/PoweredByDrifttech";
import { Icon } from "@iconify/react";

const ResetPasswordOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode } = useTheme();
  const resetPasswordData = useStore((state) => state.resetPasswordData);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Get email from navigation state or store
  const [userEmail, setUserEmail] = useState("");

  // Refs for each OTP input
  const inputRefs = useRef([]);

  // Initialize email from navigation state or store
  useEffect(() => {
    let emailFound = false;

    console.log("ResetPasswordOtp: Initializing component", {
      hasLocationState: !!location.state?.email,
      hasStoreData: !!resetPasswordData,
    });

    try {
      // First try to get from location.state
      if (location.state?.email) {
        console.log("ResetPasswordOtp: Found email in location.state");
        setUserEmail(location.state.email);
        emailFound = true;
      } else {
        // If not in location.state, try store
        const storedData = resetPasswordData;
        if (storedData && storedData.email) {
          console.log("ResetPasswordOtp: Restored email from store");
          const resetData = storedData;
          setUserEmail(resetData.email || "");
          emailFound = true;

          // Restore partially entered OTP if available
          if (resetData.currentOtp && resetData.currentOtp.length <= 6) {
            try {
              const restoredOtp = resetData.currentOtp
                .split("")
                .concat(["", "", "", "", "", ""])
                .slice(0, 6);
              setOtp(restoredOtp);
              console.log("ResetPasswordOtp: Restored partial OTP", {
                length: resetData.currentOtp.length,
              });
            } catch (otpError) {
              console.warn("Error restoring OTP:", otpError);
            }
          }
        } else {
          console.warn("ResetPasswordOtp: No email found in store");
        }
      }

      // If no email found anywhere, redirect to forgot password
      if (!emailFound) {
        console.error(
          "ResetPasswordOtp: No email found, redirecting to forgot password"
        );
        setError("Session expired. Please request a new password reset code.");
        setTimeout(() => {
          navigate("/forgot-password", { replace: true });
        }, 2000);
      } else {
        console.log("ResetPasswordOtp: Successfully initialized with email");
      }
    } catch (error) {
      console.error("Error initializing reset password OTP:", error);
      setError("An error occurred. Redirecting to forgot password...");
      setTimeout(() => {
        navigate("/forgot-password", { replace: true });
      }, 2000);
    }

    // Focus on first input when component mounts
    try {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (focusError) {
      console.warn("Error focusing input:", focusError);
    }
  }, [location.state, resetPasswordData, navigate]);

  // Save current reset password state to store
  useEffect(() => {
    // Save current verification state to store periodically
    const saveResetPasswordState = () => {
      try {
        if (userEmail) {
          const resetData = {
            email: userEmail,
            currentOtp: otp.join(""),
            timestamp: Date.now(),
          };
          useStore.getState().setResetPasswordData(resetData);
          console.log("ResetPasswordOtp: Saved state to store", {
            email: userEmail,
            otpLength: otp.join("").length,
          });
        }
      } catch (error) {
        console.error("Error saving reset password state:", error);
      }
    };

    // Save state when user switches apps or page becomes hidden
    const handleVisibilityChange = () => {
      try {
        if (document.visibilityState === "hidden") {
          console.log("ResetPasswordOtp: App hidden, saving state");
          saveResetPasswordState();
        } else if (document.visibilityState === "visible") {
          console.log("ResetPasswordOtp: App visible again");
        }
      } catch (error) {
        console.error("Error in visibility change handler:", error);
      }
    };

    try {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("beforeunload", saveResetPasswordState);
    } catch (error) {
      console.warn("Error adding event listeners:", error);
    }

    return () => {
      try {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("beforeunload", saveResetPasswordState);
      } catch (error) {
        console.warn("Error removing event listeners:", error);
      }
    };
  }, [userEmail, otp]);

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
      const storedData = useStore.getState().resetPasswordData;
      if (storedData) {
        const resetData = storedData;
        resetData.currentOtp = newOtp.join("");
        resetData.timestamp = Date.now();
        useStore.getState().setResetPasswordData(resetData);
      } else if (userEmail) {
        // Create new entry if it doesn't exist
        const resetData = {
          email: userEmail,
          currentOtp: newOtp.join(""),
          timestamp: Date.now(),
        };
        useStore.getState().setResetPasswordData(resetData);
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

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/resend-reset-password-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage("New OTP sent successfully!");
        setResendTimer(60); // 60 second cooldown
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.message || "Failed to resend OTP. Please try again.");
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

    // Validate that we have the email
    if (!userEmail) {
      setError("Email is missing. Please go back and try again.");
      console.error("ResetPasswordOtp: Email is missing during submit");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    console.log("ResetPasswordOtp: Submitting OTP verification", {
      email: userEmail,
      otpLength: otpCode.length,
    });

    try {
      // API call to verify reset password OTP
      const response = await fetch(
        `${API_BASE_URL}/api/verify-reset-password-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            otp: otpCode,
          }),
        }
      );

      const result = await response.json();
      console.log("ResetPasswordOtp: API Response", {
        status: response.status,
        success: result.success,
        hasToken: !!result.token,
      });

      if (response.ok && result.success) {
        // Save token to store before navigation
        try {
          const tokenData = {
            email: userEmail,
            token: result.token,
            timestamp: Date.now(),
          };
          useStore.getState().setResetPasswordToken(tokenData);
          console.log("ResetPasswordOtp: Token saved to store successfully");
        } catch (error) {
          console.error("Error saving reset token to store:", error);
        }

        // Clear OTP data after successful verification
        try {
          useStore.getState().clearResetPasswordData();
          console.log("ResetPasswordOtp: Cleared reset password data");
        } catch (error) {
          console.warn("Error clearing reset data:", error);
        }

        // Navigate to reset password screen with email and verified OTP token
        console.log("ResetPasswordOtp: Navigating to reset password screen");
        navigate("/reset-password", {
          state: { email: userEmail, token: result.token },
        });
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
        console.error("ResetPasswordOtp: Verification failed", result.message);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
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
                    icon="mdi:shield-key"
                    className="text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                  />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Verify Code
                </h2>
                <p
                  className={`${theme.text.secondary} text-sm text-center px-4`}
                >
                  We've sent a 6-digit code to
                </p>
                <p className={`${theme.text.primary} text-sm font-semibold`}>
                  {userEmail}
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
                        Resend OTP in {resendTimer}s
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
                    "Verify Code"
                  )}
                </button>

                {/* Back to Forgot Password */}
                <div
                  className={`text-center mt-8 pt-6 border-t ${theme.border.secondary}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      // Clear store when going back
                      try {
                        useStore.getState().clearResetPasswordData();
                      } catch (error) {
                        console.warn("Error clearing localStorage:", error);
                      }
                      navigate("/forgot-password");
                    }}
                    className={`text-sm ${theme.text.link} hover:${theme.text.linkHover} underline flex items-center justify-center gap-1 mx-auto`}
                  >
                    <Icon icon="mdi:arrow-left" className="text-base" />
                    Back
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Powered by DriftTech */}
        <div className="relative z-10 flex items-center justify-center px-4 pb-10">
          <PoweredByDriftTech />
        </div>
      </div>
    </>
  );
};

export default ResetPasswordOtp;
