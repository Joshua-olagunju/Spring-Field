import { Navigate, useLocation } from "react-router-dom";

/**
 * SignupProtectedRoute Component
 * Ensures user has a valid OTP before accessing signup page
 * Redirects to signup-otp if no OTP is provided
 */
const SignupProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check if user came from OTP screen with valid OTP code
  const hasValidOtp = location.state?.otp_code;

  // Redirect to OTP screen if no valid OTP
  if (!hasValidOtp) {
    return <Navigate to="/signup-otp" replace />;
  }

  return children;
};

export default SignupProtectedRoute;
