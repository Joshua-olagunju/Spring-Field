import { useTheme } from "../context/useTheme";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

const BottomNavBar = () => {
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
      path: "/dashboard",
      icon: "mdi:home-outline",
      iconFilled: "mdi:home",
    },
    {
      name: "Visitors",
      path: "/visitors",
      icon: "mdi:account-group-outline",
      iconFilled: "mdi:account-group",
    },
    {
      name: "Subscription",
      path: "/subscription",
      icon: "mdi:credit-card-outline",
      iconFilled: "mdi:credit-card",
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 ${theme.bottomBar.background} ${theme.bottomBar.border} border-t`}
    >
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
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
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
