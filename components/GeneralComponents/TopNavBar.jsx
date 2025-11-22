import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/useTheme";
import { useUser } from "../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../src/config/apiConfig";
import logoImage from "../../src/assets/logo.png";
import PwaInstallBanner from "./PwaInstallBanner";

const TopNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { authToken, user } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState("User");
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      if (!authToken || !user) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await response.json();
        if (response.ok && result.success) {
          const data = result.data;
          const fullName =
            data.full_name ||
            `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
            "User";
          setUserName(fullName);
        }
      } catch {
        setUserName(user?.full_name || "User");
      }
    };

    fetchUserData();
  }, [authToken, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    setShowDropdown(false);
    navigate("/settings");
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    // Logout modal will be triggered from App.jsx context
    window.dispatchEvent(new Event("openLogoutModal"));
  };

  // Hide top nav on auth pages and transactions page
  const hiddenPages = [
    "/login",
    "/signup-otp",
    "/signup",
    "/email-verification",
    "/forgot-password",
    "/reset-password-otp",
    "/reset-password",
    "/settings",
    "/transactions",
    "/admin/transactions",
  ];
  if (hiddenPages.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* PWA Install Banner - Slides down from top nav */}
      <PwaInstallBanner />

      <nav
        className={`fixed top-0 z-[1000] left-0 right-0 z-40 ${theme.topNav.background} ${theme.topNav.border} border-b`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
              <img
                src={logoImage}
                alt="SpringField Estate Logo"
                className="w-full h-full object-contain p-1.5 animate-pulse"
                style={{
                  filter: "invert(2) brightness(7)",
                  animation: "gentleFloat 3s ease-in-out infinite",
                }}
              />
            </div>

            <div className="hidden sm:block">
              <h1 className={`text-lg font-bold ${theme.topNav.text}`}>
                SpringField Estate
              </h1>
            </div>
          </div>

          {/* Custom animation keyframes */}
          <style jsx>{`
            @keyframes gentleFloat {
              0%,
              100% {
                transform: translateY(0px) scale(1);
              }
              50% {
                transform: translateY(-3px) scale(1.05);
              }
            }
          `}</style>

          {/* User Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-lg transition-all ${
                theme.topNav.hover
              } ${showDropdown ? theme.background.input : ""}`}
            >
              <span
                className={`text-sm sm:text-base font-semibold ${theme.topNav.text} max-w-[100px] sm:max-w-[150px] truncate`}
                title={userName}
              >
                {userName}
              </span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <Icon
                  icon="mdi:account"
                  className="text-white text-lg sm:text-xl"
                />
              </div>
              <Icon
                icon={showDropdown ? "mdi:chevron-up" : "mdi:chevron-down"}
                className={`text-lg ${theme.topNav.icon}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className={`absolute right-0 mt-2 w-48 ${theme.background.card} rounded-lg ${theme.shadow.medium} border ${theme.border.secondary} overflow-hidden`}
              >
                <button
                  onClick={handleSettingsClick}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.input} transition-colors ${theme.text.primary} border-b ${theme.border.secondary}`}
                >
                  <Icon icon="mdi:cog" className="text-xl" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button
                  onClick={handleLogoutClick}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.input} transition-colors text-red-600 hover:text-red-700`}
                >
                  <Icon icon="mdi:logout" className="text-xl" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default TopNavBar;
