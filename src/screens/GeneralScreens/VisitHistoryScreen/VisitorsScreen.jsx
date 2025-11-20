import { useState, useEffect } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { API_BASE_URL } from "../../../config/apiConfig";

const VisitorsScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken } = useUser();
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch visitor entries from API
  useEffect(() => {
    const fetchVisitorEntries = async () => {
      try {
        setIsLoading(true);
        // For admin users, fetch all entries; for regular users, fetch their entries
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const endpoint =
          user.role === "admin" || user.role === "super_admin"
            ? `${API_BASE_URL}/api/visitor-tokens/all-entries`
            : `${API_BASE_URL}/api/visitor-tokens/my-entries`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              authToken || localStorage.getItem("authToken")
            }`,
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setVisitors(result.data.entries || []);
        } else {
          console.error("Failed to fetch visitor entries:", result.message);
        }
      } catch (error) {
        console.error("Error fetching visitor entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitorEntries();
  }, [authToken]);

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
              Visitors Log
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              Complete history of all visitor entries and token usage
            </p>
          </div>

          {/* Visitor Cards */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon
                  icon="mdi:loading"
                  className={`animate-spin text-4xl ${theme.text.tertiary}`}
                />
              </div>
            ) : visitors.length === 0 ? (
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
                        {visitor.visitor_name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <p
                          className={`text-xs sm:text-sm ${theme.text.secondary} truncate`}
                        >
                          Host: {visitor.resident_name} • {visitor.house_number}
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
                            {formatTime(visitor.entered_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:logout"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span
                            className={`text-xs sm:text-sm ${
                              visitor.is_active
                                ? "text-green-600 font-medium"
                                : theme.text.secondary
                            }`}
                          >
                            {visitor.exited_at
                              ? formatTime(visitor.exited_at)
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
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
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
                  {selectedVisitor.visitor_name}
                </h3>
                <p className={`text-sm ${theme.text.secondary}`}>
                  Visiting {selectedVisitor.resident_name}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <DetailItem
                  icon="mdi:phone"
                  label="Phone"
                  value={selectedVisitor.visitor_phone || "N/A"}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:home"
                  label="House"
                  value={selectedVisitor.house_number}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:account"
                  label="Host"
                  value={selectedVisitor.resident_name}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:shield-account"
                  label="Guard"
                  value={selectedVisitor.guard_name || "N/A"}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:clock"
                  label="Duration"
                  value={
                    selectedVisitor.duration_minutes
                      ? `${Math.floor(
                          selectedVisitor.duration_minutes / 60
                        )}h ${selectedVisitor.duration_minutes % 60}m`
                      : "Currently Active"
                  }
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:calendar"
                  label="Date"
                  value={format(
                    new Date(selectedVisitor.entered_at),
                    "MMM dd, yyyy"
                  )}
                  theme={theme}
                />
              </div>

              {/* Notes */}
              {selectedVisitor.note && (
                <div className="mt-4">
                  <h4
                    className={`text-sm font-medium ${theme.text.secondary} mb-1`}
                  >
                    Additional Notes
                  </h4>
                  <p className={`text-sm ${theme.text.primary}`}>
                    {selectedVisitor.note}
                  </p>
                </div>
              )}
            </div>

            {/* Status Footer */}
            <div
              className={`${
                selectedVisitor.is_active
                  ? "bg-green-50"
                  : theme.background.input
              } px-6 py-4 rounded-b-2xl border-t ${
                theme.border.secondary
              } flex items-center justify-between`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  icon={
                    selectedVisitor.is_active
                      ? "mdi:check-circle"
                      : "mdi:check-circle"
                  }
                  className={`text-xl ${
                    selectedVisitor.is_active
                      ? "text-green-600"
                      : theme.text.tertiary
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    selectedVisitor.is_active
                      ? "text-green-700"
                      : theme.text.secondary
                  }`}
                >
                  {selectedVisitor.is_active
                    ? "Currently on premises"
                    : "Visit completed"}
                </span>
              </div>
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
