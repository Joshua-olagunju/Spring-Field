/**
 * Real-time Form Validation Utilities
 * Provides instant feedback for form inputs with accessibility
 */

/**
 * Validate email in real-time
 * @param {string} email - Email to validate
 * @returns {object} Validation result with message
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate password with strength requirements
 * @param {string} password - Password to validate
 * @returns {object} Validation result with details
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: "Password is required",
      requirements: {
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      },
    };
  }

  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&\-_]/.test(password),
  };

  const allMet = Object.values(requirements).every((req) => req);

  let message = "";
  if (!allMet) {
    const missing = [];
    if (!requirements.minLength) missing.push("at least 8 characters");
    if (!requirements.hasUpperCase) missing.push("one uppercase letter");
    if (!requirements.hasLowerCase) missing.push("one lowercase letter");
    if (!requirements.hasNumber) missing.push("one number");
    if (!requirements.hasSpecialChar) missing.push("one special character");
    message = `Password must contain ${missing.join(", ")}`;
  }

  return {
    isValid: allMet,
    message,
    requirements,
    strength: calculatePasswordStrength(requirements),
  };
};

/**
 * Calculate password strength
 * @param {object} requirements - Requirements object
 * @returns {string} Strength level
 */
const calculatePasswordStrength = (requirements) => {
  const metCount = Object.values(requirements).filter((req) => req).length;

  if (metCount <= 2) return "weak";
  if (metCount <= 3) return "medium";
  if (metCount <= 4) return "good";
  return "strong";
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {object} Validation result
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: "Phone number is required" };
  }

  // Remove spaces and check if it's a valid format
  const cleanPhone = phone.replace(/\s/g, "");
  const phoneRegex = /^[0-9]{10,15}$/;

  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      message: "Please enter a valid phone number (10-15 digits)",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {object} Validation result
 */
export const validateRequired = (value, fieldName = "This field") => {
  if (!value || value.trim() === "") {
    return { isValid: false, message: `${fieldName} is required` };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate confirmation match
 * @param {string} value - Value to check
 * @param {string} confirmValue - Confirmation value
 * @param {string} fieldName - Name of the field
 * @returns {object} Validation result
 */
export const validateMatch = (value, confirmValue, fieldName = "Password") => {
  if (value !== confirmValue) {
    return { isValid: false, message: `${fieldName}s do not match` };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate OTP code
 * @param {string} otp - OTP to validate
 * @param {number} length - Expected length
 * @returns {object} Validation result
 */
export const validateOTP = (otp, length = 6) => {
  if (!otp) {
    return { isValid: false, message: "OTP is required" };
  }

  if (otp.length !== length) {
    return {
      isValid: false,
      message: `OTP must be ${length} digits`,
    };
  }

  if (!/^\d+$/.test(otp)) {
    return { isValid: false, message: "OTP must contain only numbers" };
  }

  return { isValid: true, message: "" };
};

/**
 * Get validation class for input
 * @param {boolean} touched - Whether field has been touched
 * @param {boolean} isValid - Whether field is valid
 * @param {boolean} isDarkMode - Dark mode status
 * @returns {string} Class name for input
 */
export const getInputValidationClass = (
  touched,
  isValid,
  isDarkMode = false
) => {
  if (!touched) {
    return isDarkMode
      ? "border-gray-600 focus:border-purple-500 focus:ring-purple-500"
      : "border-gray-300 focus:border-purple-500 focus:ring-purple-500";
  }

  if (isValid) {
    return isDarkMode
      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
      : "border-green-500 focus:border-green-500 focus:ring-green-500";
  }

  return isDarkMode
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : "border-red-500 focus:border-red-500 focus:ring-red-500";
};

/**
 * Get password strength color
 * @param {string} strength - Strength level
 * @returns {string} Color class
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case "weak":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "good":
      return "bg-blue-500";
    case "strong":
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
};

/**
 * Get password strength text
 * @param {string} strength - Strength level
 * @returns {string} Strength text
 */
export const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case "weak":
      return "Weak";
    case "medium":
      return "Medium";
    case "good":
      return "Good";
    case "strong":
      return "Strong";
    default:
      return "";
  }
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
  validateMatch,
  validateOTP,
  getInputValidationClass,
  getPasswordStrengthColor,
  getPasswordStrengthText,
};
