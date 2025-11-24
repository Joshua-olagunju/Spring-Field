import { createContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../src/config/apiConfig";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize state with localStorage data immediately to prevent flashing
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        return parsedUser.email_verified_at ? parsedUser : null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    const token = localStorage.getItem("authToken");
    return token || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        return !!user.email_verified_at;
      } catch {
        return false;
      }
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState(false); // Start as false since we initialize from localStorage

  // Clear authentication data
  const clearAuth = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("pendingVerificationUser");
  }, []);

  // Check if user is authenticated
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        const user = JSON.parse(userData);

        // CRITICAL: If email is not verified, do not authenticate user
        if (!user.email_verified_at) {
          clearAuth();
          setIsLoading(false);
          return;
        }

        // Trust the localStorage data - set auth immediately
        console.log("✅ Setting auth from localStorage");
        setAuthToken(token);
        setUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);

        // ONLY verify token in background if explicitly requested, don't auto-logout
        // This prevents losing auth when switching apps
      } else {
        console.log("❌ No auth token found in localStorage");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Don't clear auth on error - might be temporary issue
      setIsLoading(false);
    }
  }, [clearAuth]);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Handle page visibility changes (when user switches apps)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("🔄 App became visible again");
        // Immediately restore auth state from localStorage if available
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("userData");

        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            if (user.email_verified_at) {
              // Force restore authentication state
              console.log("🔑 Restoring auth state from localStorage");
              setAuthToken(token);
              setUser(user);
              setIsAuthenticated(true);
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error parsing stored user data:", error);
          }
        }
      } else {
        console.log("🔄 App going to background, preserving auth state");
      }
    };

    const handlePageHide = () => {
      console.log("📱 Page hide event - preserving auth state");
      // Don't clear anything when page hides
    };

    const handleBeforeUnload = () => {
      console.log("🔄 Before unload - keeping auth token");
      // Don't clear auth token on page refresh or navigation
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const token = result.token || result.data?.token;
        const userData = result.user || result.data?.user;

        // CRITICAL: Check if email is verified
        if (!userData.email_verified_at) {
          // Email not verified - ONLY save user data, NOT the token
          // This prevents access to authenticated routes
          localStorage.setItem(
            "pendingVerificationUser",
            JSON.stringify({
              email: userData.email,
              user_id: userData.id,
              role: userData.role,
              tempToken: token, // Store temporarily for verification API call
            })
          );

          // Do NOT set authenticated state
          return {
            success: true,
            data: result,
            user: userData,
            token,
            needsVerification: true,
          };
        }

        // Email is verified - save token and authenticate
        setAuthToken(token);
        setUser(userData);
        setIsAuthenticated(true);

        // Persist in localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("token", token); // Also save as 'token' for backward compatibility

        return { success: true, data: result, user: userData, token };
      } else {
        return {
          success: false,
          message: result.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Optional: Call logout endpoint to invalidate token on server
      if (authToken) {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  // Complete email verification and save auth token
  const completeEmailVerification = (userData, authToken) => {
    setAuthToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);

    // Persist in localStorage - NOW that email is verified
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("token", authToken); // Also save as 'token' for backward compatibility

    // Clear temporary verification data
    localStorage.removeItem("pendingVerificationUser");
  };

  // Refresh user data from server
  const refreshUserData = async () => {
    try {
      if (!authToken) return;

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          updateUser(result.user);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

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
