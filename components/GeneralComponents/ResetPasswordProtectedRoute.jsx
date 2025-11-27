import { Navigate, useLocation } from "react-router-dom";
import useStore from "../../src/store/useStore";

/**
 * ResetPasswordProtectedRoute Component
 * Ensures only users who have verified their OTP can access the reset password page
 * Allows access for:
 * 1. Users navigating from reset-password-otp with email and token state
 * 2. Users with valid resetPasswordToken in localStorage
 * Redirects to forgot-password if no valid state found
 */
const ResetPasswordProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Get reset password state from navigation (from reset-password-otp)
  const resetState = location.state;
  const hasResetState = resetState?.email && resetState?.token;

  // Check store for reset password token
  let hasStoredResetToken = false;
  try {
    const storedData = useStore.getState().resetPasswordToken;
    if (storedData) {
      const tokenData = storedData;
      hasStoredResetToken = !!(tokenData.email && tokenData.token);
    }
  } catch (error) {
    console.warn("Error reading resetPasswordToken from store:", error);
  }

  // Allow access if user has reset state from OTP verification OR stored token in store
  if (hasResetState || hasStoredResetToken) {
    return children;
  }

  // Redirect to forgot-password if no valid state
  return <Navigate to="/forgot-password" replace />;
};

export default ResetPasswordProtectedRoute;
