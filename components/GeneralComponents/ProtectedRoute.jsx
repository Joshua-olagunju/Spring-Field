import { Navigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useUser } from "../../context/useUser";
import { useTheme } from "../../context/useTheme";

/**
 * ProtectedRoute Component
 * Ensures user is authenticated before accessing protected routes
 * Redirects to login if not authenticated
 * Redirects to email verification if email not verified
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, user } = useUser();
  const { theme, isDarkMode } = useTheme();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: isDarkMode
            ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))"
            : "linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246), rgb(249, 250, 251))",
        }}
      >
        <div
          className={`${theme.background.card} rounded-2xl ${theme.shadow.large} p-8 text-center`}
        >
          <Icon
            icon="mdi:loading"
            className="text-4xl text-blue-600 animate-spin mx-auto mb-4"
          />
          <p className={`${theme.text.primary} font-medium`}>
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification
  if (user && !user.email_verified_at) {
    return (
      <Navigate to="/email-verification" state={{ from: location }} replace />
    );
  }

  // Check role-based access if required
  if (requiredRole && user && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleRedirectMap = {
      super: "/super-admin/dashboard",
      landlord: "/admin/dashboard",
      resident: "/dashboard",
      security: "/dashboard",
    };

    const redirectPath = roleRedirectMap[user.role] || "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
