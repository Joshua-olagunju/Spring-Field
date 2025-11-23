# 🚀 cPanel Shared Hosting Deployment Guide (Truehost)

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Truehost shared hosting account with cPanel access
- [ ] Domain name (e.g., springfield.co.ke)
- [ ] cPanel login credentials
- [ ] FTP/File Manager access
- [ ] Database creation privileges
- [ ] SSH access (optional but recommended)

---

## 🎯 Overview

Your application has two parts:
1. **Frontend (React + Vite)** → Will be in `public_html/`
2. **Backend (Laravel API)** → Will be in `public_html/api/`

---

## PART 1: Backend Deployment (Laravel API)

### Step 1: Prepare Your Laravel Project Locally

#### 1.1 Build for Production
```bash
cd C:\xampp\htdocs\Spring-Field\backend

# Update composer dependencies (production mode)
composer install --optimize-autoloader --no-dev

# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

#### 1.2 Update Backend .env File

Edit `backend/.env`:

```env
# Application
APP_NAME="Spring Field"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com/api

# Database (You'll get these from cPanel)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_cpanel_database_name
DB_USERNAME=your_cpanel_database_user
DB_PASSWORD=your_cpanel_database_password

# Session & Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=database

# CORS - Your Frontend URL
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com

# Flutterwave PRODUCTION
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-your-live-public-key-X"
FLUTTERWAVE_SECRET_KEY="FLWSEC-your-live-secret-key"
FLUTTERWAVE_ENCRYPTION_KEY="FLWSECK-your-live-encryption-key"

# Mail Configuration (Use your domain email)
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=465
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"
```

#### 1.3 Update Flutterwave Plan IDs

Edit `backend/config/flutterwave.php` - Replace all 21 plan IDs with PRODUCTION plan IDs from Flutterwave dashboard.

---

### Step 2: Create Database in cPanel

1. **Login to cPanel** (usually: https://yourdomain.com:2083)
2. Go to **MySQL® Databases**
3. **Create Database:**
   - Database Name: `springfield_db` (cPanel will prefix it, e.g., `cpanelusername_springfield_db`)
   - Click **Create Database**
4. **Create Database User:**
   - Username: `springfield_user`
   - Password: (Generate strong password)
   - Click **Create User**
5. **Add User to Database:**
   - Select the user you created
   - Select the database you created
   - Grant **ALL PRIVILEGES**
   - Click **Make Changes**
6. **Save these credentials** - you'll need them for `.env` file

---

### Step 3: Upload Backend Files to cPanel

#### Option A: File Manager (Easier)

1. In cPanel, open **File Manager**
2. Navigate to `public_html/`
3. Create folder: `api`
4. Enter the `api` folder
5. Click **Upload** button
6. **Zip your backend folder first:**
   ```bash
   # On your local machine
   cd C:\xampp\htdocs\Spring-Field
   # Create a zip file of the backend folder
   ```
7. Upload the ZIP file to `public_html/api/`
8. Right-click the ZIP → **Extract**
9. Move all files from `backend/` folder to `api/` directly
10. Delete the empty `backend/` folder and ZIP file

#### Option B: FTP (Alternative)

1. Use FileZilla or WinSCP
2. Connect with FTP credentials from cPanel
3. Navigate to `public_html/api/`
4. Upload entire `backend` folder contents (not the folder itself)

---

### Step 4: Configure Backend on Server

#### 4.1 Update .env File on Server

1. In cPanel File Manager, go to `public_html/api/`
2. Find `.env` file (if hidden, click **Settings** → Show Hidden Files)
3. Right-click → **Edit**
4. Update these values:
   ```env
   DB_DATABASE=cpanelusername_springfield_db
   DB_USERNAME=cpanelusername_springfield_user
   DB_PASSWORD=the_password_you_created
   
   APP_URL=https://yourdomain.com/api
   ```
5. **Save**

#### 4.2 Set Folder Permissions

In File Manager:
1. Right-click `storage` folder → **Permissions**
2. Set to: **755** (or check: Read, Write, Execute for Owner; Read, Execute for Group/World)
3. Check **Recurse into subdirectories**
4. Click **Change Permissions**
5. Repeat for `bootstrap/cache` folder

---

### Step 5: Run Database Migrations

#### Option A: Using Terminal/SSH (Recommended)

1. In cPanel, open **Terminal** (or use SSH client like PuTTY)
2. Navigate to your API folder:
   ```bash
   cd public_html/api
   ```
3. Run migrations:
   ```bash
   php artisan migrate --force
   ```
4. If you get "command not found", use full PHP path:
   ```bash
   /usr/local/bin/php artisan migrate --force
   ```

#### Option B: Using Web Browser (If no SSH access)

Create a temporary migration file:

1. Create file: `public_html/api/migrate.php`
2. Add this content:
   ```php
   <?php
   // Delete this file after running migrations!
   require __DIR__.'/vendor/autoload.php';
   $app = require_once __DIR__.'/bootstrap/app.php';
   $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
   $status = $kernel->call('migrate', ['--force' => true]);
   echo $status === 0 ? 'Migrations completed successfully!' : 'Migrations failed!';
   ?>
   ```
3. Visit: `https://yourdomain.com/api/migrate.php`
4. **IMPORTANT:** Delete `migrate.php` immediately after success

