import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTheme } from "../../../../context/useTheme";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      setError("Please enter your current password");
      return;
    }
    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    
    // Check password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_])[A-Za-z\d@$!%*?&\-_]*$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/settings/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: confirmPassword,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess("");
        }, 2000);
      } else {
        setError(result.message || "Failed to change password");
      }
    } catch (err) {
      setError("Error changing password. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Icon icon="mdi:lock-reset" className="text-3xl text-green-600" />
          </div>

          {/* Title */}
          <h2
            className={`text-xl font-bold ${theme.text.primary} mb-2 text-center`}
          >
            Change Password
          </h2>

          {/* Description */}
          <p className={`text-sm ${theme.text.secondary} mb-6 text-center`}>
            Enter your current password and choose a new one
          </p>

          {/* Form */}
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label
                className={`block text-sm font-medium ${theme.text.primary} mb-2`}
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter current password"
                  className={`w-full px-4 py-2 pr-10 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-green-500 transition-colors`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.text.secondary} hover:${theme.text.primary}`}
                >
                  <Icon
                    icon={showCurrentPassword ? "mdi:eye-off" : "mdi:eye"}
                    className="text-lg"
                  />
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                className={`block text-sm font-medium ${theme.text.primary} mb-2`}
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-2 pr-10 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-green-500 transition-colors`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.text.secondary} hover:${theme.text.primary}`}
                >
                  <Icon
                    icon={showNewPassword ? "mdi:eye-off" : "mdi:eye"}
                    className="text-lg"
                  />
                </button>
              </div>
              <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                At least 6 characters
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                className={`block text-sm font-medium ${theme.text.primary} mb-2`}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2 pr-10 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-green-500 transition-colors`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.text.secondary} hover:${theme.text.primary}`}
                >
                  <Icon
                    icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                    className="text-lg"
                  />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-300">
                <p className="text-xs text-red-800 flex items-center gap-2">
                  <Icon icon="mdi:alert-circle" />
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 rounded-lg bg-green-100 border border-green-300">
                <p className="text-xs text-green-800 flex items-center gap-2">
                  <Icon icon="mdi:check-circle" />
                  {success}
                </p>
              </div>
            )}

            {/* Info Box */}
            <div
              className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
            >
              <p className={`text-xs font-medium ${theme.text.secondary} mb-2`}>
                🔐 Password Requirements:
              </p>
              <ul
                className={`text-xs ${theme.text.secondary} space-y-1 list-disc list-inside`}
              >
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character (@$!%*?&-_)</li>
                <li>Different from your current password</li>
                <li>Passwords must match</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-300 dark:border-gray-600">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={
                isLoading ||
                !currentPassword.trim() ||
                !newPassword.trim() ||
                !confirmPassword.trim()
              }
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Icon icon="mdi:check" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
