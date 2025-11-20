import { Navigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useUser } from "../../context/useUser";
import { useTheme } from "../../context/useTheme";

/**
 * EmailVerificationProtectedRoute Component
 * Ensures only users who need email verification can access this page
 * Allows access for:
 * 1. Authenticated users with unverified emails
 * 2. Users navigating from signup/login with verification state
 * Redirects to login if not authenticated and no verification state
 * Redirects to appropriate dashboard if email already verified
 */
const EmailVerificationProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useUser();
  const { theme, isDarkMode } = useTheme();
  const location = useLocation();

  // Get email verification state from navigation (from signup/login)
  const verificationState = location.state;
  const hasVerificationState =
    verificationState?.email && verificationState?.user_id;

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
            Verifying email status...
          </p>
        </div>
      </div>
    );
  }

  // Allow access if user has verification state from signup/login (even if not fully authenticated yet)
  if (hasVerificationState) {
    return children;
  }

  // Allow access if user is authenticated but email is not verified
  if (isAuthenticated && user && !user.email_verified_at) {
    return children;
  }

  // Redirect to login if not authenticated and no verification state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If email is already verified, redirect to appropriate dashboard
  if (user && user.email_verified_at) {
    const roleRedirectMap = {
      super: "/super-admin/dashboard",
      landlord: "/admin/dashboard",
      resident: "/dashboard",
      security: "/security/dashboard",
    };

    const redirectPath = roleRedirectMap[user.role] || "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default EmailVerificationProtectedRoute;