---

### Step 6: Configure .htaccess for API

Ensure `public_html/api/public/.htaccess` exists:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

### Step 7: Point Domain to API

#### Option 1: Subdomain (Recommended)
1. In cPanel → **Subdomains**
2. Create subdomain: `api.yourdomain.com`
3. Document Root: `public_html/api/public`
4. Your API URL: `https://api.yourdomain.com`

#### Option 2: Subdirectory
1. In cPanel → **Domains** → **Addon Domains**
2. Or use File Manager to create symlink:
   - API accessible at: `https://yourdomain.com/api`
   - But Laravel needs document root at `public_html/api/public`

**For subdirectory setup:**

Create `public_html/api-redirect/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ /api/public/$1 [L]
</IfModule>
```

Then create `public_html/.htaccess` and add:
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ api/public/$1 [L]
```

---

### Step 8: Test Backend API

Visit these URLs to verify:
- `https://api.yourdomain.com/` or `https://yourdomain.com/api/` → Should see Laravel default page or JSON
- `https://api.yourdomain.com/api/test` → Test endpoint
- Check `public_html/api/storage/logs/laravel.log` for errors

---

## PART 2: Frontend Deployment (React + Vite)

### Step 1: Build Frontend Locally

#### 1.1 Update Frontend .env.production

Create/edit `.env.production` in your frontend root:

```env
# API URL - Use the URL you configured in Step 7
VITE_API_BASE_URL=https://api.yourdomain.com
# OR if using subdirectory:
# VITE_API_BASE_URL=https://yourdomain.com/api

# Flutterwave Production Key
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-live-public-key-X

# Firebase Configuration (Same as development)
VITE_FIREBASE_API_KEY=AIzaSyDhhXqDiOx_6QujQp4uPxY2poXzTMygulk
VITE_FIREBASE_AUTH_DOMAIN=notification-3e1ff.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=notification-3e1ff
VITE_FIREBASE_STORAGE_BUCKET=notification-3e1ff.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=273002087588
VITE_FIREBASE_APP_ID=1:273002087588:web:89fe7bbc074671ce8c9231
VITE_FIREBASE_MEASUREMENT_ID=G-ZFPEBC7ECZ
VITE_FIREBASE_VAPID_KEY=BGDB_4SHiLJH1mOsYkUvZ3CNs5YxBFBe3fKGGYxkl7QW7PzKd4hy_zXO_4fcqydRIQDaZ4YW2kvqVV07na2SMkw
```

#### 1.2 Build the Frontend

```bash
cd C:\xampp\htdocs\Spring-Field

# Build for production
npm run build
```

This creates a `dist/` folder with optimized files.

---

### Step 2: Upload Frontend to cPanel

#### 2.1 Clear public_html (IMPORTANT!)

1. In cPanel File Manager, go to `public_html/`
2. **Select ALL files EXCEPT:**
   - `api/` folder
   - `cgi-bin/` folder (if exists)
   - `.htaccess` (if exists)
3. Delete selected files

#### 2.2 Upload Built Frontend

1. On your local machine, ZIP the contents of `dist/` folder:
   - **IMPORTANT:** Zip the CONTENTS, not the dist folder itself
   - Select all files inside `dist/` → Right-click → Send to → Compressed folder
2. In cPanel File Manager, go to `public_html/`
3. Upload the ZIP file
4. Extract the ZIP
5. Delete the ZIP file

