import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/useTheme";
import { Icon } from "@iconify/react";

const TopNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const userName = "User"; // Default value for development
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch user data from API (commented out for development without auth)
    // const fetchUserData = async () => {
    //   try {
    //     const response = await fetch("http://localhost:8000/api/user", {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${localStorage.getItem("token")}`,
    //       },
    //     });
    //     const result = await response.json();
    //     if (response.ok && result.success) {
    //       setUserName(
    //         `${result.data.first_name || ""} ${
    //           result.data.last_name || ""
    //         }`.trim() || "User"
    //       );
    //     }
    //   } catch (error) {
    //     console.error("Error fetching user data:", error);
    //     setUserName("User");
    //   }
    // };
    // Comment out to prevent API call during development
    // fetchUserData();
  }, []);

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

  // Hide top nav on auth pages (same behavior as bottom nav)
  const authPages = [
    "/login",
    "/signup-otp",
    "/signup",
    "/email-verification",
    "/forgot-password",
    "/reset-password-otp",
    "/reset-password",
    "/settings",
  ];
  if (authPages.includes(location.pathname)) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 z-[1000] left-0 right-0 z-40 ${theme.topNav.background} ${theme.topNav.border} border-b`}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            {/* Placeholder for user's logo - they will replace this */}
            <Icon
              icon="mdi:home-city"
              className="text-white text-2xl sm:text-3xl"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className={`text-lg font-bold ${theme.topNav.text}`}>
              SpringField Estate
            </h1>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-lg transition-all ${
              theme.topNav.hover
            } ${showDropdown ? theme.background.input : ""}`}
          >
            <span
              className={`text-sm sm:text-base font-semibold ${theme.topNav.text} max-w-[120px] sm:max-w-none truncate`}
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
  );
};

export default TopNavBar;
