# 🎨 Springfield Estate Frontend - React Integration Guide

**Complete frontend architecture for Springfield Estate management system with Laravel API integration**

## 🛠️ Technology Stack

- **Framework**: React 19.1.1 with Vite 7.1.7
- **Styling**: TailwindCSS 4.1.16
- **State Management**: React Context + Hooks
- **HTTP Client**: Fetch API
- **Authentication**: JWT tokens (Laravel Sanctum)
- **UI Components**: Custom components with Tailwind
- **Icons**: Heroicons or Lucide React

---

## 📱 **Frontend Architecture & Page Structure**

### 🏗️ **Application Structure**
```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── common/          # Common UI elements (Button, Modal, etc.)
│   └── forms/           # Form components
├── pages/               # Main application pages
│   ├── auth/            # Login, Register pages
│   ├── dashboard/       # Role-based dashboards
│   ├── houses/          # House management pages
│   ├── users/           # User management pages
│   ├── visitors/        # Visitor management pages
│   ├── payments/        # Payment pages
│   └── admin/           # Admin-only pages
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── context/             # React Context providers
├── utils/               # Utility functions
└── constants/           # App constants and configs
```

---

## 🔐 **Authentication Flow & Pages**

### **1. Login Page** (`/login`)
**Purpose**: User authentication entry point
**API Integration**: `POST /api/auth/login`

