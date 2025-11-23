#!/bin/bash

# FCM Setup Quick Start Script
# This script helps you complete the FCM setup quickly

echo "🔔 Firebase Cloud Messaging Setup"
echo "=================================="
echo ""

# Check if in backend directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "   cd backend && bash ../fcm-setup.sh"
    exit 1
fi

echo "📦 Step 1: Installing Firebase Admin SDK..."
composer require kreait/laravel-firebase

echo ""
echo "🗄️ Step 2: Running migration..."
php artisan migrate

echo ""
echo "✅ Laravel setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get your VAPID key from Firebase Console"
echo "2. Update src/firebase.js with your VAPID key"
echo "3. Download serviceAccountKey.json from Firebase"
echo "4. Place it in: backend/storage/app/firebase/serviceAccountKey.json"
echo "5. Initialize notifications in your React app"
echo ""
echo "📚 See FCM_SETUP_GUIDE.md for detailed instructions"
