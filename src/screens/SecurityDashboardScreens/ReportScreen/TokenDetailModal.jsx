import { Icon } from "@iconify/react";
import { useState } from "react";
import { API_BASE_URL } from "../../../config/apiConfig";
import useStore from "../../../store/useStore";

const TokenDetailModal = ({ theme, isOpen, onClose, tokenData }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  if (!isOpen || !tokenData) return null;

  // Check if current user is security personnel
  const userData = useStore.getState().user;
  const isSecurity = userData?.role === "security";

  // Calculate actual status based on token data
  const calculateStatus = () => {
    if (tokenData.status) {
      return tokenData.status; // Use pre-calculated status if available
    }

    // Calculate based on exits and expiration
    if (!tokenData.exited_at) {
      // Visitor hasn't exited yet
      if (tokenData.expires_at) {
        const isExpired = new Date(tokenData.expires_at) < new Date();
        return isExpired ? "expired_active" : "active";
      }
      return "active";
    }
    return "inactive";
  };

  const actualStatus = calculateStatus();

  // Calculate duration
  const calculateDuration = () => {
    if (!tokenData.entered_at && !tokenData.dateIssued) return "N/A";

    const enteredAt = new Date(tokenData.entered_at || tokenData.dateIssued);
    const exitedAt = tokenData.exited_at
      ? new Date(tokenData.exited_at)
      : new Date();

    const diffMinutes = Math.floor((exitedAt - enteredAt) / 1000 / 60);

    if (diffMinutes < 60) {
      return `${diffMinutes} mins`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "expired":
      case "expired_active":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "mdi:check-circle";
      case "inactive":
      case "completed":
        return "mdi:close-circle";
      case "expired":
      case "expired_active":
        return "mdi:clock-alert";
      default:
        return "mdi:help-circle";
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutMessage("");

    try {
      const authToken = useStore.getState().authToken;
      const response = await fetch(
        `${API_BASE_URL}/api/visitor-tokens/exit-visitor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            entry_id: tokenData.id,
            note: "Checked out via Token Details modal",
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setCheckoutMessage("✅ Visitor checked out successfully!");
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to update the list
        }, 1500);
      } else {
        setCheckoutMessage(
          `❌ ${result.message || "Failed to checkout visitor"}`
        );
      }
    } catch {
      setCheckoutMessage("❌ Network error. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`${theme.background.card} w-full max-w-2xl rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Icon
                  icon="mdi:account-details"
                  className="text-white text-2xl"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Token Details</h2>
                <p className="text-white/80 text-sm">
                  Visitor Entry Information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Icon icon="mdi:close" className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                actualStatus
              )}`}
            >
              <Icon icon={getStatusIcon(actualStatus)} className="text-lg" />
              <span className="capitalize">
                {actualStatus === "expired_active"
                  ? "Expired Active"
                  : actualStatus}
              </span>
            </span>
          </div>

          {/* Visitor Information */}
          <div>
            <h3
              className={`text-lg font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}
            >
              <Icon
                icon="mdi:account"
                className="text-blue-600 dark:text-blue-400"
              />
              Visitor Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem
                icon="mdi:account-outline"
                label="Visitor Name"
                value={tokenData.visitor_name || tokenData.visitorName || "N/A"}
                theme={theme}
              />
              <DetailItem
                icon="mdi:phone"
                label="Visitor Phone"
                value={
                  tokenData.visitor_phone || tokenData.visitorPhone || "N/A"
                }
                theme={theme}
              />
            </div>
          </div>

          {/* Host Information */}
          <div>
            <h3
              className={`text-lg font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}
            >
              <Icon
                icon="mdi:home-account"
                className="text-purple-600 dark:text-purple-400"
              />
              Host Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem
                icon="mdi:account-tie"
                label="Resident Name"
                value={tokenData.resident_name || tokenData.resident || "N/A"}
                theme={theme}
              />
              <DetailItem
                icon="mdi:phone-outline"
                label="Resident Phone"
                value={tokenData.resident_phone || "N/A"}
                theme={theme}
              />
              <DetailItem
                icon="mdi:home"
                label="House Number"
                value={tokenData.house_number || tokenData.house || "N/A"}
                theme={theme}
              />
              <DetailItem
                icon="mdi:map-marker"
                label="Address"
                value={tokenData.address || "N/A"}
                theme={theme}
              />
            </div>
          </div>

          {/* Visit Details */}
          <div>
            <h3
              className={`text-lg font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}
            >
              <Icon
                icon="mdi:calendar-clock"
                className="text-green-600 dark:text-green-400"
              />
              Visit Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem
                icon="mdi:calendar-arrow-right"
                label="Entry Time"
                value={formatDate(tokenData.entered_at || tokenData.dateIssued)}
                theme={theme}
              />
              <DetailItem
                icon="mdi:calendar-arrow-left"
                label="Exit Time"
                value={
                  tokenData.exited_at
                    ? formatDate(tokenData.exited_at)
                    : tokenData.status === "active"
                    ? "Still on premises"
                    : "N/A"
                }
                theme={theme}
              />
              <DetailItem
                icon="mdi:clock-outline"
                label="Duration"
                value={calculateDuration()}
                theme={theme}
              />
              <DetailItem
                icon="mdi:clock-alert-outline"
                label="Token Expires"
                value={formatDate(tokenData.expires_at || tokenData.expiryDate)}
                theme={theme}
              />
            </div>
          </div>

          {/* Security Information - Only visible to security personnel */}
          {isSecurity && tokenData.guard_name && (
            <div>
              <h3
                className={`text-lg font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}
              >
                <Icon
                  icon="mdi:shield-account"
                  className="text-orange-600 dark:text-orange-400"
                />
                Security Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <DetailItem
                  icon="mdi:account-star"
                  label="Verified By"
                  value={tokenData.guard_name}
                  theme={theme}
                />
              </div>
            </div>
          )}

          {/* Additional Notes - Only visible to security personnel */}
          {isSecurity && tokenData.note && (
            <div>
              <h3
                className={`text-lg font-bold ${theme.text.primary} mb-4 flex items-center gap-2`}
              >
                <Icon
                  icon="mdi:note-text"
                  className="text-indigo-600 dark:text-indigo-400"
                />
                Notes
              </h3>
              <div
                className={`${theme.background.secondary} p-4 rounded-lg border ${theme.border.secondary}`}
              >
                <p className={`text-sm ${theme.text.primary}`}>
                  {tokenData.note}
                </p>
              </div>
            </div>
          )}

          {/* Token ID */}
          <div
            className={`${theme.background.secondary} p-4 rounded-lg border ${theme.border.secondary}`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs ${theme.text.secondary}`}>
                Token ID
              </span>
              <span
                className={`font-mono text-sm font-semibold ${theme.text.primary}`}
              >
                #{tokenData.id || tokenData.token_id || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`sticky bottom-0 ${theme.background.card} p-6 rounded-b-2xl border-t ${theme.border.secondary}`}
        >
          {checkoutMessage && (
            <div
              className={`mb-3 text-center text-sm font-medium ${
                checkoutMessage.includes("✅")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {checkoutMessage}
            </div>
          )}

          {isSecurity &&
          (actualStatus === "expired_active" ||
            actualStatus === "expired" ||
            actualStatus === "active") &&
          !tokenData.exited_at ? (
            <div className="flex gap-2">
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                  isCheckingOut ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isCheckingOut ? (
                  <>
                    <Icon icon="mdi:loading" className="text-xl animate-spin" />
                    Logging Out...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:logout" className="text-xl" />
                    Checkout Visitor
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isCheckingOut}
                className={`px-6 py-3 rounded-xl ${
                  theme.background.secondary
                } ${
                  theme.text.primary
                } font-semibold transition-all active:scale-95 border ${
                  theme.border.secondary
                } hover:${theme.background.card} ${
                  isCheckingOut ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:check" className="text-xl" />
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for modal details
const DetailItem = ({ icon, label, value, theme }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1">
      <Icon icon={icon} className={`text-base ${theme.text.tertiary}`} />
      <span className={`text-xs font-medium ${theme.text.secondary}`}>
        {label}
      </span>
    </div>
    <p className={`text-sm font-semibold ${theme.text.primary}`}>{value}</p>
  </div>
);

export default TokenDetailModal;
