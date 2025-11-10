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
      link: "text-green-600",
      linkHover: "text-green-700",
    },
    // Brand colors (Green theme)
    brand: {
      primary: "bg-gradient-to-r from-green-600 to-green-700",
      primarySolid: "bg-green-600",
      primaryHover: "bg-gradient-to-r from-green-700 to-green-800",
      primaryText: "text-green-600",
      primaryBorder: "border-green-600",
      primaryRing: "ring-green-500",
      light: "bg-green-50",
      lighter: "bg-green-100",
    },
    // Button colors
    button: {
      primary:
        "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
      outline:
        "border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700",
      disabled: "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60",
      success: "bg-green-600 hover:bg-green-700 text-white",
      danger: "bg-red-600 hover:bg-red-700 text-white",
    },
    // Border colors
    border: {
      primary: "border-gray-300",
      secondary: "border-gray-200",
      focus: "border-green-500",
      error: "border-red-500",
    },
    // Status colors
    status: {
      success: "bg-green-100 text-green-700",
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
    // Bottom navigation bar
    bottomBar: {
      background: "bg-white",
      border: "border-gray-200",
      active: "text-green-600 bg-green-50",
      inactive: "text-gray-500",
      iconActive: "text-green-600",
      iconInactive: "text-gray-400",
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
      success: "text-green-400",
      link: "text-green-400",
      linkHover: "text-green-300",
    },
    // Brand colors (Green theme for dark mode)
    brand: {
      primary: "bg-gradient-to-r from-green-500 to-green-600",
      primarySolid: "bg-green-500",
      primaryHover: "bg-gradient-to-r from-green-600 to-green-700",
      primaryText: "text-green-400",
      primaryBorder: "border-green-500",
      primaryRing: "ring-green-400",
      light: "bg-green-900",
      lighter: "bg-green-800",
    },
    // Button colors
    button: {
      primary:
        "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white",
      secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200",
      outline:
        "border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-700 text-gray-200",
      disabled: "bg-gray-700 text-gray-500 cursor-not-allowed opacity-60",
      success: "bg-green-500 hover:bg-green-600 text-white",
      danger: "bg-red-500 hover:bg-red-600 text-white",
    },
    // Border colors
    border: {
      primary: "border-gray-600",
      secondary: "border-gray-700",
      focus: "border-green-400",
      error: "border-red-500",
    },
    // Status colors
    status: {
      success: "bg-green-900 text-green-300",
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
    // Bottom navigation bar
    bottomBar: {
      background: "bg-gray-900",
      border: "border-gray-700",
      active: "text-green-400 bg-green-900/30",
      inactive: "text-gray-400",
      iconActive: "text-green-400",
      iconInactive: "text-gray-500",
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