```jsx
// pages/auth/Login.jsx
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { AuthService } from '../../services/authService'

const Login = () => {
  const [credentials, setCredentials] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await AuthService.login(credentials)
      if (response.success) {
        login(response.data.user, response.data.token)
        // Redirect based on user role
        redirectToDashboard(response.data.user.role)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <input 
            type="tel"
            placeholder="Phone Number"
            value={credentials.phone}
            onChange={(e) => setCredentials({...credentials, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input 
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

### **2. Registration Page** (`/register`)
**Purpose**: New user registration with invite codes
**API Integration**: `POST /api/auth/verify-code`, `POST /api/auth/register`

```jsx
// pages/auth/Register.jsx
const Register = () => {
  const [step, setStep] = useState(1) // 1: Code verification, 2: User details
  const [codeData, setCodeData] = useState(null)
  const [registrationCode, setRegistrationCode] = useState('')
  const [userDetails, setUserDetails] = useState({
    full_name: '', phone: '', email: '', password: '', password_confirmation: ''
  })

  const verifyCode = async () => {
    const response = await AuthService.verifyRegistrationCode(registrationCode)
    if (response.success) {
      setCodeData(response.data)
      setStep(2)
    }
  }

  const completeRegistration = async () => {
    const registrationData = {
      code_id: codeData.code_id,
      ...userDetails,
      role: codeData.role
    }
    const response = await AuthService.completeRegistration(registrationData)
    // Handle success/error
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {step === 1 && (
        <div className="max-w-md w-full space-y-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Enter Registration Code
          </h2>
          <input 
            type="text"
            placeholder="Enter your registration code"
            value={registrationCode}
            onChange={(e) => setRegistrationCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button onClick={verifyCode} className="w-full bg-blue-600 text-white py-2 rounded-md">
            Verify Code
          </button>
        </div>
      )}
      
      {step === 2 && (
        <div className="max-w-md w-full space-y-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Complete Registration
          </h2>
          <div className="bg-green-100 p-4 rounded-md mb-4">
            <p>House: {codeData.house_info.house_number}</p>
            <p>Address: {codeData.house_info.address}</p>
          </div>
          
          {/* User details form */}
          <form onSubmit={completeRegistration}>
            <input 
              type="text"
              placeholder="Full Name"
              value={userDetails.full_name}
              onChange={(e) => setUserDetails({...userDetails, full_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            {/* Other form fields */}
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md">
              Complete Registration
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
```

---

## 🏠 **Dashboard Pages by Role**

### **Super Admin Dashboard** (`/admin/dashboard`)
**APIs Used**: `GET /api/users`, `GET /api/houses`, `GET /api/registration-codes/statistics`, `GET /api/logs`

```jsx
// pages/dashboard/SuperAdminDashboard.jsx
const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalHouses: 0, totalPayments: 0, recentActivity: []
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      const [users, houses, codes, logs] = await Promise.all([
        UserService.getUsers(),
        HouseService.getHouses(),
        RegistrationCodeService.getStatistics(),
        LogService.getRecentLogs()
      ])
      // Process and set stats
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          {/* More stat cards */}
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {stats.recentActivity.map((activity, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.created_at}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700">
            <h3 className="text-lg font-semibold mb-2">Create Landlord</h3>
            <p className="text-sm">Add new landlord account</p>
          </button>
          <button className="bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700">
            <h3 className="text-lg font-semibold mb-2">View Reports</h3>
            <p className="text-sm">Generate system reports</p>
          </button>
          <button className="bg-purple-600 text-white p-6 rounded-lg text-center hover:bg-purple-700">
            <h3 className="text-lg font-semibold mb-2">System Logs</h3>
            <p className="text-sm">View audit trail</p>
          </button>
        </div>
      </div>
    </div>
  )
}
```

### **Landlord Dashboard** (`/landlord/dashboard`)
**APIs Used**: `GET /api/houses` (filtered), `GET /api/users` (residents), `GET /api/registration-codes`

```jsx
// pages/dashboard/LandlordDashboard.jsx
const LandlordDashboard = () => {
  const [myHouses, setMyHouses] = useState([])
  const [residents, setResidents] = useState([])
  const [registrationCodes, setRegistrationCodes] = useState([])

  useEffect(() => {
    const fetchLandlordData = async () => {
      // These APIs automatically filter by landlord_id based on auth token
      const housesResponse = await HouseService.getHouses()
      const residentsResponse = await UserService.getUsers({ role: 'resident' })
      const codesResponse = await RegistrationCodeService.getCodes()
      
      setMyHouses(housesResponse.data.houses)
      setResidents(residentsResponse.data.users)
      setRegistrationCodes(codesResponse.data.codes)
    }
    fetchLandlordData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Landlord Dashboard</h1>
        
        {/* My Houses */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              My Houses ({myHouses.length})
            </h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
              Add House
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {myHouses.map(house => (
              <div key={house.id} className="border rounded-lg p-4">
                <h4 className="font-semibold">{house.house_number}</h4>
                <p className="text-gray-600 text-sm">{house.address}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {house.active_residents_count} residents
                  </span>
                  <span className="text-sm font-medium">₦{house.rent_amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Registration Codes */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Registration Codes
            </h3>
          </div>
          <div className="p-6">
            <button 
              onClick={() => generateRegistrationCode()}
              className="bg-green-600 text-white px-6 py-3 rounded-md"
            >
              Generate New Registration Code
            </button>
            
            {/* Recent Codes */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Recent Codes</h4>
              {registrationCodes.slice(0, 5).map(code => (
                <div key={code.id} className="flex justify-between items-center py-2 border-b">
                  <span className="font-mono text-sm">{code.code}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    code.status === 'active' ? 'bg-green-100 text-green-800' : 
                    code.status === 'used' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {code.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### **Resident Dashboard** (`/resident/dashboard`)
**APIs Used**: `GET /api/user`, `GET /api/visitor-tokens`, `GET /api/payments/history`

```jsx
// pages/dashboard/ResidentDashboard.jsx
const ResidentDashboard = () => {
  const [user, setUser] = useState(null)
  const [visitorTokens, setVisitorTokens] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  const [showTokenModal, setShowTokenModal] = useState(false)

  useEffect(() => {
    const fetchResidentData = async () => {
      const userResponse = await AuthService.getCurrentUser()
      const tokensResponse = await VisitorTokenService.getTokens()
      const paymentsResponse = await PaymentService.getHistory()
      
      setUser(userResponse.data.user)
      setVisitorTokens(tokensResponse.data.tokens)
      setPaymentHistory(paymentsResponse.data.payments)
    }
    fetchResidentData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome, {user?.full_name}
        </h1>
        
        {/* House Info */}
        {user?.house && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your House Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">House Number</p>
                  <p className="text-lg font-semibold">{user.house.house_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-lg">{user.house.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Landlord</p>
                  <p className="text-lg">{user.house.landlord.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p className="text-lg">{user.house.landlord.phone}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button 
            onClick={() => setShowTokenModal(true)}
            className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700"
          >
            <h3 className="text-lg font-semibold mb-2">Generate Visitor Token</h3>
            <p className="text-sm">Create access token for your visitors</p>
          </button>
          <button 
            onClick={() => initiatePayment()}
            className="bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700"
          >
            <h3 className="text-lg font-semibold mb-2">Pay Security Levy</h3>
            <p className="text-sm">Make monthly security payment</p>
          </button>
        </div>

        {/* Active Visitor Tokens */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Active Visitor Tokens
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {visitorTokens.filter(token => token.is_active).map(token => (
              <li key={token.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {token.issued_for_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {token.issued_for_phone} • {token.visit_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-gray-900">{token.display_token}</p>
                    <p className="text-sm text-gray-500">
                      Expires: {new Date(token.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment History */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Payment History
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {paymentHistory.slice(0, 5).map(payment => (
              <li key={payment.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Security Levy - {payment.period_type}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ₦{Number(payment.amount).toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Visitor Token Modal */}
      {showTokenModal && (
        <VisitorTokenModal 
          isOpen={showTokenModal} 
          onClose={() => setShowTokenModal(false)}
          onTokenGenerated={handleTokenGenerated}
        />
      )}
    </div>
  )
}
```

### **Security Guard Dashboard** (`/security/dashboard`)
**APIs Used**: `POST /api/visitor-tokens/verify`, `GET /api/visitor-entries/active`, `POST /api/visitor-entries`

```jsx
// pages/dashboard/SecurityDashboard.jsx
const SecurityDashboard = () => {
  const [scanResult, setScanResult] = useState(null)
  const [activeVisitors, setActiveVisitors] = useState([])
  const [tokenInput, setTokenInput] = useState('')
  const [verifying, setVerifying] = useState(false)

  const verifyToken = async () => {
    setVerifying(true)
    try {
      const response = await VisitorTokenService.verifyToken(tokenInput)
      if (response.success) {
        setScanResult(response.data)
        // Show verification result
      }
    } catch (error) {
      // Handle error
    } finally {
      setVerifying(false)
    }
  }

  const admitVisitor = async (tokenId, visitorDetails) => {
    try {
      const response = await VisitorEntryService.logEntry({
        token_id: tokenId,
        visitor_name: visitorDetails.name,
        visitor_phone: visitorDetails.phone,
        entered_at: new Date().toISOString()
      })
      
      if (response.success) {
        // Refresh active visitors list
        fetchActiveVisitors()
        setScanResult(null)
        setTokenInput('')
      }
    } catch (error) {
      // Handle error
    }
  }

  const logExit = async (entryId) => {
    try {
      await VisitorEntryService.logExit(entryId)
      fetchActiveVisitors()
    } catch (error) {
      // Handle error
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Security Gate</h1>
        
        {/* Token Verification */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Verify Visitor Token
            </h3>
          </div>
          <div className="p-6">
            <div className="flex space-x-4">
              <input 
                type="text"
                placeholder="Enter visitor token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-lg font-mono"
              />
              <button 
                onClick={verifyToken}
                disabled={verifying || !tokenInput}
                className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            
            {/* Verification Result */}
            {scanResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="text-lg font-semibold text-green-800 mb-2">
                  Token Valid ✓
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Visitor: {scanResult.visitor_name}</p>
                    <p>Phone: {scanResult.visitor_phone}</p>
                    <p>Visit Type: {scanResult.visit_type}</p>
                  </div>
                  <div>
                    <p className="font-medium">Visiting: {scanResult.resident.full_name}</p>
                    <p>House: {scanResult.house.house_number}</p>
                    <p>Address: {scanResult.house.address}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <button 
                    onClick={() => admitVisitor(scanResult.token_id, scanResult)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                  >
                    Admit Visitor
                  </button>
                  <button 
                    onClick={() => setScanResult(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Visitors */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Visitors Currently Inside ({activeVisitors.length})
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {activeVisitors.map(visitor => (
              <li key={visitor.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {visitor.visitor_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {visitor.visitor_phone} • Visiting {visitor.resident.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      House {visitor.house.house_number} • Entered: {new Date(visitor.entered_at).toLocaleString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => logExit(visitor.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Log Exit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
```

---

## 🏠 **Management Pages**

### **House Management** (`/admin/houses`, `/landlord/houses`)
**APIs Used**: `GET /api/houses`, `POST /api/houses`, `PUT /api/houses/{id}`, `DELETE /api/houses/{id}`

### **User Management** (`/admin/users`)
**APIs Used**: `GET /api/users`, `POST /api/users`, `PUT /api/users/{id}`, `PUT /api/users/{id}/status`

### **Registration Code Management** (`/admin/codes`, `/landlord/codes`)
**APIs Used**: `GET /api/registration-codes`, `POST /api/registration-codes/generate`, `PUT /api/registration-codes/{id}/deactivate`

---

## 💳 **Payment Integration Pages**

### **Payment Selection** (`/payment/select`)
**Purpose**: Choose payment plan and amount
**API Integration**: `POST /api/payments/create`

### **Payment Processing** (`/payment/process`)
**Purpose**: Flutterwave checkout integration
**API Integration**: Flutterwave redirect → `POST /api/flutterwave/webhook`

### **Payment History** (`/payment/history`)
**APIs Used**: `GET /api/payments/history`

---

## 🎫 **Visitor Management Pages**

### **Generate Visitor Token** (`/visitor/generate`)
**APIs Used**: `POST /api/visitor-tokens`

### **Token Verification** (`/security/verify`)
**APIs Used**: `POST /api/visitor-tokens/verify`

### **Visitor Entries** (`/security/entries`)
**APIs Used**: `GET /api/visitor-entries`, `POST /api/visitor-entries`, `PUT /api/visitor-entries/{id}/exit`

---

## 🔧 **React Services Setup**

### **API Service Configuration**
```jsx
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

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      ...options
    }

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body)
    }

    const response = await fetch(url, config)
    
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
      return
    }

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed')
    }

    return data
  }
}

export default new ApiService()
```

### **Authentication Service**
```jsx
// services/authService.js
import ApiService from './apiService'

export const AuthService = {
  async verifyRegistrationCode(code) {
    return ApiService.request('/auth/verify-code', {
      method: 'POST',
      body: { registration_code: code }
    })
  },

  async completeRegistration(data) {
    return ApiService.request('/auth/register', {
      method: 'POST',
      body: data
    })
  },

  async login(credentials) {
    return ApiService.request('/auth/login', {
      method: 'POST',
      body: credentials
    })
  },

  async getCurrentUser() {
    return ApiService.request('/user')
  },

  async updateProfile(data) {
    return ApiService.request('/user/profile', {
      method: 'PUT',
      body: data
    })
  },

  async logout() {
    return ApiService.request('/auth/logout', { method: 'POST' })
  }
}
```

### **House Service**
```jsx
// services/houseService.js
export const HouseService = {
  async getHouses(filters = {}) {
    const params = new URLSearchParams(filters)
    return ApiService.request(`/houses?${params}`)
  },

  async createHouse(houseData) {
    return ApiService.request('/houses', {
      method: 'POST',
      body: houseData
    })
  },

  async updateHouse(id, data) {
    return ApiService.request(`/houses/${id}`, {
      method: 'PUT',
      body: data
    })
  },

  async deleteHouse(id) {
    return ApiService.request(`/houses/${id}`, {
      method: 'DELETE'
    })
  },

  async getAvailableHouses() {
    return ApiService.request('/houses/available/list')
  }
}
```

### **Visitor Token Service**
```jsx
// services/visitorTokenService.js
export const VisitorTokenService = {
  async generateToken(tokenData) {
    return ApiService.request('/visitor-tokens', {
      method: 'POST',
      body: tokenData
    })
  },

  async verifyToken(token) {
    return ApiService.request('/visitor-tokens/verify', {
      method: 'POST',
      body: { token }
    })
  },

  async getTokens() {
    return ApiService.request('/visitor-tokens')
  },

  async revokeToken(id) {
    return ApiService.request(`/visitor-tokens/${id}/revoke`, {
      method: 'PUT'
    })
  }
}
```

---

## 🚀 **Development Setup**

### **1. Environment Setup**
```bash
# Install dependencies
npm install

# Add additional packages
npm install react-router-dom @heroicons/react lucide-react

# Create environment file
echo "VITE_API_BASE_URL=http://127.0.0.1:8000/api" > .env
echo "VITE_APP_NAME=Springfield Estate" >> .env
```

### **2. Project Structure Setup**
```bash
# Create folder structure
mkdir -p src/{components/{auth,layout,common,forms},pages/{auth,dashboard,houses,users,visitors,payments,admin},hooks,services,context,utils,constants}

# Create initial files
touch src/services/{apiService.js,authService.js,houseService.js,visitorTokenService.js}
touch src/hooks/{useAuth.js,useApi.js}
touch src/context/{AuthContext.jsx,AppContext.jsx}
```

### **3. Router Setup**
```jsx
// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Import pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard'
import LandlordDashboard from './pages/dashboard/LandlordDashboard'
import ResidentDashboard from './pages/dashboard/ResidentDashboard'
import SecurityDashboard from './pages/dashboard/SecurityDashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['super']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/landlord/dashboard" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/resident/dashboard" element={
              <ProtectedRoute allowedRoles={['resident']}>
                <ResidentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/security/dashboard" element={
              <ProtectedRoute allowedRoles={['security']}>
                <SecurityDashboard />
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}
```

---

## 📱 **Mobile-Responsive Design**

### **TailwindCSS Configuration**
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spring': {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### **Responsive Breakpoints Usage**
```jsx
// Mobile-first responsive design
<div className="
  grid 
  grid-cols-1          /* Mobile: 1 column */
  md:grid-cols-2       /* Tablet: 2 columns */
  lg:grid-cols-3       /* Desktop: 3 columns */
  xl:grid-cols-4       /* Large: 4 columns */
  gap-4 
  p-4 
  md:p-6 
  lg:p-8
">
```

---

## 🔄 **Complete System Flow**

### **1. User Registration Journey**
```
1. User visits `/register`
2. Enters registration code → API: POST /api/auth/verify-code
3. System validates code and shows house details
4. User completes profile → API: POST /api/auth/register  
5. Redirect to role-based dashboard
```

### **2. Payment Flow**
```
1. Resident clicks "Pay Levy" → `/payment/select`
2. Selects amount/period → API: POST /api/payments/create
3. Redirect to Flutterwave checkout
4. Payment processed → Webhook: POST /api/flutterwave/webhook
5. Return to dashboard with updated status
```

### **3. Visitor Token Workflow**
```
1. Resident generates token → API: POST /api/visitor-tokens
2. Shares token with visitor
3. Visitor arrives at gate
4. Security scans token → API: POST /api/visitor-tokens/verify
5. Security admits visitor → API: POST /api/visitor-entries
6. Visitor exits → API: PUT /api/visitor-entries/{id}/exit
```

### **4. Administrative Operations**
```
1. Super Admin creates landlord → API: POST /api/users
2. Landlord adds houses → API: POST /api/houses  
3. Landlord generates registration codes → API: POST /api/registration-codes/generate
4. Monitor system activity → API: GET /api/logs
```

---

## 🚀 **Development Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

---

## 📞 **Frontend Support**

- **Frontend Developer**: React/Vite specialist needed
- **UI/UX Designer**: For component design and user experience
- **Mobile Developer**: For responsive optimization
- **Integration Specialist**: For API connection and state management

---

**Frontend Architecture Guide**  
**Version**: 1.0.0-MVP  
**React Version**: 19.1.1  
**Vite Version**: 7.1.7  
**Last Updated**: November 2025

This comprehensive guide provides everything needed to build the Springfield Estate frontend with seamless Laravel API integration. Each page corresponds to specific backend endpoints, ensuring a complete full-stack solution.