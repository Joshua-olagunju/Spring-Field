import { createContext, useState, useEffect } from "react";

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
        // Verify token is still valid by making a request to backend
        const response = await fetch("http://localhost:8000/api/verify-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await response.json();
          setAuthToken(token);
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear everything
          clearAuth();
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const token = result.token;
        const userData = result.user;

        // Store in state
        setAuthToken(token);
        setUser(userData);
        setIsAuthenticated(true);

        // Persist in localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));

        return { success: true, data: result };
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
        await fetch("http://localhost:8000/api/logout", {
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
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  // Refresh user data from server
  const refreshUserData = async () => {
    try {
      if (!authToken) return;

      const response = await fetch("http://localhost:8000/api/user/profile", {
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
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
