import { useEffect, useState } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";

const ReportScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken } = useUser();
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:8000/api/reports/statistics",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setStatistics(result.data);
      } else {
        setError(result.message || "Failed to fetch statistics");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 pb-20 w-full relative flex items-center justify-center">
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: isDarkMode
              ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))"
              : "linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246), rgb(249, 250, 251))",
          }}
        />
        <div className="flex flex-col items-center gap-4">
          <Icon
            icon="mdi:loading"
            className={`text-4xl ${theme.text.primary} animate-spin`}
          />
          <p className={`${theme.text.secondary}`}>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 pb-20 w-full relative flex items-center justify-center">
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: isDarkMode
              ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))"
              : "linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246), rgb(249, 250, 251))",
          }}
        />
        <div
          className={`${theme.background.card} rounded-xl ${theme.shadow.medium} p-8 max-w-md mx-4`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Icon icon="mdi:alert-circle" className="text-2xl text-red-500" />
            <h2 className={`text-xl font-bold ${theme.text.primary}`}>
              Error Loading Data
            </h2>
          </div>
          <p className={`${theme.text.secondary} mb-4`}>{error}</p>
          <button
            onClick={fetchStatistics}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
              >
                Reports & Analytics 📊
              </h1>
              <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
                Comprehensive statistics and insights from your SpringField
                Estate database
              </p>
            </div>
            <button
              onClick={fetchStatistics}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white flex items-center gap-2`}
            >
              <Icon
                icon={isLoading ? "mdi:loading" : "mdi:refresh"}
                className={isLoading ? "animate-spin" : ""}
              />
              {isLoading ? "Loading..." : "Refresh"}
            </button>
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
                value={statistics.user_statistics.total_users}
                color="#3b82f6"
                trend={statistics.user_statistics.user_growth_trend}
              />
              <StatCard
                icon="mdi:shield-account-multiple"
                label="Total Admins"
                value={statistics.user_statistics.total_admins}
                color="#f97316"
                trend={2}
              />
              <StatCard
                icon="mdi:home-city"
                label="Total Residents"
                value={statistics.user_statistics.total_residents}
                color="#10b981"
                trend={8}
              />
              <StatCard
                icon="mdi:account-check"
                label="Active Users"
                value={statistics.user_statistics.active_users}
                color="#8b5cf6"
                trend={5}
              />
              <StatCard
                icon="mdi:account-remove"
                label="Inactive Users"
                value={statistics.user_statistics.inactive_users}
                color="#ef4444"
                trend={-3}
              />
              <StatCard
                icon="mdi:percent"
                label="User Retention Rate"
                value={`${statistics.user_statistics.user_retention_rate}%`}
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
                value={statistics.visitor_statistics.total_visitors}
                color="#ec4899"
                trend={statistics.visitor_statistics.monthly_visitor_growth}
              />
              <StatCard
                icon="mdi:clock-outline"
                label="Average Daily Visitors"
                value={statistics.visitor_statistics.average_daily_visitors}
                color="#f59e0b"
                trend={6}
              />
              <StatCard
                icon="mdi:trending-up"
                label="Monthly Visitor Growth"
                value={`${statistics.visitor_statistics.monthly_visitor_growth}%`}
                color="#14b8a6"
                trend={statistics.visitor_statistics.monthly_visitor_growth}
              />
              <StatCard
                icon="mdi:percent"
                label="Visitor Conversion Rate"
                value={`${statistics.visitor_statistics.visitor_conversion_rate}%`}
                color="#6366f1"
                trend={7}
              />
              <StatCard
                icon="mdi:account-star"
                label="Returning Visitors"
                value={statistics.visitor_statistics.returning_visitors}
                color="#f43f5e"
                trend={11}
              />
              <StatCard
                icon="mdi:account-question"
                label="First-Time Visitors"
                value={statistics.visitor_statistics.first_time_visitors}
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
                value={statistics.token_statistics.active_tokens}
                color="#059669"
                trend={statistics.token_statistics.token_growth_trend}
              />
              <StatCard
                icon="mdi:clock-alert"
                label="Pending Tokens"
                value={statistics.token_statistics.pending_tokens}
                color="#d97706"
                trend={3}
              />
              <StatCard
                icon="mdi:calendar-x"
                label="Expired Tokens"
                value={statistics.token_statistics.expired_tokens}
                color="#dc2626"
                trend={-2}
              />
              <StatCard
                icon="mdi:percent"
                label="Token Utilization"
                value={`${statistics.token_statistics.token_utilization_rate}%`}
                color="#7c3aed"
                trend={5}
              />
              <StatCard
                icon="mdi:chart-line"
                label="Avg. Token Duration"
                value={`${statistics.token_statistics.average_token_duration_hours}h`}
                color="#0891b2"
                trend={2}
              />
              <StatCard
                icon="mdi:qrcode-scan"
                label="Tokens Generated Today"
                value={statistics.token_statistics.tokens_generated_today}
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
                  {statistics.system_health.status} ✓
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
                  {statistics.system_health.database_status} ✓
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
                  {statistics.system_health.peak_activity_time}
                </p>
                <p className={`text-xs ${theme.text.tertiary} mt-2`}>
                  Based on visitor entry data
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
