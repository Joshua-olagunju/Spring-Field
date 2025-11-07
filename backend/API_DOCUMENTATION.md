# 🔗 Springfield Estate API Documentation
**Complete API Reference for React Frontend Integration**

## 📋 **Base Configuration**
```javascript
// API Base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api'

// Headers for authenticated requests
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json'
})
```

---

## 🏥 **Health Check**

### **Check API Health**
```javascript
GET /api/health

// Usage
const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`)
  return await response.json()
}

// Response
{
  "status": "OK",
  "message": "Springfield Estate API is running",
  "timestamp": "2025-11-07T15:30:00.000000Z",
  "version": "1.0.0-MVP"
}
```

---

## 🔐 **Authentication Routes**

### **1. Verify Registration Code**
```javascript
POST /api/auth/verify-code

// Request Body
{
  "registration_code": "ABC123XYZ789"
}

// Usage
const verifyRegistrationCode = async (code) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registration_code: code })
  })
  return await response.json()
}

// Success Response (200)
{
  "success": true,
  "message": "Registration code verified successfully",
  "data": {
    "house_info": {
      "id": 1,
      "house_number": "A101",
      "address": "123 Springfield Estate, Lagos",
      "landlord_name": "John Landlord"
    },
    "code_id": 5
  }
}

// Error Response (401)
{
  "success": false,
  "message": "Invalid, expired, or already used registration code"
}
```

### **2. Complete Registration**
```javascript
POST /api/auth/register

// Request Body
{
  "code_id": 5,
  "full_name": "Jane Resident",
  "phone": "08123456789",
  "email": "jane@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "resident"
}

// Usage
const completeRegistration = async (registrationData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationData)
  })
  return await response.json()
}

// Success Response (201)
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "user": {
      "id": 15,
      "full_name": "Jane Resident",
      "phone": "08123456789",
      "email": "jane@example.com",
      "role": "resident",
      "status_active": true,
      "house": {
        "id": 1,
        "house_number": "A101",
        "address": "123 Springfield Estate, Lagos"
      }
    },
    "token": "1|abc123def456ghi789..."
  }
}
```

### **3. User Login**
```javascript
POST /api/auth/login

// Request Body
{
  "phone": "08123456789",
  "password": "password123"
}

// Usage
const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  return await response.json()
}

// Success Response (200)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 15,
      "full_name": "Jane Resident",
      "phone": "08123456789",
      "email": "jane@example.com",
      "role": "resident",
      "status_active": true,
      "house": {
        "id": 1,
        "house_number": "A101",
        "address": "123 Springfield Estate, Lagos"
      }
    },
    "token": "1|abc123def456ghi789..."
  }
}
```

### **4. Get Current User Profile**
```javascript
GET /api/user

// Usage
const getCurrentUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/user`, {
    headers: getAuthHeaders(token)
  })
  return await response.json()
}

// Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": 15,
      "full_name": "Jane Resident",
      "phone": "08123456789",
      "email": "jane@example.com",
      "role": "resident",
      "status_active": true,
      "created_at": "2025-11-07T10:30:00.000000Z",
      "house": {
        "id": 1,
        "house_number": "A101",
        "address": "123 Springfield Estate, Lagos",
        "landlord": {
          "id": 2,
          "full_name": "John Landlord",
          "phone": "08098765432"
        }
      }
    }
  }
}
```

### **5. Update User Profile**
```javascript
PUT /api/user/profile

// Request Body
{
  "full_name": "Jane Updated Resident",
  "email": "jane.updated@example.com"
}

// Usage
const updateProfile = async (token, profileData) => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(profileData)
  })
  return await response.json()
}

// Response (200)
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 15,
      "full_name": "Jane Updated Resident",
      "phone": "08123456789",
      "email": "jane.updated@example.com",
      "role": "resident",
      "status_active": true
    }
  }
}
```

### **6. Logout**
```javascript
POST /api/auth/logout

// Usage
const logout = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(token)
  })
  return await response.json()
}

// Response (200)
{
  "success": true,
  "message": "Logged out successfully"
}
```

### **7. Logout from All Devices**
```javascript
POST /api/auth/logout-all

// Usage
const logoutAll = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/logout-all`, {
    method: 'POST',
    headers: getAuthHeaders(token)
  })
  return await response.json()
}

// Response (200)
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

## 👥 **User Management Routes**
*Access: Super Admin, Landlord (limited), Users (own profile)*

### **1. List Users**
```javascript
GET /api/users?page=1&per_page=15&role=resident&status=active&search=jane

// Query Parameters
- page: Page number (default: 1)
- per_page: Items per page (default: 15)
- role: Filter by role (super, landlord, resident, security)
- status: Filter by status (active, inactive)
- search: Search in name, phone, email

// Usage
const getUsers = async (token, filters = {}) => {
  const queryParams = new URLSearchParams(filters)
  const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
    headers: getAuthHeaders(token)
  })
  return await response.json()
}

// Response (200)
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 15,
        "full_name": "Jane Resident",
        "phone": "08123456789",
        "email": "jane@example.com",
        "role": "resident",
        "status_active": true,
        "created_at": "2025-11-07T10:30:00.000000Z",
        "house": {
          "id": 1,
          "house_number": "A101",
          "address": "123 Springfield Estate, Lagos",
          "landlord": {
            "full_name": "John Landlord",
            "phone": "08098765432"
          }
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 3,
      "per_page": 15,
      "total": 45
    }
  }
}
```

