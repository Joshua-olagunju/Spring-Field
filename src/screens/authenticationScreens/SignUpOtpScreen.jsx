import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/useTheme";
import ThemeToggle from "../../../components/GeneralComponents/ThemeToggle";
import AnimatedSecurityBackground from "../../../components/GeneralComponents/AnimatedSecurityBackground";
import { Icon } from "@iconify/react";

const SignUpOtpScreen = () => {
  const navigate = useNavigate();
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
  const [superAdminCount, setSuperAdminCount] = useState(null);
  const [isCheckingCount, setIsCheckingCount] = useState(true);

  // Refs for each OTP input
  const inputRefs = useRef([]);

  // Check super admin count on mount
  useEffect(() => {
    const checkSuperAdminCount = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/super-admin-count",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();
        if (response.ok && result.success) {
          setSuperAdminCount(result.data.super_admin_count);

          // If less than 3 super admins, redirect directly to signup
          if (result.data.super_admin_count < 3) {
            displayModal("info", "Welcome!", "Redirecting to registration...");
            setTimeout(() => navigate("/signup"), 1500);
          }
        }
      } catch (error) {
        console.error("Error checking super admin count:", error);
        setError("Connection error. Please try again.");
      } finally {
        setIsCheckingCount(false);
      }
    };

    checkSuperAdminCount();
  }, [navigate]);

  useEffect(() => {
    if (!isCheckingCount && superAdminCount >= 3 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isCheckingCount, superAdminCount]);

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

  const displayModal = (type, message, details = "", otpCode = null, targetRole = null) => {
    setModalContent({ type, message, details });
    setShowModal(true);

    if (type === "info") {
      setTimeout(() => setShowModal(false), 1500);
    } else if (type === "success") {
      setTimeout(() => {
        setShowModal(false);
        // Navigate to signup with OTP code and target role
        navigate("/signup", { 
          state: { 
            otp_code: otpCode,
            target_role: targetRole || "resident"
          } 
        });
      }, 2000);
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

    try {
      // Validate and get OTP details from API
      const validateResponse = await fetch(
        "http://localhost:8000/api/validate-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp_code: otpCode }),
        }
      );

      const validateResult = await validateResponse.json();

      if (!validateResponse.ok || !validateResult.success) {
        setError(validateResult.message || "Invalid OTP. Please try again.");
        setIsLoading(false);
        return;
      }

      // OTP is valid, now we can proceed with the signup flow
      // Store the target role from the validation response
      const targetRole = validateResult.data?.target_role || "resident";
      
      displayModal(
        "success",
        "OTP Verified!",
        "Redirecting to registration...",
        otpCode,
        targetRole
      );
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Something went wrong. Please try again.");
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
          {isCheckingCount ? (
            // Loading spinner while checking super admin count
            <div className="flex flex-col items-center gap-4">
              <Icon
                icon="mdi:loading"
                className="text-6xl animate-spin text-blue-600"
              />
              <p className={theme.text.primary}>
                Checking registration status...
              </p>
            </div>
          ) : superAdminCount >= 3 ? (
            // Show OTP form only if >= 3 super admins
            <div className="w-full max-w-md">
              <div
                className={`${theme.background.card} rounded-[0.5rem] ${theme.shadow.sm} w-full px-12 pt-8 pb-6`}
              >
                {/* Header */}
                <div className="mb-8 flex flex-col items-center gap-2">
                  <div className="mb-4">
                    <Icon
                      icon="mdi:email-lock"
                      className="text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                    />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Verify OTP
                  </h2>
                  <p className={`${theme.text.secondary} text-sm text-center`}>
                    Enter the 6-digit code sent to your email to access
                    registration
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* OTP Input Fields */}
                  <div>
                    <label
                      className={`block text-sm text-center font-semibold ${theme.text.primary} mb-4`}
                    >
                      Enter OTP Code
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
                      "Verify OTP"
                    )}
                  </button>

                  {/* Contact Admin Message */}
                  <div className="text-center">
                    <div
                      className={`${theme.background.input} border ${theme.border.secondary} rounded-lg p-4`}
                    >
                      <Icon
                        icon="mdi:information"
                        className={`text-3xl ${theme.text.primary} mx-auto mb-2`}
                      />
                      <p className={`text-sm ${theme.text.secondary}`}>
                        Need help? Please contact your administrator for OTP
                        assistance.
                      </p>
                    </div>
                  </div>

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
          ) : null}
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

export default SignUpOtpScreen;
