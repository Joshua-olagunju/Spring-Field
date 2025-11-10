// import { Navigate, useLocation } from "react-router-dom";
// import { useUser } from "../context/useUser";

const ProtectedRoute = ({ children }) => {
  // const { isAuthenticated, isLoading } = useUser();
  // const location = useLocation();

  // // Show loading spinner while checking auth
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // // Redirect to login if not authenticated
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // AUTHENTICATION TEMPORARILY DISABLED FOR DEVELOPMENT
  return children;
};

export default ProtectedRoute;
