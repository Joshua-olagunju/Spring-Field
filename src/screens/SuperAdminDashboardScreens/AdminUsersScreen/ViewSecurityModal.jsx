import { Icon } from "@iconify/react";

const ViewSecurityModal = ({
  theme,
  security,
  securityIndex,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl ${theme.background.card} rounded-2xl ${theme.shadow.large} overflow-hidden`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  #{securityIndex}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Security Personnel Details
                </h2>
                <p className="text-sm text-white/80">Complete information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Icon icon="mdi:close" className="text-2xl text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h3
                className={`text-sm font-semibold ${theme.text.tertiary} mb-3 uppercase tracking-wide`}
              >
                Personal Information
              </h3>
              <div className="space-y-3">
                <InfoItem
                  theme={theme}
                  icon="mdi:account"
                  label="Full Name"
                  value={security.full_name || "N/A"}
                />
                <InfoItem
                  theme={theme}
                  icon="mdi:phone"
                  label="Phone Number"
                  value={security.phone || "N/A"}
                />
                <InfoItem
                  theme={theme}
                  icon="mdi:email"
                  label="Email"
                  value={security.email || "Not provided"}
                />
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3
                className={`text-sm font-semibold ${theme.text.tertiary} mb-3 uppercase tracking-wide`}
              >
                Account Information
              </h3>
              <div className="space-y-3">
                <InfoItem
                  theme={theme}
                  icon="mdi:shield-account"
                  label="Role"
                  value="Security"
                />
                <InfoItem
                  theme={theme}
                  icon="mdi:calendar"
                  label="Registration Date"
                  value={new Date(security.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                />
                <div>
                  <p
                    className={`text-xs ${theme.text.secondary} mb-1 flex items-center gap-2`}
                  >
                    <Icon icon="mdi:check-circle" className="text-base" />
                    Account Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      security.status_active
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    <Icon
                      icon={
                        security.status_active
                          ? "mdi:check-circle"
                          : "mdi:close-circle"
                      }
                      className="text-base"
                    />
                    {security.status_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="md:col-span-2">
              <h3
                className={`text-sm font-semibold ${theme.text.tertiary} mb-3 uppercase tracking-wide`}
              >
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoItem
                  theme={theme}
                  icon="mdi:clock-outline"
                  label="Last Login"
                  value={
                    security.last_login_at
                      ? new Date(security.last_login_at).toLocaleString()
                      : "Never"
                  }
                />
                <InfoItem
                  theme={theme}
                  icon="mdi:identifier"
                  label="User ID"
                  value={`#${security.id}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${theme.border.secondary}`}>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ theme, icon, label, value }) => (
  <div>
    <p
      className={`text-xs ${theme.text.secondary} mb-1 flex items-center gap-2`}
    >
      <Icon icon={icon} className="text-base" />
      {label}
    </p>
    <p className={`text-sm font-medium ${theme.text.primary}`}>{value}</p>
  </div>
);

export default ViewSecurityModal;
