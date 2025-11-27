import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { API_BASE_URL } from "../config/apiConfig";

/**
 * Main Zustand Store with Persistence
 * Replaces all localStorage usage with a centralized state management solution
 */
const useStore = create(
  persist(
    (set, get) => ({
      // ========== AUTH STATE ==========
      user: null,
      authToken: null,
      isAuthenticated: false,
      isLoading: false,

      // ========== THEME STATE ==========
      isDarkMode: true,
      themePreference: "dark",

      // ========== TEMPORARY AUTH FLOWS ==========
      // Email verification flow
      emailVerificationData: null,

      // Password reset flow
      resetPasswordData: null,
      resetPasswordToken: null,

      // Pending verification user (not yet email verified)
      pendingVerificationUser: null,

      // ========== PAYMENT LOGS ==========
      paymentLogs: [],

      // ========== AUTH ACTIONS ==========
      setUser: (user) => set({ user }),

      setAuthToken: (token) => set({ authToken: token }),

      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      setLoading: (isLoading) => set({ isLoading }),

      /**
       * Login action
       */
      login: async (email, password) => {
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

            // Check if email is verified
            if (!userData.email_verified_at) {
              // Save pending user data but don't authenticate
              set({
                pendingVerificationUser: {
                  email: userData.email,
                  user_id: userData.id,
                  role: userData.role,
                  tempToken: token,
                },
              });

              return {
                success: true,
                data: result,
                user: userData,
                token,
                needsVerification: true,
              };
            }

            // Email verified - authenticate user
            set({
              authToken: token,
              user: userData,
              isAuthenticated: true,
              pendingVerificationUser: null,
            });

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
      },

      /**
       * Logout action
       */
      logout: async () => {
        const { authToken } = get();

        try {
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
          // Clear all auth-related state
          set({
            authToken: null,
            user: null,
            isAuthenticated: false,
            pendingVerificationUser: null,
            emailVerificationData: null,
            resetPasswordData: null,
            resetPasswordToken: null,
          });
        }
      },

      /**
       * Update user data
       */
      updateUser: (userData) => {
        set({ user: userData });
      },

      /**
       * Complete email verification
       */
      completeEmailVerification: (userData, authToken) => {
        set({
          authToken,
          user: userData,
          isAuthenticated: true,
          pendingVerificationUser: null,
          emailVerificationData: null,
        });
      },

      /**
       * Check auth status
       */
      checkAuthStatus: async () => {
        const { authToken, user } = get();

        if (authToken && user) {
          // Verify email is confirmed
          if (!user.email_verified_at) {
            set({
              authToken: null,
              user: null,
              isAuthenticated: false,
            });
            return;
          }

          set({
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      },

      /**
       * Refresh user data from server
       */
      refreshUserData: async () => {
        const { authToken } = get();

        if (!authToken) return;

        try {
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
              set({ user: result.user });
            }
          }
        } catch (error) {
          console.error("Failed to refresh user data:", error);
        }
      },

      // ========== THEME ACTIONS ==========
      setTheme: (isDark) => {
        set({
          isDarkMode: isDark,
          themePreference: isDark ? "dark" : "light",
        });

        // Update document class
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      toggleTheme: () => {
        const { isDarkMode } = get();
        const newIsDark = !isDarkMode;

        set({
          isDarkMode: newIsDark,
          themePreference: newIsDark ? "dark" : "light",
        });

        // Update document class
        if (newIsDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      syncThemeWithBackend: async () => {
        const { authToken, themePreference } = get();

        if (!authToken) return;

        try {
          await fetch(`${API_BASE_URL}/api/settings/theme`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ theme: themePreference }),
          });
        } catch (error) {
          console.error("Failed to sync theme:", error);
        }
      },

      // ========== EMAIL VERIFICATION ACTIONS ==========
      setEmailVerificationData: (data) => {
        set({ emailVerificationData: data });
      },

      clearEmailVerificationData: () => {
        set({ emailVerificationData: null });
      },

      // ========== PASSWORD RESET ACTIONS ==========
      setResetPasswordData: (data) => {
        set({ resetPasswordData: data });
      },

      setResetPasswordToken: (data) => {
        set({ resetPasswordToken: data });
      },

      clearResetPasswordData: () => {
        set({
          resetPasswordData: null,
          resetPasswordToken: null,
        });
      },

      // ========== PAYMENT LOG ACTIONS ==========
      addPaymentLog: (logEntry) => {
        set((state) => ({
          paymentLogs: [...state.paymentLogs, logEntry],
        }));
      },

      clearPaymentLogs: () => {
        set({ paymentLogs: [] });
      },

      getPaymentLogs: () => {
        return get().paymentLogs;
      },

      // ========== UTILITY ACTIONS ==========
      clearAllData: () => {
        set({
          user: null,
          authToken: null,
          isAuthenticated: false,
          isLoading: false,
          emailVerificationData: null,
          resetPasswordData: null,
          resetPasswordToken: null,
          pendingVerificationUser: null,
          paymentLogs: [],
        });
      },
    }),
    {
      name: "springfield-storage", // unique name for storage key
      storage: createJSONStorage(() => localStorage), // use localStorage for persistence
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
        isDarkMode: state.isDarkMode,
        themePreference: state.themePreference,
        emailVerificationData: state.emailVerificationData,
        resetPasswordData: state.resetPasswordData,
        resetPasswordToken: state.resetPasswordToken,
        pendingVerificationUser: state.pendingVerificationUser,
        paymentLogs: state.paymentLogs,
      }),
    }
  )
);

export default useStore;
