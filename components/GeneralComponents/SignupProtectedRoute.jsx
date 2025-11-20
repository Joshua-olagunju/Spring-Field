import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

/**
 * SignupProtectedRoute Component
 * Ensures user has a valid OTP before accessing signup page, unless they can be a super admin
 * Redirects to signup-otp if no OTP is provided and super admin slots are full
 */
const SignupProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [canBeSuperAdmin, setCanBeSuperAdmin] = useState(false);

  // Check if user came from OTP screen with valid OTP code
  const hasValidOtp = location.state?.otp_code;

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/super-admin-count",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const result = await response.json();
        if (response.ok && result.success) {
          setCanBeSuperAdmin(result.data.super_admin_count < 3);
        }
      } catch (error) {
        console.error("Error checking super admin count:", error);
        // On error, assume OTP is required for safety
        setCanBeSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSuperAdminStatus();
  }, []);

  // Show loading while checking super admin status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking registration requirements...</p>
        </div>
      </div>
    );
  }

  // If user can be super admin (less than 3 exist), allow direct access
  if (canBeSuperAdmin) {
    return children;
  }

  // If super admin slots are full, require OTP
  if (!hasValidOtp) {
    return <Navigate to="/signup-otp" replace />;
  }

  return children;
};

export default SignupProtectedRoute;
