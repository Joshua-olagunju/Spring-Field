/**
 * Centralized Button Styles Configuration
 * Consistent gradient button styles across the application
 */

export const buttonStyles = {
  // Primary gradient button (main CTA)
  primary: `
    bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 
    hover:from-purple-700 hover:via-blue-700 hover:to-purple-700
    text-white font-semibold py-3 px-6 rounded-lg
    transition-all duration-300 ease-in-out
    transform hover:scale-105 hover:shadow-lg
    focus:outline-none focus:ring-4 focus:ring-purple-500/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `,

  // Secondary gradient button
  secondary: `
    bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500
    hover:from-blue-600 hover:via-purple-600 hover:to-blue-600
    text-white font-semibold py-3 px-6 rounded-lg
    transition-all duration-300 ease-in-out
    transform hover:scale-105 hover:shadow-lg
    focus:outline-none focus:ring-4 focus:ring-blue-500/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `,

  // Success gradient button
  success: `
    bg-gradient-to-r from-green-500 via-emerald-500 to-green-500
    hover:from-green-600 hover:via-emerald-600 hover:to-green-600
    text-white font-semibold py-3 px-6 rounded-lg
    transition-all duration-300 ease-in-out
    transform hover:scale-105 hover:shadow-lg
    focus:outline-none focus:ring-4 focus:ring-green-500/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `,

  // Danger gradient button
  danger: `
    bg-gradient-to-r from-red-500 via-pink-500 to-red-500
    hover:from-red-600 hover:via-pink-600 hover:to-red-600
    text-white font-semibold py-3 px-6 rounded-lg
    transition-all duration-300 ease-in-out
    transform hover:scale-105 hover:shadow-lg
    focus:outline-none focus:ring-4 focus:ring-red-500/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `,

  // Warning gradient button
  warning: `
    bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500
    hover:from-yellow-600 hover:via-orange-600 hover:to-yellow-600
    text-white font-semibold py-3 px-6 rounded-lg
    transition-all duration-300 ease-in-out
    transform hover:scale-105 hover:shadow-lg
    focus:outline-none focus:ring-4 focus:ring-yellow-500/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `,

  // Outline gradient button
  outline: `
    bg-transparent border-2 border-purple-600 text-purple-600
    dark:border-purple-400 dark:text-purple-400
    hover:bg-gradient-to-r hover:from-purple-600 hover:via-blue-600 hover:to-purple-600
    hover:text-white hover:border-transparent
    font-semibold py-3 px-6 rounded-lg
    transition-all duration-300 ease-in-out
    transform hover:scale-105 hover:shadow-lg
    focus:outline-none focus:ring-4 focus:ring-purple-500/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `,

  // Ghost button
  ghost: `
    bg-transparent text-gray-700 dark:text-gray-300
    hover:bg-gray-100 dark:hover:bg-gray-800
    font-semibold py-3 px-6 rounded-lg
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-4 focus:ring-gray-500/50
    disabled:opacity-50 disabled:cursor-not-allowed
  `,

  // Small size variant
  small: `py-2 px-4 text-sm`,

  // Large size variant
  large: `py-4 px-8 text-lg`,

  // Full width
  fullWidth: `w-full`,

  // Icon button
  icon: `
    p-3 rounded-lg
    bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600
    hover:from-purple-700 hover:via-blue-700 hover:to-purple-700
    text-white transition-all duration-300
    focus:outline-none focus:ring-4 focus:ring-purple-500/50
    transform hover:scale-110
  `,
};

/**
 * Helper function to combine button styles
 * @param {string} variant - Button variant (primary, secondary, etc.)
 * @param {string} size - Button size (small, large)
 * @param {boolean} fullWidth - Whether button should be full width
 * @param {string} additional - Additional custom classes
 * @returns {string} Combined class names
 */
export const getButtonClass = (
  variant = "primary",
  size = "",
  fullWidth = false,
  additional = ""
) => {
  const baseClass = buttonStyles[variant] || buttonStyles.primary;
  const sizeClass = size ? buttonStyles[size] : "";
  const widthClass = fullWidth ? buttonStyles.fullWidth : "";

  return `${baseClass} ${sizeClass} ${widthClass} ${additional}`
    .trim()
    .replace(/\s+/g, " ");
};

export default buttonStyles;
