import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/useTheme";
import { useUser } from "../../../context/useUser";
import ThemeToggle from "../../../components/ThemeToggle";
import { Icon } from "@iconify/react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const isValid =
      formData.email.trim() !== "" &&
      formData.password.trim() !== "";

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
        displayModal(
          "success",
          "Login Successful",
          "Redirecting to dashboard..."
        );

        setFormData({ email: "", password: "" });

        // Get the redirect path from location state or default to dashboard
        const from = location.state?.from?.pathname || "/dashboard";

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
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
      <ThemeToggle />
      {/* Page Background - Professional Security Design */}
      <div
        className="fixed inset-0 min-h-screen w-screen overflow-y-auto overflow-x-hidden"
        style={{
          background: isDarkMode
            ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))"
            : "linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246), rgb(249, 250, 251))",
        }}
      >
        {/* Subtle Security Pattern Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle gradient overlay for depth */}
          <div
            className="absolute inset-0"
            style={{
              background: isDarkMode
                ? "radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.05), transparent 50%)"
                : "radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.03), transparent 50%)",
            }}
          ></div>

          {/* Professional grid pattern */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ opacity: isDarkMode ? 0.02 : 0.015 }}
            xmlns="http://www.w3.org/2000/svg"
          >
       
            <rect width="100%" height="100%" fill="url(#security-grid)" />
          </svg>
        </div>

        <div>
          {/* Top Left Decorative Element */}
          <div className="absolute top-0 left-0 w-48 h-48 md:w-72 md:h-72 bg-blue-600 rounded-br-full opacity-20 pointer-events-none"></div>
        </div>

        {/* Form Container */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className={`w-full max-w-2xl mx-auto`}>
            {/* Header Section */}
            {/* Form Section - Centered on larger screens */}
            <div className="flex-1 my-auto relative z-10 flex justify-center px-3  ">
              <div
                className={`${theme.background.card} rounded-[0.5rem] ${theme.shadow.sm} w-full max-w-2xl px-6 pt-8 pb-6`}
              >
                {/* Welcome Text */}
                <div className="mb-8 flex flex-col items-center gap-2">
                  <h2
                    className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                  >
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
                        <Icon icon="mdi:email-outline" className="text-white text-sm" />
                      </div>
                      Email Address *
                    </label>
                    <div className="relative">
                      
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 placeholder:text-[0.8rem] ${
                          theme.background.input
                        } ${
                          theme.text.primary
                        } border rounded-[0.3rem] focus:outline-none transition-all focus:${theme.brand.primaryRing}`}
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
                        <Icon icon="mdi:lock-outline" className="text-white text-sm" />
                      </div>
                      Password *
                    </label>
                    <div className="relative">
                      
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full   placeholder:text-[0.8rem] ${
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
                        href="/signup"
                        className={`${theme.text.link} text-[0.8rem] hover:${theme.text.linkHover} underline  `}
                      >
                        Create Account
                      </a>
                    </p>
                  </div>
                </form>
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
                    <h3
                      className={`text-2xl font-bold ${theme.text.primary} mb-2`}
                    >
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
        </div>
      </div>
    </>
  );
};

export default Login;