### **2. Create User** 
```javascript
POST /api/users

// Request Body
{
  "full_name": "New User",
  "phone": "08111111111",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "resident",
  "house_id": 1,
  "status_active": true
}

// Usage (Super Admin only)
const createUser = async (token, userData) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(userData)
  })
  return await response.json()
}
```

### **3. Get User Details**
```javascript
GET /api/users/{id}

// Usage
const getUserDetails = async (token, userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: getAuthHeaders(token)
  })
  return await response.json()
}

// Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": 15,
      "full_name": "Jane Resident",
      "phone": "08123456789",
      "email": "jane@example.com",
      "role": "resident",
      "status_active": true,
      "created_at": "2025-11-07T10:30:00.000000Z",
      "house": {
        "id": 1,
        "house_number": "A101",
        "address": "123 Springfield Estate, Lagos",
        "landlord": {
          "full_name": "John Landlord",
          "phone": "08098765432"
        }
      },
      "recent_payments": [
        {
          "id": 10,
          "amount": "50000.00",
          "status": "paid",
          "period_type": "monthly",
          "created_at": "2025-11-01T00:00:00.000000Z"
        }
      ]
    }
  }
}
```

### **4. Update User**
```javascript
PUT /api/users/{id}

// Request Body
{
  "full_name": "Updated Name",
  "email": "updated@example.com",
  "status_active": false
}

// Usage
const updateUser = async (token, userId, userData) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(userData)
  })
  return await response.json()
}
```

### **5. Toggle User Status**
```javascript
PUT /api/users/{id}/status

// Usage
const toggleUserStatus = async (token, userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(token)
  })
  return await response.json()
}

// Response (200)
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "user": {
      "id": 15,
      "full_name": "Jane Resident",
      "status_active": false
    }
  }
}
```

### **6. Delete User**
```javascript
DELETE /api/users/{id}

// Usage (Super Admin only)
const deleteUser = async (token, userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token)
  })
  return await response.json()
}

// Response (200)
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 🎯 **React Integration Examples**

### **1. Authentication Hook**
```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('auth_token'))
  const [loading, setLoading] = useState(false)

  const login = async (credentials) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setToken(data.data.token)
        setUser(data.data.user)
        localStorage.setItem('auth_token', data.data.token)
        return { success: true, data: data.data }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: 'Network error' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(token)
      })
    }
    
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
  }

  return { user, token, login, logout, loading }
}
```

### **2. API Service Class**
```javascript
// services/apiService.js
class ApiService {
  constructor() {
    this.baseURL = 'http://127.0.0.1:8000/api'
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getHeaders(),
      ...options
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return data
    } catch (error) {
      throw error
    }
  }

  // Authentication
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  async getCurrentUser() {
    return this.request('/user')
  }

  // Users
  async getUsers(filters = {}) {
    const queryParams = new URLSearchParams(filters)
    return this.request(`/users?${queryParams}`)
  }

  async getUserDetails(id) {
    return this.request(`/users/${id}`)
  }

  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
}

export default new ApiService()
```

---

## 🚨 **Error Handling**

### **Common Error Responses**
```javascript
// Validation Error (422)
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "phone": ["The phone field is required."],
    "email": ["The email must be a valid email address."]
  }
}

// Authentication Error (401)
{
  "success": false,
  "message": "Authentication required"
}

// Authorization Error (403)
{
  "success": false,
  "message": "You do not have permission to access this resource",
  "error_code": "INSUFFICIENT_ROLE",
  "required_roles": ["super", "landlord"],
  "user_role": "resident"
}

// Not Found Error (404)
{
  "success": false,
  "message": "User not found"
}

// Server Error (500)
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📱 **Role-Based Access Control**

### **Role Permissions Matrix**
```javascript
const ROLE_PERMISSIONS = {
  super: ['*'], // All permissions
  landlord: [
    'users.view.own_residents',
    'users.create.residents', 
    'users.update.own_residents',
    'houses.manage.own',
    'registration_codes.generate'
  ],
  resident: [
    'users.view.own',
    'users.update.own',
    'visitor_tokens.create',
    'payments.view.own'
  ],
  security: [
    'visitor_tokens.verify',
    'visitor_entries.manage',
    'users.view.own'
  ]
}

// Usage in React
const hasPermission = (userRole, permission) => {
  const rolePerms = ROLE_PERMISSIONS[userRole] || []
  return rolePerms.includes('*') || rolePerms.includes(permission)
}
```

---

## 📌 **Quick Reference - All Available Endpoints**

### **Authentication & Profile**
- `GET /api/health` - Health check
- `POST /api/auth/verify-code` - Verify registration code
- `POST /api/auth/register` - Complete registration
- `POST /api/auth/login` - User login
- `GET /api/user` - Get current user
- `PUT /api/user/profile` - Update profile
- `POST /api/auth/logout` - Logout
- `POST /api/auth/logout-all` - Logout all devices

### **User Management**
- `GET /api/users` - List users (paginated)
- `POST /api/users` - Create user (Super Admin)
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `PUT /api/users/{id}/status` - Toggle user status
- `DELETE /api/users/{id}` - Delete user (Super Admin)

---

**🔥 This is your complete API documentation for the React frontend!** 

The APIs are fully functional and ready for integration. Would you like me to continue building the remaining controllers (Houses, Registration Codes, Visitor Management, Payments) or would you prefer to test these endpoints first?