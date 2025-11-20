import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/useTheme";
import { API_BASE_URL } from "../../config/apiConfig";
import ThemeToggle from "../../../components/GeneralComponents/ThemeToggle";
import AnimatedSecurityBackground from "../../../components/GeneralComponents/AnimatedSecurityBackground";
import PoweredByDriftTech from "../../../components/GeneralComponents/PoweredByDriftTech";
import { Icon } from "@iconify/react";

const ResetPasswordOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode } = useTheme();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Get email from navigation state
  const userEmail = location.state?.email || "";

  // Refs for each OTP input
  const inputRefs = useRef([]);

  useEffect(() => {
    // Redirect if no email provided (commented out for development)
    // if (!userEmail) {
    //   navigate("/forgot-password");
    //   return;
    // }

    // Focus on first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [navigate]);

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

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

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

      if (response.ok && result.success) {
        // Navigate to reset password screen with email and verified OTP token
        navigate("/reset-password", {
          state: { email: userEmail, token: result.token },
        });
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
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
      <ThemeToggle />
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
                    onClick={() => navigate("/forgot-password")}
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
