import { useTheme } from "../../../../context/useTheme";
import { Icon } from "@iconify/react";

const UsersScreen = () => {
  const { theme, isDarkMode } = useTheme();

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
    },
    {
      id: "USR-003",
      name: "Sarah Tenant",
      dateCreated: "2025-10-20",
      status: "suspended",
      role: "Resident",
      lastActive: "2025-11-05",
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
    },
  ];

  const handleUserClick = (user) => {
    console.log("User clicked:", user);
    // TODO: Show modal or navigate to detail view
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
      <div className="w-full px-0">
        <div className="max-w-full mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1
              className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
            >
              All Users
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              View all users in the system including admins, residents, and security personnel
            </p>
          </div>

          {/* Users Section */}
          <div
            className={`${theme.background.card} rounded-xl ${theme.shadow.medium} p-6 flex flex-col`}
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-2 flex-shrink-0">
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
                {allUsers.length} users
              </span>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[500px] lg:max-h-[600px]">
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
              ) : (
                allUsers.map((user) => (
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
                          <p
                            className={`text-xs ${theme.text.tertiary} mt-1`}
                          >
                            Created: {user.dateCreated}
                          </p>
                          <p
                            className={`text-xs ${theme.text.tertiary}`}
                          >
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
      </div>
    </div>
  );
};

export default UsersScreen;
