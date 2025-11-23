# 🚀 Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1️⃣ Frontend Configuration

#### Update Environment Variables
1. Create `.env.production` file (copy from `.env.production.example`)
2. Update these values:
   ```env
   VITE_API_BASE_URL="https://your-api-domain.com"
   VITE_FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-YOUR-PRODUCTION-KEY-X"
   ```

#### Firebase Configuration
✅ **No changes needed!** Firebase config works for both dev and production.
- Same API keys
- Same VAPID key
- Same project ID

Just ensure `public/firebase-messaging-sw.js` is deployed with your build.

#### Build for Production
```bash
npm run build
```
This creates optimized files in the `dist/` folder.

---

### 2️⃣ Backend Configuration (Laravel)

#### Update Laravel .env
Located at: `backend/.env`

```env
# Change to production
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-api-domain.com

# Update CORS origins
SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
SESSION_DOMAIN=.your-api-domain.com

# Flutterwave PRODUCTION keys
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-your-production-key-X"
FLUTTERWAVE_SECRET_KEY="FLWSEC-your-production-secret-key"
FLUTTERWAVE_ENCRYPTION_KEY="FLWSECK-your-production-encryption-key"
```

#### Update Flutterwave Plan IDs
In `backend/config/flutterwave.php`, update the 21 plan IDs with PRODUCTION plan IDs from Flutterwave dashboard.

#### Firebase Service Account
✅ **File is already in place!**
- Location: `backend/storage/app/firebase/serviceAccountKey.json`
- This file works for both dev and production
- Just ensure it's deployed to your server

---

### 3️⃣ Deployment Steps

#### Frontend Deployment (e.g., Vercel, Netlify, etc.)

**Option A: Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Option B: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Option C: cPanel/Shared Hosting**
1. Run `npm run build`
2. Upload `dist/` folder contents to public_html
3. Ensure `.htaccess` handles SPA routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

#### Backend Deployment (Laravel)

**Option A: VPS (Linux)**
```bash
# SSH into server
cd /var/www/your-app

# Pull latest code
git pull origin main

# Install dependencies
composer install --optimize-autoloader --no-dev

# Run migrations
php artisan migrate --force

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

**Option B: cPanel/Shared Hosting**
1. Upload `backend/` folder contents
2. Point document root to `backend/public`
3. Run migrations via terminal/SSH
4. Set folder permissions (775 for storage)

---

### 4️⃣ Firebase Notifications - Production Setup

#### No Configuration Changes Needed! ✅

The Firebase notifications will work automatically in production because:
1. ✅ Same Firebase project for dev and production
2. ✅ Service worker is included in build
3. ✅ FCM tokens are device-specific (not environment-specific)
4. ✅ Backend serviceAccountKey.json works everywhere

#### What Users Need to Do:
1. **Visit your production site**
2. **Login to their account**
3. **Allow notifications** when prompted by browser
4. **That's it!** They'll receive push notifications

#### Testing in Production:
```bash
# SSH into your production server
cd /path/to/backend

# Test notification sending
php test_real_notification.php
```

---

### 5️⃣ Domain Configuration

#### Add Your Production Domain to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `notification-3e1ff`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add your production domain: `your-domain.com`

#### Update CORS in Laravel

In `backend/config/cors.php`:
```php
'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-production-domain.com', // Add this
],
```

---

### 6️⃣ SSL Certificate (HTTPS)

⚠️ **Important:** Push notifications require HTTPS in production!

**Free SSL Options:**
- **Let's Encrypt** (cPanel, Plesk have built-in support)
- **Cloudflare** (free SSL proxy)
- **Vercel/Netlify** (automatic SSL)

---

### 7️⃣ Post-Deployment Verification

#### Frontend Checklist
- [ ] Site loads on production domain
- [ ] API calls reach backend successfully
- [ ] Login/Authentication works
- [ ] Notification permission prompt appears
- [ ] FCM token is saved to backend
- [ ] Payments work with production Flutterwave keys

#### Backend Checklist
- [ ] API endpoints respond correctly
- [ ] Database connections working
- [ ] File uploads work (storage folder writable)
- [ ] Firebase notifications send successfully
- [ ] Logs are being written (storage/logs)

#### Test Notifications
1. Login as a resident
2. Grant notification permission
3. Have security grant access to a visitor
4. Resident should receive push notification ✅

---

## 🔧 Troubleshooting

### Notifications Not Working in Production?

**Check:**
1. **HTTPS**: Production must use HTTPS
2. **Service Worker**: Verify at `https://your-domain.com/firebase-messaging-sw.js`
3. **Browser Console**: Look for Firebase errors
4. **Backend Logs**: Check `storage/logs/laravel.log`
5. **FCM Token**: Verify user's token is saved in database

**Test Backend:**
```bash
# SSH into production server
php test_real_notification.php
```

**Test Frontend:**
```javascript
// Open browser console on production site
// Check for these logs:
"🔔 Requesting notification permission..."
"✅ Notification permission granted"
"📱 FCM Token: ..."
"💾 Saving FCM token to: ..."
```

---

## 📞 Support

If you encounter issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure serviceAccountKey.json is uploaded to server

---

## ✅ Summary

**What You Need to Change for Production:**

### Frontend (.env.production)
- ✅ `VITE_API_BASE_URL` → Your production API URL
- ✅ `VITE_FLUTTERWAVE_PUBLIC_KEY` → Production Flutterwave key
- ❌ Firebase config → **NO CHANGES NEEDED**

### Backend (.env)
- ✅ `APP_ENV=production`
- ✅ `APP_URL` → Your production URL
- ✅ Flutterwave keys → Production keys
- ✅ Update plan IDs in `config/flutterwave.php`
- ❌ Firebase serviceAccountKey.json → **NO CHANGES NEEDED**

**That's it!** 🎉 Your push notifications will work automatically once deployed.
