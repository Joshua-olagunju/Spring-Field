import { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// Theme color configurations
const themes = {
  light: {
    // Background colors
    background: {
      primary: "bg-gradient-to-br from-gray-50 to-gray-100",
      secondary: "bg-white",
      card: "bg-white",
      input: "bg-gray-50",
      inputHover: "bg-gray-100",
      modal: "bg-white",
    },
    // Text colors
    text: {
      primary: "text-gray-900",
      secondary: "text-gray-600",
      tertiary: "text-gray-500",
      inverse: "text-white",
      error: "text-red-600",
      success: "text-green-700",
      link: "text-blue-600",
      linkHover: "text-blue-700",
    },
    // Brand colors (Blue theme)
    brand: {
      primary: "bg-gradient-to-r from-blue-600 to-blue-700",
      primarySolid: "bg-blue-600",
      primaryHover: "bg-gradient-to-r from-blue-700 to-blue-800",
      primaryText: "text-blue-600",
      primaryBorder: "border-blue-600",
      primaryRing: "ring-blue-500",
      light: "bg-blue-50",
      lighter: "bg-blue-100",
    },
    // Button colors
    button: {
      primary:
        "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
      outline:
        "border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700",
      disabled: "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60",
      success: "bg-blue-600 hover:bg-blue-700 text-white",
      danger: "bg-red-600 hover:bg-red-700 text-white",
    },
    // Border colors
    border: {
      primary: "border-gray-300",
      secondary: "border-gray-200",
      focus: "border-blue-500",
      error: "border-red-500",
    },
    // Status colors
    status: {
      success: "bg-blue-100 text-blue-700",
      error: "bg-red-100 text-red-600",
      warning: "bg-yellow-100 text-yellow-700",
      info: "bg-blue-100 text-blue-700",
    },
    // Shadow colors
    shadow: {
      small: "shadow-sm",
      medium: "shadow-md",
      large: "shadow-xl",
      xl: "shadow-2xl",
    },
    // Status bar (top)
    statusBar: {
      background: "bg-white",
      text: "text-gray-900",
      icon: "text-gray-600",
      border: "border-gray-200",
    },
    // Top navigation bar
    topNav: {
      background: "bg-white/95 backdrop-blur-md",
      text: "text-gray-900",
      icon: "text-gray-600",
      border: "border-gray-200",
      hover: "hover:bg-gray-50",
    },
    // Bottom navigation bar
    bottomBar: {
      background: "bg-gray-50/95 backdrop-blur-md",
      border: "border-gray-300",
      active: "text-blue-600 bg-blue-50",
      inactive: "text-gray-500",
      iconActive: "text-blue-600",
      iconInactive: "text-gray-400",
    },
    // Animated background icons
    animatedIcons: {
      primary: "rgba(59, 130, 246, 0.25)", // Blue
      secondary: "rgba(147, 51, 234, 0.2)", // Purple
      tertiary: "rgba(59, 130, 246, 0.18)", // Light Blue
    },
  },
  dark: {
    // Background colors
    background: {
      primary: "bg-gradient-to-br from-gray-900 to-gray-800",
      secondary: "bg-gray-800",
      card: "bg-gray-800",
      input: "bg-gray-700",
      inputHover: "bg-gray-600",
      modal: "bg-gray-800",
    },
    // Text colors
    text: {
      primary: "text-gray-100",
      secondary: "text-gray-300",
      tertiary: "text-gray-400",
      inverse: "text-gray-900",
      error: "text-red-400",
      success: "text-blue-400",
      link: "text-blue-400",
      linkHover: "text-blue-300",
    },
    // Brand colors (Blue theme for dark mode)
    brand: {
      primary: "bg-gradient-to-r from-blue-500 to-blue-600",
      primarySolid: "bg-blue-500",
      primaryHover: "bg-gradient-to-r from-blue-600 to-blue-700",
      primaryText: "text-blue-400",
      primaryBorder: "border-blue-500",
      primaryRing: "ring-blue-400",
      light: "bg-blue-900",
      lighter: "bg-blue-800",
    },
    // Button colors
    button: {
      primary:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
      secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200",
      outline:
        "border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-700 text-gray-200",
      disabled: "bg-gray-700 text-gray-500 cursor-not-allowed opacity-60",
      success: "bg-blue-500 hover:bg-blue-600 text-white",
      danger: "bg-red-500 hover:bg-red-600 text-white",
    },
    // Border colors
    border: {
      primary: "border-gray-600",
      secondary: "border-gray-700",
      focus: "border-blue-400",
      error: "border-red-500",
    },
    // Status colors
    status: {
      success: "bg-blue-900 text-blue-300",
      error: "bg-red-900 text-red-300",
      warning: "bg-yellow-900 text-yellow-300",
      info: "bg-blue-900 text-blue-300",
    },
    // Shadow colors
    shadow: {
      small: "shadow-sm shadow-black/20",
      medium: "shadow-md shadow-black/30",
      large: "shadow-xl shadow-black/40",
      xl: "shadow-2xl shadow-black/50",
    },
    // Status bar (top)
    statusBar: {
      background: "bg-gray-900",
      text: "text-gray-100",
      icon: "text-gray-300",
      border: "border-gray-700",
    },
    // Top navigation bar
    topNav: {
      background: "bg-gray-900/95 backdrop-blur-md",
      text: "text-gray-100",
      icon: "text-gray-300",
      border: "border-gray-700",
      hover: "hover:bg-gray-800",
    },
    // Bottom navigation bar
    bottomBar: {
      background: "bg-gray-800/95 backdrop-blur-md",
      border: "border-gray-600",
      active: "text-blue-400 bg-blue-900/30",
      inactive: "text-gray-400",
      iconActive: "text-blue-400",
      iconInactive: "text-gray-500",
    },
    // Animated background icons
    animatedIcons: {
      primary: "rgba(59, 130, 246, 0.15)", // Blue
      secondary: "rgba(147, 51, 234, 0.12)", // Purple
      tertiary: "rgba(59, 130, 246, 0.1)", // Light Blue
    },
  },
};

export const ThemeProvider = ({ children }) => {
  // Check for saved theme preference or default to 'light'
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  // Update localStorage and document class when theme changes
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? themes.dark : themes.light;

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
    colors: theme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
