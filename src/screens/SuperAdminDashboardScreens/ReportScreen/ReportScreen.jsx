import { useEffect } from "react";
import { useTheme } from "../../../../context/useTheme";
import { Icon } from "@iconify/react";

const ReportScreen = () => {
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    // Simulate API call to fetch statistics
    // setIsLoading(false);
  }, []);

  // Mock statistics data
  const statistics = {
    totalUsers: 156,
    totalAdmins: 8,
    totalVisitors: 2847,
    averageDailyVisitors: 45,
    activeUsers: 32,
    totalResidents: 125,
    pendingTokens: 12,
    expiredTokens: 89,
    activeTokens: 156,
    monthlyVisitorGrowth: 18,
    userRetentionRate: 87,
    visitorConversionRate: 64,
  };

  const StatCard = ({ icon, label, value, color, trend }) => (
    <div
      className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-6`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs sm:text-sm ${theme.text.secondary} mb-2`}>
            {label}
          </p>
          <p
            className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
          >
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <Icon
                icon={
                  trend > 0
                    ? "mdi:trending-up"
                    : trend < 0
                    ? "mdi:trending-down"
                    : "mdi:minus"
                }
                className={`text-sm ${
                  trend > 0
                    ? "text-green-500"
                    : trend < 0
                    ? "text-red-500"
                    : theme.text.secondary
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  trend > 0
                    ? "text-green-500"
                    : trend < 0
                    ? "text-red-500"
                    : theme.text.secondary
                }`}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center`}
          style={{
            backgroundColor: `${color}20`,
          }}
        >
          <Icon
            icon={icon}
            className={`text-xl sm:text-2xl`}
            style={{ color }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 pb-20 w-full relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: isDarkMode
            ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))"
            : "linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246), rgb(249, 250, 251))",
        }}
      />

      {/* Content */}
      <div className="w-full px-0">
        <div className="max-w-full mx-auto ">
          {/* Header */}
          <div className="mb-8">
            <h1
              className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
            >
              Reports & Analytics 📊
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              Comprehensive statistics and insights from your SpringField Estate
              database
            </p>
          </div>

          {/* User Statistics Section */}
          <div className="mb-8">
            <h2
              className={`text-lg sm:text-xl font-bold ${theme.text.primary} mb-4`}
            >
              User Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                icon="mdi:account-multiple"
                label="Total Users"
                value={statistics.totalUsers}
                color="#3b82f6"
                trend={12}
              />
              <StatCard
                icon="mdi:shield-account-multiple"
                label="Total Admins"
                value={statistics.totalAdmins}
                color="#f97316"
                trend={2}
              />
              <StatCard
                icon="mdi:home-city"
                label="Total Residents"
                value={statistics.totalResidents}
                color="#10b981"
                trend={8}
              />
              <StatCard
                icon="mdi:account-check"
                label="Active Users"
                value={statistics.activeUsers}
                color="#8b5cf6"
                trend={5}
              />
              <StatCard
                icon="mdi:account-remove"
                label="Inactive Users"
                value={statistics.totalUsers - statistics.activeUsers}
                color="#ef4444"
                trend={-3}
              />
              <StatCard
                icon="mdi:percent"
                label="User Retention Rate"
                value={`${statistics.userRetentionRate}%`}
                color="#06b6d4"
                trend={4}
              />
            </div>
          </div>

          {/* Visitor Statistics Section */}
          <div className="mb-8">
            <h2
              className={`text-lg sm:text-xl font-bold ${theme.text.primary} mb-4`}
            >
              Visitor Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                icon="mdi:account-group"
                label="Total All-Time Visitors"
                value={statistics.totalVisitors}
                color="#ec4899"
                trend={18}
              />
              <StatCard
                icon="mdi:clock-outline"
                label="Average Daily Visitors"
                value={statistics.averageDailyVisitors}
                color="#f59e0b"
                trend={6}
              />
              <StatCard
                icon="mdi:trending-up"
                label="Monthly Visitor Growth"
                value={`${statistics.monthlyVisitorGrowth}%`}
                color="#14b8a6"
                trend={9}
              />
              <StatCard
                icon="mdi:percent"
                label="Visitor Conversion Rate"
                value={`${statistics.visitorConversionRate}%`}
                color="#6366f1"
                trend={7}
              />
              <StatCard
                icon="mdi:account-star"
                label="Returning Visitors"
                value={Math.floor(statistics.totalVisitors * 0.35)}
                color="#f43f5e"
                trend={11}
              />
              <StatCard
                icon="mdi:account-question"
                label="First-Time Visitors"
                value={Math.floor(statistics.totalVisitors * 0.65)}
                color="#a855f7"
                trend={4}
              />
            </div>
          </div>

          {/* Token Statistics Section */}
          <div className="mb-8">
            <h2
              className={`text-lg sm:text-xl font-bold ${theme.text.primary} mb-4`}
            >
              Token Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                icon="mdi:qrcode"
                label="Total Active Tokens"
                value={statistics.activeTokens}
                color="#059669"
                trend={22}
              />
              <StatCard
                icon="mdi:clock-alert"
                label="Pending Tokens"
                value={statistics.pendingTokens}
                color="#d97706"
                trend={3}
              />
              <StatCard
                icon="mdi:calendar-x"
                label="Expired Tokens"
                value={statistics.expiredTokens}
                color="#dc2626"
                trend={-2}
              />
              <StatCard
                icon="mdi:percent"
                label="Token Utilization"
                value={`${Math.round(
                  (statistics.activeTokens /
                    (statistics.activeTokens + statistics.expiredTokens)) *
                    100
                )}%`}
                color="#7c3aed"
                trend={5}
              />
              <StatCard
                icon="mdi:chart-line"
                label="Avg. Token Duration"
                value="4.2 days"
                color="#0891b2"
                trend={2}
              />
              <StatCard
                icon="mdi:qrcode-scan"
                label="Tokens Generated Today"
                value="12"
                color="#6b21a8"
                trend={8}
              />
            </div>
          </div>

          {/* Summary Card */}
          <div
            className={`${theme.background.card} rounded-2xl ${theme.shadow.medium} p-6 sm:p-8 mb-8`}
          >
            <h2
              className={`text-lg sm:text-xl font-bold ${theme.text.primary} mb-6`}
            >
              Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <p
                  className={`text-xs sm:text-sm ${theme.text.secondary} mb-1`}
                >
                  System Health
                </p>
                <p
                  className={`text-lg sm:text-xl font-bold ${theme.text.primary}`}
                >
                  Excellent ✓
                </p>
                <p className={`text-xs ${theme.text.tertiary} mt-2`}>
                  All systems operational
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p
                  className={`text-xs sm:text-sm ${theme.text.secondary} mb-1`}
                >
                  Database Status
                </p>
                <p
                  className={`text-lg sm:text-xl font-bold ${theme.text.primary}`}
                >
                  Healthy ✓
                </p>
                <p className={`text-xs ${theme.text.tertiary} mt-2`}>
                  No issues detected
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p
                  className={`text-xs sm:text-sm ${theme.text.secondary} mb-1`}
                >
                  Peak Activity Time
                </p>
                <p
                  className={`text-lg sm:text-xl font-bold ${theme.text.primary}`}
                >
                  2:00 PM - 4:00 PM
                </p>
                <p className={`text-xs ${theme.text.tertiary} mt-2`}>
                  Average response time: 145ms
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p
                  className={`text-xs sm:text-sm ${theme.text.secondary} mb-1`}
                >
                  Last Update
                </p>
                <p
                  className={`text-lg sm:text-xl font-bold ${theme.text.primary}`}
                >
                  Just now
                </p>
                <p className={`text-xs ${theme.text.tertiary} mt-2`}>
                  Data refreshed in real-time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
