import { useTheme } from "../../../../context/useTheme";
import { Icon } from "@iconify/react";
import AdminUsersActions from "./AdminUsersActions";

const AdminUsers = () => {
  const { theme, isDarkMode } = useTheme();

  // Dummy data for admins (replace with API call)
  const admins = [
    {
      id: 1,
      name: "John Michael",
      phone: "+234 812 345 6789",
      email: "john.michael@springfield.com",
      houseNumber: "Block A, Unit 1",
      address: "123 Estate Road, Lagos",
      role: "Security Manager",
      totalUsers: 24,
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2025-11-10T14:30:00",
    },
    {
      id: 2,
      name: "Sarah Okonkwo",
      phone: "+234 803 987 6543",
      email: "sarah.okonkwo@springfield.com",
      houseNumber: "Block B, Unit 5",
      address: "456 Estate Road, Lagos",
      role: "Facilities Admin",
      totalUsers: 18,
      status: "active",
      joinDate: "2024-03-20",
      lastActive: "2025-11-10T16:45:00",
    },
    {
      id: 4,
      name: "Chisom Adeyemi",
      phone: "+234 905 234 5678",
      email: "chisom.adeyemi@springfield.com",
      houseNumber: "Block C, Unit 12",
      address: "789 Estate Road, Lagos",
      role: "Payments Admin",
      totalUsers: 31,
      status: "active",
      joinDate: "2024-02-10",
      lastActive: "2025-11-10T13:20:00",
    },
    {
      id: 5,
      name: "Chisom Adeyemi",
      phone: "+234 905 234 5678",
      email: "chisom.adeyemi@springfield.com",
      houseNumber: "Block C, Unit 12",
      address: "789 Estate Road, Lagos",
      role: "Payments Admin",
      totalUsers: 31,
      status: "active",
      joinDate: "2024-02-10",
      lastActive: "2025-11-10T13:20:00",
    },
    {
      id: 6,
      name: "Chisom Adeyemi",
      phone: "+234 905 234 5678",
      email: "chisom.adeyemi@springfield.com",
      houseNumber: "Block C, Unit 12",
      address: "789 Estate Road, Lagos",
      role: "Payments Admin",
      totalUsers: 31,
      status: "active",
      joinDate: "2024-02-10",
      lastActive: "2025-11-10T13:20:00",
    },
    {
      id: 7,
      name: "Chisom Adeyemi",
      phone: "+234 905 234 5678",
      email: "chisom.adeyemi@springfield.com",
      houseNumber: "Block C, Unit 12",
      address: "789 Estate Road, Lagos",
      role: "Payments Admin",
      totalUsers: 31,
      status: "active",
      joinDate: "2024-02-10",
      lastActive: "2025-11-10T13:20:00",
    },
    {
      id: 8,
      name: "Chisom Adeyemi",
      phone: "+234 905 234 5678",
      email: "chisom.adeyemi@springfield.com",
      houseNumber: "Block C, Unit 12",
      address: "789 Estate Road, Lagos",
      role: "Payments Admin",
      totalUsers: 31,
      status: "active",
      joinDate: "2024-02-10",
      lastActive: "2025-11-10T13:20:00",
    },
    {
      id: 9,
      name: "Chisom Adeyemi",
      phone: "+234 905 234 5678",
      email: "chisom.adeyemi@springfield.com",
      houseNumber: "Block C, Unit 12",
      address: "789 Estate Road, Lagos",
      role: "Payments Admin",
      totalUsers: 31,
      status: "active",
      joinDate: "2024-02-10",
      lastActive: "2025-11-10T13:20:00",
    },
  ];

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
                  {admins.length}
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
            {admins.length === 0 ? (
              <div
                className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-8 sm:p-12 text-center`}
              >
                <Icon
                  icon="mdi:shield-account-outline"
                  className={`text-6xl ${theme.text.tertiary} mb-4 mx-auto`}
                />
                <p className={`text-base ${theme.text.secondary} mb-1`}>
                  No administrators found
                </p>
                <p className={`text-sm ${theme.text.tertiary}`}>
                  Administrator records will appear here
                </p>
              </div>
            ) : (
              admins.map((admin, index) => (
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

                    {/* Admin Info - Start at top */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3
                        className={`font-semibold ${theme.text.primary} text-base sm:text-lg truncate`}
                      >
                        {admin.name}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm ${theme.text.secondary} truncate mb-2`}
                      >
                        {admin.houseNumber}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-medium ${theme.text.secondary}`}
                        >
                          Total Users:
                        </span>
                        <span
                          className={`text-lg sm:text-xl font-bold ${theme.brand.primaryText}`}
                        >
                          {admin.totalUsers}
                        </span>
                      </div>
                    </div>

                    {/* 3-Dot Menu */}
                    <div className="flex-shrink-0">
                      <AdminUsersActions
                        theme={theme}
                        admin={admin}
                        adminIndex={index + 1}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
