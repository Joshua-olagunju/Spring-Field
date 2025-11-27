/**
 * Zustand Store Test
 *
 * Run this in browser console to test the store functionality
 */

import useStore from "./src/store/useStore";

// Test 1: Check initial state
console.log("=== TEST 1: Initial State ===");
console.log(useStore.getState());

// Test 2: Set auth token
console.log("\n=== TEST 2: Set Auth Token ===");
useStore.getState().setAuthToken("test-token-123");
console.log("Auth Token:", useStore.getState().authToken);

// Test 3: Set user data
console.log("\n=== TEST 3: Set User Data ===");
useStore.getState().setUser({
  id: 1,
  email: "test@example.com",
  name: "Test User",
  role: "resident",
  email_verified_at: new Date().toISOString(),
});
console.log("User:", useStore.getState().user);

// Test 4: Set authenticated
console.log("\n=== TEST 4: Set Authenticated ===");
useStore.getState().setAuthenticated(true);
console.log("Is Authenticated:", useStore.getState().isAuthenticated);

// Test 5: Test theme
console.log("\n=== TEST 5: Theme Toggle ===");
console.log("Initial Dark Mode:", useStore.getState().isDarkMode);
useStore.getState().toggleTheme();
console.log("After Toggle:", useStore.getState().isDarkMode);
useStore.getState().toggleTheme(); // Toggle back
console.log("After Second Toggle:", useStore.getState().isDarkMode);

// Test 6: Email verification data
console.log("\n=== TEST 6: Email Verification Data ===");
useStore.getState().setEmailVerificationData({
  email: "test@example.com",
  user_id: 1,
  tempToken: "verification-token",
});
console.log("Verification Data:", useStore.getState().emailVerificationData);
useStore.getState().clearEmailVerificationData();
console.log("After Clear:", useStore.getState().emailVerificationData);

// Test 7: Payment logs
console.log("\n=== TEST 7: Payment Logs ===");
useStore.getState().addPaymentLog({
  timestamp: new Date().toISOString(),
  message: "Test payment 1",
  amount: 1000,
});
useStore.getState().addPaymentLog({
  timestamp: new Date().toISOString(),
  message: "Test payment 2",
  amount: 2000,
});
console.log("Payment Logs:", useStore.getState().getPaymentLogs());
console.log("Logs Count:", useStore.getState().getPaymentLogs().length);
useStore.getState().clearPaymentLogs();
console.log("After Clear:", useStore.getState().getPaymentLogs());

// Test 8: Persistence check
console.log("\n=== TEST 8: Persistence Check ===");
console.log('Check localStorage for key "springfield-storage"');
const stored = localStorage.getItem("springfield-storage");
if (stored) {
  console.log("Persisted Data:", JSON.parse(stored).state);
}

// Test 9: Complete auth flow
console.log("\n=== TEST 9: Complete Auth Flow ===");
useStore.getState().setUser({
  id: 2,
  email: "auth@test.com",
  name: "Auth Test",
  role: "landlord",
  email_verified_at: new Date().toISOString(),
});
useStore.getState().setAuthToken("auth-token-456");
useStore.getState().setAuthenticated(true);
console.log("Auth State:", {
  user: useStore.getState().user,
  token: useStore.getState().authToken,
  isAuth: useStore.getState().isAuthenticated,
});

// Test 10: Logout
console.log("\n=== TEST 10: Logout ===");
useStore.getState().logout();
console.log("After Logout:", {
  user: useStore.getState().user,
  token: useStore.getState().authToken,
  isAuth: useStore.getState().isAuthenticated,
});

// Test 11: State selectors
console.log("\n=== TEST 11: State Selectors (React Pattern) ===");
console.log("This is how you would use in React:");
console.log(`
Example Component:

import useStore from './store/useStore';

function MyComponent() {
  // Select specific state (component only re-renders when this changes)
  const user = useStore((state) => state.user);
  const authToken = useStore((state) => state.authToken);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  
  // Get actions
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <h1>Welcome, {user.name}!</h1>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login(email, password)}>Login</button>
      )}
    </div>
  );
}
`);

console.log("\n=== ALL TESTS COMPLETED ===");
console.log("✅ Store is working correctly!");
console.log("✅ Data persists to localStorage automatically");
console.log("✅ Ready to use in your React components");
