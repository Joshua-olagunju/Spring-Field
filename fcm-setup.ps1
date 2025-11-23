# FCM Setup Quick Start Script (PowerShell)
# This script helps you complete the FCM setup quickly

Write-Host "`n🔔 Firebase Cloud Messaging Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if in backend directory
if (-not (Test-Path "artisan")) {
    Write-Host "❌ Error: Please run this script from the backend directory" -ForegroundColor Red
    Write-Host "   cd backend" -ForegroundColor Yellow
    Write-Host "   ..\fcm-setup.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Step 1: Installing Firebase Admin SDK..." -ForegroundColor Yellow
composer require kreait/laravel-firebase

Write-Host "`n🗄️ Step 2: Running migration..." -ForegroundColor Yellow
php artisan migrate

Write-Host "`n✅ Laravel setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Get your VAPID key from Firebase Console" -ForegroundColor White
Write-Host "2. Update src/firebase.js with your VAPID key (line 35)" -ForegroundColor White
Write-Host "3. Download serviceAccountKey.json from Firebase" -ForegroundColor White
Write-Host "4. Create directory: backend/storage/app/firebase/" -ForegroundColor White
Write-Host "5. Place serviceAccountKey.json in that directory" -ForegroundColor White
Write-Host "6. Initialize notifications in your React app" -ForegroundColor White
Write-Host ""
Write-Host "📚 See FCM_SETUP_GUIDE.md for detailed instructions" -ForegroundColor Yellow
Write-Host ""
