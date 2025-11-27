/**
 * Custom hook to replace localStorage usage with Zustand store
 * This provides backward-compatible localStorage-like API using Zustand
 */
import useStore from "../store/useStore";

export const useLocalStorage = () => {
  const store = useStore();

  return {
    // Auth Token
    getAuthToken: () => store.authToken,
    setAuthToken: (token) => store.setAuthToken(token),

    // User Data
    getUserData: () => store.user,
    setUserData: (user) => store.setUser(user),

    // Email Verification Data
    getEmailVerificationData: () => store.emailVerificationData,
    setEmailVerificationData: (data) => store.setEmailVerificationData(data),
    clearEmailVerificationData: () => store.clearEmailVerificationData(),

    // Reset Password Data
    getResetPasswordData: () => store.resetPasswordData,
    setResetPasswordData: (data) => store.setResetPasswordData(data),
    getResetPasswordToken: () => store.resetPasswordToken,
    setResetPasswordToken: (data) => store.setResetPasswordToken(data),
    clearResetPasswordData: () => store.clearResetPasswordData(),

    // Pending Verification User
    getPendingVerificationUser: () => store.pendingVerificationUser,

    // Payment Logs
    getPaymentLogs: () => store.getPaymentLogs(),
    addPaymentLog: (log) => store.addPaymentLog(log),
    clearPaymentLogs: () => store.clearPaymentLogs(),

    // Theme
    getTheme: () => store.themePreference,

    // Generic - for backward compatibility
    getItem: (key) => {
      const keyMap = {
        authToken: () => store.authToken,
        token: () => store.authToken,
        userData: () => JSON.stringify(store.user),
        theme: () => store.themePreference,
        emailVerificationData: () =>
          JSON.stringify(store.emailVerificationData),
        resetPasswordData: () => JSON.stringify(store.resetPasswordData),
        resetPasswordToken: () => JSON.stringify(store.resetPasswordToken),
        pendingVerificationUser: () =>
          JSON.stringify(store.pendingVerificationUser),
        payment_logs: () => JSON.stringify(store.paymentLogs),
      };

      return keyMap[key] ? keyMap[key]() : null;
    },

    setItem: (key, value) => {
      const keyMap = {
        authToken: () => store.setAuthToken(value),
        token: () => store.setAuthToken(value),
        userData: () =>
          store.setUser(typeof value === "string" ? JSON.parse(value) : value),
        theme: () => store.setTheme(value === "dark"),
        emailVerificationData: () =>
          store.setEmailVerificationData(
            typeof value === "string" ? JSON.parse(value) : value
          ),
        resetPasswordData: () =>
          store.setResetPasswordData(
            typeof value === "string" ? JSON.parse(value) : value
          ),
        resetPasswordToken: () =>
          store.setResetPasswordToken(
            typeof value === "string" ? JSON.parse(value) : value
          ),
      };

      if (keyMap[key]) {
        keyMap[key]();
      }
    },

    removeItem: (key) => {
      const keyMap = {
        emailVerificationData: () => store.clearEmailVerificationData(),
        resetPasswordData: () => store.clearResetPasswordData(),
        resetPasswordToken: () => store.clearResetPasswordData(),
        payment_logs: () => store.clearPaymentLogs(),
        authToken: () => store.setAuthToken(null),
        token: () => store.setAuthToken(null),
        userData: () => store.setUser(null),
        pendingVerificationUser: () => store.logout(),
      };

      if (keyMap[key]) {
        keyMap[key]();
      }
    },

    // Clear all
    clear: () => store.clearAllData(),
  };
};

export default useLocalStorage;
