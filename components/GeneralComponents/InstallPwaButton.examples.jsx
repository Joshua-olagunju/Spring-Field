/**
 * EXAMPLE: How to Use InstallPwaButton Component
 *
 * This file shows examples of how to integrate the PWA install button
 * into different pages of your application.
 */

import InstallPwaButton from "../components/GeneralComponents/InstallPwaButton";
import { useTheme } from "../context/useTheme";

// ============================================
// EXAMPLE 1: Settings Page
// ============================================
function SettingsPageExample() {
  const { theme } = useTheme();

  return (
    <div className={`p-6 ${theme.background.primary}`}>
      <h1 className={`text-2xl font-bold mb-6 ${theme.text.primary}`}>
        Settings
      </h1>

      {/* Other settings sections... */}

      {/* Install App Section */}
      <div
        className={`mb-6 p-6 rounded-lg ${theme.background.card} ${theme.shadow.medium}`}
      >
        <h2 className={`text-xl font-semibold mb-3 ${theme.text.primary}`}>
          📱 Install App
        </h2>
        <p className={`mb-4 ${theme.text.secondary}`}>
          Get quick access to SpringField Estate by installing it on your
          device. Works offline and provides a native app experience.
        </p>
        <InstallPwaButton />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Dashboard with Floating Button
// ============================================
function DashboardExample() {
  return (
    <div className="relative">
      {/* Dashboard content... */}

      {/* Floating Install Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <InstallPwaButton buttonText="Get App" className="shadow-2xl" />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Login/Signup Footer
// ============================================
function LoginPageExample() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Login form... */}

      {/* Footer with Install Button */}
      <div
        className={`mt-auto p-6 border-t ${theme.border.secondary} text-center`}
      >
        <p className={`mb-4 ${theme.text.secondary}`}>
          Install SpringField Estate for faster access
        </p>
        <InstallPwaButton className="mx-auto" />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 4: User Profile Menu Dropdown
// ============================================
function ProfileDropdownExample() {
  const { theme } = useTheme();

  return (
    <div
      className={`w-64 rounded-lg ${theme.background.card} ${theme.shadow.large}`}
    >
      {/* Other menu items... */}

      <div className={`p-4 border-t ${theme.border.secondary}`}>
        <InstallPwaButton buttonText="Install App" className="w-full" />
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Dedicated "Get the App" Page
// ============================================
function GetAppPageExample() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${theme.background.primary} flex items-center justify-center p-6`}
    >
      <div
        className={`max-w-2xl w-full text-center p-12 rounded-2xl ${theme.background.card} ${theme.shadow.large}`}
      >
        <div className="text-6xl mb-6">📱</div>

        <h1 className={`text-4xl font-bold mb-4 ${theme.text.primary}`}>
          Get the SpringField Estate App
        </h1>

        <p className={`text-lg mb-8 ${theme.text.secondary}`}>
          Install our Progressive Web App for a fast, native-like experience
          with offline access and quick loading.
        </p>

        <div className="mb-8">
          <InstallPwaButton
            buttonText="Install Now"
            className="justify-center text-lg"
          />
        </div>

        <div className={`grid grid-cols-3 gap-6 mt-12 ${theme.text.secondary}`}>
          <div>
            <div className="text-3xl mb-2">⚡</div>
            <p className="font-semibold">Lightning Fast</p>
          </div>
          <div>
            <div className="text-3xl mb-2">📴</div>
            <p className="font-semibold">Works Offline</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🔒</div>
            <p className="font-semibold">Secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Banner at Top of Dashboard
// ============================================
function DashboardBannerExample() {
  const { theme } = useTheme();

  return (
    <div>
      {/* Install Banner */}
      <div
        className={`mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between`}
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl">📱</div>
          <div>
            <h3 className="font-semibold">Install SpringField Estate</h3>
            <p className="text-sm opacity-90">
              Get quick access from your home screen
            </p>
          </div>
        </div>
        <InstallPwaButton buttonText="Install" />
      </div>

      {/* Rest of dashboard... */}
    </div>
  );
}

// ============================================
// EXAMPLE 7: Custom Styled Button
// ============================================
function CustomStyledExample() {
  return (
    <InstallPwaButton
      buttonText="📥 Download App"
      className="transform hover:scale-110 transition-transform"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "12px 24px",
        fontSize: "16px",
        fontWeight: "bold",
      }}
    />
  );
}

// ============================================
// EXAMPLE 8: Simple Inline Usage
// ============================================
function SimpleExample() {
  return (
    <div className="p-4">
      <h2 className="mb-4">Welcome to SpringField Estate</h2>
      <p className="mb-4">Install our app for the best experience:</p>
      <InstallPwaButton />
    </div>
  );
}

export {
  SettingsPageExample,
  DashboardExample,
  LoginPageExample,
  ProfileDropdownExample,
  GetAppPageExample,
  DashboardBannerExample,
  CustomStyledExample,
  SimpleExample,
};
