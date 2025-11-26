import { Navigate, useLocation } from "react-router-dom";

/**
 * ResetPasswordOtpProtectedRoute Component
 * Ensures only users who need password reset OTP verification can access this page
 * Allows access for:
 * 1. Users navigating from forgot-password with email state
 * 2. Users with valid resetPasswordData in localStorage
 * Redirects to forgot-password if no valid state found
 */
const ResetPasswordOtpProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Get reset password state from navigation (from forgot-password)
  const resetState = location.state;
  const hasResetState = resetState?.email;

  // Check localStorage for reset password data
  let hasStoredResetData = false;
  try {
    const storedData = localStorage.getItem("resetPasswordData");
    if (storedData) {
      const resetData = JSON.parse(storedData);
      hasStoredResetData = !!resetData.email;
    }
  } catch (error) {
    console.warn("Error reading resetPasswordData from localStorage:", error);
  }

  // Allow access if user has reset state from forgot-password OR stored data in localStorage
  if (hasResetState || hasStoredResetData) {
    return children;
  }

  // Redirect to forgot-password if no valid state
  return <Navigate to="/forgot-password" replace />;
};

export default ResetPasswordOtpProtectedRoute;
