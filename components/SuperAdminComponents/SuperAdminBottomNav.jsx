import { useTheme } from "../../context/useTheme";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const Motion = motion;

const SuperAdminBottomNav = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide bottom nav on auth pages and transactions page
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

  const navItems = [
    {
      name: "Home",
      path: "/super-admin/dashboard",
      icon: "mdi:home-outline",
      iconFilled: "mdi:home",
    },
    {
      name: "Visitors",
      path: "/super-admin/visitors",
      icon: "mdi:account-group-outline",
      iconFilled: "mdi:account-group",
    },

    {
      name: "Admins",
      path: "/super-admin/admins",
      icon: "mdi:shield-account-outline",
      iconFilled: "mdi:shield-account",
    },
    {
      name: "Reports",
      path: "/super-admin/reports",
      icon: "mdi:file-chart-outline",
      iconFilled: "mdi:file-chart",
    },
    {
      name: "Transactions",
      path: "/super-admin/transactions",
      icon: "mdi:credit-card-outline",
      iconFilled: "mdi:credit-card",
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
            <Motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 sm:flex-none py-2 px-1 rounded-xl transition-colors ${
                isActive ? theme.bottomBar.active : theme.bottomBar.inactive
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <Motion.div
                  layoutId="activeTabSuperAdmin"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-600/30 dark:to-purple-600/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Icon
                  icon={isActive ? item.iconFilled : item.icon}
                  className={`text-2xl ${
                    isActive
                      ? theme.bottomBar.iconActive
                      : theme.bottomBar.iconInactive
                  }`}
                />
              </Motion.div>
              <Motion.span
                className="text-xs font-medium text-center truncate w-full relative z-10"
                animate={{ fontWeight: isActive ? 600 : 500 }}
              >
                {item.name}
              </Motion.span>
            </Motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default SuperAdminBottomNav;
