# 🏠 Springfield Estate - Frontend Application

> **Modern Estate Management System Interface**  
> Built with React 19.1.1 + Vite 7.1.7 + TailwindCSS 4.1.16

![Springfield Estate Logo](./assets/logo.svg)

## 🌟 Overview

The Springfield Estate frontend provides an intuitive, responsive web interface for our digital estate management system. This React application delivers role-based experiences for Super Admins, Admins (Landlords), Residents, and Security Guards with real-time updates and seamless payment integration.

## 🏗️ Architecture

```
Frontend Architecture
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Shared components
│   │   ├── auth/            # Authentication forms
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── payments/        # Payment components
│   │   └── visitors/        # Visitor management
│   ├── pages/               # Route-based pages
│   │   ├── auth/            # Login/Register pages
│   │   ├── dashboard/       # Role-specific dashboards
│   │   ├── payments/        # Payment management
│   │   └── visitors/        # Visitor token system
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API service layer
│   ├── utils/               # Helper functions
│   ├── store/               # State management
│   └── styles/              # Global CSS & Tailwind
└── public/
    ├── icons/               # App icons & favicons
    └── images/              # Static images
```

## 📋 Prerequisites

Before running the frontend, ensure you have:

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- **Backend API** running on port 8000
- **Modern browser** (Chrome 90+, Firefox 88+, Safari 14+)

## ⚙️ Installation & Setup

### 1. Clone & Navigate
```bash
# Navigate to project directory
cd c:\xampp\htdocs\Spring-Field\Spring-Field

# Verify Node.js installation
node --version
npm --version
```

### 2. Install Dependencies
```bash
# Install all packages
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration

Create `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_URL=http://localhost:5173

# Flutterwave Payment Gateway
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your_public_key

# Application Settings
VITE_APP_NAME="Springfield Estate"
VITE_APP_VERSION=1.0.0-MVP

# Development
VITE_API_TIMEOUT=10000
VITE_DEBUG_MODE=true
```

### 4. Development Server
```bash
# Start Vite development server
npm run dev

# Or using yarn
yarn dev
```

### 5. Verify Installation
- **Frontend URL**: http://localhost:5173
- **API Connection**: Check browser console for API health check
- **Hot Reload**: Verify changes reflect immediately

## 🎨 Technology Stack

### Core Framework
- **React 19.1.1** - Latest React with modern features
- **Vite 7.1.7** - Ultra-fast build tool and dev server
- **React Router 7** - Client-side routing

### Styling & UI
- **TailwindCSS 4.1.16** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Beautiful SVG icons
- **React Hot Toast** - Toast notifications

### State Management & API
- **React Query/TanStack Query** - Server state management
- **Zustand** - Lightweight client state
- **Axios** - HTTP client with interceptors

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety (optional)

## 👥 User Roles & Features

### 🔧 Super Admin Dashboard
```jsx
// Features Available
- Estate-wide analytics
- User role management
- System configuration
- Payment oversight
- Security monitoring
```

### 🏢 Admin (Landlord) Dashboard
```jsx
// Features Available
- Resident management
- Payment tracking
- Property oversight
- Revenue analytics
- Maintenance requests
```

### 🏠 Resident Portal
```jsx
// Features Available
- Payment history & dues
- Visitor token generation
- Community announcements
- Maintenance requests
- Profile management
```

### 🛡️ Security Guard Interface
```jsx
// Features Available
- Token verification scanner
- Visitor entry/exit logging
- Real-time visitor status
- Emergency alerts
- Shift reporting
```

## 🔗 API Integration

### Authentication Service
```javascript
// src/services/authService.js
import api from './api'

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/login', credentials)
    localStorage.setItem('token', response.data.token)
    return response.data
  },
  
  logout: async () => {
    await api.post('/logout')
    localStorage.removeItem('token')
  },
  
  getCurrentUser: async () => {
    return await api.get('/user')
  }
}
```

### Payment Service
```javascript
// src/services/paymentService.js
export const paymentService = {
  createPayment: async (paymentData) => {
    return await api.post('/payments/create', paymentData)
  },
  
  getPaymentHistory: async () => {
    return await api.get('/payments/history')
  },
  
  initializeFlutterwavePayment: (amount, callback) => {
    FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: generateTransactionRef(),
      amount: amount,
      currency: "NGN",
      callback: callback
    })
  }
}
```

### Visitor Token Service
```javascript
// src/services/visitorService.js
export const visitorService = {
  generateToken: async (visitorData) => {
    return await api.post('/tokens/create', visitorData)
  },
  
  verifyToken: async (tokenHash) => {
    return await api.post('/tokens/verify', { token: tokenHash })
  },
  
  getTokenLogs: async () => {
    return await api.get('/tokens/logs')
  }
}
```

## 🎯 Component Structure

### Shared Components
```jsx
// src/components/common/Button.jsx
export const Button = ({ variant, size, children, ...props }) => {
  const baseClasses = "font-medium rounded-lg transition-colors"
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700"
  }
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${size}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Dashboard Layout
```jsx
// src/components/dashboard/Layout.jsx
import { Sidebar, Header, MainContent } from './components'

export const DashboardLayout = ({ children, userRole }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <Header />
        <MainContent>
          {children}
        </MainContent>
      </div>
    </div>
  )
}
```

