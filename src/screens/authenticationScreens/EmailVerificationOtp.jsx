import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/useTheme";
import ThemeToggle from "../../../components/ThemeToggle";
import AnimatedSecurityBackground from "../../../components/AnimatedSecurityBackground";
import { Icon } from "@iconify/react";

const EmailVerificationOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode } = useTheme();
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

  // Get email and user role from navigation state
  const userEmail = location.state?.email || "your email";
  const userRole = location.state?.role || "resident";
  const userId = location.state?.user_id;

  // Refs for each OTP input
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus on first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

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

  const displayModal = (type, message, details = "") => {
    setModalContent({ type, message, details });
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
      if (type === "success") {
        // Redirect to appropriate dashboard based on user role
        const dashboardRoutes = {
          super: "/admin-dashboard",
          landlord: "/landlord-dashboard",
          resident: "/resident-dashboard",
          security: "/security-dashboard",
        };
        const route = dashboardRoutes[userRole] || "/dashboard";
        navigate(route, { state: { userId, userRole } });
      }
    }, 3000);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/email-verification/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: location.state?.user_id,
            email: location.state?.email,
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

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // API call to verify email OTP
      const response = await fetch(
        "http://localhost:8000/api/email-verification/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: location.state?.user_id,
            email: location.state?.email,
            otp_code: otpCode,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
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

                {/* Back to Login */}
                <div
                  className={`text-center mt-8 pt-6 border-t ${theme.border.secondary}`}
                >
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className={`text-sm ${theme.text.link} hover:${theme.text.linkHover} underline`}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6">
            <div
              className={`${theme.background.modal} rounded-3xl p-8 max-w-sm w-full ${theme.shadow.xl} transform transition-all animate-fadeIn`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                {modalContent.type === "success" ? (
                  <div
                    className={`w-20 h-20 ${theme.status.success} rounded-full flex items-center justify-center mb-5`}
                  >
                    <Icon
                      icon="mdi:check-circle"
                      className={`text-5xl ${theme.text.success}`}
                    />
                  </div>
                ) : (
                  <div
                    className={`w-20 h-20 ${theme.status.error} rounded-full flex items-center justify-center mb-5`}
                  >
                    <Icon
                      icon="mdi:alert-circle"
                      className={`text-5xl ${theme.text.error}`}
                    />
                  </div>
                )}
                <h3 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>
                  {modalContent.message}
                </h3>
                {modalContent.details && (
                  <p className={`text-sm ${theme.text.secondary} mb-8`}>
                    {modalContent.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmailVerificationOtp;
