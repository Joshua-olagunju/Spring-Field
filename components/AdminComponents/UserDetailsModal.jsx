import { Icon } from "@iconify/react";

const UserDetailsModal = ({ user, theme, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  // Calculate payment status color and icon
  const getPaymentStatusInfo = (paymentCount) => {
    if (paymentCount >= 10) {
      return {
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900",
        textColor: "text-green-800 dark:text-green-200",
        icon: "mdi:check-circle",
        label: "On Track",
      };
    } else if (paymentCount >= 6) {
      return {
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900",
        textColor: "text-yellow-800 dark:text-yellow-200",
        icon: "mdi:alert",
        label: "Behind",
      };
    } else {
      return {
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900",
        textColor: "text-red-800 dark:text-red-200",
        icon: "mdi:alert-circle",
        label: "Overdue",
      };
    }
  };

  const paymentInfo = getPaymentStatusInfo(user.payment_count || 0);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold ${theme.text.primary}`}>
              User Details
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${theme.background.input} hover:${theme.background.card} transition-colors`}
            >
              <Icon
                icon="mdi:close"
                className={`text-lg ${theme.text.secondary}`}
              />
            </button>
          </div>

          {/* User Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className={`font-semibold ${theme.text.primary} mb-3`}>
                Basic Information
              </h4>
              <div className="space-y-3">
                <DetailItem
                  icon="mdi:account"
                  label="Full Name"
                  value={user.full_name || user.name || "N/A"}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:email"
                  label="Email Address"
                  value={user.email || "N/A"}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:phone"
                  label="Phone Number"
                  value={user.phone || "N/A"}
                  theme={theme}
                />
              </div>
            </div>

            {/* Housing Info */}
            <div>
              <h4 className={`font-semibold ${theme.text.primary} mb-3`}>
                Housing Information
              </h4>
              <div className="space-y-3">
                <DetailItem
                  icon="mdi:home"
                  label="House Number"
                  value={
                    user.house_number || user.houseNumber || "Not Assigned"
                  }
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:home-variant"
                  label="House Type"
                  value={user.house_type || "N/A"}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:map-marker"
                  label="Address"
                  value={user.address || "N/A"}
                  theme={theme}
                />
                {/* Payment Count with Status */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon
                      icon="mdi:cash-multiple"
                      className={`text-base ${theme.text.tertiary}`}
                    />
                    <span
                      className={`text-xs font-medium ${theme.text.secondary}`}
                    >
                      Payment Progress
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${paymentInfo.color}`}>
                      {user.payment_count || 0}/12
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${paymentInfo.bgColor} ${paymentInfo.textColor}`}
                    >
                      <Icon icon={paymentInfo.icon} className="text-sm" />
                      {paymentInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div>
              <h4 className={`font-semibold ${theme.text.primary} mb-3`}>
                Account Information
              </h4>
              <div className="space-y-3">
                <DetailItem
                  icon="mdi:shield-account"
                  label="Role"
                  value={user.role || "Resident"}
                  theme={theme}
                />
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon
                      icon="mdi:check-circle"
                      className={`text-base ${theme.text.tertiary}`}
                    />
                    <span
                      className={`text-xs font-medium ${theme.text.secondary}`}
                    >
                      Account Status
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      user.status === "active"
                        ? theme.status.success
                        : theme.status.error
                    }`}
                  >
                    <Icon
                      icon={
                        user.status === "active"
                          ? "mdi:check-circle"
                          : "mdi:close-circle"
                      }
                      className="text-sm"
                    />
                    {user.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <DetailItem
                  icon="mdi:calendar-plus"
                  label="Date Joined"
                  value={
                    user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"
                  }
                  theme={theme}
                />
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
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
    <p className={`text-sm ${theme.text.primary}`}>{value}</p>
  </div>
);

export default UserDetailsModal;
