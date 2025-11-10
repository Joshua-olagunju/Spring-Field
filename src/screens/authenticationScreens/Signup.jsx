import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/useTheme";
import ThemeToggle from "../../../components/ThemeToggle";
import AnimatedSecurityBackground from "../../../components/AnimatedSecurityBackground";
import { Icon } from "@iconify/react";

const SignUp = () => {
  const navigate = useNavigate();
  const { theme, isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    houseNumber: "",
    address: "",
    description: "",
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
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    houseNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ""));
  };

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

    // Validation
    if (id === "email") {
      if (value.trim() === "") {
        setErrors((prev) => ({ ...prev, email: "" }));
      } else if (!validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (id === "phoneNumber") {
      if (value.trim() === "") {
        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      } else if (!validatePhoneNumber(value)) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "Invalid phone number (10-15 digits)",
        }));
      } else {
        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      }
    }

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

    // Clear other field errors on input
    if (["firstName", "lastName", "houseNumber", "address"].includes(id)) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  useEffect(() => {
    const allRequirementsMet = Object.values(passwordRequirements).every(
      (req) => req === true
    );

    const isValid =
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      validateEmail(formData.email) &&
      formData.phoneNumber.trim() !== "" &&
      validatePhoneNumber(formData.phoneNumber) &&
      formData.houseNumber.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.confirmPassword.trim() !== "" &&
      formData.password === formData.confirmPassword &&
      allRequirementsMet &&
      Object.values(errors).every((error) => error === "");

    setIsFormValid(isValid);
  }, [formData, passwordRequirements, errors]);

  const displayModal = (type, message, details = "", userEmail = "", userId = null, userRole = "resident") => {
    setModalContent({ type, message, details });
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
      if (type === "success") {
        navigate("/email-verification", { state: { email: userEmail, user_id: userId, role: userRole } });
      }
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          house_number: formData.houseNumber,
          address: formData.address,
          description: formData.description,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        displayModal(
          "success",
          "Registration Successful!",
          "Please verify your email to continue...",
          formData.email,
          result.data?.user?.id,
          result.data?.user?.role
        );
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          houseNumber: "",
          address: "",
          description: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        displayModal(
          "error",
          "Registration Failed",
          result.message || "Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      displayModal(
        "error",
        "Registration Failed",
        "Something went wrong. Please check your connection or try again later."
      );
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
          <div className="w-full max-w-2xl">
            <div
              className={`${theme.background.card} rounded-[0.5rem] ${theme.shadow.sm} w-full px-12 pt-8 pb-6`}
            >
              {/* Welcome Text */}
              <div className="mb-8 flex flex-col items-center gap-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Create Account
                </h2>
                <p className={`${theme.text.secondary} text-sm`}>
                  Fill in your details to register
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* First Name and Last Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className={`block text-sm text-start font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}
                    >
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded">
                        <Icon
                          icon="mdi:account"
                          className="text-white text-sm"
                        />
                      </div>
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                      placeholder="Enter first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className={`block text-sm text-start font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}
                    >
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded">
                        <Icon
                          icon="mdi:account"
                          className="text-white text-sm"
                        />
                      </div>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

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
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p
                      className={`${theme.text.error} text-xs mt-2 ml-1 flex items-center gap-1`}
                    >
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className={`block text-sm text-start font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded">
                      <Icon icon="mdi:phone" className="text-white text-sm" />
                    </div>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && (
                    <p
                      className={`${theme.text.error} text-xs mt-2 ml-1 flex items-center gap-1`}
                    >
                      <Icon icon="mdi:alert-circle" className="text-sm" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* House Number and Address Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* House Number */}
                  <div>
                    <label
                      htmlFor="houseNumber"
                      className={`block text-sm text-start font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}
                    >
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded">
                        <Icon icon="mdi:home" className="text-white text-sm" />
                      </div>
                      House Number *
                    </label>
                    <input
                      type="text"
                      id="houseNumber"
                      value={formData.houseNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                      placeholder="e.g., 123"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="address"
                      className={`block text-sm text-start font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}
                    >
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded">
                        <Icon
                          icon="mdi:map-marker"
                          className="text-white text-sm"
                        />
                      </div>
                      Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                {/* Description Field */}
                <div>
                  <label
                    htmlFor="description"
                    className={`block text-sm text-start font-semibold ${theme.text.primary} mb-3 flex items-center gap-2`}
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded">
                      <Icon
                        icon="mdi:text-box-outline"
                        className="text-white text-sm"
                      />
                    </div>
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-3 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing} resize-none`}
                    placeholder="Additional information (optional)"
                  />
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
                      className={`w-full px-4 py-3 pr-12 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                      placeholder="Create password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      <Icon
                        icon={showPassword ? "mdi:eye" : "mdi:eye-off"}
                        className={`text-[1rem] ${theme.text.tertiary}`}
                      />
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-3 space-y-1.5">
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
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 placeholder:text-[0.8rem] ${theme.background.input} ${theme.text.primary} border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
                      placeholder="Confirm your password"
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
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Login Link */}
                <div
                  className={`text-center mt-8 pt-6 border-t ${theme.border.secondary}`}
                >
                  <p className={`text-sm ${theme.text.secondary}`}>
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className={`${theme.text.link} text-[0.8rem] hover:${theme.text.linkHover} underline`}
                    >
                      Sign In
                    </a>
                  </p>
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
                <button
                  onClick={() => setShowModal(false)}
                  className={`w-full py-3.5 rounded-2xl font-bold transition-all active:scale-95 ${
                    modalContent.type === "success"
                      ? theme.button.success
                      : theme.button.danger
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SignUp;
