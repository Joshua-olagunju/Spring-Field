import { useTheme } from "../context/useTheme";

const StatusBar = () => {
  const { theme } = useTheme();

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-6"
      style={{
        backgroundColor: theme.statusBar.background,
      }}
    />
  );
};

export default StatusBar;
