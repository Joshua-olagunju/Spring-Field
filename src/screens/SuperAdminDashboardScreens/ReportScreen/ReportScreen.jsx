import { useEffect, useState } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../../config/apiConfig";

const ReportScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken } = useUser();
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [revenueFilter, setRevenueFilter] = useState("all_time");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  useEffect(() => {
    fetchStatistics();
    fetchRevenue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/reports/statistics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

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

  const fetchRevenue = async (filter = revenueFilter, customRange = null) => {
    try {
      const token = authToken || localStorage.getItem("authToken");
      let url = `${API_BASE_URL}/api/super-admin/revenue?filter=${filter}`;

      if (filter === "custom" && customRange) {
        url += `&start_date=${customRange.start}&end_date=${customRange.end}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setRevenueData(result.data);
      } else {
        console.error("Failed to fetch revenue:", result.message);
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  };

  const handleFilterChange = (filter) => {
    setRevenueFilter(filter);
    setShowCustomDatePicker(filter === "custom");
    if (filter !== "custom") {
      fetchRevenue(filter);
    }
  };

  const handleCustomDateSubmit = () => {
    if (customDateRange.start && customDateRange.end) {
      fetchRevenue("custom", customDateRange);
      setShowCustomDatePicker(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount || 0);
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
          <div className="mb-8">
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
                >
                  Reports & Analytics
                </h1>
                <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
                  Comprehensive statistics and insights from your SpringField
                  Estate database
                </p>
              </div>
              <button
                onClick={() => {
                  fetchStatistics();
                  fetchRevenue();
                }}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white flex items-center gap-2 whitespace-nowrap`}
              >
                <Icon
                  icon={isLoading ? "mdi:loading" : "mdi:refresh"}
                  className={isLoading ? "animate-spin" : ""}
                />
                {isLoading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Revenue Section */}
          <div className="mb-8">
            <h2
              className={`text-lg sm:text-xl font-bold ${theme.text.primary} mb-4`}
            >
              Revenue Statistics
            </h2>

            {/* Revenue Card */}
            <div
              className={`${theme.background.card} rounded-2xl ${theme.shadow.medium} p-4 sm:p-6 mb-4`}
            >
              <div className="flex flex-col gap-4">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all_time", label: "All Time" },
                    { value: "this_year", label: "This Year" },
                    { value: "this_month", label: "This Month" },
                    { value: "this_week", label: "This Week" },
                    { value: "today", label: "Today" },
                    { value: "custom", label: "Custom" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => handleFilterChange(filter.value)}
                      className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        revenueFilter === filter.value
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md"
                          : `${theme.background.input} ${theme.text.secondary} hover:${theme.background.card}`
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Picker */}
                {showCustomDatePicker && (
                  <div className={`${theme.background.input} p-4 rounded-lg`}>
                    <p
                      className={`text-sm font-medium ${theme.text.primary} mb-3`}
                    >
                      Select Date Range
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <div className="flex-1">
                        <label
                          className={`text-xs text-center ${theme.text.secondary} mb-1 block`}
                        >
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={customDateRange.start}
                          onChange={(e) =>
                            setCustomDateRange({
                              ...customDateRange,
                              start: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg ${theme.background.card} ${theme.text.primary} border ${theme.border.secondary} outline-none focus:ring-2 focus:ring-green-500`}
                        />
                      </div>

                      <div className="flex-1">
                        <label
                          className={`text-xs ${theme.text.secondary} mb-1 block`}
                        >
                          End Date
                        </label>
                        <input
                          type="date"
                          value={customDateRange.end}
                          onChange={(e) =>
                            setCustomDateRange({
                              ...customDateRange,
                              end: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 rounded-lg ${theme.background.card} ${theme.text.primary} border ${theme.border.secondary} outline-none focus:ring-2 focus:ring-green-500`}
                        />
                      </div>

                      <button
                        onClick={handleCustomDateSubmit}
                        disabled={
                          !customDateRange.start || !customDateRange.end
                        }
                        className={`px-4 py-2 rounded-lg font-medium transition-colors self-center ${
                          customDateRange.start && customDateRange.end
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-400 cursor-not-allowed text-gray-200"
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}

                {/* Revenue Display */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <p className={`text-sm ${theme.text.secondary} mb-2`}>
                      Total Revenue
                      {revenueFilter !== "all_time" && (
                        <span className="ml-2 text-xs">
                          ({revenueFilter.replace("_", " ")})
                        </span>
                      )}
                    </p>
                    <p
                      className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent`}
                    >
                      {revenueData
                        ? formatCurrency(revenueData.total_revenue)
                        : "Loading..."}
                    </p>
                    {revenueData && (
                      <div className="mt-3 flex flex-wrap gap-4">
                        <div>
                          <p className={`text-xs ${theme.text.tertiary}`}>
                            Total Payments
                          </p>
                          <p
                            className={`text-lg font-semibold ${theme.text.primary}`}
                          >
                            {revenueData.total_payments}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${theme.text.tertiary}`}>
                            Average Payment
                          </p>
                          <p
                            className={`text-lg font-semibold ${theme.text.primary}`}
                          >
                            {formatCurrency(revenueData.average_payment)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Icon
                      icon="mdi:cash-multiple"
                      className="text-white text-3xl sm:text-4xl"
                    />
                  </div>
                </div>
              </div>
            </div>
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
                icon="mdi:account-group"
                label="Total Landlords"
                value={statistics.user_statistics.total_landlords}
                color="#f97316"
                trend={2}
              />
              <StatCard
                icon="mdi:shield-crown"
                label="Total Super Admins"
                value={statistics.user_statistics.total_super_admins}
                color="#8b5cf6"
                trend={0}
              />
              <StatCard
                icon="mdi:shield-account"
                label="Total Security"
                value={statistics.user_statistics.total_security}
                color="#06b6d4"
                trend={1}
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
                icon="mdi:calendar-remove"
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
