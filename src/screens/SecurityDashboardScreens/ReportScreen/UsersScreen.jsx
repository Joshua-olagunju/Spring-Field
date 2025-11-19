import { useState, useEffect } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";

const UsersScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });

  // Fetch users from API
  const fetchUsers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
      const response = await fetch(
        `http://localhost:8000/api/test-security-users?page=${page}${searchParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchQuery);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Initial load
  useEffect(() => {
    fetchUsers(1, searchQuery);
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
      fetchUsers(newPage, searchQuery);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return "mdi:check-circle";
      case "inactive":
        return "mdi:close-circle";
      case "suspended":
        return "mdi:alert-circle";
      default:
        return "mdi:help-circle";
    }
  };

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
      case "administrator":
        return "mdi:shield-account";
      case "super_admin":
      case "super admin":
        return "mdi:crown";
      case "security":
        return "mdi:security";
      case "resident":
        return "mdi:home";
      case "guest":
        return "mdi:account";
      case "visitor":
        return "mdi:account-plus";
      default:
        return "mdi:account-circle";
    }
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
      case "administrator":
        return "from-blue-500 to-blue-600";
      case "super_admin":
      case "super admin":
        return "from-purple-500 to-purple-600";
      case "security":
        return "from-red-500 to-red-600";
      case "resident":
        return "from-green-500 to-green-600";
      case "guest":
        return "from-orange-500 to-orange-600";
      case "visitor":
        return "from-yellow-500 to-yellow-600";
      default:
        return "from-gray-500 to-gray-600";
    }
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
      <div className="w-full ">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
          >
            All Users
          </h1>
          <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
            View all users in the system including admins, residents, and
            security personnel
          </p>
        </div>

        {/* Sticky Search Bar */}
        <div
          className="sticky top-16 z-30 pb-6 mb-6"
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
                placeholder="Search users…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent text-sm ${theme.text.primary} placeholder-current placeholder-opacity-40 outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div
          className={`${theme.background.card} rounded-xl ${theme.shadow.medium} p-6`}
        >
          {/* Header */}
          <div className="mb-4 flex items-center gap-2">
            <Icon
              icon="mdi:account-multiple"
              className={`text-2xl ${theme.brand.primaryText}`}
            />
            <h2
              className={`text-xl sm:text-2xl font-bold ${theme.text.primary}`}
            >
              Users Directory
            </h2>
            <span
              className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${theme.background.secondary} ${theme.text.secondary}`}
            >
              {pagination.total} users
            </span>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icon
                    icon="mdi:loading"
                    className={`text-5xl ${theme.text.tertiary} mb-3 mx-auto opacity-50 animate-spin`}
                  />
                  <p className={`text-sm ${theme.text.secondary}`}>
                    Loading users...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icon
                    icon="mdi:alert-circle"
                    className={`text-5xl text-red-500 mb-3 mx-auto opacity-50`}
                  />
                  <p className={`text-sm text-red-600 dark:text-red-400 mb-2`}>
                    {error}
                  </p>
                  <button
                    onClick={() => fetchUsers(currentPage, searchQuery)}
                    className={`px-4 py-2 rounded-lg ${theme.brand.primary} text-white text-sm hover:opacity-90 transition-opacity`}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icon
                    icon="mdi:magnify-close"
                    className={`text-5xl ${theme.text.tertiary} mb-3 mx-auto opacity-50`}
                  />
                  <p className={`text-sm ${theme.text.secondary}`}>
                    No users match your search.
                  </p>
                </div>
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`w-full ${theme.background.secondary} hover:${theme.background.card} rounded-lg p-4 transition-all border ${theme.border.secondary} hover:border-blue-500 text-left`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* User Avatar */}
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${getRoleColor(
                          user.role
                        )} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon
                          icon={getRoleIcon(user.role)}
                          className="text-white text-lg"
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`text-xs sm:text-sm font-semibold ${theme.text.primary} truncate`}
                          >
                            {user.name}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full bg-opacity-20 truncate`}
                            style={{
                              backgroundColor:
                                user.role.toLowerCase() === "super_admin" || user.role.toLowerCase() === "super admin"
                                  ? "rgb(168, 85, 247)"
                                  : user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "administrator"
                                  ? "rgb(59, 130, 246)"
                                  : user.role.toLowerCase() === "security"
                                  ? "rgb(239, 68, 68)"
                                  : user.role.toLowerCase() === "resident"
                                  ? "rgb(34, 197, 94)"
                                  : "rgb(107, 114, 128)",
                              color:
                                user.role.toLowerCase() === "super_admin" || user.role.toLowerCase() === "super admin"
                                  ? "rgb(216, 180, 254)"
                                  : user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "administrator"
                                  ? "rgb(191, 219, 254)"
                                  : user.role.toLowerCase() === "security"
                                  ? "rgb(254, 205, 211)"
                                  : user.role.toLowerCase() === "resident"
                                  ? "rgb(187, 247, 208)"
                                  : "rgb(209, 213, 219)",
                            }}
                          >
                            {user.role}
                          </span>
                        </div>
                        <p
                          className={`text-xs ${theme.text.secondary} truncate`}
                        >
                          {user.email}
                        </p>
                        <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                          Created: {user.created_at}
                        </p>
                        <p className={`text-xs ${theme.text.tertiary}`}>
                          Last Active: {user.last_active}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          user.status
                        )}`}
                      >
                        <Icon
                          icon={getStatusIcon(user.status)}
                          className="text-sm"
                        />
                        <span className="capitalize">{user.status}</span>
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && !error && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <p className={`text-sm ${theme.text.secondary}`}>
                  Page {pagination.current_page} of {pagination.total_pages}
                </p>
                <span className={`text-xs ${theme.text.tertiary}`}>
                  ({pagination.total} total users)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_prev}
                  className={`p-2 rounded-lg ${
                    pagination.has_prev
                      ? `${theme.background.input} hover:${theme.background.card} ${theme.text.primary}`
                      : `${theme.background.secondary} ${theme.text.tertiary} cursor-not-allowed`
                  } transition-colors`}
                >
                  <Icon icon="mdi:chevron-left" className="text-lg" />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.total_pages - 2) {
                      pageNum = pagination.total_pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          pageNum === currentPage
                            ? `${theme.brand.primary} text-white`
                            : `${theme.background.input} hover:${theme.background.card} ${theme.text.primary}`
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                  className={`p-2 rounded-lg ${
                    pagination.has_next
                      ? `${theme.background.input} hover:${theme.background.card} ${theme.text.primary}`
                      : `${theme.background.secondary} ${theme.text.tertiary} cursor-not-allowed`
                  } transition-colors`}
                >
                  <Icon icon="mdi:chevron-right" className="text-lg" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative`}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme.text.primary}`}>
                  User Details
                </h2>
                <button
                  onClick={handleCloseModal}
                  className={`p-2 rounded-full ${theme.background.input} hover:${theme.background.card} transition-colors`}
                >
                  <Icon
                    icon="mdi:close"
                    className={`text-xl ${theme.text.secondary}`}
                  />
                </button>
              </div>

              {/* User Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${getRoleColor(
                    selectedUser.role
                  )} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon
                    icon={getRoleIcon(selectedUser.role)}
                    className="text-white text-3xl"
                  />
                </div>
                <h3 className={`text-lg font-bold ${theme.text.primary}`}>
                  {selectedUser.name}
                </h3>
                <p className={`text-sm ${theme.text.secondary} mb-2`}>
                  {selectedUser.role}
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                    selectedUser.status
                  )}`}
                >
                  <Icon
                    icon={getStatusIcon(selectedUser.status)}
                    className="text-sm"
                  />
                  <span className="capitalize">{selectedUser.status}</span>
                </span>
              </div>

              {/* User Details */}
              <div
                className={`${theme.background.input} p-4 rounded-lg space-y-4`}
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={`${theme.text.tertiary} mb-1`}>Email</p>
                    <p className={`${theme.text.primary}`}>
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <p className={`${theme.text.tertiary} mb-1`}>Phone</p>
                    <p className={`${theme.text.primary}`}>
                      {selectedUser.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className={`${theme.text.tertiary} mb-1`}>Role</p>
                    <p className={`${theme.text.primary}`}>
                      {selectedUser.role}
                    </p>
                  </div>
                  <div>
                    <p className={`${theme.text.tertiary} mb-1`}>Status</p>
                    <p className={`${theme.text.primary} capitalize`}>
                      {selectedUser.status}
                    </p>
                  </div>
                  <div>
                    <p className={`${theme.text.tertiary} mb-1`}>
                      Date Created
                    </p>
                    <p className={`${theme.text.primary}`}>
                      {selectedUser.created_at}
                    </p>
                  </div>
                  <div>
                    <p className={`${theme.text.tertiary} mb-1`}>Last Login</p>
                    <p className={`${theme.text.primary}`}>
                      {selectedUser.last_login_at}
                    </p>
                  </div>
                </div>


              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className={`flex-1 px-4 py-3 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Close
                </button>
                {/* Security personnel can only view user details, no edit functionality */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersScreen;
