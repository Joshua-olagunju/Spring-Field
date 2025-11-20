import { useState, useEffect } from "react";
import { useUser } from "../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../src/config/apiConfig";

const RecentVisitors = ({
  theme,
  onVisitorClick,
  showViewAll = false,
  viewAllRoute = "/visitors",
}) => {
  const { authToken } = useUser();
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);

  useEffect(() => {
    const fetchRecentVisitors = async () => {
      if (!authToken) return;

      setIsLoading(true);
      try {
        // Use user dashboard stats endpoint which returns user-specific recent visitors
        const response = await fetch(
          `${API_BASE_URL}/api/visitor-tokens/user-dashboard-stats`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          // Get recent visitors from the user dashboard stats (already limited to 5)
          setRecentVisitors(result.data?.recent_visitors || []);
        } else {
          console.error("Failed to fetch recent visitors:", result.message);
        }
      } catch (error) {
        console.error("Error fetching recent visitors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentVisitors();
  }, [authToken]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50";
      case "completed":
        return "text-blue-600 bg-blue-50";
      case "expired":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return "mdi:check-circle";
      case "completed":
        return "mdi:check-all";
      case "expired":
        return "mdi:clock-alert-outline";
      default:
        return "mdi:circle";
    }
  };

  const handleVisitorClick = (visitor) => {
    setSelectedVisitor(visitor);
    setShowVisitorModal(true);
    if (onVisitorClick) {
      onVisitorClick(visitor);
    }
  };

  return (
    <div
      className={`${theme.background.card} rounded-2xl ${theme.shadow.medium} p-6 sm:p-8 mb-8`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl sm:text-2xl font-bold ${theme.text.primary}`}>
          Recent Visitors
        </h2>
        {showViewAll && (
          <a
            href={viewAllRoute}
            className={`text-sm font-medium ${theme.brand.primaryText} hover:underline`}
          >
            View All
          </a>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Icon
            icon="mdi:loading"
            className={`animate-spin text-4xl ${theme.text.tertiary}`}
          />
        </div>
      ) : recentVisitors.length === 0 ? (
        <div className="text-center py-12">
          <Icon
            icon="mdi:account-group-outline"
            className={`text-6xl ${theme.text.tertiary} mb-4 mx-auto`}
          />
          <p className={`text-base ${theme.text.secondary} mb-1`}>
            No recent visitors
          </p>
          <p className={`text-sm ${theme.text.tertiary}`}>
            Your recent visitors will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentVisitors.map((visitor) => (
            <div
              key={visitor.id}
              onClick={() => handleVisitorClick(visitor)}
              className={`${theme.background.input} rounded-xl p-4 cursor-pointer hover:${theme.shadow.small} transition-all border ${theme.border.secondary}`}
            >
              <div className="flex items-center text-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-semibold ${theme.text.primary} mb-1`}>
                    {visitor.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm ${theme.text.secondary}`}>
                      {visitor.phone}
                    </p>
                    {visitor.resident_name && (
                      <>
                        <span className={`text-sm ${theme.text.tertiary}`}>
                          •
                        </span>
                        <p className={`text-sm ${theme.text.secondary}`}>
                          {visitor.resident_name}
                        </p>
                      </>
                    )}
                    {visitor.house_number && (
                      <>
                        <span className={`text-sm ${theme.text.tertiary}`}>
                          •
                        </span>
                        <p className={`text-sm ${theme.text.secondary}`}>
                          House {visitor.house_number}
                        </p>
                      </>
                    )}
                  </div>
                  <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                    {visitor.visit_date} at {visitor.visit_time}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      visitor.status
                    )}`}
                  >
                    <Icon
                      icon={getStatusIcon(visitor.status)}
                      className="text-sm"
                    />
                    {visitor.status.charAt(0).toUpperCase() +
                      visitor.status.slice(1)}
                  </span>
                  {visitor.visit_type && (
                    <span
                      className={`text-xs ${theme.text.tertiary} capitalize`}
                    >
                      {visitor.visit_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visitor Details Modal */}
      {showVisitorModal && selectedVisitor && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowVisitorModal(false)}
          />

          <div
            className={`${theme.background.card} w-full max-w-lg rounded-2xl ${theme.shadow.large} relative`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2
                className={`text-xl sm:text-2xl font-bold ${theme.text.primary}`}
              >
                Visitor Details
              </h2>
              <button
                onClick={() => setShowVisitorModal(false)}
                className={`p-2 rounded-full hover:${theme.background.input} transition-colors`}
              >
                <Icon
                  icon="mdi:close"
                  className={`text-xl ${theme.text.tertiary}`}
                />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Visitor Name */}
                <div>
                  <label
                    className={`text-sm font-medium ${theme.text.secondary} block mb-1`}
                  >
                    Visitor Name
                  </label>
                  <p
                    className={`text-base ${theme.text.primary} font-semibold`}
                  >
                    {selectedVisitor.name}
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    className={`text-sm font-medium ${theme.text.secondary} block mb-1`}
                  >
                    Phone Number
                  </label>
                  <p className={`text-base ${theme.text.primary}`}>
                    {selectedVisitor.phone || "N/A"}
                  </p>
                </div>

                {/* Visit Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`text-sm font-medium ${theme.text.secondary} block mb-1`}
                    >
                      Visit Date
                    </label>
                    <p className={`text-base ${theme.text.primary}`}>
                      {selectedVisitor.visit_date}
                    </p>
                  </div>
                  <div>
                    <label
                      className={`text-sm font-medium ${theme.text.secondary} block mb-1`}
                    >
                      Visit Time
                    </label>
                    <p className={`text-base ${theme.text.primary}`}>
                      {selectedVisitor.visit_time}
                    </p>
                  </div>
                </div>

                {/* Visit Type */}
                {selectedVisitor.visit_type && (
                  <div>
                    <label
                      className={`text-sm font-medium ${theme.text.secondary} block mb-1`}
                    >
                      Visit Type
                    </label>
                    <p className={`text-base ${theme.text.primary} capitalize`}>
                      {selectedVisitor.visit_type}
                    </p>
                  </div>
                )}

                {/* Resident Info */}
                {selectedVisitor.resident_name && (
                  <div>
                    <label
                      className={`text-sm font-medium ${theme.text.secondary} block mb-1`}
                    >
                      Host/Resident
                    </label>
                    <p className={`text-base ${theme.text.primary}`}>
                      {selectedVisitor.resident_name}
                      {selectedVisitor.house_number && (
                        <span
                          className={`text-sm ${theme.text.secondary} ml-2`}
                        >
                          (House {selectedVisitor.house_number})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label
                    className={`text-sm font-medium ${theme.text.secondary} block mb-1`}
                  >
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(
                      selectedVisitor.status
                    )}`}
                  >
                    <Icon
                      icon={getStatusIcon(selectedVisitor.status)}
                      className="text-base"
                    />
                    {selectedVisitor.status.charAt(0).toUpperCase() +
                      selectedVisitor.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowVisitorModal(false)}
                  className={`px-6 py-2 rounded-lg ${theme.background.secondary} ${theme.text.primary} hover:${theme.background.input} transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentVisitors;
