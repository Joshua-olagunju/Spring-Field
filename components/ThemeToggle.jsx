import { useTheme } from "../context/useTheme";
import { Icon } from "@iconify/react";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all active:scale-95"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Icon
          icon="mdi:white-balance-sunny"
          className="text-2xl text-yellow-500"
        />
      ) : (
        <Icon
          icon="mdi:moon-waning-crescent"
          className="text-2xl text-gray-700"
        />
      )}
    </button>
  );
};

export default ThemeToggle;
