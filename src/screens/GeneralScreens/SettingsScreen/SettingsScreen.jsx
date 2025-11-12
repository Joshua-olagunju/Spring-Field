import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/useTheme";
import { Icon } from "@iconify/react";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileModal from "./ProfileModal";

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="min-h-screen pt-0 pb-20 w-full relative">
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
          {/* Header with Back Button */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg ${theme.background.input} hover:${theme.background.card} transition-colors`}
              title="Go back"
            >
              <Icon
                icon="mdi:arrow-left"
                className={`text-lg sm:text-xl ${theme.text.primary}`}
              />
            </button>
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${theme.text.primary}`}
              >
                Settings
              </h1>
            </div>
          </div>

          {/* Settings List */}
          <div className="space-y-3">
            {/* Profile Setting */}
            <button
              onClick={() => setShowProfileModal(true)}
              className={`w-full ${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-5 hover:${theme.shadow.medium} transition-all text-left border ${theme.border.secondary} hover:border-blue-500 active:scale-98`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon="mdi:account"
                      className="text-white text-xl sm:text-2xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold ${theme.text.primary} mb-1 text-sm sm:text-base`}
                    >
                      Profile
                    </h3>
                    <p
                      className={`text-xs sm:text-sm ${theme.text.secondary} truncate`}
                    >
                      View and edit your profile information
                    </p>
                  </div>
                </div>
                <Icon
                  icon="mdi:chevron-right"
                  className={`text-xl ${theme.text.tertiary} flex-shrink-0`}
                />
              </div>
            </button>

            {/* Change Password Setting */}
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className={`w-full ${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-5 hover:${theme.shadow.medium} transition-all text-left border ${theme.border.secondary} hover:border-blue-500 active:scale-98`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon="mdi:lock"
                      className="text-white text-xl sm:text-2xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold ${theme.text.primary} mb-1 text-sm sm:text-base`}
                    >
                      Change Password
                    </h3>
                    <p
                      className={`text-xs sm:text-sm ${theme.text.secondary} truncate`}
                    >
                      Update your account password
                    </p>
                  </div>
                </div>
                <Icon
                  icon="mdi:chevron-right"
                  className={`text-xl ${theme.text.tertiary} flex-shrink-0`}
                />
              </div>
            </button>

            {/* Theme Toggle Setting */}
            <div
              className={`w-full ${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-5 border ${theme.border.secondary}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon={
                        isDarkMode
                          ? "mdi:moon-waning-crescent"
                          : "mdi:white-balance-sunny"
                      }
                      className="text-white text-xl sm:text-2xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold ${theme.text.primary} mb-1 text-sm sm:text-base`}
                    >
                      Theme
                    </h3>
                    <p
                      className={`text-xs sm:text-sm ${theme.text.secondary} truncate`}
                    >
                      {isDarkMode ? "Dark Mode" : "Light Mode"}
                    </p>
                  </div>
                </div>

                {/* Toggle Button - Horizontal */}
                <button
                  onClick={toggleTheme}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    isDarkMode ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      isDarkMode ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div
            className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-6 mt-8 border ${theme.border.secondary}`}
          >
            <p className={`text-xs sm:text-sm ${theme.text.secondary}`}>
              💡 <strong>Tip:</strong> You can also toggle the theme using the
              button in the top-right corner of the screen.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default SettingsScreen;
