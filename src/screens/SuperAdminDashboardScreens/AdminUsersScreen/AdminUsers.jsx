import { useState, useEffect } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import AdminUsersActions from "./AdminUsersActions";
import { GenerateUserTokenModal } from "../../AdminDashboardScreens/TokenGenerationModals";
import { API_BASE_URL } from "../../../config/apiConfig";

const AdminUsers = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Fetch admins/landlords from API
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/super-admin/landlords`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                authToken || localStorage.getItem("authToken")
              }`,
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setAdmins(result.data || []);
        } else {
          console.error("Failed to fetch admins:", result.message);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [authToken]);

  // Handle token generation for specific admin
  const handleGenerateTokenForAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowTokenModal(true);
  };

  const handleTokenModalClose = () => {
    setShowTokenModal(false);
    setSelectedAdmin(null);
  };

  // Refresh admins list (for use by child components)
  const refreshAdmins = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/landlords`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              authToken || localStorage.getItem("authToken")
            }`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setAdmins(result.data || []);
      }
    } catch (error) {
      console.error("Error refreshing admins:", error);
    }
  };

  // Filter admins based on search query
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone?.includes(searchQuery) ||
      admin.house_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1
              className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
            >
              Manage Admins
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              View and manage all administrator accounts
            </p>
          </div>
          {/* Sticky Search Bar */}
          <div
            className="sticky top-16 z-999 pb-6 mb-6"
            style={{
              background: isDarkMode
                ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))"
                : "linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246), rgb(249, 250, 251))",
            }}
          >
            <div className="pt-4">
              <div
                className={`relative max-w-md flex items-center gap-1 px-3 py-2 rounded-lg ${theme.background.card} ${theme.shadow.small} border ${theme.border.secondary}`}
              >
                <Icon
                  icon="mdi:magnify"
                  className={`text-lg ${theme.text.tertiary}`}
                />

                <input
                  type="text"
                  placeholder="Search admins…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`flex-1 bg-transparent text-sm ${theme.text.primary} placeholder-current placeholder-opacity-40 outline-none`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`p-1 rounded-full hover:${theme.background.secondary} transition-colors`}
                  >
                    <Icon
                      icon="mdi:close"
                      className={`text-sm ${theme.text.tertiary}`}
                    />
                  </button>
                )}
              </div>

              {/* Search Results Count */}
              {searchQuery && (
                <div className="mt-2 px-1">
                  <span className={`text-sm ${theme.text.secondary}`}>
                    Found {filteredAdmins.length} of {admins.length}{" "}
                    administrators
                  </span>
                </div>
              )}
            </div>
          </div>{" "}
          {/* Total Admins Stat Card */}
          <div
            className={`${theme.background.card} rounded-2xl ${theme.shadow.medium} p-6 sm:p-8 mb-8`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm sm:text-base ${theme.text.secondary} mb-2`}
                >
                  Total Administrators
                </p>
                <p
                  className={`text-3xl sm:text-4xl font-bold ${theme.text.primary}`}
                >
                  {filteredAdmins.length}
                </p>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Icon
                  icon="mdi:shield-account-multiple"
                  className="text-white text-3xl sm:text-4xl"
                />
              </div>
            </div>
          </div>
          {/* Admin Cards List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon
                  icon="mdi:loading"
                  className={`animate-spin text-4xl ${theme.text.tertiary}`}
                />
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div
                className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-8 sm:p-12 text-center`}
              >
                <Icon
                  icon="mdi:shield-account-outline"
                  className={`text-6xl ${theme.text.tertiary} mb-4 mx-auto`}
                />
                <p className={`text-base ${theme.text.secondary} mb-1`}>
                  {searchQuery
                    ? "No administrators found"
                    : "No administrators found"}
                </p>
                <p className={`text-sm ${theme.text.tertiary}`}>
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Administrator records will appear here"}
                </p>
              </div>
            ) : (
              filteredAdmins.map((admin, index) => (
                <div
                  key={admin.id}
                  className={`w-full ${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-5 border ${theme.border.secondary} hover:border-orange-500 transition-all`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Number Badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>

                    {/* Admin Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3
                        className={`font-semibold ${theme.text.primary} text-base sm:text-lg truncate`}
                      >
                        {admin.full_name}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm ${theme.text.secondary} truncate mb-2`}
                      >
                        {admin.house_number || "No house assigned"}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            admin.status === "active"
                              ? theme.status.success
                              : admin.status === "inactive"
                              ? theme.status.error
                              : theme.status.warning
                          }`}
                        >
                          <Icon
                            icon={
                              admin.status === "active"
                                ? "mdi:check-circle"
                                : admin.status === "inactive"
                                ? "mdi:close-circle"
                                : "mdi:clock-outline"
                            }
                            className="text-sm"
                          />
                          {admin.status?.charAt(0).toUpperCase() +
                            admin.status?.slice(1) || "Unknown"}
                        </span>

                        {/* Total Users */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs sm:text-sm font-medium ${theme.text.secondary}`}
                          >
                            Users:
                          </span>
                          <span
                            className={`text-lg sm:text-xl font-bold ${theme.brand.primaryText}`}
                          >
                            {admin.residents_count || 0}
                          </span>
                        </div>

                        {/* Payment Count */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs sm:text-sm font-medium ${theme.text.secondary}`}
                          >
                            Payments:
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              admin.payment_count >=
                              admin.months_since_registration
                                ? "text-green-600 dark:text-green-400"
                                : admin.payment_count >=
                                  Math.ceil(
                                    admin.months_since_registration * 0.6
                                  )
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {admin.payment_count || 0}/
                            {admin.months_since_registration || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3-Dot Menu */}
                    <div className="flex-shrink-0">
                      <AdminUsersActions
                        theme={theme}
                        admin={admin}
                        adminIndex={index + 1}
                        onGenerateToken={() =>
                          handleGenerateTokenForAdmin(admin)
                        }
                        onAdminUpdate={refreshAdmins}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Token Generation Modal */}
      {showTokenModal && selectedAdmin && (
        <GenerateUserTokenModal
          theme={theme}
          isOpen={showTokenModal}
          onClose={handleTokenModalClose}
          adminContext={{
            id: selectedAdmin.id,
            name: selectedAdmin.full_name,
            house_number:
              selectedAdmin.house_number ||
              selectedAdmin.house?.house_number ||
              "N/A",
            address:
              selectedAdmin.address || selectedAdmin.house?.address || "N/A",
          }}
        />
      )}
    </div>
  );
};

export default AdminUsers;
