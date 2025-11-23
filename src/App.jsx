import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { UserProvider } from "../context/UserContext";
import { useUser } from "../context/useUser";
import { useNotifications } from "./hooks/useNotifications";
import { onForegroundMessage } from "./firebase"; // Add this import
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
import PaymentScreen from "./screens/GeneralScreens/PaymentScreen/PaymentScreen";
import Transactions from "./screens/GeneralScreens/PaymentScreen/Transactions";
import SplashScreen from "../components/GeneralComponents/SplashScreen";

// Auto-redirect component for root path
const AutoRedirect = () => {
  const { isAuthenticated, isLoading, user } = useUser();

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
};

function AppContent() {
  const { logout, isLoading, isAuthenticated } = useUser();
  const { initializeNotifications } = useNotifications();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Auto-initialize notifications for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      // Automatically request notification permission after login
      initializeNotifications()
        .then((token) => {
          if (token) {
            console.log("🔔 Notifications auto-enabled for authenticated user");
          }
        })
        .catch((error) => {
          console.log("⚠️ Notification permission not granted:", error);
        });
    }
  }, [isAuthenticated, initializeNotifications]);

  // Handle splash screen - show for minimum 3 seconds
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3300); // Show splash for minimum 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

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
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("🔔 Foreground notification received:", payload);

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
            console.log("📱 Notification clicked, data:", notificationData);

            // You can add navigation logic here for different notification types
            if (
              notificationData.type === "visitor_arrival" ||
              notificationData.type === "visitor_departure"
            ) {
              // Could navigate to visitors page or show visitor details
              console.log(
                "🚪 Visitor notification clicked:",
                notificationData.visitor_name
              );
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

  const showNavigation =
    isAuthenticated && !publicRoutes.includes(location.pathname);

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

      {/* Main Content - No padding, screens handle their own spacing */}
      <div className={showNavigation ? "pt-6" : ""}>
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
          <Route path="/reset-password-otp" element={<ResetPasswordOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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
    <ThemeProvider>
      <UserProvider>
        <Router>
          <AppContent />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
