import { useState } from "react";
import { useTheme } from "../../../../context/useTheme";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

const VisitorsScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dummy data (replace with API call)
  const visitors = [
    {
      id: 1,
      name: "John Smith",
      phone: "+234 812 345 6789",
      purpose: "Family Visit",
      unit: "Block A, Unit 12",
      signIn: "2025-11-10T09:30:00",
      signOut: "2025-11-10T14:45:00",
      status: "completed",
      host: "Mrs. Williams",
      vehicleDetails: "Toyota Camry (White) - LAG 123 XY",
      idType: "Driver's License",
      notes: "Regular visitor, host's brother",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      phone: "+234 803 987 6543",
      purpose: "Maintenance Work",
      unit: "Block C, Unit 5",
      signIn: "2025-11-10T11:15:00",
      signOut: null,
      status: "active",
      host: "Mr. Thompson",
      vehicleDetails: "None (Walked in)",
      idType: "Work ID",
      notes: "Plumbing repairs in kitchen",
    },
  ];

  const handleCardClick = (visitor) => {
    setSelectedVisitor(visitor);
    setIsModalOpen(true);
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), "hh:mm a");
  };

  return (
    <div className="min-h-screen pt-16 pb-20 w-full relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: isDarkMode
            ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))"
            : "linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246), rgb(249, 250, 251))",
        }}
      />

      {/* Content */}
      <div className="w-full px-0">
        <div className="max-w-full mx-auto px-0 md:px-4">
          {/* Header */}
          <div className="mb-6">
            <h1
              className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
            >
              Visitor History
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              View all verified visitor entries
            </p>
          </div>

          {/* Visitor Cards */}
          <div className="space-y-4">
            {visitors.length === 0 ? (
              <div
                className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-8 sm:p-12 text-center`}
              >
                <Icon
                  icon="mdi:clipboard-text-clock-outline"
                  className={`text-6xl ${theme.text.tertiary} mb-4 mx-auto`}
                />
                <p className={`text-base ${theme.text.secondary} mb-1`}>
                  No visitor records yet
                </p>
                <p className={`text-sm ${theme.text.tertiary}`}>
                  Your verified visitor entries will appear here
                </p>
              </div>
            ) : (
              visitors.map((visitor) => (
                <button
                  key={visitor.id}
                  onClick={() => handleCardClick(visitor)}
                  className={`w-full ${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-5 hover:${theme.shadow.medium} transition-all text-left border ${theme.border.secondary} hover:border-blue-500`}
                >
                  <div className="flex items-center gap-4">
                    {/* Left: Avatar & Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold ${theme.text.primary} mb-1 text-base sm:text-lg truncate`}
                      >
                        {visitor.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <p
                          className={`text-xs sm:text-sm ${theme.text.secondary} truncate`}
                        >
                          {visitor.purpose} • {visitor.unit}
                        </p>
                      </div>
                    </div>

                    {/* Right: Times & Status */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:login"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span
                            className={`text-xs sm:text-sm ${theme.text.secondary}`}
                          >
                            {formatTime(visitor.signIn)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:logout"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span
                            className={`text-xs sm:text-sm ${
                              visitor.status === "active"
                                ? "text-green-600 font-medium"
                                : theme.text.secondary
                            }`}
                          >
                            {visitor.signOut
                              ? formatTime(visitor.signOut)
                              : "Active"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div
            className={`${theme.background.card} w-full max-w-lg rounded-2xl ${theme.shadow.large} relative`}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute right-4 top-4 p-2 rounded-full hover:${theme.background.input} transition-colors`}
            >
              <Icon
                icon="mdi:close"
                className={`text-xl ${theme.text.tertiary}`}
              />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2
                className={`text-xl sm:text-2xl font-bold ${theme.text.primary}`}
              >
                Visitor Details
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Name & Purpose */}
              <div>
                <h3
                  className={`text-lg font-semibold ${theme.text.primary} mb-1`}
                >
                  {selectedVisitor.name}
                </h3>
                <p className={`text-sm ${theme.text.secondary}`}>
                  {selectedVisitor.purpose}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <DetailItem
                  icon="mdi:phone"
                  label="Phone"
                  value={selectedVisitor.phone}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:home"
                  label="Unit"
                  value={selectedVisitor.unit}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:account"
                  label="Host"
                  value={selectedVisitor.host}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:car"
                  label="Vehicle"
                  value={selectedVisitor.vehicleDetails}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:card-account-details"
                  label="ID Type"
                  value={selectedVisitor.idType}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:clock"
                  label="Duration"
                  value={
                    selectedVisitor.signOut
                      ? "5 hours 15 mins"
                      : "Currently Active"
                  }
                  theme={theme}
                />
              </div>

              {/* Notes */}
              {selectedVisitor.notes && (
                <div className="mt-4">
                  <h4
                    className={`text-sm font-medium ${theme.text.secondary} mb-1`}
                  >
                    Additional Notes
                  </h4>
                  <p className={`text-sm ${theme.text.primary}`}>
                    {selectedVisitor.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Status Footer */}
            <div
              className={`${
                selectedVisitor.status === "active"
                  ? "bg-green-50"
                  : theme.background.input
              } px-6 py-4 rounded-b-2xl border-t ${
                theme.border.secondary
              } flex items-center justify-between`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  icon={
                    selectedVisitor.status === "active"
                      ? "mdi:check-circle"
                      : "mdi:check-circle"
                  }
                  className={`text-xl ${
                    selectedVisitor.status === "active"
                      ? "text-green-600"
                      : theme.text.tertiary
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    selectedVisitor.status === "active"
                      ? "text-green-700"
                      : theme.text.secondary
                  }`}
                >
                  {selectedVisitor.status === "active"
                    ? "Currently on premises"
                    : "Visit completed"}
                </span>
              </div>
              <button
                className={`text-xs ${theme.text.link} hover:${theme.text.linkHover}`}
              >
                View Full Log
              </button>
            </div>
          </div>
        </div>
      )}
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

export default VisitorsScreen;
