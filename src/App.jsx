import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { ThemeProvider } from "../context/ThemeContext";
import { UserProvider } from "../context/UserContext";
import { useUser } from "../context/useUser";
import { useTheme } from "../context/useTheme";
import useStore from "./store/useStore";

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f5f5f5",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <h1 style={{ color: "#d32f2f", marginBottom: "16px" }}>
            Oops! Something went wrong
          </h1>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            The app encountered an error.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
// TEMPORARILY DISABLED FOR MOBILE TESTING
// import { useNotifications } from "./hooks/useNotifications";
// TEMPORARILY DISABLED FOR MOBILE TESTING\n// import { onForegroundMessage } from \"./firebase\"; // Add this import
import Login from "./screens/authenticationScreens/Login";
import SignUp from "./screens/authenticationScreens/Signup";
import SignUpOtpScreen from "./screens/authenticationScreens/SignUpOtpScreen";
import EmailVerificationOtp from "./screens/authenticationScreens/EmailVerificationOtp";
import ForgotPassword from "./screens/authenticationScreens/ForgotPassword";
import ResetPasswordOtp from "./screens/authenticationScreens/ResetPasswordOtp";
import ResetPassword from "./screens/authenticationScreens/ResetPassword";
import DashboardScreen from "./screens/UserDashboardScreens/DashboradScreen/DashboardScreen";
import VisitorsScreen from "./screens/GeneralScreens/VisitHistoryScreen/VisitorsScreen";
import SettingsScreen from "./screens/GeneralScreens/SettingsScreen/SettingsScreen";
import SuperAdminDashboard from "./screens/SuperAdminDashboardScreens/DashboardScreen/SuperAdminDashboard";
import AdminUsers from "./screens/SuperAdminDashboardScreens/AdminUsersScreen/AdminUsers";
import SuperAdminReportScreen from "./screens/SuperAdminDashboardScreens/ReportScreen/ReportScreen";
import SuperAdminTransactions from "./screens/SuperAdminDashboardScreens/Transactions/Transactions";
import StatusBar from "../components/GeneralComponents/StatusBar";
import LandlordDashboard from "./screens/AdminDashboardScreens/DashboardScreen/LandlordDashboard";
import LandlordUsers from "./screens/AdminDashboardScreens/DashboardScreen/LandlordUsers";
import SecDashboard from "./screens/SecurityDashboardScreens/ReportScreen/SecDashboard";
import SecurityReportScreen from "./screens/SecurityDashboardScreens/ReportScreen/ReportScreen";
import UsersScreen from "./screens/SecurityDashboardScreens/ReportScreen/UsersScreen";
import TopNavBar from "../components/GeneralComponents/TopNavBar";
import BottomNavBar from "../components/UserComponents/BottomNavBar";
import SuperAdminBottomNav from "../components/SuperAdminComponents/SuperAdminBottomNav";
import AdminBottomNav from "../components/AdminComponents/AdminBottomNav";
import SecurityBottomNav from "../components/SecurityComponents/SecurityBottomNav";
import LogoutConfirmModal from "../components/GeneralComponents/LogoutConfirmModal";
import ProtectedRoute from "../components/GeneralComponents/ProtectedRoute";
import SignupProtectedRoute from "../components/GeneralComponents/SignupProtectedRoute";
import EmailVerificationProtectedRoute from "../components/GeneralComponents/EmailVerificationProtectedRoute";
import ResetPasswordOtpProtectedRoute from "../components/GeneralComponents/ResetPasswordOtpProtectedRoute";
import ResetPasswordProtectedRoute from "../components/GeneralComponents/ResetPasswordProtectedRoute";
import PaymentScreen from "./screens/GeneralScreens/PaymentScreen/PaymentScreen";
import Transactions from "./screens/GeneralScreens/PaymentScreen/Transactions";
import SplashScreen from "../components/GeneralComponents/SplashScreen";

