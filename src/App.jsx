import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { ThemeProvider } from "../context/ThemeContext";
import { UserProvider } from "../context/UserContext";
import { useUser } from "../context/useUser";
import Login from "./screens/authenticationScreens/Login";
import SignUp from "./screens/authenticationScreens/Signup";
import ForgotPassword from "./screens/authenticationScreens/ForgotPassword";
import ResetPassword from "./screens/authenticationScreens/ResetPassword";
import StatusBar from "../components/StatusBar";
import BottomNavBar from "../components/BottomNavBar";
import ProtectedRoute from "../components/ProtectedRoute";

// Auto-redirect component for root path
const AutoRedirect = () => {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function AppContent() {
  return (
    <>
      {/* Status Bar - Shows on all pages */}
      <StatusBar />

      {/* Main Content with padding for status and bottom bars */}
      <div className="pt-6 pb-20">
        <Routes>
          <Route path="/" element={<AutoRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <h2 className="text-2xl">Dashboard - Coming Soon</h2>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitors"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <h2 className="text-2xl">Visitors - Coming Soon</h2>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <h2 className="text-2xl">Payments - Coming Soon</h2>
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
        </Routes>
      </div>

      {/* Bottom Navigation Bar - Hides on auth pages automatically */}
      <BottomNavBar />
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
