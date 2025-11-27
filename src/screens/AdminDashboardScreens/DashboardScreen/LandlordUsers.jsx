import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../../config/apiConfig";
import LandlordUsersActions from "./LandlordUsersActions";

const LandlordUsers = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch users and payment stats from API
  const fetchData = useCallback(
    async (page = currentPage) => {
      try {
        setIsLoading(true);

        // Fetch users
        const usersResponse = await fetch(
          `${API_BASE_URL}/api/landlord/users?page=${page}&per_page=20`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const usersResult = await usersResponse.json();

        if (usersResponse.ok && usersResult.success) {
          // Check if data is paginated
          if (usersResult.data.data) {
            setUsers(usersResult.data.data || []);
            setPagination({
              current_page: usersResult.data.current_page,
              last_page: usersResult.data.last_page,
              total: usersResult.data.total,
              per_page: usersResult.data.per_page,
            });
          } else {
            setUsers(usersResult.data || []);
            setPagination(null);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [authToken, currentPage]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh users list (for use by child components)
  const refreshUsers = async () => {
    await fetchData(currentPage);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery) ||
      user.house_number?.toLowerCase().includes(searchQuery.toLowerCase())
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
              My Users
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              View and manage users registered under your property
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div
              className={`relative max-w-md flex items-center gap-1 px-3 py-2 rounded-lg ${theme.background.card} ${theme.shadow.small} border ${theme.border.secondary}`}
            >
              <Icon
                icon="mdi:magnify"
                className={`text-lg ${theme.text.tertiary}`}
              />

              <input
                type="text"
                placeholder="Search users…"
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
                  Found {filteredUsers.length} of {users.length} users
                </span>
              </div>
            )}
          </div>

          {/* Pagination Info */}
          {pagination && (
            <div
              className={`${theme.background.card} rounded-lg p-3 ${theme.shadow.small} border ${theme.border.secondary} mb-6`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme.text.secondary}`}>
                  Total Users: {pagination.total}
                </span>
                <span className={`text-sm ${theme.text.secondary}`}>
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
              </div>
            </div>
          )}

          {/* Stats Card */}
          <div
            className={`${theme.background.card} rounded-2xl ${theme.shadow.medium} p-6 sm:p-8 mb-8`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm sm:text-base ${theme.text.secondary} mb-2`}
                >
                  Total Users Under Your Property
                </p>
                <p
                  className={`text-3xl sm:text-4xl font-bold ${theme.text.primary}`}
                >
                  {isLoading ? "..." : filteredUsers.length}
                </p>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Icon
                  icon="mdi:account-group"
                  className="text-white text-3xl sm:text-4xl"
                />
              </div>
            </div>
          </div>

          {/* Users Cards List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon
                  icon="mdi:loading"
                  className={`animate-spin text-4xl ${theme.text.tertiary}`}
                />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div
                className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-8 sm:p-12 text-center`}
              >
                <Icon
                  icon="mdi:account-group-outline"
                  className={`text-6xl ${theme.text.tertiary} mb-4 mx-auto`}
                />
                <p className={`text-base ${theme.text.secondary} mb-1`}>
                  {searchQuery ? "No users found" : "No users found"}
                </p>
                <p className={`text-sm ${theme.text.tertiary}`}>
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "User records will appear here"}
                </p>
              </div>
            ) : (
              filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`w-full ${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-5 border ${theme.border.secondary} hover:border-blue-500 transition-all`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Number Badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3
                        className={`font-semibold ${theme.text.primary} text-base sm:text-lg truncate`}
                      >
                        {user.full_name}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm ${theme.text.secondary} truncate mb-2`}
                      >
                        {user.house_type || "No house type"}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            user.status === "active"
                              ? theme.status.success
                              : user.status === "inactive"
                              ? theme.status.error
                              : theme.status.warning
                          }`}
                        >
                          <Icon
                            icon={
                              user.status === "active"
                                ? "mdi:check-circle"
                                : user.status === "inactive"
                                ? "mdi:close-circle"
                                : "mdi:clock-outline"
                            }
                            className="text-sm"
                          />
                          {user.status?.charAt(0).toUpperCase() +
                            user.status?.slice(1) || "Unknown"}
                        </span>

                        {/* Payment Count */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs sm:text-sm font-medium ${theme.text.secondary}`}
                          >
                            Payments:
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              user.payment_count >=
                              user.months_since_registration
                                ? "text-green-600 dark:text-green-400"
                                : user.payment_count >=
                                  Math.ceil(
                                    user.months_since_registration * 0.6
                                  )
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {user.payment_count || 0}/
                            {user.months_since_registration || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3-Dot Menu */}
                    <div className="flex-shrink-0">
                      <LandlordUsersActions
                        theme={theme}
                        user={user}
                        userIndex={index + 1}
                        onUserUpdate={refreshUsers}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && pagination && pagination.last_page > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCurrentPage(pagination.current_page - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={pagination.current_page === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  pagination.current_page === 1
                    ? `${theme.background.input} ${theme.text.tertiary} cursor-not-allowed opacity-50`
                    : `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg`
                }`}
              >
                <Icon icon="mdi:chevron-left" className="text-lg" />
                Previous
              </button>

              <div
                className={`px-4 py-2 ${theme.background.card} rounded-lg border ${theme.border.secondary} ${theme.shadow.small}`}
              >
                <span className={`text-sm font-medium ${theme.text.primary}`}>
                  {pagination.current_page} / {pagination.last_page}
                </span>
              </div>

              <button
                onClick={() => {
                  setCurrentPage(pagination.current_page + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={pagination.current_page === pagination.last_page}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  pagination.current_page === pagination.last_page
                    ? `${theme.background.input} ${theme.text.tertiary} cursor-not-allowed opacity-50`
                    : `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg`
                }`}
              >
                Next
                <Icon icon="mdi:chevron-right" className="text-lg" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordUsers;
