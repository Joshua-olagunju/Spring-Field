import { useTheme } from "../context/useTheme";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const Motion = motion;

const AnimatedSecurityBackground = () => {
  const { theme, isDarkMode } = useTheme();

  return (
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
            id="security-grid"
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
        <rect width="100%" height="100%" fill="url(#security-grid)" />
      </svg>

      {/* Animated Security Icons - Distributed across entire viewport */}

      {/* Icon 1 - Shield Lock (Top Left) */}
      <Motion.div
        className="absolute"
        style={{
          top: "8%",
          left: "12%",
          color: theme.animatedIcons.primary,
          filter: "drop-shadow(0 0 8px currentColor)",
        }}
        animate={{
          y: [0, -30, 0],
          rotate: [0, 8, 0, -8, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Icon icon="mdi:shield-lock" className="text-7xl" />
      </Motion.div>

      {/* Icon 2 - Key (Top Right) */}
      <Motion.div
        className="absolute"
        style={{
          top: "15%",
          right: "18%",
          color: theme.animatedIcons.secondary,
          filter: "drop-shadow(0 0 8px currentColor)",
        }}
        animate={{
          y: [0, 20, 0],
          rotate: [0, -15, 0, 10, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <Icon icon="mdi:key-variant" className="text-6xl" />
      </Motion.div>

      {/* Icon 3 - Fingerprint (Middle Left) */}
      <Motion.div
        className="absolute"
        style={{
          top: "35%",
          left: "8%",
          color: theme.animatedIcons.tertiary,
          filter: "drop-shadow(0 0 10px currentColor)",
        }}
        animate={{
          y: [0, -35, 0],
          scale: [1, 1.15, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <Icon icon="mdi:fingerprint" className="text-8xl" />
      </Motion.div>

      {/* Icon 4 - Lock (Middle Right) */}
      <Motion.div
        className="absolute"
        style={{
          top: "40%",
          right: "10%",
          color: theme.animatedIcons.secondary,
          filter: "drop-shadow(0 0 8px currentColor)",
        }}
        animate={{
          y: [0, 25, 0],
          rotate: [0, 12, 0, -8, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 8.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        <Icon icon="mdi:lock" className="text-6xl" />
      </Motion.div>

      {/* Icon 5 - CCTV (Middle Center-Left) */}
      <Motion.div
        className="absolute"
        style={{
          top: "55%",
          left: "15%",
          color: theme.animatedIcons.primary,
          filter: "drop-shadow(0 0 8px currentColor)",
        }}
        animate={{
          x: [0, 15, 0, -10, 0],
          y: [0, -20, 0],
          rotate: [0, -10, 0, 8, 0],
        }}
        transition={{
          duration: 9.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      >
        <Icon icon="mdi:cctv" className="text-7xl" />
      </Motion.div>

      {/* Icon 6 - Safe (Middle Center-Right) */}
      <Motion.div
        className="absolute"
        style={{
          top: "50%",
          right: "15%",
          color: theme.animatedIcons.tertiary,
          filter: "drop-shadow(0 0 8px currentColor)",
        }}
        animate={{
          y: [0, -22, 0],
          rotate: [0, -8, 0, 6, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.5,
        }}
      >
        <Icon icon="mdi:safe-square" className="text-6xl" />
      </Motion.div>

      {/* Icon 7 - Account Lock (Bottom Left) */}
      <Motion.div
        className="absolute"
        style={{
          bottom: "18%",
          left: "10%",
          color: theme.animatedIcons.primary,
          filter: "drop-shadow(0 0 8px currentColor)",
        }}
        animate={{
          y: [0, 18, 0],
          scale: [1, 1.12, 1],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 8.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      >
        <Icon icon="mdi:account-lock" className="text-6xl" />
      </Motion.div>

      {/* Icon 8 - Eye Check (Bottom Right) */}
      <Motion.div
        className="absolute"
        style={{
          bottom: "22%",
          right: "12%",
          color: theme.animatedIcons.secondary,
          filter: "drop-shadow(0 0 10px currentColor)",
        }}
        animate={{
          x: [0, -12, 0, 8, 0],
          y: [0, 15, 0, -10, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 9.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3.5,
        }}
      >
        <Icon icon="mdi:eye-check" className="text-7xl" />
      </Motion.div>

      {/* Icon 9 - Network Security (Lower Middle Left) */}
      <Motion.div
        className="absolute"
        style={{
          bottom: "10%",
          left: "20%",
          color: theme.animatedIcons.primary,
          filter: "drop-shadow(0 0 8px currentColor)",
        }}
        animate={{
          y: [0, -25, 0, 15, 0],
          rotate: [0, 15, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      >
        <Icon icon="mdi:security-network" className="text-5xl" />
      </Motion.div>

      {/* Icon 10 - Shield Check (Lower Middle Right) */}
      <Motion.div
        className="absolute"
        style={{
          bottom: "12%",
          right: "22%",
          color: theme.animatedIcons.tertiary,
          filter: "drop-shadow(0 0 8px currentColor)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4.5,
        }}
      >
        <Icon icon="mdi:shield-check" className="text-6xl" />
      </Motion.div>

      {/* Icon 11 - VPN Key (Top Center) */}
      <Motion.div
        className="absolute"
        style={{
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          color: theme.animatedIcons.secondary,
          filter: "drop-shadow(0 0 8px currentColor)",
        }}
        animate={{
          y: [0, -18, 0],
          x: [-20, 20, -20],
          rotate: [0, -12, 0],
        }}
        transition={{
          duration: 10.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
      >
        <Icon icon="mdi:vpn-key" className="text-6xl" />
      </Motion.div>

      {/* Icon 12 - Shield Star (Bottom Center) */}
      <Motion.div
        className="absolute"
        style={{
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          color: theme.animatedIcons.primary,
          filter: "drop-shadow(0 0 8px currentColor)",
        }}
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.15, 1],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 9.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.8,
        }}
      >
        <Icon icon="mdi:shield-star" className="text-6xl" />
      </Motion.div>
    </div>
  );
};

export default AnimatedSecurityBackground;
