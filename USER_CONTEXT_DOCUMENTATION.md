# User Context Implementation

## Overview

Implemented a comprehensive authentication system with auto-login functionality similar to WhatsApp, where users stay logged in across sessions.

## Files Created/Modified

### 1. **UserContext.jsx** (`context/UserContext.jsx`)

Main authentication context that manages:

- User state and authentication token
- Auto-login on app load
- Token verification with backend
- Persistent storage in localStorage

**Key Features:**

- `user`: Current user data object
- `authToken`: JWT/Bearer token for API requests
- `isAuthenticated`: Boolean flag for auth status
- `isLoading`: Loading state during auth check
- `login(email, password)`: Login function
- `logout()`: Logout and clear session
- `updateUser(userData)`: Update user data
- `refreshUserData()`: Fetch latest user data from server
- `checkAuthStatus()`: Verify token validity

**API Endpoints Used:**

- `POST /api/login` - User login
- `POST /api/verify-token` - Verify token validity
- `POST /api/logout` - Logout user
- `GET /api/user/profile` - Get user profile data

### 2. **useUser.js** (`context/useUser.js`)

Custom hook for accessing UserContext:

```javascript
const { user, authToken, isAuthenticated, login, logout } = useUser();
```

### 3. **ProtectedRoute.jsx** (`components/ProtectedRoute.jsx`)

Component that wraps protected routes and:

- Shows loading spinner while checking authentication
- Redirects to login if not authenticated
- Preserves the attempted route for redirect after login

### 4. **App.jsx** (Modified)

Updated to include:

- `UserProvider` wrapper around the entire app
- `ProtectedRoute` wrapper for dashboard, visitors, payments, profile
- `AutoRedirect` component for root path that:
  - Redirects to `/dashboard` if authenticated
  - Redirects to `/login` if not authenticated

### 5. **Login.jsx** (Modified)

Updated to use UserContext:

- Uses `useUser()` hook for authentication
- Auto-redirects if already logged in
- Handles login via `userLogin()` from context
- Supports redirect to original route after login

## How It Works

### Auto-Login Flow:

1. **App Loads** → `UserProvider` mounts
2. **Check localStorage** → Look for `authToken` and `userData`
3. **Verify Token** → Call `/api/verify-token` endpoint
4. **If Valid** → Set user as authenticated, redirect to dashboard
5. **If Invalid** → Clear auth data, show login screen

### Login Flow:

1. User enters credentials
2. Call `login(email, password)` from UserContext
3. Backend returns token + user data
4. Store in state + localStorage
5. Redirect to dashboard (or original requested route)

### Logout Flow:

1. User clicks logout button
2. Call `logout()` from UserContext
3. Optional: Notify backend to invalidate token
4. Clear state + localStorage
5. Redirect to login page

### Protected Routes:

- Wrapped with `<ProtectedRoute>` component
- Automatically check authentication
- Redirect to login if not authenticated
- Preserve attempted route for post-login redirect

## Usage Examples

### In Any Component:

```javascript
import { useUser } from "../context/useUser";

function MyComponent() {
  const { user, authToken, isAuthenticated, logout } = useUser();

  return (
    <div>
      <p>Welcome {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls:

```javascript
const { authToken } = useUser();

const response = await fetch("http://localhost:8000/api/some-endpoint", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  },
});
```

### Logout Button:

```javascript
const { logout } = useUser();

<button onClick={logout}>Logout</button>;
```

## Data Stored in localStorage:

- `authToken`: JWT/Bearer token
- `userData`: JSON stringified user object

## Security Notes:

- Token is verified on every app load
- Invalid/expired tokens are automatically cleared
- All protected routes require authentication
- Token is sent in Authorization header for API calls

## Next Steps:

1. Implement actual dashboard page
2. Add logout button to profile/settings
3. Implement token refresh mechanism
4. Add session timeout handling
5. Implement remember me functionality