Your structure should be:
```
public_html/
├── index.html          ← Frontend entry point
├── assets/             ← CSS, JS, images
├── firebase-messaging-sw.js
├── api/                ← Your Laravel backend
│   ├── app/
│   ├── public/
│   └── ...
└── .htaccess          ← Create this next
```

---

### Step 3: Configure .htaccess for SPA Routing

Create `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Don't rewrite files or directories
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Don't rewrite API requests
    RewriteCond %{REQUEST_URI} !^/api/
    
    # Don't rewrite cgi-bin
    RewriteCond %{REQUEST_URI} !^/cgi-bin/
    
    # Rewrite everything else to index.html
    RewriteRule ^ index.html [L]
</IfModule>

# Enable CORS for API calls
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
</IfModule>
```

---

## PART 3: Firebase Configuration

### Step 1: Add Production Domain to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **notification-3e1ff**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add your domain: `yourdomain.com`
6. Click **Add**

### Step 2: Verify Service Worker

1. Visit: `https://yourdomain.com/firebase-messaging-sw.js`
2. Should see the JavaScript file content (not 404)

---

## PART 4: SSL Certificate Setup

### Enable SSL in cPanel (Required for Push Notifications!)

1. In cPanel, go to **SSL/TLS Status**
2. Find your domain
3. Click **Run AutoSSL**
4. Wait for certificate installation (usually 1-5 minutes)
5. Verify: Visit `https://yourdomain.com` (should show padlock icon)

