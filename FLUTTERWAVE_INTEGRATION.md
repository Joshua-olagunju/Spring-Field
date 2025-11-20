# Flutterwave Payment Integration - Implementation Guide

## Overview

This document outlines the complete Flutterwave payment integration implemented for SpringField Estate, connecting subscription payments with visitor token generation functionality.

## Backend Implementation

### 1. Environment Configuration

Add the following to your backend `.env` file:

```env
# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key-here
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-key-here
FLUTTERWAVE_WEBHOOK_SECRET_HASH=your-webhook-secret-hash
FLUTTERWAVE_ENVIRONMENT=sandbox
```

### 2. Configuration File

- **Location**: `backend/config/flutterwave.php`
- **Purpose**: Centralized configuration for Flutterwave settings and package definitions
- **Features**:
  - API endpoints configuration
  - Package pricing for different user types
  - Environment-specific settings

### 3. Service Layer

- **File**: `backend/app/Services/FlutterwaveService.php`
- **Functionality**:
  - Payment initialization
  - Transaction verification
  - Webhook signature validation
  - Error handling and logging

### 4. Controller Updates

- **PaymentController**: Enhanced with Flutterwave integration
  - `initializePayment()`: Creates payment records and initializes Flutterwave
  - `handleWebhook()`: Processes payment confirmations
  - `hasActiveSubscription()`: Checks user subscription status
- **VisitorTokenController**: Added subscription validation
  - Checks active subscription before token generation
  - Returns subscription requirement error when needed

### 5. API Endpoints

```
GET /api/payments/packages - Get subscription packages
POST /api/payments/initialize - Initialize payment
GET /api/payments/subscription-status - Check subscription status
POST /api/flutterwave/webhook - Handle payment webhooks
```

## Frontend Implementation

### 1. Environment Configuration

Add to frontend `.env`:

```env
VITE_FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_TEST-your-public-key-here"
```

### 2. Payment Screen Updates

- **File**: `src/screens/GeneralScreens/PaymentScreen/PaymentScreen.jsx`
- **Features**:
  - Fixed JSX structure and syntax errors
  - Integrated with backend payment API
  - Package selection and payment initialization
  - Flutterwave checkout integration

### 3. Visitor Token Modal Updates

- **File**: `src/screens/GeneralScreens/VisitorsTokenGenerationModal/VisitorsGenerationToken.jsx`
- **Features**:
  - Subscription status checking on modal open
  - Subscription requirement validation
  - User-friendly subscription prompts
  - Error handling for subscription-related issues

## Package Configuration

### Tenant Package

- Monthly: ₦3,000
- 6 Months: ₦15,000 (16.7% savings)
- Yearly: ₦27,000 (25% savings)

### Landlord Alone Package

- Monthly: ₦5,000
- 6 Months: ₦25,000 (16.7% savings)
- Yearly: ₦45,000 (25% savings)

### Landlord with Tenants Package

- Monthly: ₦7,000
- 6 Months: ₦35,000 (16.7% savings)
- Yearly: ₦63,000 (25% savings)

## Payment Flow

### 1. User Selects Package

- User views available packages in PaymentScreen
- Package prices are fetched from backend
- User selects desired plan and period

### 2. Payment Initialization

- Frontend calls `/api/payments/initialize` with package details
- Backend validates package and creates payment record
- Backend returns Flutterwave payment data
- Frontend launches Flutterwave checkout

### 3. Payment Processing

- User completes payment in Flutterwave modal
- Flutterwave sends webhook to `/api/flutterwave/webhook`
- Backend verifies payment and updates subscription status

### 4. Token Generation Access

- When user tries to generate visitor token
- System checks active subscription via `/api/payments/subscription-status`
- If no active subscription, shows subscription requirement message
- If active subscription exists, allows token generation

## Security Features

### 1. Webhook Validation

- HMAC signature verification using webhook secret
- Transaction verification with Flutterwave API
- Protection against replay attacks

### 2. Payment Validation

- Amount and package validation against configuration
- User authentication requirements
- Transaction reference uniqueness

### 3. Subscription Enforcement

- Active subscription check before token generation
- Period-based access control
- Automatic subscription expiry handling

## Testing Checklist

### Backend Testing

- [ ] Payment package retrieval
- [ ] Payment initialization with valid data
- [ ] Payment initialization with invalid data
- [ ] Webhook processing with valid signature
- [ ] Webhook processing with invalid signature
- [ ] Subscription status checking
- [ ] Token generation with active subscription
- [ ] Token generation without subscription

### Frontend Testing

- [ ] Payment screen displays correctly
- [ ] Package selection works
- [ ] Flutterwave modal opens
- [ ] Payment success handling
- [ ] Visitor token modal subscription check
- [ ] Subscription requirement display
- [ ] Error handling and user feedback

## Deployment Considerations

### 1. Environment Variables

- Update Flutterwave keys for production environment
- Set webhook secret hash securely
- Configure proper API URLs

### 2. Database

- Ensure Payment model migrations are run
- Verify foreign key constraints
- Set up proper indexing for performance

### 3. Webhooks

- Configure webhook URL in Flutterwave dashboard
- Ensure webhook endpoint is accessible
- Set up proper SSL certificates

### 4. Logging and Monitoring

- Monitor payment success/failure rates
- Set up alerts for webhook failures
- Track subscription activation/expiry events

## Support and Maintenance

### 1. Common Issues

- **Webhook failures**: Check signature validation and network connectivity
- **Payment failures**: Verify API credentials and request format
- **Subscription issues**: Check payment status and expiry dates

### 2. Monitoring

- Track payment conversion rates
- Monitor subscription renewal rates
- Watch for webhook processing errors

### 3. Updates

- Regularly update Flutterwave SDK if used
- Monitor for API version changes
- Keep security patches updated

## Additional Features to Consider

### 1. Enhanced Payment Features

- Recurring subscription management
- Payment retry mechanisms
- Multiple payment methods support

### 2. User Experience Improvements

- Payment history dashboard
- Subscription renewal reminders
- Usage analytics and limits

### 3. Administrative Features

- Payment reconciliation tools
- Subscription management dashboard
- Revenue reporting and analytics

---

**Note**: Remember to replace all test API keys with production keys before going live, and ensure all webhook URLs are properly configured in your Flutterwave dashboard.
