# SpringField Estate PWA Setup Guide

This guide explains how to set up and use the Progressive Web App (PWA) features for SpringField Estate.

## 📱 What is a PWA?

A Progressive Web App allows users to install your web application on their devices (phones, tablets, computers) just like a native app, with offline support and a native app-like experience.

## 🎯 Features Implemented

- ✅ **Installable**: Users can install the app on their devices
- ✅ **Offline Support**: Basic offline functionality via service worker
- ✅ **Native App Feel**: Runs in standalone mode without browser UI
- ✅ **Custom Icons**: Branded app icons in all required sizes
- ✅ **Install Instructions**: Built-in modal with platform-specific guides
- ✅ **Auto-hide**: Install button automatically hides when app is installed

## 📁 PWA Files Structure

```
SpringField Estate/
├── public/
│   ├── manifest.json          # PWA manifest configuration
│   ├── service-worker.js      # Service worker for offline support
│   ├── generate-icons.html    # Icon generator tool
│   └── icons/                 # PWA icons (need to be generated)
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
├── components/GeneralComponents/
│   └── InstallPwaButton.jsx   # Reusable install button component
└── index.html                 # Updated with PWA meta tags
```

## 🎨 Step 1: Generate PWA Icons

You have two options to generate the required PWA icons:

### Option A: Using the Web-Based Generator (Recommended)

1. Start your development server:

   ```powershell
   npm run dev
   ```

2. Open the icon generator in your browser:

   ```
   http://localhost:5173/generate-icons.html
   ```

3. Upload your logo file (`src/assets/logo.png`)

4. Click "Generate Icons"

5. Download each generated icon (right-click → Save as)

6. Save all icons to the `public/icons/` folder with the correct filenames:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

### Option B: Using the Node.js Script

1. Install the sharp package:

   ```powershell
   npm install sharp --save-dev
   ```

2. Run the icon generator script:

   ```powershell
   npm run generate-icons
   ```

3. Icons will be automatically saved to `public/icons/`

## 🔧 Step 2: Using the Install Button Component

The `InstallPwaButton` component is ready to use anywhere in your app.

### Basic Usage

```jsx
import InstallPwaButton from "../components/GeneralComponents/InstallPwaButton";

function MyComponent() {
  return (
    <div>
      <InstallPwaButton />
    </div>
  );
}
```

### With Custom Props

```jsx
<InstallPwaButton
  buttonText="Download App"
  className="my-custom-class"
  style={{ margin: "20px" }}
/>
```

### Component Features

- **Auto-detection**: Automatically detects if app is installed
- **Auto-hide**: Button disappears when app is already installed
- **Native Prompt**: Triggers browser's native install prompt
- **Info Modal**: Includes installation instructions for Android, iOS, and Desktop
- **Themed**: Fully integrated with your theme context (light/dark mode)

## 📱 Installation Instructions for Users

### Android (Chrome)

1. Open the app in Chrome
2. Tap the menu (⋮) → "Install app" or "Add to Home screen"
3. Confirm installation
4. App appears on your home screen

### iOS (Safari)

1. Open the app in Safari
2. Tap the Share button (⬆️)
3. Scroll down → "Add to Home Screen"
4. Tap "Add"
5. App appears on your home screen

### Desktop (Chrome/Edge/Brave)

1. Look for the install icon (⊕) in the address bar, OR
2. Click menu (⋮) → "Install SpringField Estate"
3. Click "Install"
4. App opens in its own window

## 🚀 Testing the PWA

### Local Testing

1. Build the production version:

   ```powershell
   npm run build
   ```

2. Preview the build:

   ```powershell
   npm run preview
   ```

3. Open in browser and test installation

### PWA Checklist

- [ ] Icons generated and placed in `public/icons/`
- [ ] Manifest.json is accessible at `/manifest.json`
- [ ] Service worker is registered
- [ ] App installs successfully on mobile
- [ ] App installs successfully on desktop
- [ ] Install button shows when app is not installed
- [ ] Install button hides when app is installed
- [ ] Info modal works and shows instructions

## 🔍 Debugging PWA

### Chrome DevTools

1. Open DevTools (F12)
2. Go to "Application" tab
3. Check:
   - **Manifest**: Verify all fields are correct
   - **Service Workers**: Ensure it's registered and active
   - **Storage**: Check cache storage

### Lighthouse Audit

1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Fix any issues reported

## 📝 Customization

### Update App Name or Colors

Edit `public/manifest.json`:

```json
{
  "name": "Your App Name",
  "short_name": "Short Name",
  "theme_color": "#3B82F6",
  "background_color": "#ffffff"
}
```

### Update Service Worker Cache

Edit `public/service-worker.js`:

```javascript
const CACHE_NAME = "springfield-estate-v2"; // Increment version
const urlsToCache = [
  "/",
  "/index.html",
  // Add more URLs to cache
];
```

## 🎨 Where to Place the Install Button

Suggested locations:

- Settings page
- User profile menu
- Dashboard header
- Login/Signup page footer
- Dedicated "Get the App" page

Example placement in Settings:

```jsx
import InstallPwaButton from "../components/GeneralComponents/InstallPwaButton";

function SettingsScreen() {
  return (
    <div>
      <h2>App Settings</h2>

      <div className="settings-section">
        <h3>Install App</h3>
        <p>Install SpringField Estate on your device for quick access</p>
        <InstallPwaButton />
      </div>
    </div>
  );
}
```

## ⚠️ Important Notes

1. **HTTPS Required**: PWA features only work on HTTPS (or localhost for development)
2. **iOS Limitations**: iOS has limited PWA support compared to Android
3. **Browser Support**: Not all browsers support all PWA features
4. **Icon Sizes**: All icon sizes are required for proper display across devices

## 🐛 Common Issues

### Issue: Install button doesn't show

- **Solution**: Make sure you're testing on HTTPS or localhost
- **Solution**: Check that service worker is registered
- **Solution**: Clear browser cache and reload

### Issue: Icons not showing

- **Solution**: Verify icons exist in `public/icons/` folder
- **Solution**: Check manifest.json paths are correct
- **Solution**: Clear application cache in DevTools

### Issue: App doesn't install

- **Solution**: Check browser console for errors
- **Solution**: Run Lighthouse audit to identify issues
- **Solution**: Ensure manifest.json is valid JSON

## 📚 Additional Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)

## ✅ Quick Start Checklist

1. [ ] Generate PWA icons using the web tool or Node script
2. [ ] Place icons in `public/icons/` folder
3. [ ] Test app installation on your device
4. [ ] Add `<InstallPwaButton />` to desired pages
5. [ ] Test the info modal and installation process
6. [ ] Deploy to production (HTTPS required)
7. [ ] Test installation on production site

---

**Need Help?** Contact the development team or refer to the documentation above.
