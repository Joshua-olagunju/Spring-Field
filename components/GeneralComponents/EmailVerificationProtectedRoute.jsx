import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/useUser";

/**
 * EmailVerificationProtectedRoute Component
 * Ensures only authenticated users who need email verification can access this page
 * Redirects to login if not authenticated
 * Redirects to appropriate dashboard if email already verified
 */
const EmailVerificationProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useUser();
  const location = useLocation();

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

  // Redirect to login if not authenticated
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
