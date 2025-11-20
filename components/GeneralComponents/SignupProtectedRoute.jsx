import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useTheme } from "../../context/useTheme";
import { API_BASE_URL } from "../../src/config/apiConfig";

/**
 * SignupProtectedRoute Component
 * Ensures user has a valid OTP before accessing signup page, unless they can be a super admin
 * Redirects to signup-otp if no OTP is provided and super admin slots are full
 */
const SignupProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { theme, isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [canBeSuperAdmin, setCanBeSuperAdmin] = useState(false);

  // Check if user came from OTP screen with valid OTP code
  const hasValidOtp = location.state?.otp_code;

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/super-admin-count`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

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
            Checking registration requirements...
          </p>
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
