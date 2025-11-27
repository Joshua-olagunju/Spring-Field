/**
 * Reusable Skeleton Loader Component
 * Provides accessible loading placeholders with animations
 */

export const SkeletonCard = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse ${className}`}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
    >
      <div className="bg-gray-300 dark:bg-gray-700 rounded-lg h-full"></div>
    </div>
  );
};

export const SkeletonText = ({ lines = 3, className = "" }) => {
  return (
    <div
      className={`space-y-3 ${className}`}
      role="status"
      aria-label="Loading text"
      aria-live="polite"
    >
      {[...Array(lines)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded h-4"
          style={{ width: index === lines - 1 ? "70%" : "100%" }}
        ></div>
      ))}
    </div>
  );
};

export const SkeletonAvatar = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded-full ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading avatar"
      aria-live="polite"
    ></div>
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-label="Loading table"
      aria-live="polite"
    >
      {/* Header */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {[...Array(columns)].map((_, index) => (
          <div
            key={`header-${index}`}
            className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded h-6"
          ></div>
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {[...Array(columns)].map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded h-10"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonDashboardCard = ({ className = "" }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}
      role="status"
      aria-label="Loading dashboard card"
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-4">
        <SkeletonAvatar size="md" />
        <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded w-20 h-8"></div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
};

export const SkeletonList = ({ items = 5, showAvatar = true }) => {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-label="Loading list"
      aria-live="polite"
    >
      {[...Array(items)].map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          {showAvatar && <SkeletonAvatar size="md" />}
          <div className="flex-1">
            <SkeletonText lines={2} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonButton = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded-lg h-12 ${className}`}
      role="status"
      aria-label="Loading button"
      aria-live="polite"
    ></div>
  );
};

// Shimmer effect skeleton (more advanced)
export const ShimmerSkeleton = ({ className = "", height = "h-4" }) => {
  return (
    <div
      className={`relative overflow-hidden bg-gray-300 dark:bg-gray-700 rounded ${height} ${className}`}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default {
  Card: SkeletonCard,
  Text: SkeletonText,
  Avatar: SkeletonAvatar,
  Table: SkeletonTable,
  DashboardCard: SkeletonDashboardCard,
  List: SkeletonList,
  Button: SkeletonButton,
  Shimmer: ShimmerSkeleton,
};
