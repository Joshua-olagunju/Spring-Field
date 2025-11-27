# 🔄 Migration Guide: localStorage → Zustand

## ✅ Completed Migration

### Core Files

- ✅ **Zustand Store Created**: `/src/store/useStore.js`
- ✅ **UserContext**: Now uses Zustand instead of localStorage
- ✅ **ThemeContext**: Now uses Zustand instead of localStorage
- ✅ **Custom Hook**: `/src/hooks/useLocalStorage.js` for backward compatibility

## 🎯 How to Use Zustand in Your Components

### Method 1: Direct Zustand Usage (Recommended)

```jsx
import useStore from "../store/useStore";

function MyComponent() {
  // Get state
  const user = useStore((state) => state.user);
  const authToken = useStore((state) => state.authToken);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  // Get actions
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);
  const setEmailVerificationData = useStore(
    (state) => state.setEmailVerificationData
  );

  // Use them
  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      // Handle success
    }
  };
}
```

### Method 2: Using Custom Hook (Backward Compatible)

```jsx
import { useLocalStorage } from "../hooks/useLocalStorage";

function MyComponent() {
  const storage = useLocalStorage();

  // Get data (replaces localStorage.getItem)
  const authToken = storage.getAuthToken();
  const userData = storage.getUserData();
  const theme = storage.getItem("theme");

  // Set data (replaces localStorage.setItem)
  storage.setAuthToken("new-token");
  storage.setUserData(userObject);
  storage.setItem("theme", "dark");

  // Remove data (replaces localStorage.removeItem)
  storage.removeItem("authToken");

  // Clear all (replaces localStorage.clear)
  storage.clear();
}
```

### Method 3: Through Context (Easiest for existing code)

```jsx
import { useUser } from "../../context/useUser";
import { useTheme } from "../../context/useTheme";

function MyComponent() {
  const { user, authToken, login, logout } = useUser();
  const { isDarkMode, toggleTheme } = useTheme();

  // Use as before - contexts now use Zustand internally
}
```

## 🔄 Common Replacements

### Authentication Data

**Before:**

```jsx
localStorage.getItem("authToken");
localStorage.setItem("authToken", token);
localStorage.removeItem("authToken");
```

**After (Option 1 - Direct):**

```jsx
const authToken = useStore((state) => state.authToken);
const setAuthToken = useStore((state) => state.setAuthToken);
setAuthToken(token);
setAuthToken(null); // to remove
```

**After (Option 2 - Hook):**

```jsx
const storage = useLocalStorage();
storage.getAuthToken();
storage.setAuthToken(token);
storage.removeItem("authToken");
```

### User Data

**Before:**

```jsx
const userData = JSON.parse(localStorage.getItem("userData") || "{}");
localStorage.setItem("userData", JSON.stringify(user));
```

**After:**

```jsx
const user = useStore((state) => state.user);
const setUser = useStore((state) => state.setUser);
setUser(userObject);
```

### Email Verification Data

**Before:**

```jsx
const data = JSON.parse(localStorage.getItem("emailVerificationData"));
localStorage.setItem("emailVerificationData", JSON.stringify(data));
localStorage.removeItem("emailVerificationData");
```

**After:**

```jsx
const emailVerificationData = useStore((state) => state.emailVerificationData);
const setEmailVerificationData = useStore(
  (state) => state.setEmailVerificationData
);
const clearEmailVerificationData = useStore(
  (state) => state.clearEmailVerificationData
);

setEmailVerificationData(data);
clearEmailVerificationData();
```

### Password Reset Data

**Before:**

```jsx
localStorage.getItem("resetPasswordData");
localStorage.setItem("resetPasswordData", JSON.stringify(data));
localStorage.removeItem("resetPasswordData");
```

**After:**

```jsx
const resetPasswordData = useStore((state) => state.resetPasswordData);
const setResetPasswordData = useStore((state) => state.setResetPasswordData);
const clearResetPasswordData = useStore(
  (state) => state.clearResetPasswordData
);
```

### Theme

**Before:**

```jsx
localStorage.getItem("theme");
localStorage.setItem("theme", "dark");
```

**After:**

```jsx
const isDarkMode = useStore((state) => state.isDarkMode);
const setTheme = useStore((state) => state.setTheme);
setTheme(true); // for dark mode
```

### Payment Logs

**Before:**

```jsx
const logs = JSON.parse(localStorage.getItem("payment_logs") || "[]");
const newLogs = [...logs, newLog];
localStorage.setItem("payment_logs", JSON.stringify(newLogs));
```

**After:**

