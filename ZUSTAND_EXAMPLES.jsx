/**
 * EXAMPLE: How to migrate a component from localStorage to Zustand
 *
 * This file shows before/after comparisons for common patterns
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

// ========================================
// EXAMPLE 1: Simple Auth Token Check
// ========================================

// ❌ BEFORE (using localStorage directly)
function BeforeComponent1() {
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
  }, [authToken, navigate]);

  return <div>Protected Content</div>;
}

// ✅ AFTER (using Zustand)
function AfterComponent1() {
  const authToken = useStore((state) => state.authToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    }
  }, [authToken]);

  return <div>Protected Content</div>;
}

// ========================================
// EXAMPLE 2: User Data with JSON Parse
// ========================================

// ❌ BEFORE
function BeforeComponent2() {
  const [userData, setUserData] = useState(() => {
    try {
      const data = localStorage.getItem("userData");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  const updateProfile = (newData) => {
    setUserData(newData);
    localStorage.setItem("userData", JSON.stringify(newData));
  };

  return <div>{userData?.name}</div>;
}

// ✅ AFTER
function AfterComponent2() {
  const user = useStore((state) => state.user);
  const updateUser = useStore((state) => state.updateUser);

  const updateProfile = (newData) => {
    updateUser(newData);
    // That's it! Zustand automatically persists to localStorage
  };

  return <div>{user?.name}</div>;
}

// ========================================
// EXAMPLE 3: Email Verification Flow
// ========================================

// ❌ BEFORE
function BeforeEmailVerification() {
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem("emailVerificationData");
    if (stored) {
      setVerificationData(JSON.parse(stored));
    }
  }, []);

  const saveVerificationData = (data) => {
    setVerificationData(data);
    localStorage.setItem("emailVerificationData", JSON.stringify(data));
  };

  const clearVerificationData = () => {
    setVerificationData(null);
    localStorage.removeItem("emailVerificationData");
  };

  return <div>{verificationData?.email}</div>;
}

// ✅ AFTER
function AfterEmailVerification() {
  const emailVerificationData = useStore(
    (state) => state.emailVerificationData
  );
  const setEmailVerificationData = useStore(
    (state) => state.setEmailVerificationData
  );
  const clearEmailVerificationData = useStore(
    (state) => state.clearEmailVerificationData
  );

  // No useEffect needed! Data is already loaded from localStorage by Zustand

  const saveVerificationData = (data) => {
    setEmailVerificationData(data);
    // Automatically persisted!
  };

  return <div>{emailVerificationData?.email}</div>;
}

// ========================================
// EXAMPLE 4: Payment Logs Array
// ========================================

// ❌ BEFORE
function BeforePaymentLogs() {
  const logPayment = (message, data) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data,
    };

    try {
      const existingLogs = JSON.parse(
        localStorage.getItem("payment_logs") || "[]"
      );
      existingLogs.push(logEntry);
      localStorage.setItem("payment_logs", JSON.stringify(existingLogs));
    } catch (error) {
      console.error("Failed to save log");
    }
  };

  const getLogs = () => {
    try {
      return JSON.parse(localStorage.getItem("payment_logs") || "[]");
    } catch {
      return [];
    }
  };

  const clearLogs = () => {
    localStorage.removeItem("payment_logs");
  };
}

// ✅ AFTER
function AfterPaymentLogs() {
  const addPaymentLog = useStore((state) => state.addPaymentLog);
  const getPaymentLogs = useStore((state) => state.getPaymentLogs);
  const clearPaymentLogs = useStore((state) => state.clearPaymentLogs);

  const logPayment = (message, data) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data,
    };

    addPaymentLog(logEntry);
    // That's it! Much cleaner, with error handling built-in
  };

  const getLogs = () => {
    return getPaymentLogs();
  };
}

// ========================================
// EXAMPLE 5: Multiple localStorage Calls
// ========================================

// ❌ BEFORE
function BeforeMultipleStorage() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [userData, setUserData] = useState(() => {
    const data = localStorage.getItem("userData");
    return data ? JSON.parse(data) : null;
  });

  const handleLogout = () => {
    setAuthToken(null);
    setUserData(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
  };
}

// ✅ AFTER
function AfterMultipleStorage() {
  const authToken = useStore((state) => state.authToken);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  const handleLogout = () => {
    logout(); // Clears everything automatically!
  };
}

// ========================================
// EXAMPLE 6: Using Context (No Changes Needed!)
// ========================================

// ✅ THIS WORKS WITHOUT CHANGES
import { useUser } from "../context/useUser";
import { useTheme } from "../context/useTheme";

function WorksWithoutChanges() {
  const { user, authToken, login, logout } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();

  // Everything works exactly as before!
  // Contexts now use Zustand internally

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={toggleTheme}>
        Switch to {isDarkMode ? "Light" : "Dark"} Mode
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// ========================================
// EXAMPLE 7: Backward Compatible Hook
// ========================================

// ✅ USING THE COMPATIBILITY HOOK
import { useLocalStorage } from "../hooks/useLocalStorage";

function BackwardCompatible() {
  const storage = useLocalStorage();

  // Drop-in replacement for localStorage API
  const token = storage.getItem("authToken");
  storage.setItem("authToken", "new-token");
  storage.removeItem("authToken");

  // Or use specific methods
  const userData = storage.getUserData();
  storage.setUserData({ name: "John" });

  const logs = storage.getPaymentLogs();
  storage.addPaymentLog({ message: "Payment made" });
}

// ========================================
// EXAMPLE 8: Complex Auth Flow
// ========================================

// ❌ BEFORE
function BeforeLogin() {
  const handleLogin = async (email, password) => {
    const response = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.success) {
      if (!result.user.email_verified_at) {
        // Save pending user
        localStorage.setItem(
          "pendingVerificationUser",
          JSON.stringify({
            email: result.user.email,
            user_id: result.user.id,
            tempToken: result.token,
          })
        );
        navigate("/email-verification");
      } else {
        // Save auth
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("userData", JSON.stringify(result.user));
        navigate("/dashboard");
      }
    }
  };
}

// ✅ AFTER
function AfterTokenData() {
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    const result = await login(email, password);

    if (result.success) {
      if (result.needsVerification) {
        navigate("/email-verification");
      } else {
        navigate("/dashboard");
      }
    }
    // All localStorage handling done automatically in the store!
  };
}

// ========================================
// EXAMPLE 9: Checking Auth in Multiple Places
// ========================================

// ❌ BEFORE (Inconsistent checks)
function BeforeAuthCheck1() {
  const token = localStorage.getItem("authToken");
  if (!token) navigate("/login");
}

function BeforeAuthCheck2() {
  const userData = localStorage.getItem("userData");
  const user = userData ? JSON.parse(userData) : null;
  if (!user) navigate("/login");
}

function BeforeAuthCheck3() {
  const token = localStorage.getItem("token"); // Different key!
  if (!token) navigate("/login");
}

// ✅ AFTER (Consistent, single source of truth)

function AfterAuthCheck() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    navigate("/login");
  }
  // Always consistent, always correct!
}

// ========================================
// EXAMPLE 10: Theme Persistence
// ========================================

// ❌ BEFORE
function BeforeTheme() {
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
}

// ✅ AFTER
function AfterAuthFlow() {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const toggleTheme = useStore((state) => state.toggleTheme);

  // That's it! Document class updates and persistence handled automatically
}

export {
  AfterComponent1,
  AfterComponent2,
  AfterEmailVerification,
  AfterPaymentLogs,
  AfterMultipleStorage,
  WorksWithoutChanges,
  BackwardCompatible,
  AfterTokenData,
  AfterAuthCheck,
  AfterAuthFlow,
};
