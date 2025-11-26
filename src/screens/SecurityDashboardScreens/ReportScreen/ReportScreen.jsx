import { useState, useEffect } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../../config/apiConfig";
import TokenDetailModal from "./TokenDetailModal";

const ReportScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken, isAuthenticated } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive', 'expired_active'
  const [dateFilter, setDateFilter] = useState("all_time"); // 'today', 'week', 'month', 'all_time', 'custom'
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch token history from API
  useEffect(() => {
    const fetchTokenHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = authToken || localStorage.getItem("authToken");

        if (!token || !isAuthenticated) {
          setError(
            "Authentication required. Please log in to view token history."
          );
          setTokenHistory([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/visitor-tokens/all-entries`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          // Transform API data to match component structure
          const transformedData = result.data.entries.map((entry) => {
            // Determine actual status based on exit time and token expiration
            let actualStatus = "inactive";

            if (!entry.exited_at) {
              // Visitor hasn't exited yet
              // Check if token is expired
              if (entry.expires_at) {
                const expiresDate = new Date(entry.expires_at);
                const now = new Date();
                const isExpired = expiresDate < now;

                if (isExpired) {
                  actualStatus = "expired_active"; // Token expired but visitor still inside
                } else {
                  actualStatus = "active"; // Token valid and visitor inside
                }
              } else {
                // No expiration date, treat as active
                actualStatus = "active";
              }
            }

            return {
              id: entry.id,
              dateIssued: new Date(entry.entered_at)
                .toISOString()
                .split("T")[0],
              status: actualStatus,
              visitorName: entry.visitor_name,
              expiryDate: entry.exited_at || "Active",
              resident: entry.resident_name,
              house: entry.house_number,
              entered_at: entry.entered_at,
              exited_at: entry.exited_at,
              expires_at: entry.expires_at,
              visitor_phone: entry.visitor_phone,
              resident_phone: entry.resident_phone,
              address: entry.address,
              guard_name: entry.guard_name,
              note: entry.note,
            };
          });

          setTokenHistory(transformedData);
        } else {
          const errorMessage =
            result.message || "Failed to fetch token history";
          setError(errorMessage);
          if (response.status === 401) {
            setError("Authentication failed. Please log in again.");
          }
          setTokenHistory([]);
        }
      } catch {
        const errorMessage =
          "Network error. Please check your connection and try again.";
        setError(errorMessage);
        setTokenHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenHistory();
  }, [authToken, isAuthenticated]);

  // Helper function to filter by date
  const filterByDate = (token) => {
    if (dateFilter === "all_time") return true;

    const tokenDate = new Date(token.dateIssued);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case "today": {
        return tokenDate >= today;
      }
      case "week": {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return tokenDate >= weekAgo;
      }
      case "month": {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return tokenDate >= monthAgo;
      }
      case "custom": {
        if (!customDateRange.start || !customDateRange.end) return true;
        const startDate = new Date(customDateRange.start);
        const endDate = new Date(customDateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        return tokenDate >= startDate && tokenDate <= endDate;
      }
      default:
        return true;
    }
  };

  // Filter token history based on search query, status, and date
  const filteredTokens = tokenHistory.filter((token) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      String(token.id).toLowerCase().includes(query) ||
      (token.visitorName || "").toLowerCase().includes(query) ||
      (token.dateIssued || "").toLowerCase().includes(query) ||
      (token.resident || "").toLowerCase().includes(query) ||
      (token.house || "").toLowerCase().includes(query);

    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "expired_active") {
      // Show tokens that are expired or expired_active
      matchesStatus =
        token.status === "expired_active" || token.status === "expired";
    } else {
      matchesStatus = token.status === statusFilter;
    }

    const matchesDate = filterByDate(token);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleTokenClick = async (token) => {
    try {
      // Use the token data we already have with the calculated status
      // Add the status to the token data before showing modal
      const fullTokenData = {
        ...token,
        status: token.status, // Use the already calculated status
      };

      setSelectedToken(fullTokenData);
      setShowDetailModal(true);
    } catch {
      // Error opening token details
    }
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    if (filter === "custom") {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
  };

  const handleCustomDateSubmit = () => {
    setShowCustomDatePicker(false);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "expired":
      case "expired_active":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return "mdi:check-circle";
      case "inactive":
        return "mdi:close-circle";
      case "expired":
      case "expired_active":
        return "mdi:clock-alert";
      case "suspended":
        return "mdi:alert-circle";
      default:
        return "mdi:help-circle";
    }
  };

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
      <div className="w-full ">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
          >
            Token Reports
          </h1>
          <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
            View and manage all token history
          </p>
        </div>

        {/* Search Bar and Filters */}
        <div className="pb-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div
              className={`max-w-md flex items-center gap-3 px-3 py-1 rounded-lg ${theme.background.card} ${theme.shadow.small} border ${theme.border.secondary}`}
            >
              <Icon
                icon="mdi:magnify"
                className={`text-lg ${theme.text.tertiary}`}
              />

              <input
                type="text"
                placeholder="Search token history…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent text-sm ${theme.text.primary} placeholder-current placeholder-opacity-40 outline-none`}
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : `${theme.background.card} ${theme.text.secondary} hover:${theme.background.secondary}`
                }`}
              >
                All ({tokenHistory.length})
              </button>

              <button
                onClick={() => setStatusFilter("active")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "active"
                    ? "bg-green-600 text-white"
                    : `${theme.background.card} ${theme.text.secondary} hover:${theme.background.secondary}`
                }`}
              >
                Active (
                {tokenHistory.filter((t) => t.status === "active").length})
              </button>

              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "inactive"
                    ? "bg-gray-600 text-white"
                    : `${theme.background.card} ${theme.text.secondary} hover:${theme.background.secondary}`
                }`}
              >
                Inactive (
                {tokenHistory.filter((t) => t.status === "inactive").length})
              </button>

              <button
                onClick={() => setStatusFilter("expired_active")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === "expired_active"
                    ? "bg-orange-600 text-white"
                    : `${theme.background.card} ${theme.text.secondary} hover:${theme.background.secondary}`
                }`}
              >
                <Icon icon="mdi:alert-circle" className="inline mr-1" />
                Expired Active (
                {
                  tokenHistory.filter(
                    (t) =>
                      t.status === "expired_active" || t.status === "expired"
                  ).length
                }
                )
              </button>
            </div>

            {/* Date Filter Toggle Button */}
            <div className="flex justify-center sm:justify-start">
              <button
                onClick={() => setShowDateFilters(!showDateFilters)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  showDateFilters
                    ? "bg-purple-600 text-white"
                    : `${theme.background.card} ${theme.text.secondary} hover:${theme.background.secondary}`
                }`}
              >
                <Icon icon="mdi:calendar-filter" className="text-base" />
                {showDateFilters ? "Hide Date Filters" : "Show Date Filters"}
              </button>
            </div>

            {/* Date Filter - Only show when toggled */}
            {showDateFilters && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <button
                  onClick={() => handleDateFilterChange("today")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === "today"
                      ? "bg-purple-600 text-white"
                      : `${theme.background.card} ${theme.text.secondary} hover:${theme.background.secondary}`
                  }`}
                >
                  <Icon icon="mdi:calendar-today" className="inline mr-1" />
                  Today
                </button>

                <button
                  onClick={() => handleDateFilterChange("week")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === "week"
                      ? "bg-purple-600 text-white"
                      : `${theme.background.card} ${theme.text.secondary} hover:${theme.background.secondary}`
                  }`}
                >
                  <Icon icon="mdi:calendar-week" className="inline mr-1" />
                  This Week
                </button>

                <button
                  onClick={() => handleDateFilterChange("month")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === "month"
                      ? "bg-purple-600 text-white"
                      : `${theme.background.card} ${theme.text.secondary} hover:${theme.background.secondary}`
                  }`}
                >
                  <Icon icon="mdi:calendar-month" className="inline mr-1" />
                  This Month
                </button>

                <button
                  onClick={() => handleDateFilterChange("all_time")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === "all_time"
                      ? "bg-purple-600 text-white"
                      : `${theme.background.card} ${theme.text.secondary} hover:${theme.background.secondary}`
                  }`}
                >
                  <Icon icon="mdi:calendar" className="inline mr-1" />
                  All Time
                </button>

                <button
                  onClick={() => handleDateFilterChange("custom")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateFilter === "custom"
                      ? "bg-purple-600 text-white"
                      : `${theme.background.card} ${theme.text.secondary} hover:${theme.background.secondary}`
                  }`}
                >
                  <Icon icon="mdi:calendar-range" className="inline mr-1" />
                  Custom Range
                </button>
              </div>
            )}

            {/* Custom Date Range Picker - Only show when custom is selected AND date filters are visible */}
            {showDateFilters && showCustomDatePicker && (
              <div
                className={`${theme.background.card} p-4 rounded-lg border ${theme.border.secondary}`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium ${theme.text.secondary} mb-2`}
                    >
                      <Icon icon="mdi:calendar-start" className="inline mr-1" />
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
                      className={`w-full px-3 py-2 rounded-lg border ${theme.border.secondary} ${theme.background.input} ${theme.text.primary} text-sm`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium ${theme.text.secondary} mb-2`}
                    >
                      <Icon icon="mdi:calendar-end" className="inline mr-1" />
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
                      className={`w-full px-3 py-2 rounded-lg border ${theme.border.secondary} ${theme.background.input} ${theme.text.primary} text-sm`}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleCustomDateSubmit}
                    disabled={!customDateRange.start || !customDateRange.end}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      customDateRange.start && customDateRange.end
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomDatePicker(false);
                      setDateFilter("all_time");
                      setCustomDateRange({ start: "", end: "" });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${theme.background.secondary} ${theme.text.secondary} hover:${theme.background.card}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Token History Section */}
        <div
          className={`${theme.background.card} rounded-xl ${theme.shadow.medium} p-6`}
        >
          {/* Header */}
          <div className="mb-4 flex items-center gap-2">
            <Icon
              icon="mdi:qrcode"
              className={`text-2xl ${theme.brand.primaryText}`}
            />
            <h2
              className={`text-xl sm:text-2xl font-bold ${theme.text.primary}`}
            >
              Token History
            </h2>
          </div>

          {/* Token List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Icon
                  icon="mdi:loading"
                  className={`text-4xl ${theme.text.tertiary} animate-spin`}
                />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icon
                    icon="mdi:alert-circle"
                    className={`text-5xl ${theme.text.tertiary} mb-3 mx-auto opacity-50`}
                  />
                  <p className={`text-sm ${theme.text.secondary} mb-2`}>
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className={`px-4 py-2 rounded-lg text-sm ${theme.background.card} ${theme.text.primary} border ${theme.border.secondary} hover:${theme.background.secondary} transition-colors`}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : tokenHistory.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icon
                    icon="mdi:qrcode-scan"
                    className={`text-5xl ${theme.text.tertiary} mb-3 mx-auto opacity-50`}
                  />
                  <p className={`text-sm ${theme.text.secondary}`}>
                    You don't have any token history yet.
                  </p>
                </div>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icon
                    icon="mdi:magnify-close"
                    className={`text-5xl ${theme.text.tertiary} mb-3 mx-auto opacity-50`}
                  />
                  <p className={`text-sm ${theme.text.secondary}`}>
                    No results found
                  </p>
                </div>
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleTokenClick(token)}
                  className={`w-full ${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-5 hover:${theme.shadow.medium} transition-all text-left border ${theme.border.secondary} hover:border-blue-500`}
                >
                  <div className="flex items-start gap-4">
                    {/* Left: Visitor Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold ${theme.text.primary} mb-1 text-base sm:text-lg truncate`}
                      >
                        {token.visitorName}
                      </h3>
                      <div className="flex flex-col gap-1">
                        <p
                          className={`text-xs sm:text-sm ${theme.text.secondary} truncate`}
                        >
                          Host: {token.resident} • {token.house}
                        </p>
                        <div className="flex flex-col gap-0.5 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Icon icon="mdi:login" className="text-sm" />
                            <span>
                              Entry:{" "}
                              {new Date(
                                token.entered_at || token.dateIssued
                              ).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {token.exited_at && (
                            <div className="flex items-center gap-1">
                              <Icon icon="mdi:logout" className="text-sm" />
                              <span>
                                Exit:{" "}
                                {new Date(token.exited_at).toLocaleString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Duration & Status */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex flex-col items-end gap-2">
                        {/* Duration */}
                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:clock-outline"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span
                            className={`text-xs sm:text-sm font-semibold ${theme.text.primary}`}
                          >
                            {(() => {
                              const enteredAt = new Date(
                                token.entered_at || token.dateIssued
                              );
                              const exitedAt = token.exited_at
                                ? new Date(token.exited_at)
                                : new Date();
                              const diffMinutes = Math.floor(
                                (exitedAt - enteredAt) / 1000 / 60
                              );

                              if (diffMinutes < 60) {
                                return `${diffMinutes} mins`;
                              } else {
                                const hours = Math.floor(diffMinutes / 60);
                                const mins = diffMinutes % 60;
                                return mins > 0
                                  ? `${hours}h ${mins}m`
                                  : `${hours}h`;
                              }
                            })()}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            token.status
                          )}`}
                        >
                          <Icon
                            icon={getStatusIcon(token.status)}
                            className="text-sm"
                          />
                          <span className="capitalize">
                            {token.status === "expired_active"
                              ? "Expired"
                              : token.status}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Token Detail Modal */}
      <TokenDetailModal
        theme={theme}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedToken(null);
        }}
        tokenData={selectedToken}
      />
    </div>
  );
};

export default ReportScreen;
