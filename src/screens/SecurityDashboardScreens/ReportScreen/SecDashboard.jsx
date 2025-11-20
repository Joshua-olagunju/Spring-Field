import { useState, useEffect } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import TokenVerificationModal from "./TokenVerificationModal";
import ActiveTokensModal from "./ActiveTokensModal";
import { API_BASE_URL } from "../../../config/apiConfig";

const SecDashboard = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken } = useUser();
  const [totalTokens, setTotalTokens] = useState(0);
  const [activeTokens, setActiveTokens] = useState(0);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showActiveTokensModal, setShowActiveTokensModal] = useState(false);

  // Fetch token statistics
  useEffect(() => {
    const fetchTokenStats = async () => {
      try {
        // Fetch all entries for total count
        const allEntriesResponse = await fetch(
          `${API_BASE_URL}/api/visitor-tokens/all-entries`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                authToken || localStorage.getItem("authToken")
              }`,
            },
          }
        );

        // Fetch active entries
        const activeEntriesResponse = await fetch(
          `${API_BASE_URL}/api/visitor-tokens/active-entries`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                authToken || localStorage.getItem("authToken")
              }`,
            },
          }
        );

        const allResult = await allEntriesResponse.json();
        const activeResult = await activeEntriesResponse.json();

        if (allEntriesResponse.ok && allResult.success) {
          setTotalTokens(
            allResult.data.pagination?.total ||
              allResult.data.entries?.length ||
              0
          );
        }

        if (activeEntriesResponse.ok && activeResult.success) {
          setActiveTokens(activeResult.data?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching token stats:", error);
      }
    };

    fetchTokenStats();
  }, [authToken]);

  const handleViewAllTokens = () => {
    // This would navigate to ReportScreen - implement with router when needed
  };

  const handleViewActiveTokens = () => {
    setShowActiveTokensModal(true);
  };

  const handleVerifyToken = () => {
    setShowVerificationModal(true);
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
        <div className="max-w-full mx-auto ">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1
              className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
            >
              Security Dashboard 🔒
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              Monitor visitor tokens and access reports
            </p>
          </div>

          {/* Verify Token Section */}
          <div
            className={`${theme.background.card} rounded-2xl ${theme.shadow.medium} mb-5 p-6 sm:p-8`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Icon
                  icon="mdi:shield-check"
                  className="text-white text-3xl sm:text-4xl"
                />
              </div>
              <h2
                className={`text-xl sm:text-2xl font-bold ${theme.text.primary} mb-2`}
              >
                Verify Token
              </h2>
              <p
                className={`text-sm sm:text-base ${theme.text.secondary} mb-6 max-w-md`}
              >
                Verify visitor access tokens and grant entry
              </p>
              <button
                onClick={handleVerifyToken}
                className="bg-gradient-to-r from-purple-600 via-purple-600 to-purple-600 hover:from-purple-700 hover:via-purple-700 hover:to-purple-700 text-white font-semibold px-8 py-3 sm:px-10 sm:py-4 rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Icon icon="mdi:qrcode-scan" className="text-xl" />
                Verify Token
              </button>
            </div>
          </div>

          {/* Active Tokens Section */}
          <div
            className={`${theme.background.card} rounded-2xl ${theme.shadow.medium} mb-5 p-6 sm:p-8`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Icon
                  icon="mdi:account-group"
                  className="text-white text-3xl sm:text-4xl"
                />
              </div>
              <h2
                className={`text-xl sm:text-2xl font-bold ${theme.text.primary} mb-2`}
              >
                Active Visitors
              </h2>
              <p
                className={`text-sm sm:text-base ${theme.text.secondary} mb-4 max-w-md`}
              >
                {activeTokens} {activeTokens === 1 ? "visitor" : "visitors"}{" "}
                currently on premises
              </p>
              <button
                onClick={handleViewActiveTokens}
                className="bg-gradient-to-r from-green-600 via-green-600 to-green-600 hover:from-green-700 hover:via-green-700 hover:to-green-700 text-white font-semibold px-8 py-3 sm:px-10 sm:py-4 rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Icon icon="mdi:account-clock" className="text-xl" />
                View Active Tokens
              </button>
            </div>
          </div>

          {/* Token Statistics Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
            {/* Total Tokens Card */}
            <div
              className={`${theme.background.card} rounded-xl ${theme.shadow.medium} p-6 sm:p-8`}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p
                    className={`text-sm sm:text-base ${theme.text.secondary} mb-2`}
                  >
                    Total Tokens
                  </p>
                  <p
                    className={`text-3xl sm:text-4xl font-bold ${theme.text.primary}`}
                  >
                    {totalTokens}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon
                    icon="mdi:qrcode"
                    className="text-white text-2xl sm:text-3xl"
                  />
                </div>
              </div>
              <button
                onClick={handleViewAllTokens}
                className={`text-sm font-semibold ${theme.text.link} hover:${theme.text.linkHover} flex items-center gap-1 transition-all`}
              >
                View All Tokens
                <Icon icon="mdi:arrow-right" className="text-base" />
              </button>
            </div>

            {/* Active Tokens Card */}
            <div
              className={`${theme.background.card} rounded-xl ${theme.shadow.medium} p-6 sm:p-8`}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p
                    className={`text-sm sm:text-base ${theme.text.secondary} mb-2`}
                  >
                    Active Tokens
                  </p>
                  <p
                    className={`text-3xl sm:text-4xl font-bold ${theme.text.primary}`}
                  >
                    {activeTokens}
                  </p>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon
                    icon="mdi:check-circle"
                    className="text-white text-2xl sm:text-3xl"
                  />
                </div>
              </div>
              <button
                onClick={handleViewActiveTokens}
                className={`text-sm font-semibold ${theme.text.link} hover:${theme.text.linkHover} flex items-center gap-1 transition-all`}
              >
                View Active Tokens
                <Icon icon="mdi:arrow-right" className="text-base" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Token Verification Modal */}
      <TokenVerificationModal
        theme={theme}
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />

      {/* Active Tokens Modal */}
      <ActiveTokensModal
        theme={theme}
        isOpen={showActiveTokensModal}
        onClose={() => setShowActiveTokensModal(false)}
      />
    </div>
  );
};

export default SecDashboard;
