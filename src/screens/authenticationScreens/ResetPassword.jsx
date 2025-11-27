import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/useTheme";
import useStore from "../../store/useStore";
import { API_BASE_URL } from "../../config/apiConfig";
import AnimatedSecurityBackground from "../../../components/GeneralComponents/AnimatedSecurityBackground";
import PoweredByDriftTech from "../../../components/GeneralComponents/PoweredByDrifttech";
import { Icon } from "@iconify/react";
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthText,
} from "../../utils/formValidation";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    type: "",
    message: "",
    details: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  // Real-time validation state
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Get email and token from navigation state or localStorage
  const [userEmail, setUserEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Initialize email and token from navigation state or localStorage
  const resetPasswordToken = useStore((state) => state.resetPasswordToken);

  useEffect(() => {
    // First try to get from location.state
    if (location.state?.email && location.state?.token) {
      setUserEmail(location.state.email);
      setResetToken(location.state.token);
      // Loaded reset credentials from navigation state

      // Save to store for persistence
      try {
        const tokenData = {
          email: location.state.email,
          token: location.state.token,
          timestamp: Date.now(),
        };
        useStore.getState().setResetPasswordToken(tokenData);
        // Saved reset token to store
      } catch (error) {
        console.warn("Error saving reset token to store:", error);
      }
    } else if (!location.state?.email && !location.state?.token) {
      // Only try to restore from store if location.state is empty
      try {
        const storedData = resetPasswordToken;
        if (storedData && storedData.email && storedData.token) {
          const tokenData = storedData;
          setUserEmail(tokenData.email || "");
          setResetToken(tokenData.token || "");
          // Restored reset credentials from store
        }
      } catch (error) {
        console.warn("Error parsing stored reset token:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]); // Only depend on location.state to avoid infinite loop

  useEffect(() => {
    // Redirect if no email or token provided (now checking state variables)
    // if (!userEmail || !resetToken) {
    //   navigate("/forgot-password");
    // }
  }, [navigate]);

  const checkPasswordRequirements = (password) => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (id === "password") {
      checkPasswordRequirements(value);
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }

    if (id === "confirmPassword") {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  useEffect(() => {
    const allRequirementsMet = Object.values(passwordRequirements).every(
      (req) => req === true
    );

    const isValid =
      formData.password.trim() !== "" &&
      formData.confirmPassword.trim() !== "" &&
      formData.password === formData.confirmPassword &&
      allRequirementsMet &&
      Object.values(errors).every((error) => error === "");

    setIsFormValid(isValid);
  }, [formData, passwordRequirements, errors]);

  const displayModal = (type, message, details = "") => {
    setModalContent({ type, message, details });
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
      if (type === "success") {
        navigate("/login");
      }
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    // Validate that we have email and token
    if (!userEmail || !resetToken) {
      displayModal(
        "error",
        "Session Expired",
        "Please start the password reset process again."
      );
      setTimeout(() => {
        navigate("/forgot-password");
      }, 3000);
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        email: userEmail,
        token: resetToken,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      };

      // Submitting password reset

      const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      // Reset password response received

      if (response.ok && result.success) {
        // Clear store after successful password reset
        try {
          useStore.getState().clearResetPasswordToken();
          useStore.getState().clearResetPasswordData();
          // Cleared reset password data from store
        } catch (error) {
          console.warn("Error clearing localStorage:", error);
        }

        displayModal(
          "success",
          "Password Reset Successful!",
          "You can now login with your new password"
        );
        setFormData({ password: "", confirmPassword: "" });
      } else {
        // Handle validation errors
        let errorMessage = result.message || "Please try again.";

        if (result.errors) {
          // Extract first error message
          const firstError = Object.values(result.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          }
          console.error("❌ Validation errors:", result.errors);
        }

        displayModal("error", "Password Reset Failed", errorMessage);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      displayModal(
        "error",
        "Password Reset Failed",
        "Something went wrong. Please try again later."
      );
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
                    icon="mdi:lock-reset"
                    className="text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                  />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Reset Password
                </h2>
                <p className={`${theme.text.secondary} text-sm text-center`}>
                  Create a new secure password for your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => setTouched({ ...touched, password: true })}
                      className={`w-full px-4 py-3 pr-12 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                      placeholder="Create new password"
                      aria-label="New password"
                      aria-required="true"
                      aria-invalid={
                        touched.password &&
                        !Object.values(passwordRequirements).every((v) => v)
                          ? "true"
                          : "false"
                      }
                      aria-describedby="password-requirements"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor(
                              validatePassword(formData.password).strength
                            )}`}
                            style={{
                              width: `${
                                (validatePassword(formData.password).strength /
                                  5) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            getPasswordStrengthText(
                              validatePassword(formData.password).strength
                            ) === "Weak"
                              ? "text-red-500"
                              : getPasswordStrengthText(
                                  validatePassword(formData.password).strength
                                ) === "Fair"
                              ? "text-yellow-500"
                              : getPasswordStrengthText(
                                  validatePassword(formData.password).strength
                                ) === "Good"
                              ? "text-blue-500"
                              : getPasswordStrengthText(
                                  validatePassword(formData.password).strength
                                ) === "Strong"
                              ? "text-green-500"
                              : "text-green-600"
                          }`}
                        >
                          {getPasswordStrengthText(
                            validatePassword(formData.password).strength
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Password Requirements */}
                  <div id="password-requirements" className="mt-3 space-y-1.5">
                    <p
                      className={`text-xs font-semibold ${theme.text.secondary}`}
                    >
                      Password Requirements:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <div
                        className={`flex items-center gap-1.5 text-xs ${
                          passwordRequirements.minLength
                            ? theme.text.success
                            : theme.text.tertiary
                        }`}
                      >
                        <Icon
                          icon={
                            passwordRequirements.minLength
                              ? "mdi:check-circle"
                              : "mdi:circle-outline"
                          }
                          className="text-sm"
                        />
                        At least 8 characters
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-xs ${
                          passwordRequirements.hasUpperCase
                            ? theme.text.success
                            : theme.text.tertiary
                        }`}
                      >
                        <Icon
                          icon={
                            passwordRequirements.hasUpperCase
                              ? "mdi:check-circle"
                              : "mdi:circle-outline"
                          }
                          className="text-sm"
                        />
                        One uppercase letter
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-xs ${
                          passwordRequirements.hasLowerCase
                            ? theme.text.success
                            : theme.text.tertiary
                        }`}
                      >
                        <Icon
                          icon={
                            passwordRequirements.hasLowerCase
                              ? "mdi:check-circle"
                              : "mdi:circle-outline"
                          }
                          className="text-sm"
                        />
                        One lowercase letter
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-xs ${
                          passwordRequirements.hasNumber
                            ? theme.text.success
                            : theme.text.tertiary
                        }`}
                      >
                        <Icon
                          icon={
                            passwordRequirements.hasNumber
                              ? "mdi:check-circle"
                              : "mdi:circle-outline"
                          }
                          className="text-sm"
                        />
                        One number
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-xs sm:col-span-2 ${
                          passwordRequirements.hasSpecialChar
                            ? theme.text.success
                            : theme.text.tertiary
                        }`}
                      >
                        <Icon
                          icon={
                            passwordRequirements.hasSpecialChar
                              ? "mdi:check-circle"
                              : "mdi:circle-outline"
                          }
                          className="text-sm"
                        />
                        One special character (!@#$%^&*)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className={`block text-sm text-start font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded">
                      <Icon
                        icon="mdi:lock-check"
                        className="text-white text-sm"
                      />
                    </div>
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      <Icon
                        icon={showConfirmPassword ? "mdi:eye" : "mdi:eye-off"}
                        className={`text-[1rem] ${theme.text.tertiary}`}
                      />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p
                      className={`${theme.text.error} text-xs mt-2 ml-1 flex items-center gap-1`}
                    >
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {errors.confirmPassword}
                    </p>
                  )}
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
                      Resetting Password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                {/* Back to Login */}
                <div
                  className={`text-center mt-8 pt-6 border-t ${theme.border.secondary}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      // Clear store when going back
                      try {
                        useStore.getState().clearResetPasswordToken();
                        useStore.getState().clearResetPasswordData();
                      } catch (error) {
                        console.warn("Error clearing store:", error);
                      }
                      navigate("/login");
                    }}
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

export default ResetPassword;
