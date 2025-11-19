import { useState, useEffect } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { GenerateUserTokenModal } from "../TokenGenerationModals";
import { GenerateVisitorTokenModal } from "../../GeneralScreens/VisitorsTokenGenerationModal/VisitorsGenerationToken";

const LandlordDashboard = () => {
  const { theme, isDarkMode } = useTheme();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_visitors: 0,
      total_users: 0,
      total_tokens: 0,
      active_tokens: 0,
      pending_tokens: 0,
      used_tokens: 0,
      expired_tokens: 0,
    },
    recent_visitors: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateUserTokenModal, setShowGenerateUserTokenModal] =
    useState(false);
  const [showGenerateVisitorTokenModal, setShowGenerateVisitorTokenModal] =
    useState(false);
  const [showActiveTokensModal, setShowActiveTokensModal] = useState(false);
  const [activeTokens, setActiveTokens] = useState([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState(null);

  useEffect(() => {
    // Fetch dashboard statistics from API
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/visitor-tokens/admin-dashboard-stats",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken") || localStorage.getItem("token")}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setDashboardData(result.data);
        } else {
          console.error("Failed to fetch dashboard stats:", result.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleVisitorClick = (visitor) => {
    console.log("Visitor clicked:", visitor);
  };

  const handleGenerateUserToken = () => {
    setShowGenerateUserTokenModal(true);
  };

  const handleGenerateVisitorToken = () => {
    setShowGenerateVisitorTokenModal(true);
  };

  const handleActiveTokensClick = async () => {
    setIsLoadingTokens(true);
    setShowActiveTokensModal(true);
    
    try {
      const response = await fetch(
        "http://localhost:8000/api/visitor-tokens/my-tokens",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken") || localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Filter only active tokens (not expired and not used)
        const active = result.data.tokens.filter(token => 
          !token.is_expired && !token.is_used
        );
        setActiveTokens(active);
      } else {
        console.error("Failed to fetch tokens:", result.message);
        setActiveTokens([]);
      }
    } catch (error) {
      console.error("Error fetching active tokens:", error);
      setActiveTokens([]);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const copyToClipboard = async (text, tokenId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTokenId(tokenId);
      console.log('Token copied to clipboard!');
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedTokenId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1
              className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
            >
              Admin Dashboard 👨‍💼
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              Manage residents, admins, visitors, and system reports
            </p>
          </div>

          {/* Primary Action: Generate Account Token Card */}
          <div
            className={`${theme.background.card} rounded-2xl ${theme.shadow.medium} p-6 sm:p-8 mb-6`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Icon
                  icon="mdi:account-plus"
                  className="text-white text-3xl sm:text-4xl"
                />
              </div>
              <h2
                className={`text-xl sm:text-2xl font-bold ${theme.text.primary} mb-2`}
              >
                Generate Resident Account
              </h2>
              <p
                className={`text-sm sm:text-base ${theme.text.secondary} mb-6 max-w-md`}
              >
                Create a new resident account with access credentials
              </p>
              <button
                onClick={handleGenerateUserToken}
                className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 hover:from-blue-700 hover:via-blue-700 hover:to-blue-700 text-white font-semibold px-8 py-3 sm:px-10 sm:py-4 rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Icon icon="mdi:plus-circle" className="text-xl" />
                Generate User Token
              </button>
            </div>
          </div>

          {/* Secondary Action: Generate Visitor Token Card */}
          <div
            className={`${theme.background.card} rounded-2xl ${theme.shadow.medium} p-6 sm:p-8 mb-8`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Icon
                  icon="mdi:qrcode-scan"
                  className="text-white text-3xl sm:text-4xl"
                />
              </div>
              <h2
                className={`text-xl sm:text-2xl font-bold ${theme.text.primary} mb-2`}
              >
                Generate Visitor Token
              </h2>
              <p
                className={`text-sm sm:text-base ${theme.text.secondary} mb-6 max-w-md`}
              >
                Create a secure access token for expected visitors
              </p>
              <button
                onClick={handleGenerateVisitorToken}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 sm:px-10 sm:py-4 rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Icon icon="mdi:plus-circle" className="text-xl" />
                Generate Visitor Token
              </button>
            </div>
          </div>

          {/* Recent Visitors Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl sm:text-2xl font-bold ${theme.text.primary}`}
              >
                Recent Visitors
              </h2>
              <button
                onClick={() => navigate('/admin/visitors')}
                className={`text-sm font-semibold ${theme.text.link} hover:${theme.text.linkHover} flex items-center gap-1 transition-colors`}
              >
                View All
                <Icon icon="mdi:arrow-right" className="text-base" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon
                  icon="mdi:loading"
                  className={`animate-spin text-4xl ${theme.text.tertiary}`}
                />
              </div>
            ) : dashboardData.recent_visitors.length === 0 ? (
              <div
                className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-8 sm:p-12 text-center`}
              >
                <Icon
                  icon="mdi:account-group-outline"
                  className={`text-6xl ${theme.text.tertiary} mb-4 mx-auto`}
                />
                <p className={`text-base ${theme.text.secondary} mb-1`}>
                  No recent visitors yet
                </p>
                <p className={`text-sm ${theme.text.tertiary}`}>
                  Visitor records will appear here
                </p>
              </div>
            ) : (
              <div className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-6`}>
                <div className="space-y-3">
                  {dashboardData.recent_visitors.slice(0, 5).map((visitor) => (
                    <button
                      key={visitor.id}
                      onClick={() => handleVisitorClick(visitor)}
                      className={`w-full ${theme.background.input} rounded-lg p-3 hover:${theme.background.card} transition-all text-left border ${theme.border.secondary} hover:border-blue-500`}
                    >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon
                          icon="mdi:account"
                          className="text-white text-xl sm:text-2xl"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold ${theme.text.primary} mb-1 truncate text-sm sm:text-base`}
                        >
                          {visitor.name}
                        </h3>
                        <p
                          className={`text-xs sm:text-sm ${theme.text.secondary} mb-2 truncate`}
                        >
                          {visitor.phone || "No phone number"}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              visitor.status === "active"
                                ? theme.status.success
                                : visitor.status === "expired"
                                ? theme.status.error
                                : theme.status.info
                            }`}
                          >
                            <Icon
                              icon={
                                visitor.status === "active"
                                  ? "mdi:check-circle"
                                  : visitor.status === "expired"
                                  ? "mdi:close-circle"
                                  : visitor.status === "completed"
                                  ? "mdi:check-circle-outline"
                                  : "mdi:clock-outline"
                              }
                              className="text-sm"
                            />
                            {visitor.status === "active"
                              ? "Active"
                              : visitor.status === "expired"
                              ? "Expired"
                              : visitor.status === "completed"
                              ? "Completed"
                              : "Pending"}
                          </span>
                          <span className={`text-xs ${theme.text.tertiary}`}>
                            {visitor.visit_date || "Today"} • {visitor.visit_time || "Recent"}
                          </span>
                        </div>
                      </div>
                      <Icon
                        icon="mdi:chevron-right"
                        className={`text-xl ${theme.text.tertiary} flex-shrink-0`}
                      />
                    </div>
                  </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8">
            <div
              className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-6 text-center`}
            >
              <Icon
                icon="mdi:account-group"
                className={`text-3xl sm:text-4xl ${theme.brand.primaryText} mb-2 mx-auto`}
              />
              <p
                className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-1`}
              >
                {dashboardData.stats.total_visitors}
              </p>
              <p className={`text-xs sm:text-sm ${theme.text.secondary}`}>
                Total Visitors
              </p>
            </div>

            <div
              className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-6 text-center`}
            >
              <Icon
                icon="mdi:account-multiple-plus"
                className={`text-3xl sm:text-4xl text-green-600 mb-2 mx-auto`}
              />
              <p
                className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-1`}
              >
                {dashboardData.stats.total_users}
              </p>
              <p className={`text-xs sm:text-sm ${theme.text.secondary}`}>
                Total Users
              </p>
            </div>

            <button
              onClick={handleActiveTokensClick}
              className={`${theme.background.card} rounded-xl ${theme.shadow.small} hover:${theme.shadow.medium} p-4 sm:p-6 text-center transition-all hover:border-purple-500 border border-transparent`}
            >
              <Icon
                icon="mdi:qrcode"
                className={`text-3xl sm:text-4xl text-purple-600 mb-2 mx-auto`}
              />
              <p
                className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-1`}
              >
                {dashboardData.stats.active_tokens}
              </p>
              <p className={`text-xs sm:text-sm ${theme.text.secondary}`}>
                Active Tokens
              </p>
              <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                Click to view & copy
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GenerateUserTokenModal
        theme={theme}
        isOpen={showGenerateUserTokenModal}
        onClose={() => setShowGenerateUserTokenModal(false)}
      />
      <GenerateVisitorTokenModal
        theme={theme}
        isOpen={showGenerateVisitorTokenModal}
        onClose={() => setShowGenerateVisitorTokenModal(false)}
      />

      {/* Active Tokens Modal */}
      {showActiveTokensModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowActiveTokensModal(false)}
          />

          {/* Modal Content */}
          <div
            className={`${theme.background.card} w-full max-w-2xl rounded-2xl ${theme.shadow.large} relative max-h-[80vh] overflow-hidden`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2
                className={`text-xl sm:text-2xl font-bold ${theme.text.primary}`}
              >
                Active Tokens ({dashboardData.stats.active_tokens})
              </h2>
              <button
                onClick={() => setShowActiveTokensModal(false)}
                className={`p-2 rounded-full hover:${theme.background.input} transition-colors`}
              >
                <Icon
                  icon="mdi:close"
                  className={`text-xl ${theme.text.tertiary}`}
                />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {isLoadingTokens ? (
                <div className="flex items-center justify-center py-8">
                  <Icon
                    icon="mdi:loading"
                    className={`animate-spin text-4xl ${theme.text.tertiary}`}
                  />
                </div>
              ) : activeTokens.length === 0 ? (
                <div className="text-center py-8">
                  <Icon
                    icon="mdi:qrcode-off"
                    className={`text-6xl ${theme.text.tertiary} mb-4 mx-auto`}
                  />
                  <p className={`text-base ${theme.text.secondary} mb-1`}>
                    No active tokens found
                  </p>
                  <p className={`text-sm ${theme.text.tertiary} mb-4`}>
                    Active tokens will appear here when you generate them
                  </p>
                  <button
                    onClick={() => {
                      setShowActiveTokensModal(false);
                      setShowGenerateVisitorTokenModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Generate Visitor Token
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTokens.map((token) => (
                    <div
                      key={token.id}
                      className={`${theme.background.input} rounded-xl p-4 border ${theme.border.secondary}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold ${theme.text.primary} mb-1 text-base`}
                          >
                            {token.visitor_name}
                          </h3>
                          <p
                            className={`text-xs ${theme.text.secondary} mb-2`}
                          >
                            {token.visitor_phone || "No phone"} • {token.stay_type}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${theme.status.success}`}
                            >
                              <Icon icon="mdi:check-circle" className="text-sm" />
                              Active
                            </span>
                            <span className={`text-xs ${theme.text.tertiary}`}>
                              Expires: {new Date(token.expires_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-0">
                          {token.token ? (
                            <>
                              <div
                                className={`${theme.background.card} rounded-lg p-3 border text-sm`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Icon icon="mdi:qrcode" className="text-blue-600" />
                                  <span className="font-medium text-blue-700">Token</span>
                                </div>
                                <div
                                  className={`${theme.background.input} rounded p-2 font-mono text-sm ${theme.text.primary} break-all border`}
                                >
                                  {token.token}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => copyToClipboard(token.token, token.id)}
                                  className={`${
                                    copiedTokenId === token.id
                                      ? 'bg-green-700 text-white'
                                      : 'bg-green-600 hover:bg-green-700 text-white'
                                  } text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 flex-1 justify-center`}
                                >
                                  <Icon 
                                    icon={copiedTokenId === token.id ? "mdi:check" : "mdi:content-copy"} 
                                    className="text-sm" 
                                  />
                                  {copiedTokenId === token.id ? "Copied!" : "Copy Token"}
                                </button>
                                <button
                                  onClick={() => {
                                    setShowActiveTokensModal(false);
                                    setShowGenerateVisitorTokenModal(true);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 justify-center"
                                >
                                  <Icon icon="mdi:plus" className="text-sm" />
                                  New
                                </button>
                              </div>
                            </>
                          ) : (
                            <div
                              className={`${theme.background.card} rounded-lg p-3 border text-sm text-center`}
                            >
                              <Icon icon="mdi:lock" className="text-gray-500 text-2xl mb-2" />
                              <p className="text-xs text-gray-500">Token no longer available</p>
                              <button
                                onClick={() => {
                                  setShowActiveTokensModal(false);
                                  setShowGenerateVisitorTokenModal(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded mt-2"
                              >
                                Generate New
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;