// Auto-redirect component for root path
const AutoRedirect = () => {
  const { isAuthenticated, isLoading, user } = useUser();

  try {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Check if email is verified
    if (!user?.email_verified_at) {
      // Check if there's stored verification data
      try {
        const storedData = useStore.getState().emailVerificationData;
        if (storedData) {
          // Found stored verification data
        }
      } catch (error) {
        console.error("Error checking verification data:", error);
      }
      return <Navigate to="/email-verification" replace />;
    }

    // Route to appropriate dashboard based on role
    switch (user?.role) {
      case "super":
        return <Navigate to="/super-admin/dashboard" replace />;
      case "landlord":
        return <Navigate to="/admin/dashboard" replace />;
      case "resident":
        return <Navigate to="/dashboard" replace />;
      case "security":
        return <Navigate to="/security/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error("AutoRedirect error:", error);
    return <Navigate to="/login" replace />;
  }
};

function AppContent() {
  const { logout, isLoading, isAuthenticated } = useUser();
  const { isDarkMode } = useTheme();
  // TEMPORARILY DISABLED FOR MOBILE TESTING
  // const { initializeNotifications } = useNotifications();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on first app load, not on subsequent navigation or tab switches
    return !sessionStorage.getItem("appLoaded");
  });

  // Update PWA theme color based on current theme
  useEffect(() => {
    const themeColor = isDarkMode ? "#111827" : "#ffffff";
    const backgroundColor = isDarkMode ? "#111827" : "#ffffff";

    // Update meta theme-color for PWA
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    }

    // Update body background color to match theme
    document.body.style.backgroundColor = backgroundColor;
    document.documentElement.style.backgroundColor = backgroundColor;

    // Update Apple status bar style
    const appleStatusBarStyle = document.querySelector(
      "meta[name='apple-mobile-web-app-status-bar-style']"
    );
    if (appleStatusBarStyle) {
      appleStatusBarStyle.setAttribute(
        "content",
        isDarkMode ? "black-translucent" : "black-translucent"
      );
    }
  }, [isDarkMode]);

  // Prevent app from refreshing when switching between apps
  useEffect(() => {
    const preventRefresh = () => {
      // Only prevent refresh if user is authenticated and has token
      const token = useStore.getState().authToken;
      if (token && isAuthenticated) {
        // Don't prevent the event, just log it
      }
    };

    // Handle app state changes
    const handleAppStateChange = () => {
      const token = useStore.getState().authToken;
      if (token) {
        // Force maintain auth state
        window.dispatchEvent(new Event("maintain-auth"));
      }
    };

    window.addEventListener("beforeunload", preventRefresh);
    window.addEventListener("focus", handleAppStateChange);
    window.addEventListener("pageshow", handleAppStateChange);

    return () => {
      window.removeEventListener("beforeunload", preventRefresh);
      window.removeEventListener("focus", handleAppStateChange);
      window.removeEventListener("pageshow", handleAppStateChange);
    };
  }, [isAuthenticated]);

  // Auto-initialize notifications for authenticated users
  // TEMPORARILY DISABLED FOR MOBILE TESTING
  /* 
  useEffect(() => {
    if (isAuthenticated) {
      // Automatically request notification permission after login
      initializeNotifications()
        .then((token) => {
          if (token) {
            // Notifications auto-enabled for authenticated user
          }
        })
        .catch((error) => {
          // Notification permission not granted
        });
    }
  }, [isAuthenticated, initializeNotifications]);
  */

  // Handle splash screen - show only on first load, then mark as loaded
  useEffect(() => {
    if (!isLoading && showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Mark app as loaded so splash won't show again in this session
        sessionStorage.setItem("appLoaded", "true");
      }, 3300); // Reduced from 3.3 seconds to 2 seconds for faster experience
      return () => clearTimeout(timer);
    }
  }, [isLoading, showSplash]);

  // Listen for logout event from TopNavBar
  useEffect(() => {
    const handleOpenLogoutModal = () => {
      setShowLogoutModal(true);
    };

    window.addEventListener("openLogoutModal", handleOpenLogoutModal);
    return () =>
      window.removeEventListener("openLogoutModal", handleOpenLogoutModal);
  }, []);

  // Listen for foreground push notifications
  // TEMPORARILY DISABLED FOR MOBILE TESTING
  /*
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      // Foreground notification received

      // Show browser notification
      if (payload.notification) {
        const { title, body } = payload.notification;
        const notificationData = payload.data || {};

        // Create and show browser notification
        if (Notification.permission === "granted") {
          // Always use app logo for all notifications
          const appIcon = "/icons/icon-192x192.png";

          const notification = new Notification(title || "SpringField Estate", {
            body: body || "You have a new notification",
            icon: appIcon, // Always use your app logo
            badge: "/icons/icon-72x72.png",
            tag: "springfield-notification", // Prevents duplicate notifications
            requireInteraction: true, // Keeps notification visible until user interacts
            data: notificationData,
          });

          // Handle notification click
          notification.onclick = function (event) {
            event.preventDefault();
            window.focus(); // Focus the app window
            notification.close();

            // Handle navigation based on notification type
            // Notification clicked

            // You can add navigation logic here for different notification types
            if (
              notificationData.type === "visitor_arrival" ||
              notificationData.type === "visitor_departure"
            ) {
              // Could navigate to visitors page or show visitor details
              // Visitor notification clicked
            }
          };

          // Auto-close after 10 seconds if not interacted with
          setTimeout(() => {
            notification.close();
          }, 10000);
        }
      }
    });

    // Cleanup function
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);
  */

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Use UserContext logout method which handles API call and localStorage cleanup
      await logout();

      // Close modal and redirect to login
      setShowLogoutModal(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  };

  // Routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/signup-otp",
    "/signup",
    "/forgot-password",
    "/reset-password-otp",
    "/reset-password",
    "/email-verification",
  ];

  // Routes that have their own back button and don't need full TopNavBar padding
  const routesWithReducedPadding = [
    "/settings",
    "/transactions",
    "/admin/transactions",
    "/super-admin/transactions",
  ];

  const showNavigation =
    isAuthenticated && !publicRoutes.includes(location.pathname);

  // Determine padding based on route type
  const shouldUseReducedPadding = routesWithReducedPadding.includes(
    location.pathname
  );
  const contentPadding = showNavigation
    ? shouldUseReducedPadding
      ? "pt-4"
      : "pt-15"
    : "";

  // Show splash screen while loading
  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
      {/* Status Bar - Shows on all pages */}
      <StatusBar />

      {/* Top Navigation Bar - Shows only on protected routes */}
      {showNavigation && <TopNavBar />}

      {/* Main Content - Dynamic padding based on route type */}
      <div className={contentPadding}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AutoRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup-otp" element={<SignUpOtpScreen />} />
          <Route
            path="/signup"
            element={
              <SignupProtectedRoute>
                <SignUp />
              </SignupProtectedRoute>
            }
          />
          <Route
            path="/email-verification"
            element={
              <EmailVerificationProtectedRoute>
                <EmailVerificationOtp />
              </EmailVerificationProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password-otp"
            element={
              <ResetPasswordOtpProtectedRoute>
                <ResetPasswordOtp />
              </ResetPasswordOtpProtectedRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <ResetPasswordProtectedRoute>
                <ResetPassword />
              </ResetPasswordProtectedRoute>
            }
          />

          {/* Resident/User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="resident">
                <DashboardScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitors"
            element={
              <ProtectedRoute>
                <VisitorsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <PaymentScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <h2 className="text-2xl">Profile - Coming Soon</h2>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsScreen />
              </ProtectedRoute>
            }
          />

          {/* Landlord/Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="landlord">
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/visitors"
            element={
              <ProtectedRoute requiredRole="landlord">
                <VisitorsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="landlord">
                <LandlordUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscription"
            element={
              <ProtectedRoute requiredRole="landlord">
                <PaymentScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <ProtectedRoute requiredRole="landlord">
                <Transactions />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute requiredRole="super">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/visitors"
            element={
              <ProtectedRoute requiredRole="super">
                <VisitorsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/admins"
            element={
              <ProtectedRoute requiredRole="super">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/reports"
            element={
              <ProtectedRoute requiredRole="super">
                <SuperAdminReportScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/transactions"
            element={
              <ProtectedRoute requiredRole="super">
                <SuperAdminTransactions />
              </ProtectedRoute>
            }
          />

          {/* Security Guard Routes */}
          <Route
            path="/security/dashboard"
            element={
              <ProtectedRoute requiredRole="security">
                <SecDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security/history"
            element={
              <ProtectedRoute requiredRole="security">
                <SecurityReportScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security/users"
            element={
              <ProtectedRoute requiredRole="security">
                <UsersScreen />
              </ProtectedRoute>
            }
          />

          {/* Catch-all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Bottom Navigation Bar - Shows appropriate nav based on route and auth */}
      {showNavigation &&
        (location.pathname.startsWith("/super-admin/") ? (
          <SuperAdminBottomNav />
        ) : location.pathname.startsWith("/admin/") ? (
          <AdminBottomNav />
        ) : location.pathname.startsWith("/security/") ? (
          <SecurityBottomNav />
        ) : (
          <BottomNavBar />
        ))}

      {/* Global Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <AppContent />
          </Router>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
