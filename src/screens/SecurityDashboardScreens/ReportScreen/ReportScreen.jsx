import { useState, useEffect } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../../config/apiConfig";

const ReportScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken, isAuthenticated } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  const [tokenHistory, setTokenHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
          const transformedData = result.data.entries.map((entry) => ({
            id: entry.id,
            dateIssued: new Date(entry.entered_at).toISOString().split("T")[0],
            status: entry.is_active ? "active" : "inactive",
            visitorName: entry.visitor_name,
            expiryDate: entry.exited_at || "Active",
            resident: entry.resident_name,
            house: entry.house_number,
          }));
          setTokenHistory(transformedData);
        } else {
          const errorMessage =
            result.message || "Failed to fetch token history";
          console.error("Failed to fetch token history:", errorMessage);
          setError(errorMessage);
          if (response.status === 401) {
            setError("Authentication failed. Please log in again.");
          }
          setTokenHistory([]);
        }
      } catch (error) {
        const errorMessage =
          "Network error. Please check your connection and try again.";
        console.error("Error fetching token history:", error);
        setError(errorMessage);
        setTokenHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenHistory();
  }, [authToken, isAuthenticated]);

  // Filter token history based on search query and status
  const filteredTokens = tokenHistory.filter((token) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      String(token.id).toLowerCase().includes(query) ||
      (token.visitorName || "").toLowerCase().includes(query) ||
      (token.dateIssued || "").toLowerCase().includes(query) ||
      (token.resident || "").toLowerCase().includes(query) ||
      (token.house || "").toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" || token.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleTokenClick = (token) => {
    // TODO: Show modal or navigate to detail view
    console.log("Token clicked:", token);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
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

        {/* Sticky Search Bar and Filters */}
        <div
          className="sticky top-16 z-30 pb-6 mb-6"
          style={{
            background: isDarkMode
              ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))"
              : "linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246), rgb(249, 250, 251))",
          }}
        >
          <div className="space-y-4 pt-4">
            {/* Search Bar */}
            <div
              className={`max-w-md flex items-center gap-3 px-3 py-2 rounded-lg ${theme.background.card} ${theme.shadow.small} border ${theme.border.secondary}`}
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
            </div>
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
                  className={`w-full ${theme.background.secondary} hover:${theme.background.card} rounded-lg p-4 transition-all border ${theme.border.secondary} hover:border-blue-500 text-left`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`font-mono text-xs sm:text-sm font-semibold ${theme.text.primary}`}
                        >
                          {token.id}
                        </p>
                      </div>
                      <p
                        className={`text-xs sm:text-sm ${theme.text.secondary} truncate`}
                      >
                        {token.visitorName}
                      </p>
                      <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                        Issued: {token.dateIssued}
                      </p>
                      <p className={`text-xs ${theme.text.tertiary}`}>
                        Expires: {token.expiryDate}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          token.status
                        )}`}
                      >
                        <Icon
                          icon={getStatusIcon(token.status)}
                          className="text-sm"
                        />
                        <span className="capitalize">{token.status}</span>
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
