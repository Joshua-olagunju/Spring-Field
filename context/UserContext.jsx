import { createContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../src/config/apiConfig";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if user is authenticated
  const checkAuthStatus = async () => {
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
        setAuthToken(token);
        setUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);

        // Optional: Verify token in background (don't block UI or clear auth on failure)
        try {
          const response = await fetch(`${API_BASE_URL}/api/user`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.user) {
              // Update with fresh data from server
              setUser(result.user);
              localStorage.setItem("userData", JSON.stringify(result.user));
            }
          } else if (response.status === 401) {
            // Only clear auth if we get explicit 401 Unauthorized
            clearAuth();
          }
        } catch (error) {
          // Network errors shouldn't log user out - just log the error
          console.error("Background token verification failed:", error);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoading(false);
    }
  };

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

  // Clear authentication data
  const clearAuth = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("token"); // Also clear backward compatibility token
    localStorage.removeItem("pendingVerificationUser");
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