```jsx
const addPaymentLog = useStore((state) => state.addPaymentLog);
const getPaymentLogs = useStore((state) => state.getPaymentLogs);
const clearPaymentLogs = useStore((state) => state.clearPaymentLogs);

addPaymentLog(newLog);
const logs = getPaymentLogs();
```

## 📦 Available Zustand Store State

```javascript
{
  // Auth
  user: null | UserObject,
  authToken: null | string,
  isAuthenticated: boolean,
  isLoading: boolean,

  // Theme
  isDarkMode: boolean,
  themePreference: 'dark' | 'light',

  // Temporary Flows
  emailVerificationData: null | Object,
  resetPasswordData: null | Object,
  resetPasswordToken: null | Object,
  pendingVerificationUser: null | Object,

  // Logs
  paymentLogs: Array,
}
```

## 📦 Available Zustand Store Actions

```javascript
{
  // Auth Actions
  login(email, password),
  logout(),
  setUser(user),
  setAuthToken(token),
  setAuthenticated(boolean),
  setLoading(boolean),
  updateUser(userData),
  completeEmailVerification(userData, authToken),
  checkAuthStatus(),
  refreshUserData(),

  // Theme Actions
  setTheme(isDark),
  toggleTheme(),
  syncThemeWithBackend(),

  // Email Verification
  setEmailVerificationData(data),
  clearEmailVerificationData(),

  // Password Reset
  setResetPasswordData(data),
  setResetPasswordToken(data),
  clearResetPasswordData(),

  // Payment Logs
  addPaymentLog(log),
  clearPaymentLogs(),
  getPaymentLogs(),

  // Utility
  clearAllData(),
}
```

## 🎯 Files That Still Need Manual Update

### Authentication Screens (Priority: High)

- [ ] `/src/screens/authenticationScreens/Login.jsx`
- [ ] `/src/screens/authenticationScreens/Signup.jsx`
- [ ] `/src/screens/authenticationScreens/EmailVerificationOtp.jsx`
- [ ] `/src/screens/authenticationScreens/ResetPasswordOtp.jsx`
- [ ] `/src/screens/authenticationScreens/ResetPassword.jsx`

### Security Screens (Priority: Medium)

- [ ] `/src/screens/SecurityDashboardScreens/ReportScreen/TokenVerificationModal.jsx`
- [ ] `/src/screens/SecurityDashboardScreens/ReportScreen/ReportScreen.jsx`
- [ ] `/src/screens/SecurityDashboardScreens/ReportScreen/TokenDetailModal.jsx`
- [ ] `/src/screens/SecurityDashboardScreens/ReportScreen/ActiveTokensModal.jsx`

### Admin Screens (Priority: Medium)

- [ ] `/src/screens/SuperAdminDashboardScreens/AdminUsersScreen/AdminUsersActions.jsx`
- [ ] `/src/screens/SuperAdminDashboardScreens/AdminUsersScreen/SecurityActions.jsx`

### General Screens (Priority: Low)

- [ ] `/src/screens/GeneralScreens/PaymentScreen/PaymentScreen.jsx`
- [ ] `/src/screens/GeneralScreens/SettingsScreen/ProfileModal.jsx`
- [ ] `/src/screens/GeneralScreens/SettingsScreen/ChangePasswordModal.jsx`

## ✨ Benefits of Migration

1. **No More localStorage Bugs**: State persists automatically via Zustand's persist middleware
2. **Type Safety**: Centralized state with clear structure
3. **Better Performance**: Only re-renders components using specific state slices
4. **Easier Testing**: Can easily mock the store
5. **Devtools**: Zustand has excellent devtools for debugging
6. **Automatic Persistence**: No need to manually sync with localStorage
7. **Cross-tab Sync**: State automatically syncs across browser tabs

## 🚨 Important Notes

1. **Backward Compatibility**: The `useLocalStorage` hook provides backward-compatible API
2. **Automatic Persistence**: Zustand automatically persists state to localStorage
3. **No Breaking Changes**: Existing components using `useUser()` and `useTheme()` work without changes
4. **Gradual Migration**: You can migrate file by file - both methods work simultaneously

## 🔧 Quick Search & Replace Patterns

For quick migration, you can search and replace:

**Pattern 1:**

```
Find: localStorage.getItem\(['"]authToken['"]\)
Replace: useStore.getState().authToken
```

**Pattern 2:**

```
Find: localStorage.getItem\(['"]userData['"]\)
Replace: useStore.getState().user
```

**Pattern 3:**

```
Find: localStorage.setItem\(['"]authToken['"],\s*(.+?)\)
Replace: useStore.setState({ authToken: $1 })
```

## 📞 Need Help?

All the core functionality is already migrated. Components using `useUser()` and `useTheme()` contexts already benefit from Zustand without any changes needed!
