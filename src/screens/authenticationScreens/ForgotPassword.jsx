import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/useTheme";
import ThemeToggle from "../../../components/GeneralComponents/ThemeToggle";
import AnimatedSecurityBackground from "../../../components/GeneralComponents/AnimatedSecurityBackground";
import { Icon } from "@iconify/react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { theme, isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // API call to request password reset
      const response = await fetch(
        "http://localhost:8000/api/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Navigate to OTP screen with email
        navigate("/reset-password-otp", { state: { email } });
      } else {
        setError(
          result.message || "Email not found. Please check and try again."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
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
                    icon="mdi:lock-reset"
                    className="text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                  />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Forgot Password?
                </h2>
                <p className={`${theme.text.secondary} text-sm text-center`}>
                  Enter your email address and we'll send you a code to reset
                  your password
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
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className={`w-full px-4 py-3 placeholder:text-[0.8rem] ${
                      theme.background.input
                    } ${
                      theme.text.primary
                    } border rounded-[0.3rem] focus:outline-none transition-all ${
                      error
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : `focus:${theme.brand.primaryRing}`
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                  {error && (
                    <p
                      className={`${theme.text.error} text-xs mt-2 ml-1 flex items-center gap-1`}
                    >
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {error}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!email.trim() || isLoading}
                  className={`w-full font-semibold text-[0.9rem] py-3 px-2 rounded-[0.3rem] text-white transition-all active:scale-95 ${
                    email.trim() && !isLoading
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
                      Sending Code...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </button>

                {/* Back to Login */}
                <div
                  className={`text-center mt-8 pt-6 border-t ${theme.border.secondary}`}
                >
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className={`text-sm ${theme.text.link} hover:${theme.text.linkHover} underline flex items-center justify-center gap-1 mx-auto`}
                  >
                    <Icon icon="mdi:arrow-left" className="text-base" />
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