**Alternative: Cloudflare Free SSL**
1. Sign up at [Cloudflare](https://cloudflare.com)
2. Add your domain
3. Change nameservers at Truehost to Cloudflare's
4. Enable SSL/TLS (Flexible or Full)

---

## PART 5: Backend Email Configuration

### Option 1: Using Domain Email (Recommended)

1. In cPanel → **Email Accounts**
2. Create email: `noreply@yourdomain.com`
3. Set strong password
4. Update `backend/.env`:
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=mail.yourdomain.com
   MAIL_PORT=465
   MAIL_USERNAME=noreply@yourdomain.com
   MAIL_PASSWORD=your_email_password
   MAIL_ENCRYPTION=ssl
   MAIL_FROM_ADDRESS=noreply@yourdomain.com
   ```

### Option 2: Using Gmail SMTP

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-gmail@gmail.com
```

---

## PART 6: Testing & Verification

### Backend Tests

Visit and verify these URLs work:

```bash
# Health check
https://api.yourdomain.com/

# Test database connection
https://api.yourdomain.com/api/test

# Check logs
# File Manager → public_html/api/storage/logs/laravel.log
```

### Frontend Tests

1. **Visit:** `https://yourdomain.com`
2. **Check:**
   - [ ] Site loads correctly
   - [ ] No console errors (F12 → Console)
   - [ ] Login works
   - [ ] API calls succeed
   - [ ] Notification permission prompt appears
   - [ ] Images/assets load

### Push Notification Test

1. **Login as a user**
2. **Grant notification permission**
3. **Check browser console:**
   ```javascript
   // Should see:
   "🔔 Requesting notification permission..."
   "✅ Notification permission granted"
   "📱 FCM Token: ..."
   "💾 Saving FCM token to: https://api.yourdomain.com/api/fcm-token"
   ```
4. **Verify token saved in database:**
   - cPanel → phpMyAdmin
   - Select database → `users` table
   - Check `fcm_token` column has value

5. **Test notification sending:**
   - SSH into server
   - Run: `php public_html/api/test_real_notification.php`
   - Or create web-accessible test file temporarily

---

## 🚨 Common Issues & Solutions

### Issue 1: 500 Internal Server Error

**Solution:**
1. Check `public_html/api/storage/logs/laravel.log`
2. Verify folder permissions (755 for storage)
3. Clear config cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

### Issue 2: Database Connection Failed

**Solution:**
1. Verify database credentials in `.env`
2. Check database exists in cPanel → MySQL Databases
3. Verify user has privileges on database
4. Try `DB_HOST=localhost` or `DB_HOST=127.0.0.1`

### Issue 3: CORS Errors

**Solution:**
Update `backend/config/cors.php`:
```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
'supports_credentials' => true,
```

### Issue 4: Routes Not Working (404 on Refresh)

**Solution:**
1. Verify `.htaccess` exists in `public_html/`
2. Check if mod_rewrite is enabled (ask hosting support)
3. Ensure `RewriteEngine On` is in .htaccess

### Issue 5: Notifications Not Showing

**Checklist:**
- [ ] Site uses HTTPS (required!)
- [ ] Service worker accessible: `/firebase-messaging-sw.js`
- [ ] User granted notification permission
- [ ] FCM token saved in database
- [ ] Domain added to Firebase authorized domains
- [ ] Browser supports notifications (Chrome, Firefox, Edge)

### Issue 6: Payment Not Working

**Solution:**
1. Verify using PRODUCTION Flutterwave keys
2. Update all 21 plan IDs in `config/flutterwave.php`
3. Check Flutterwave dashboard for transaction logs
4. Ensure HTTPS is enabled (Flutterwave requires SSL)

---

## 📂 Final Directory Structure

```
public_html/
├── index.html                          ← Frontend entry
├── assets/                             ← Frontend assets
│   ├── index-abc123.js
│   ├── index-def456.css
│   └── logo-xyz789.png
├── firebase-messaging-sw.js           ← Service worker
├── .htaccess                          ← SPA routing
│
└── api/                               ← Backend folder
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/                        ← Laravel public folder
    │   ├── index.php
    │   └── .htaccess
    ├── resources/
    ├── routes/
    ├── storage/
    │   ├── app/
    │   │   └── firebase/
    │   │       └── serviceAccountKey.json
    │   └── logs/
    │       └── laravel.log
    ├── vendor/
    ├── .env                           ← Production config
    ├── artisan
    └── composer.json
```

---

## ✅ Post-Deployment Checklist

### Backend ✓
- [ ] Database created and credentials updated
- [ ] Migrations run successfully
- [ ] Storage permissions set (755)
- [ ] `.env` configured for production
- [ ] Flutterwave production keys added
- [ ] Flutterwave plan IDs updated
- [ ] Email configuration working
- [ ] API endpoints responding
- [ ] Firebase serviceAccountKey.json uploaded

### Frontend ✓
- [ ] Production build uploaded
- [ ] `.htaccess` configured for SPA
- [ ] All assets loading correctly
- [ ] No console errors
- [ ] API calls reaching backend
- [ ] Service worker accessible

### Security ✓
- [ ] SSL certificate installed
- [ ] HTTPS redirects working
- [ ] `.env` files not publicly accessible
- [ ] Debug mode disabled (`APP_DEBUG=false`)
- [ ] Strong database passwords
- [ ] File permissions secure (755 for folders, 644 for files)

### Firebase ✓
- [ ] Production domain added to authorized domains
- [ ] Service worker file accessible
- [ ] FCM tokens being saved
- [ ] Push notifications working
- [ ] Notification permissions granted

### Final Tests ✓
- [ ] User registration works
- [ ] Login/Logout works
- [ ] Password reset works
- [ ] Visitor registration works
- [ ] Payment gateway works (Flutterwave)
- [ ] Push notifications deliver
- [ ] Email sending works
- [ ] All pages load correctly

---

## 🎉 You're Live!

Your Spring Field application is now deployed on Truehost shared hosting!

**Access your application:**
- **Frontend:** https://yourdomain.com
- **API:** https://api.yourdomain.com (or https://yourdomain.com/api)

**Admin Tools:**
- **cPanel:** https://yourdomain.com:2083
- **phpMyAdmin:** cPanel → Databases → phpMyAdmin
- **File Manager:** cPanel → Files → File Manager
- **Error Logs:** `public_html/api/storage/logs/laravel.log`

---

## 📞 Support Resources

- **Truehost Support:** https://truehost.com/support
- **Laravel Docs:** https://laravel.com/docs/8.x/deployment
- **Firebase Docs:** https://firebase.google.com/docs/cloud-messaging/js/client
- **Flutterwave Docs:** https://developer.flutterwave.com/docs

---

## 🔄 Updating Your Application

### Update Backend Code:
```bash
# Upload new files via FTP/File Manager
# Then in Terminal:
cd public_html/api
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Update Frontend Code:
```bash
# On local machine:
npm run build

# Upload dist/ contents to public_html/
# Clear browser cache or use Ctrl+Shift+R to hard refresh
```

---

**Last Updated:** November 23, 2025
**Version:** 1.0
