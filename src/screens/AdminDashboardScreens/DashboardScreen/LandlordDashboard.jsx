import { useState, useEffect } from "react";
import { useTheme } from "../../../../context/useTheme";
import { Icon } from "@iconify/react";
import { GenerateUserTokenModal } from "../TokenGenerationModals";
import { GenerateVisitorTokenModal } from "../../GeneralScreens/VisitorsTokenGenerationModal/VisitorsGenerationToken";

const LandlordDashboard = () => {
  const { theme, isDarkMode } = useTheme();
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateUserTokenModal, setShowGenerateUserTokenModal] =
    useState(false);
  const [showGenerateVisitorTokenModal, setShowGenerateVisitorTokenModal] =
    useState(false);

  useEffect(() => {
    // Fetch recent visitors from API
    const fetchRecentVisitors = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/recent-visitors",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setRecentVisitors(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching recent visitors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentVisitors();
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
                className={`text-sm font-semibold ${theme.text.link} hover:${theme.text.linkHover} flex items-center gap-1`}
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
            ) : recentVisitors.length === 0 ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentVisitors.map((visitor) => (
                  <button
                    key={visitor.id}
                    onClick={() => handleVisitorClick(visitor)}
                    className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-5 hover:${theme.shadow.medium} transition-all text-left border ${theme.border.secondary} hover:border-blue-500 active:scale-98`}
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
                                  : "mdi:clock-outline"
                              }
                              className="text-sm"
                            />
                            {visitor.status === "active"
                              ? "Active"
                              : visitor.status === "expired"
                              ? "Expired"
                              : "Pending"}
                          </span>
                          <span className={`text-xs ${theme.text.tertiary}`}>
                            {visitor.visit_date || "Today"}
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
                {recentVisitors.length}
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
                12
              </p>
              <p className={`text-xs sm:text-sm ${theme.text.secondary}`}>
                Total Users
              </p>
            </div>

            <div
              className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-6 text-center`}
            >
              <Icon
                icon="mdi:qrcode"
                className={`text-3xl sm:text-4xl text-purple-600 mb-2 mx-auto`}
              />
              <p
                className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-1`}
              >
                {recentVisitors.filter((v) => v.status === "pending").length}
              </p>
              <p className={`text-xs sm:text-sm ${theme.text.secondary}`}>
                Pending Tokens
              </p>
            </div>
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
    </div>
  );
};

export default LandlordDashboard;
