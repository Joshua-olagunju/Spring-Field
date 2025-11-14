import { useState } from "react";
import { useTheme } from "../../../../context/useTheme";
import { Icon } from "@iconify/react";

const SecDashboard = () => {
  const { theme, isDarkMode } = useTheme();
  const [totalTokens] = useState(100);
  const [activeTokens] = useState(50);

  const handleViewAllTokens = () => {
    console.log("View All Tokens clicked");
    // TODO: Navigate to all tokens screen
  };

  const handleViewActiveTokens = () => {
    console.log("View Active Tokens clicked");
    // TODO: Navigate to active tokens screen
  };

  const handleInputToken = () => {
    console.log("Generate Token clicked");
    // TODO: Navigate to token generation screen
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
              Security Dashboard 🔒
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              Monitor visitor tokens and access reports
            </p>
          </div>

          {/* Token Statistics Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
            {/* Total Tokens Card */}
            <div
              className={`${theme.background.card} rounded-xl ${theme.shadow.medium} p-6 sm:p-8`}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className={`text-sm sm:text-base ${theme.text.secondary} mb-2`}>
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
                  <p className={`text-sm sm:text-base ${theme.text.secondary} mb-2`}>
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

          {/* Generate Token Section */}
          <div
            className={`${theme.background.card} rounded-2xl ${theme.shadow.medium} p-6 sm:p-8`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Icon
                  icon="mdi:qrcode-plus"
                  className="text-white text-3xl sm:text-4xl"
                />
              </div>
              <h2
                className={`text-xl sm:text-2xl font-bold ${theme.text.primary} mb-2`}
              >
                Input Token
              </h2>
              <p className={`text-sm sm:text-base ${theme.text.secondary} mb-6 max-w-md`}>
                Create a new visitor access token
              </p>
              <button
                onClick={handleInputToken}
                className="bg-gradient-to-r from-purple-600 via-purple-600 to-purple-600 hover:from-purple-700 hover:via-purple-700 hover:to-purple-700 text-white font-semibold px-8 py-3 sm:px-10 sm:py-4 rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Icon icon="mdi:plus-circle" className="text-xl" />
                Input Token
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecDashboard;
