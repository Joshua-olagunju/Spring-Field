import { useState } from "react";
import { useTheme } from "../../../../context/useTheme";
import { Icon } from "@iconify/react";

const ReportScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy token history data (replace with API call)
  const tokenHistory = [
    {
      id: "TKN-001",
      dateIssued: "2025-11-14",
      status: "active",
      visitorName: "John Smith",
      expiryDate: "2025-11-21",
    },
    {
      id: "TKN-002",
      dateIssued: "2025-11-13",
      status: "active",
      visitorName: "Sarah Johnson",
      expiryDate: "2025-11-20",
    },
    {
      id: "TKN-003",
      dateIssued: "2025-11-12",
      status: "inactive",
      visitorName: "Michael Brown",
      expiryDate: "2025-11-19",
    },
    {
      id: "TKN-004",
      dateIssued: "2025-11-11",
      status: "active",
      visitorName: "Emma Davis",
      expiryDate: "2025-11-18",
    },
    {
      id: "TKN-005",
      dateIssued: "2025-11-10",
      status: "inactive",
      visitorName: "James Wilson",
      expiryDate: "2025-11-17",
    },
    {
      id: "TKN-006",
      dateIssued: "2025-11-09",
      status: "active",
      visitorName: "Lisa Anderson",
      expiryDate: "2025-11-16",
    },
  ];

  // Filter token history based on search query
  const filteredTokens = tokenHistory.filter((token) => {
    const query = searchQuery.toLowerCase();
    return (
      token.id.toLowerCase().includes(query) ||
      token.visitorName.toLowerCase().includes(query) ||
      token.dateIssued.toLowerCase().includes(query) ||
      token.status.toLowerCase().includes(query)
    );
  });

  const handleTokenClick = (token) => {
    console.log("Token clicked:", token);
    // TODO: Show modal or navigate to detail view
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
      <div className="w-full px-0">
        <div className="max-w-full mx-auto px-4 sm:px-6">
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

          {/* Search Bar */}
          <div className="mb-6">
            <div
              className={`relative max-w-md ${theme.background.card} rounded-lg ${theme.shadow.small} border ${theme.border.secondary}`}
            >
              <Icon
                icon="mdi:magnify"
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-lg ${theme.text.tertiary}`}
              />
              <input
                type="text"
                placeholder="Search token history…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 bg-transparent text-sm ${theme.text.primary} placeholder-current placeholder-opacity-40 outline-none`}
              />
            </div>
          </div>

          {/* Token History Section */}
          <div
            className={`${theme.background.card} rounded-xl ${theme.shadow.medium} p-6 flex flex-col`}
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-2 flex-shrink-0">
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[500px] lg:max-h-[600px]">
              {tokenHistory.length === 0 ? (
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
                        <p
                          className={`text-xs ${theme.text.tertiary} mt-1`}
                        >
                          Issued: {token.dateIssued}
                        </p>
                        <p
                          className={`text-xs ${theme.text.tertiary}`}
                        >
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
    </div>
  );
};

export default ReportScreen;
