import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/useUser";

/**
 * ProtectedRoute Component
 * Ensures user is authenticated before accessing protected routes
 * Redirects to login if not authenticated
 * Redirects to email verification if email not verified
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
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
