import { useTheme } from "../../context/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

const Motion = motion;

const PoweredByDriftTech = ({ className = "", style = {} }) => {
  const { isDarkMode } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(60);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingLink, setPendingLink] = useState(null);
  const sheetRef = useRef(null);
  const dragStartY = useRef(0);
  const initialHeight = useRef(60);

  // Snap points in vh
  const SNAP_POINTS = [60, 90];
  const MIN_HEIGHT = 30;
  const CLOSE_THRESHOLD = 40;

  // Auto flip effect - simple text change
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 4000); // Change text every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCardClick = () => {
    setShowBottomSheet(true);
  };

  const handleContactClick = (contact) => {
    if (contact.link.startsWith("mailto:")) {
      window.location.href = contact.link;
    } else {
      setPendingLink(contact);
      setShowExitModal(true);
    }
  };

  const handleConfirmExit = () => {
    if (pendingLink) {
      window.open(pendingLink.link, "_blank", "noopener,noreferrer");
      setPendingLink(null);
      setShowExitModal(false);
    }
  };

  const handleCancelExit = () => {
    setPendingLink(null);
    setShowExitModal(false);
  };

  // Drag handlers for bottom sheet
  const handleDragStart = (event, info) => {
    dragStartY.current = info.point.y;
    initialHeight.current = sheetHeight;
  };

  const handleDrag = (event, info) => {
    const windowHeight = window.innerHeight;
    const dragDelta = info.point.y - dragStartY.current;
    const deltaVh = (dragDelta / windowHeight) * 100;

    // Calculate new height (dragging down decreases height)
    const newHeight = Math.max(
      MIN_HEIGHT,
      Math.min(95, initialHeight.current - deltaVh)
    );
    setSheetHeight(newHeight);
  };

  const findClosestSnapPoint = (height) => {
    // Find the closest snap point
    let closest = SNAP_POINTS[0];
    let minDiff = Math.abs(height - closest);

    for (const snap of SNAP_POINTS) {
      const diff = Math.abs(height - snap);
      if (diff < minDiff) {
        minDiff = diff;
        closest = snap;
      }
    }

    return closest;
  };

  const handleDragEnd = (event, info) => {
    const velocity = info.velocity.y;

    // If dragged down quickly or below close threshold, close the sheet
    if (velocity > 500 || sheetHeight < CLOSE_THRESHOLD) {
      setShowBottomSheet(false);
      setSheetHeight(60);
      return;
    }

    // If dragged up quickly, go to max snap point
    if (velocity < -500) {
      setSheetHeight(SNAP_POINTS[SNAP_POINTS.length - 1]);
      return;
    }

    // Otherwise, snap to the closest snap point
    const closestSnap = findClosestSnapPoint(sheetHeight);
    setSheetHeight(closestSnap);
  };

  const contactLinks = [
    {
      name: "Email",
      value: "hello@drifttech.com",
      link: "mailto:hello@drifttech.com",
      icon: "material-symbols:mail-rounded",
      color: "#EA4335",
      description: "Send us an email",
    },
    {
      name: "Website",
      value: "drifttech.com",
      link: "https://drifttech.com",
      icon: "material-symbols:language",
      color: "#4285F4",
      description: "Visit our website",
    },
    {
      name: "Twitter",
      value: "@drifttech",
      link: "https://twitter.com/drifttech",
      icon: "mdi:twitter",
      color: "#1DA1F2",
      description: "Follow us on Twitter",
    },
    {
      name: "LinkedIn",
      value: "DriftTech",
      link: "https://linkedin.com/company/drifttech",
      icon: "mdi:linkedin",
      color: "#0A66C2",
      description: "Connect with us on LinkedIn",
    },
  ];

  return (
    <>
      <Motion.div
        className={`relative w-full flex justify-center mb-20 mt-8  ${className}`}
        style={{
          ...style,
          perspective: "1000px",
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
          className="relative cursor-pointer"
          onClick={handleCardClick}
        >
          {/* Single Card with Text Animation */}
          <Motion.div
            className="px-4 py-2 rounded-full backdrop-blur-md border shadow-2xl"
            style={{
              backgroundColor: isDarkMode
                ? isFlipped
                  ? "rgba(139, 92, 246, 0.15)"
                  : "rgba(30, 30, 30, 0.85)"
                : isFlipped
                ? "rgba(139, 92, 246, 0.08)"
                : "rgba(255, 255, 255, 0.85)",
              borderColor: isDarkMode
                ? isFlipped
                  ? "rgba(139, 92, 246, 0.4)"
                  : "rgba(59, 130, 246, 0.3)"
                : isFlipped
                ? "rgba(139, 92, 246, 0.3)"
                : "rgba(59, 130, 246, 0.2)",
              boxShadow: isDarkMode
                ? isFlipped
                  ? "0 8px 32px rgba(139, 92, 246, 0.2), 0 0 20px rgba(139, 92, 246, 0.1)"
                  : "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.1)"
                : isFlipped
                ? "0 8px 32px rgba(139, 92, 246, 0.1), 0 0 20px rgba(139, 92, 246, 0.05)"
                : "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 20px rgba(59, 130, 246, 0.1)",
            }}
            animate={{
              y: [-2, 2, -2],
              rotate: [0, 1, 0, -1, 0],
              backgroundColor: isDarkMode
                ? isFlipped
                  ? "rgba(139, 92, 246, 0.15)"
                  : "rgba(30, 30, 30, 0.85)"
                : isFlipped
                ? "rgba(139, 92, 246, 0.08)"
                : "rgba(255, 255, 255, 0.85)",
              borderColor: isDarkMode
                ? isFlipped
                  ? "rgba(139, 92, 246, 0.4)"
                  : "rgba(59, 130, 246, 0.3)"
                : isFlipped
                ? "rgba(139, 92, 246, 0.3)"
                : "rgba(59, 130, 246, 0.2)",
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
              backgroundColor: {
                duration: 0.6,
                ease: "easeInOut",
              },
              borderColor: {
                duration: 0.6,
                ease: "easeInOut",
              },
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            whileTap={{
              scale: 0.98,
              transition: { duration: 0.1 },
            }}
          >
            <Motion.div
              className="text-sm font-medium text-center select-none min-h-[20px] flex items-center justify-center"
              style={{
                color: isDarkMode
                  ? isFlipped
                    ? "rgba(196, 181, 253, 0.9)"
                    : "rgba(156, 163, 175, 0.9)"
                  : isFlipped
                  ? "rgba(139, 92, 246, 0.9)"
                  : "rgba(75, 85, 99, 0.9)",
              }}
              animate={{
                opacity: [0.8, 1, 0.8],
                color: isDarkMode
                  ? isFlipped
                    ? "rgba(196, 181, 253, 0.9)"
                    : "rgba(156, 163, 175, 0.9)"
                  : isFlipped
                  ? "rgba(139, 92, 246, 0.9)"
                  : "rgba(75, 85, 99, 0.9)",
              }}
              transition={{
                opacity: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                color: {
                  duration: 0.6,
                  ease: "easeInOut",
                },
              }}
            >
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <Motion.div
                    key="powered"
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    Powered by{" "}
                    <Motion.span
                      className="font-bold text-transparent bg-clip-text"
                      style={{
                        background:
                          "linear-gradient(135deg, #3B82F6, #8B5CF6, #3B82F6)",
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
                    >
                      DriftTech
                    </Motion.span>
                  </Motion.div>
                ) : (
                  <Motion.div
                    key="contact"
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Motion.span
                      className="font-bold text-transparent bg-clip-text"
                      style={{
                        background:
                          "linear-gradient(135deg, #8B5CF6, #3B82F6, #8B5CF6)",
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
                    >
                      Contact Us
                    </Motion.span>{" "}
                    ✨
                  </Motion.div>
                )}
              </AnimatePresence>
            </Motion.div>
          </Motion.div>
        </Motion.div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <Motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: isFlipped
                  ? "linear-gradient(135deg, #8B5CF6, #3B82F6)"
                  : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
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

      {/* Bottom Sheet */}
      <Motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: showBottomSheet ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          pointerEvents: showBottomSheet ? "auto" : "none",
        }}
      >
        {/* Backdrop */}
        <Motion.div
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(0, 0, 0, 0.6)"
              : "rgba(0, 0, 0, 0.4)",
          }}
          onClick={() => setShowBottomSheet(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: showBottomSheet ? 1 : 0 }}
        />

        {/* Bottom Sheet Content */}
        <Motion.div
          ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t shadow-2xl"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(17, 24, 39, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            borderColor: isDarkMode
              ? "rgba(59, 130, 246, 0.3)"
              : "rgba(59, 130, 246, 0.2)",
            backdropFilter: "blur(20px)",
            height: `${sheetHeight}vh`,
            maxHeight: "95vh",
            minHeight: "30vh",
          }}
          initial={{ y: "100%" }}
          animate={{
            y: showBottomSheet ? 0 : "100%",
            height: `${sheetHeight}vh`,
          }}
          transition={{
            type: "spring",
            damping: 35,
            stiffness: 400,
            mass: 0.5,
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        >
          {/* Draggable Handle */}
          <div
            className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing"
            style={{
              touchAction: "none",
            }}
          >
            <div
              className="w-12 h-1.5 rounded-full transition-all duration-200"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(107, 114, 128, 0.6)"
                  : "rgba(156, 163, 175, 0.6)",
              }}
            />
          </div>

          {/* Content */}
          <div
            className="px-6 pb-8 overflow-y-auto"
            style={{
              height: "calc(100% - 60px)",
              maxHeight: `${sheetHeight - 10}vh`,
            }}
          >
            <Motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: showBottomSheet ? 1 : 0,
                y: showBottomSheet ? 0 : 20,
              }}
              transition={{ delay: 0.1 }}
            >
              <h3
                className="text-xl font-bold mb-2"
                style={{
                  color: isDarkMode
                    ? "rgba(243, 244, 246, 0.95)"
                    : "rgba(17, 24, 39, 0.95)",
                }}
              >
                Contact DriftTech
              </h3>
              <p
                className="text-sm"
                style={{
                  color: isDarkMode
                    ? "rgba(156, 163, 175, 0.8)"
                    : "rgba(107, 114, 128, 0.8)",
                }}
              >
                Get in touch with our team
              </p>
            </Motion.div>

            <div className="space-y-4">
              {contactLinks.map((contact, index) => (
                <Motion.button
                  key={contact.name}
                  onClick={() => handleContactClick(contact)}
                  className="w-full flex items-center p-4 rounded-2xl border transition-all duration-200 text-left"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(55, 65, 81, 0.6)"
                      : "rgba(243, 244, 246, 0.6)",
                    borderColor: isDarkMode
                      ? "rgba(75, 85, 99, 0.3)"
                      : "rgba(209, 213, 219, 0.3)",
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: showBottomSheet ? 1 : 0,
                    x: showBottomSheet ? 0 : -20,
                  }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: isDarkMode
                      ? "rgba(75, 85, 99, 0.8)"
                      : "rgba(229, 231, 235, 0.8)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="text-2xl mr-4 p-2 rounded-full"
                    style={{
                      backgroundColor: `${contact.color}15`,
                      color: contact.color,
                    }}
                  >
                    <Icon icon={contact.icon} width={24} height={24} />
                  </div>
                  <div className="flex-1">
                    <div
                      className="font-semibold text-base mb-1"
                      style={{
                        color: isDarkMode
                          ? "rgba(243, 244, 246, 0.95)"
                          : "rgba(17, 24, 39, 0.95)",
                      }}
                    >
                      {contact.name}
                    </div>
                    <div
                      className="text-sm mb-1"
                      style={{
                        color: contact.color,
                        fontWeight: "500",
                      }}
                    >
                      {contact.value}
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color: isDarkMode
                          ? "rgba(156, 163, 175, 0.8)"
                          : "rgba(107, 114, 128, 0.8)",
                      }}
                    >
                      {contact.description}
                    </div>
                  </div>
                  <div
                    className="text-xl"
                    style={{
                      color: isDarkMode
                        ? "rgba(156, 163, 175, 0.6)"
                        : "rgba(107, 114, 128, 0.6)",
                    }}
                  >
                    <Icon
                      icon="material-symbols:arrow-forward-rounded"
                      width={20}
                      height={20}
                    />
                  </div>
                </Motion.button>
              ))}
            </div>

            {/* Close button */}
            <Motion.button
              className="w-full mt-6 py-3 px-4 rounded-2xl font-medium transition-all duration-200"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(59, 130, 246, 0.2)"
                  : "rgba(59, 130, 246, 0.1)",
                color: isDarkMode
                  ? "rgba(147, 197, 253, 0.9)"
                  : "rgba(37, 99, 235, 0.9)",
                border: `1px solid ${
                  isDarkMode
                    ? "rgba(59, 130, 246, 0.3)"
                    : "rgba(59, 130, 246, 0.2)"
                }`,
              }}
              onClick={() => setShowBottomSheet(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: showBottomSheet ? 1 : 0,
                y: showBottomSheet ? 0 : 20,
              }}
              transition={{ delay: 0.6 }}
              whileHover={{
                scale: 1.02,
                backgroundColor: isDarkMode
                  ? "rgba(59, 130, 246, 0.3)"
                  : "rgba(59, 130, 246, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </Motion.button>
          </div>
        </Motion.div>
      </Motion.div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitModal && (
          <Motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Modal Backdrop */}
            <Motion.div
              className="absolute inset-0 backdrop-blur-md"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(0, 0, 0, 0.8)"
                  : "rgba(0, 0, 0, 0.6)",
              }}
              onClick={handleCancelExit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Content */}
            <Motion.div
              className="relative max-w-md w-full mx-4 rounded-3xl border shadow-2xl overflow-hidden"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(17, 24, 39, 0.98)"
                  : "rgba(255, 255, 255, 0.98)",
                borderColor: isDarkMode
                  ? "rgba(59, 130, 246, 0.2)"
                  : "rgba(59, 130, 246, 0.15)",
                backdropFilter: "blur(20px)",
              }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
            >
              {/* Modal Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                    style={{
                      backgroundColor: pendingLink?.color
                        ? `${pendingLink.color}15`
                        : isDarkMode
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(59, 130, 246, 0.1)",
                      color:
                        pendingLink?.color ||
                        (isDarkMode ? "#60A5FA" : "#3B82F6"),
                    }}
                  >
                    <Icon
                      icon={
                        pendingLink?.icon || "material-symbols:language-rounded"
                      }
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{
                        color: isDarkMode
                          ? "rgba(243, 244, 246, 0.95)"
                          : "rgba(17, 24, 39, 0.95)",
                      }}
                    >
                      External Link
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? "rgba(156, 163, 175, 0.8)"
                          : "rgba(107, 114, 128, 0.8)",
                      }}
                    >
                      You're about to leave this site
                    </p>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl mb-4"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(55, 65, 81, 0.5)"
                      : "rgba(243, 244, 246, 0.8)",
                  }}
                >
                  <div
                    className="text-sm font-medium mb-1"
                    style={{
                      color: isDarkMode
                        ? "rgba(243, 244, 246, 0.9)"
                        : "rgba(17, 24, 39, 0.9)",
                    }}
                  >
                    {pendingLink?.name}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color:
                        pendingLink?.color ||
                        (isDarkMode ? "#60A5FA" : "#3B82F6"),
                      fontWeight: "500",
                    }}
                  >
                    {pendingLink?.link}
                  </div>
                </div>

                <p
                  className="text-sm text-center"
                  style={{
                    color: isDarkMode
                      ? "rgba(156, 163, 175, 0.8)"
                      : "rgba(107, 114, 128, 0.8)",
                  }}
                >
                  This will open in a new tab. Continue to {pendingLink?.name}?
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex p-6 pt-0 gap-3">
                <Motion.button
                  onClick={handleCancelExit}
                  className="flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-200"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(55, 65, 81, 0.8)"
                      : "rgba(243, 244, 246, 0.8)",
                    color: isDarkMode
                      ? "rgba(156, 163, 175, 0.9)"
                      : "rgba(107, 114, 128, 0.9)",
                    border: `1px solid ${
                      isDarkMode
                        ? "rgba(75, 85, 99, 0.5)"
                        : "rgba(209, 213, 219, 0.5)"
                    }`,
                  }}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: isDarkMode
                      ? "rgba(75, 85, 99, 0.8)"
                      : "rgba(229, 231, 235, 0.8)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </Motion.button>

                <Motion.button
                  onClick={handleConfirmExit}
                  className="flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor:
                      pendingLink?.color ||
                      (isDarkMode ? "#3B82F6" : "#2563EB"),
                    color: "#FFFFFF",
                    border: `1px solid ${
                      pendingLink?.color || (isDarkMode ? "#60A5FA" : "#3B82F6")
                    }`,
                  }}
                  whileHover={{
                    scale: 1.02,
                    filter: "brightness(1.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon
                    icon="material-symbols:open-in-new-rounded"
                    width={16}
                    height={16}
                  />
                  Go to {pendingLink?.name}
                </Motion.button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PoweredByDriftTech;
