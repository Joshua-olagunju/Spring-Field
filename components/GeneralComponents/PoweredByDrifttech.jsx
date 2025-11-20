import { useTheme } from "../../context/useTheme";
import { motion } from "framer-motion";

const Motion = motion;

const PoweredByDriftTech = ({ className = "", style = {} }) => {
  const { isDarkMode } = useTheme();

  return (
    <Motion.div
      className={`relative w-full flex justify-center mt-8 mb-4 ${className}`}
      style={{
        ...style,
      }}
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 1.2,
        delay: 1.5,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Motion.div
        className="px-4 py-2 rounded-full backdrop-blur-md border shadow-2xl"
        style={{
          backgroundColor: isDarkMode
            ? "rgba(30, 30, 30, 0.85)"
            : "rgba(255, 255, 255, 0.85)",
          borderColor: isDarkMode
            ? "rgba(59, 130, 246, 0.3)"
            : "rgba(59, 130, 246, 0.2)",
          boxShadow: isDarkMode
            ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.1)"
            : "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 20px rgba(59, 130, 246, 0.1)",
        }}
        animate={{
          y: [-2, 2, -2],
          rotate: [0, 1, 0, -1, 0],
        }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <Motion.p
          className="text-sm font-medium text-center select-none"
          style={{
            color: isDarkMode
              ? "rgba(156, 163, 175, 0.9)"
              : "rgba(75, 85, 99, 0.9)",
          }}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Powered by{" "}
          <Motion.span
            className="font-bold text-transparent bg-clip-text cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6, #3B82F6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% 200%",
            }}
            animate={{
              scale: [1, 1.08, 1],
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              scale: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              },
              backgroundPosition: {
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            whileHover={{
              scale: 1.15,
              transition: { duration: 0.2 },
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.1 },
            }}
          >
            DriftTech
          </Motion.span>
        </Motion.p>
      </Motion.div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <Motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              left: `${20 + i * 30}%`,
              top: "50%",
            }}
            animate={{
              y: [-10, -20, -10],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </Motion.div>
  );
};

export default PoweredByDriftTech;
