import { useTheme } from "../../context/useTheme";
import { motion } from "framer-motion";
import logoImage from "../../src/assets/logo.png";
import PoweredByDriftTech from "./PoweredByDrifttech";

const Motion = motion;

const SplashScreen = () => {
  const { theme, isDarkMode } = useTheme();

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
      }}
    >
      {/* Background - Same as AnimatedSecurityBackground but without icons */}
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
          <defs>
            <pattern
              id="splash-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#splash-grid)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Animated Logo */}
        <Motion.div
          className="mb-6"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
            <img
              src={logoImage}
              alt="SpringField Estate Logo"
              className="w-full h-full object-contain p-3"
              style={{
                filter: "invert(2) brightness(7)",
              }}
            />
          </div>
        </Motion.div>

        {/* SpringField Estate Text */}
        <Motion.h1
          className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} text-center`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: "easeOut",
          }}
        >
          SpringField Estate
        </Motion.h1>

        {/* Loading Indicator */}
        <Motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.6,
          }}
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((index) => (
              <Motion.div
                key={index}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        </Motion.div>
      </div>

      {/* Powered by DriftTech at the bottom */}
      <div className="absolute bottom-8 left-0 right-0">
        <PoweredByDriftTech />
      </div>
    </div>
  );
};

export default SplashScreen;
