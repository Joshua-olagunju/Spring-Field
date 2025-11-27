# 🏪 Zustand Store - Springfield Estate

This directory contains the centralized state management store using Zustand.

## 📁 Files

### `useStore.js`

The main Zustand store that replaces all localStorage usage in the application.

## 🎯 Why Zustand?

Zustand provides:

- ✅ **Automatic Persistence**: State automatically saves to localStorage
- ✅ **Better Performance**: Only re-renders components using specific state
- ✅ **Type Safety**: Structured state management
- ✅ **Simple API**: Easy to use and understand
- ✅ **Small Bundle**: Only 1.2KB gzipped
- ✅ **DevTools**: Built-in debugging support

## 🚀 Quick Start

### Get State in a Component

```jsx
import useStore from "./store/useStore";

function MyComponent() {
  // Select specific state (component only re-renders when THIS changes)
  const user = useStore((state) => state.user);
  const authToken = useStore((state) => state.authToken);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return <div>Welcome, {user?.name}!</div>;
}
```

### Call Actions

```jsx
import useStore from "./store/useStore";

function LoginComponent() {
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      console.log("Logged in!");
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Get Multiple Values

```jsx
import useStore from "./store/useStore";

function DashboardComponent() {
  // Get multiple values at once
  const { user, authToken, isAuthenticated } = useStore((state) => ({
    user: state.user,
    authToken: state.authToken,
    isAuthenticated: state.isAuthenticated,
  }));

  // Or get everything (use sparingly - causes more re-renders)
  const store = useStore();

  return <div>Dashboard Content</div>;
}
```

## 📦 Available State

```javascript
{
  // Authentication
  user: null | {
    id: number,
    email: string,
    name: string,
    role: 'super' | 'landlord' | 'resident' | 'security',
    email_verified_at: string | null,
    // ... other user fields
  },
  authToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,

  // Theme
  isDarkMode: boolean,
  themePreference: 'dark' | 'light',

  // Temporary Auth Flows
  emailVerificationData: {
    email: string,
    user_id: number,
    role: string,
    tempToken: string,
    source: 'login' | 'signup',
  } | null,

  resetPasswordData: {
    email: string,
    otp: string,
  } | null,

  resetPasswordToken: {
    email: string,
    token: string,
  } | null,

  pendingVerificationUser: {
    email: string,
    user_id: number,
    role: string,
    tempToken: string,
  } | null,

  // Payment Logs
  paymentLogs: Array<{
    timestamp: string,
    message: string,
    data: any,
  }>,
}
```

## 🎬 Available Actions

### Authentication Actions

```javascript
// Login (returns { success, data, user, token, needsVerification })
await login(email, password);

// Logout
logout();

// Update user data
setUser(userData);
updateUser(userData);

// Set auth token
setAuthToken(token);

// Set authenticated status
setAuthenticated(boolean);

// Set loading state
setLoading(boolean);

// Complete email verification
completeEmailVerification(userData, authToken);

// Check auth status
checkAuthStatus();

// Refresh user data from API
refreshUserData();
```

### Theme Actions

```javascript
// Set theme (true = dark, false = light)
setTheme(boolean);

// Toggle between dark/light
toggleTheme();

// Sync theme with backend
syncThemeWithBackend();
```

### Email Verification Actions

```javascript
// Set verification data
setEmailVerificationData({
  email,
  user_id,
  role,
  tempToken,
  source,
});

// Clear verification data
clearEmailVerificationData();
```

### Password Reset Actions

```javascript
// Set reset password data
setResetPasswordData({ email, otp });

// Set reset password token
setResetPasswordToken({ email, token });

// Clear all reset password data
clearResetPasswordData();
```

### Payment Log Actions

```javascript
// Add a payment log
addPaymentLog({
  timestamp: new Date().toISOString(),
  message: "Payment initiated",
  data: { amount: 1000 },
});

// Get all payment logs
const logs = getPaymentLogs();

// Clear all payment logs
clearPaymentLogs();
```

### Utility Actions

```javascript
// Clear all data (logout + clear everything)
clearAllData();
```

## 🔧 Advanced Usage

### Subscribing to State Changes

```javascript
import useStore from "./store/useStore";

// Subscribe to specific state changes
const unsubscribe = useStore.subscribe(
  (state) => state.user,
  (user) => {
    console.log("User changed:", user);
  }
);

// Unsubscribe when done
unsubscribe();
```

### Getting State Outside React

```javascript
import useStore from "./store/useStore";

// Get current state
const currentUser = useStore.getState().user;

// Set state
useStore.getState().setUser(newUser);

// Call action
useStore.getState().logout();
```

### Resetting Store (for testing)

```javascript
import useStore from "./store/useStore";

// Clear all data
useStore.getState().clearAllData();

// Or manually reset specific fields
useStore.setState({
  user: null,
  authToken: null,
  isAuthenticated: false,
});
```

## 🎯 Best Practices

### ✅ DO

```jsx
// Select only what you need (better performance)
const user = useStore((state) => state.user);

// Use actions from store
const login = useStore((state) => state.login);

// Destructure multiple values if you need them
const { user, isAuthenticated } = useStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
}));
```

### ❌ DON'T

```jsx
// Don't select entire store (causes unnecessary re-renders)
const store = useStore();

// Don't modify state directly (use actions instead)
useStore.getState().user = newUser; // ❌ Wrong

// Use action instead
useStore.getState().setUser(newUser); // ✅ Correct
```

## 🐛 Debugging

### Check Store State in Console

```javascript
// In browser console
useStore.getState();
```

### Check Persisted Data

```javascript
// Check localStorage
const stored = localStorage.getItem("springfield-storage");
console.log(JSON.parse(stored));
```

### Install Zustand DevTools

```bash
npm install @redux-devtools/extension
```

Then update store:

```javascript
import { devtools } from "zustand/middleware";

const useStore = create(
  devtools(
    persist()
    // ... your store
  )
);
```

## 📚 Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Recipes](https://github.com/pmndrs/zustand/blob/main/docs/recipes.md)
- [Migration Guide](../ZUSTAND_MIGRATION.md)
- [Examples](../ZUSTAND_EXAMPLES.jsx)

## 🆘 Support

See the migration documentation for help:

- `ZUSTAND_MIGRATION.md` - Complete migration guide
- `ZUSTAND_EXAMPLES.jsx` - 10 real-world examples
- `ZUSTAND_IMPLEMENTATION_SUMMARY.md` - Implementation summary
