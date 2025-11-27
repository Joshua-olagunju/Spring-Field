import { createContext, useEffect } from "react";
import useStore from "../src/store/useStore";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Get state and actions from Zustand store
  const user = useStore((state) => state.user);
  const authToken = useStore((state) => state.authToken);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const isLoading = useStore((state) => state.isLoading);

  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);
  const updateUser = useStore((state) => state.updateUser);
  const refreshUserData = useStore((state) => state.refreshUserData);
  const checkAuthStatus = useStore((state) => state.checkAuthStatus);
  const completeEmailVerification = useStore(
    (state) => state.completeEmailVerification
  );

  // Initialize auth state on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Handle page visibility changes (when user switches apps)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Zustand with persist middleware automatically restores state
        // Just check auth status to ensure consistency
        checkAuthStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAuthStatus]);

  const value = {
    user,
    authToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUserData,
    checkAuthStatus,
    completeEmailVerification,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
