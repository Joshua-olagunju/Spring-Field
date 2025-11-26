import { useTheme } from "../../context/useTheme";

const StatusBar = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999]"
      style={{
        height: "max(24px, env(safe-area-inset-top))",
        paddingTop: "env(safe-area-inset-top)",
        backgroundColor: isDarkMode ? "#111827" : "#ffffff",
        WebkitBackdropFilter: "none",
        backdropFilter: "none",
        opacity: 1,
      }}
    />
  );
};

export default StatusBar;