## 🚀 Development Commands

### Development
```bash
# Start development server
npm run dev

# Start with specific port
npm run dev -- --port 3000

# Start with host binding
npm run dev -- --host 0.0.0.0
```

### Building & Testing
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Dependencies Management
```bash
# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated
```

## 🔧 Configuration Files

### Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### TailwindCSS Configuration
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
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

## 📱 Responsive Design

### Mobile-First Approach
```jsx
// Responsive component example
export const PaymentCard = ({ payment }) => {
  return (
    <div className="
      bg-white rounded-lg shadow-sm p-4
      sm:p-6 
      md:flex md:items-center md:justify-between
      lg:p-8
    ">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-gray-900 sm:text-xl">
          ₦{payment.amount.toLocaleString()}
        </h3>
        <p className="text-sm text-gray-500 sm:text-base">
          {payment.period_type} Payment
        </p>
      </div>
      
      <div className="mt-4 md:mt-0 md:ml-6">
        <StatusBadge status={payment.status} />
      </div>
    </div>
  )
}
```

## 🐛 Troubleshooting

### Common Issues

**Vite Dev Server Issues**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart with clean cache
npm run dev -- --force
```

**API Connection Issues**
```javascript
// Check API configuration
console.log('API URL:', import.meta.env.VITE_API_URL)

// Test API connectivity
fetch('http://127.0.0.1:8000/api/health')
  .then(res => res.json())
  .then(data => console.log('API Health:', data))
```

**Build Errors**
```bash
# Check for TypeScript errors
npm run type-check

# Analyze bundle size
npm run build -- --analyze

# Clean install
rm -rf node_modules package-lock.json
npm install
```

**CORS Issues**
```javascript
// Verify CORS configuration in backend
// Check if frontend URL is whitelisted:
// http://localhost:5173
```

## 🔒 Security Best Practices

### Authentication
```javascript
// Token management
const token = localStorage.getItem('authToken')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Automatic token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Environment Variables
```bash
# Never commit sensitive data
# Use .env.example for documentation
# Validate environment variables on startup
```

## 📞 Support & Contact

- **Frontend Developer**: Joshua Olagunju
- **Project Lead**: Rotimi Temitayo Daniel  
- **Contact**: driftech5233@gmail.com
- **Phone**: 09078363161
- **GitHub**: [Spring-Field Repository](https://github.com/your-username/Spring-Field)

---

**Frontend Application Documentation**  
**Version**: 1.0.0-MVP  
**React Version**: 19.1.1  
**Node.js**: 18+ LTS  
**Last Updated**: November 2025