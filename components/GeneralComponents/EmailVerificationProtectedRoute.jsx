import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/useUser";

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
  const location = useLocation();

  // Get email verification state from navigation (from signup/login)
  const verificationState = location.state;
  const hasVerificationState =
    verificationState?.email && verificationState?.user_id;

  // Show loading spinner while checking auth
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
