import { useTheme } from "../../context/useTheme";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

const SuperAdminBottomNav = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide bottom nav on auth pages
  const authPages = [
    "/login",
    "/signup-otp",
    "/signup",
    "/email-verification",
    "/forgot-password",
    "/reset-password-otp",
    "/reset-password",
  ];
  if (authPages.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    {
      name: "Home",
      path: "/admin/dashboard",
      icon: "mdi:home-outline",
      iconFilled: "mdi:home",
    },
    {
      name: "Visitors",
      path: "/admin/visitors",
      icon: "mdi:account-group-outline",
      iconFilled: "mdi:account-group",
    },
    {
      name: "Users",
      path: "/admin/admin",
      icon: "mdi:account-multiple-outline",
      iconFilled: "mdi:account-multiple",
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 ${theme.bottomBar.background} ${theme.bottomBar.border} border-t`}
    >
      <div className="flex items-center justify-between sm:justify-evenly py-3 px-2 max-w-2xl mx-auto w-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 sm:flex-none py-2 rounded-xl transition-all ${
                isActive ? theme.bottomBar.active : theme.bottomBar.inactive
              }`}
            >
              <Icon
                icon={isActive ? item.iconFilled : item.icon}
                className={`text-2xl ${
                  isActive
                    ? theme.bottomBar.iconActive
                    : theme.bottomBar.iconInactive
                }`}
              />
              <span className="text-xs font-medium text-center truncate w-full">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default SuperAdminBottomNav;
