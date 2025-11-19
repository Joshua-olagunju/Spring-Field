import { useState } from "react";
import { useTheme } from "../../../../context/useTheme";
import { Icon } from "@iconify/react";

const UsersScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Dummy users data (replace with API call)
  const allUsers = [
    {
      id: "USR-001",
      name: "Admin User",
      dateCreated: "2025-10-01",
      status: "active",
      role: "Administrator",
      lastActive: "2025-11-14",
    },
    {
      id: "USR-002",
      name: "John Resident",
      dateCreated: "2025-10-15",
      status: "active",
      role: "Resident",
      lastActive: "2025-11-14",
      paymentStatus: "current",
      paymentsThisYear: 11,
    },
    {
      id: "USR-003",
      name: "Sarah Tenant",
      dateCreated: "2025-10-20",
      status: "suspended",
      role: "Resident",
      lastActive: "2025-11-05",
      paymentStatus: "overdue",
      paymentsThisYear: 8,
    },
    {
      id: "USR-004",
      name: "Michael Guest",
      dateCreated: "2025-11-01",
      status: "active",
      role: "Guest",
      lastActive: "2025-11-12",
    },
    {
      id: "USR-005",
      name: "Emma Visitor",
      dateCreated: "2025-11-08",
      status: "active",
      role: "Visitor",
      lastActive: "2025-11-13",
    },
    {
      id: "USR-006",
      name: "Security Guard 1",
      dateCreated: "2025-09-15",
      status: "active",
      role: "Security",
      lastActive: "2025-11-14",
    },
    {
      id: "USR-007",
      name: "Super Admin",
      dateCreated: "2025-09-01",
      status: "active",
      role: "Super Admin",
      lastActive: "2025-11-14",
    },
    {
      id: "USR-008",
      name: "Inactive User",
      dateCreated: "2025-08-15",
      status: "suspended",
      role: "Resident",
      lastActive: "2025-10-30",
      paymentStatus: "pending",
      paymentsThisYear: 6,
    },
  ];

  // Filter users based on search query
  const filteredUsers = allUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.id.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query)
    );
  });

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
      case "administrator":
        return "mdi:shield-account";
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
      case "administrator":
        return "from-blue-500 to-blue-600";
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
              {filteredUsers.length} users
            </span>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {allUsers.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icon
                    icon="mdi:account-group"
                    className={`text-5xl ${theme.text.tertiary} mb-3 mx-auto opacity-50`}
                  />
                  <p className={`text-sm ${theme.text.secondary}`}>
                    No users found.
                  </p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
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
              filteredUsers.map((user) => (
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
                                user.role.toLowerCase() === "super admin"
                                  ? "rgb(168, 85, 247)"
                                  : user.role.toLowerCase() === "administrator"
                                  ? "rgb(59, 130, 246)"
                                  : user.role.toLowerCase() === "security"
                                  ? "rgb(239, 68, 68)"
                                  : "rgb(107, 114, 128)",
                              color:
                                user.role.toLowerCase() === "super admin"
                                  ? "rgb(216, 180, 254)"
                                  : user.role.toLowerCase() === "administrator"
                                  ? "rgb(191, 219, 254)"
                                  : user.role.toLowerCase() === "security"
                                  ? "rgb(254, 205, 211)"
                                  : "rgb(209, 213, 219)",
                            }}
                          >
                            {user.role}
                          </span>
                        </div>
                        <p
                          className={`text-xs ${theme.text.secondary} truncate`}
                        >
                          ID: {user.id}
                        </p>
                        <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                          Created: {user.dateCreated}
                        </p>
                        <p className={`text-xs ${theme.text.tertiary}`}>
                          Last Active: {user.lastActive}
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
                    <p className={`${theme.text.tertiary} mb-1`}>User ID</p>
                    <p className={`${theme.text.primary} font-mono`}>
                      {selectedUser.id}
                    </p>
                  </div>
                  <div>
                    <p className={`${theme.text.tertiary} mb-1`}>Role</p>
                    <p className={`${theme.text.primary}`}>
                      {selectedUser.role}
                    </p>
                  </div>
                  <div>
                    <p className={`${theme.text.tertiary} mb-1`}>
                      Date Created
                    </p>
                    <p className={`${theme.text.primary}`}>
                      {selectedUser.dateCreated}
                    </p>
                  </div>
                  <div>
                    <p className={`${theme.text.tertiary} mb-1`}>Last Active</p>
                    <p className={`${theme.text.primary}`}>
                      {selectedUser.lastActive}
                    </p>
                  </div>
                </div>

                {/* Payment Information (for residents/users) */}
                {selectedUser.role.toLowerCase() === "resident" && (
                  <div className="border-t pt-4 mt-4">
                    <h4
                      className={`${theme.text.primary} font-semibold mb-3 text-sm`}
                    >
                      Payment Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={`${theme.text.tertiary} mb-1`}>
                          Payment Status
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            selectedUser.paymentStatus === "current"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : selectedUser.paymentStatus === "overdue"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          <Icon
                            icon={
                              selectedUser.paymentStatus === "current"
                                ? "mdi:check-circle"
                                : selectedUser.paymentStatus === "overdue"
                                ? "mdi:alert-circle"
                                : "mdi:clock-outline"
                            }
                            className="text-sm"
                          />
                          <span className="capitalize">
                            {selectedUser.paymentStatus || "current"}
                          </span>
                        </span>
                      </div>
                      <div>
                        <p className={`${theme.text.tertiary} mb-1`}>
                          Payments This Year
                        </p>
                        <p className={`${theme.text.primary} font-semibold`}>
                          {selectedUser.paymentsThisYear || 10}/12 months
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
