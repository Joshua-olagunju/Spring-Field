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
// import { useUser } from "../context/useUser";
import Login from "./screens/authenticationScreens/Login";
import SignUp from "./screens/authenticationScreens/Signup";
import SignUpOtpScreen from "./screens/authenticationScreens/SignUpOtpScreen";
import EmailVerificationOtp from "./screens/authenticationScreens/EmailVerificationOtp";
import ForgotPassword from "./screens/authenticationScreens/ForgotPassword";
import ResetPasswordOtp from "./screens/authenticationScreens/ResetPasswordOtp";
import ResetPassword from "./screens/authenticationScreens/ResetPassword";
import DashboardScreen from "./screens/UserDashboardScreens/DashboradScreen/DashboardScreen";
import VisitorsScreen from "./screens/GeneralScreens/VisitHistoryScreen/VisitorsScreen";
import SuperAdminDashboard from "./screens/SuperAdminDashboardScreens/DashboardScreen/SuperAdminDashboard";
import AdminUsers from "./screens/SuperAdminDashboardScreens/AdminUsersScreen/AdminUsers";
import StatusBar from "../components/GeneralComponents/StatusBar";
import AdminDashboard from "./screens/AdminDashboardScreens/DashboardScreen/LandlordDashboard";
import TopNavBar from "../components/GeneralComponents/TopNavBar";
import BottomNavBar from "../components/UserComponents/BottomNavBar";
import SuperAdminBottomNav from "../components/SuperAdminComponents/SuperAdminBottomNav";
import ProtectedRoute from "../components/GeneralComponents/ProtectedRoute";

// Auto-redirect component for root path
const AutoRedirect = () => {
  // const { isAuthenticated, isLoading } = useUser();

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // return isAuthenticated ? (
  //   <Navigate to="/dashboard" replace />
  // ) : (
  //   <Navigate to="/login" replace />
  // );

  // AUTHENTICATION TEMPORARILY DISABLED FOR DEVELOPMENT
  return <Navigate to="/dashboard" replace />;
};

function AppContent() {
  // const { isAuthenticated } = useUser();
  const location = useLocation();

  return (
    <>
      {/* Status Bar - Shows on all pages */}
      <StatusBar />

      {/* Top Navigation Bar - Shows only on protected routes */}
      {/* TEMPORARILY ALWAYS SHOWING TOP NAV FOR DEVELOPMENT */}
      <TopNavBar />

      {/* Main Content - No padding, screens handle their own spacing */}
      <div className="pt-6">
        <Routes>
          <Route path="/" element={<AutoRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup-otp" element={<SignUpOtpScreen />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/email-verification"
            element={<EmailVerificationOtp />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password-otp" element={<ResetPasswordOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
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
                <div className="min-h-screen flex items-center justify-center">
                  <h2 className="text-2xl">Subscription - Coming Soon</h2>
                </div>
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
          {/* Super Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/visitors"
            element={
              <ProtectedRoute>
                <VisitorsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin"
            element={
              <ProtectedRoute>
                < AdminDashboard/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admins"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <h2 className="text-2xl">Reports - Coming Soon</h2>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Bottom Navigation Bar - Shows appropriate nav based on route */}
      {location.pathname.startsWith("/admin/") ? (
        <SuperAdminBottomNav />
      ) : (
        <BottomNavBar />
      )}
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
