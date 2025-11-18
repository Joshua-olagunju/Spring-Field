import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useUser } from "../../../../context/useUser";
import UserDetailsModal from "../../../../components/AdminComponents/UserDetailsModal";

const AdminUsersActions = ({
  theme,
  admin,
  adminIndex,
  onGenerateToken,
  onAdminUpdate,
}) => {
  const { authToken } = useUser();
  const [activeModal, setActiveModal] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState("below");
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch admin's users from API
  const fetchAdminUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch(
        `http://localhost:8000/api/super-admin/landlord-users/${admin.id}`,
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
        setAdminUsers(result.data || []);
      } else {
        console.error("Failed to fetch admin users:", result.message);
      }
    } catch (error) {
      console.error("Error fetching admin users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // User management actions
  const handleToggleUserStatus = async (userId, action) => {
    try {
      const token = authToken || localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:8000/api/super-admin/users/${userId}/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Refresh admin list
        if (onAdminUpdate) onAdminUpdate();
        setActiveModal(null);
      } else {
        console.error(
          `Failed to ${action} user:`,
          result.message || response.statusText
        );
        if (response.status === 401) {
          console.error("Auth token may be invalid");
        }
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = authToken || localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:8000/api/super-admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Refresh users list
        fetchAdminUsers();
      } else {
        console.error(
          "Failed to delete user:",
          result.message || response.statusText
        );
        if (response.status === 401) {
          console.error("Auth token may be invalid");
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Dynamically calculate menu position based on available space
  useEffect(() => {
    if (!isMenuOpen || !menuButtonRef.current || !menuRef.current) return;

    const calculateMenuPosition = () => {
      const viewportHeight = window.innerHeight;
      const buttonRect = menuButtonRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight || 250;

      const BOTTOM_NAV_HEIGHT = 90;
      const MARGIN = 8;

      // Check if there's enough space below
      const maxSpaceBelow =
        viewportHeight - buttonRect.bottom - BOTTOM_NAV_HEIGHT - MARGIN;

      const menuNeedsSpace = menuHeight + MARGIN;

      // Prefer showing below, only go above if not enough space below
      if (maxSpaceBelow >= menuNeedsSpace) {
        setMenuPosition("below");
      } else {
        setMenuPosition("above");
      }
    };

    // Calculate immediately when menu opens
    calculateMenuPosition();

    // Recalculate on window resize
    const handleResize = () => {
      calculateMenuPosition();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleGenerateOTP = () => {
    setIsMenuOpen(false);
    onGenerateToken();
  };

  const handleDeactivate = () => {
    setActiveModal("deactivate");
  };

  const handleActivate = () => {
    setActiveModal("activate");
  };

  const handleDelete = () => {
    setActiveModal("delete");
  };

  const handleViewUsers = () => {
    setActiveModal("viewUsers");
    fetchAdminUsers();
  };

  const handleViewDetails = () => {
    setActiveModal("viewDetails");
  };

  const confirmGenerateOTP = async () => {
    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem("authToken");

      // API call to generate OTP
      const response = await fetch(
        `http://localhost:8000/api/admin/generate-user-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            admin_id: admin.id,
            admin_name: admin.name,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("OTP Generated:", result.otp);
        alert(`OTP Generated Successfully!\nOTP: ${result.otp}`);
      } else {
        alert("Failed to generate OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error generating OTP:", error);
      alert("Error generating OTP");
    } finally {
      setActiveModal(null);
      setIsMenuOpen(false);
    }
  };

  const confirmAction = (action) => {
    console.log(`${action} confirmed for admin: ${admin.name}`);
    setActiveModal(null);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* 3-Dot Menu Button */}
      <div className="relative">
        <button
          ref={menuButtonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-lg transition-colors ${theme.background.input} hover:${theme.background.card}`}
        >
          <Icon
            icon="mdi:dots-vertical"
            className={`text-xl ${theme.text.tertiary}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className={`absolute right-0 w-48 ${
              theme.background.card
            } rounded-lg ${theme.shadow.medium} border ${
              theme.border.secondary
            } overflow-hidden z-50 ${
              menuPosition === "above" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <button
              onClick={() => {
                handleViewDetails();
                setIsMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.input} transition-colors ${theme.text.primary} border-b ${theme.border.secondary}`}
            >
              <Icon icon="mdi:account-details" className="text-lg" />
              <span className="text-sm font-medium">View Admin Details</span>
            </button>

            <button
              onClick={() => {
                handleViewUsers();
                setIsMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.input} transition-colors ${theme.text.primary} border-b ${theme.border.secondary}`}
            >
              <Icon icon="mdi:account-group" className="text-lg" />
              <span className="text-sm font-medium">View Users</span>
            </button>

            <button
              onClick={() => {
                handleGenerateOTP();
                setIsMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors text-blue-700 border-b ${theme.border.secondary}`}
            >
              <Icon icon="mdi:key-plus" className="text-lg" />
              <span className="text-sm font-medium">Generate User OTP</span>
            </button>

            <button
              onClick={() => {
                admin.status === "active"
                  ? handleDeactivate()
                  : handleActivate();
                setIsMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${
                admin.status === "active" ? "bg-yellow-50" : "bg-green-50"
              } transition-colors ${
                admin.status === "active" ? "text-yellow-700" : "text-green-700"
              } border-b ${theme.border.secondary}`}
            >
              <Icon
                icon={
                  admin.status === "active"
                    ? "mdi:pause-circle"
                    : "mdi:play-circle"
                }
                className="text-lg"
              />
              <span className="text-sm font-medium">
                {admin.status === "active"
                  ? "Deactivate Admin"
                  : "Activate Admin"}
              </span>
            </button>

            <button
              onClick={() => {
                handleDelete();
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-700"
            >
              <Icon icon="mdi:trash-can" className="text-lg" />
              <span className="text-sm font-medium">Delete Admin</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Generate User OTP Modal */}
      {activeModal === "generateOTP" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon icon="mdi:key-plus" className="text-3xl text-blue-600" />
              </div>
              <h2
                className={`text-xl font-bold ${theme.text.primary} mb-2 text-center`}
              >
                Generate User OTP
              </h2>
              <p className={`text-sm ${theme.text.secondary} mb-4 text-center`}>
                This action will generate a One-Time Password (OTP) for the
                admin <strong>{admin.name}</strong> to distribute to new users.
              </p>
              <div
                className={`${theme.background.input} p-4 rounded-lg mb-6 border ${theme.border.secondary}`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2`}
                >
                  What this does:
                </p>
                <ul
                  className={`text-xs ${theme.text.secondary} space-y-1 list-disc list-inside`}
                >
                  <li>Generates a unique OTP code</li>
                  <li>Attaches OTP to admin account</li>
                  <li>OTP can be shared with users for registration</li>
                  <li>Admin can manage OTPs from their dashboard</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmGenerateOTP}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Admin Confirmation Modal */}
      {activeModal === "deactivate" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Icon
                  icon="mdi:alert-circle"
                  className="text-3xl text-yellow-600"
                />
              </div>
              <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
                Deactivate Admin?
              </h2>
              <p className={`text-sm ${theme.text.secondary} mb-6`}>
                Are you sure you want to deactivate{" "}
                <strong>{admin.full_name}</strong>? They will not be able to
                access the system.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleToggleUserStatus(admin.id, "deactivate");
                    setActiveModal(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-colors"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activate Admin Confirmation Modal */}
      {activeModal === "activate" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Icon
                  icon="mdi:check-circle"
                  className="text-3xl text-green-600"
                />
              </div>
              <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
                Activate Admin?
              </h2>
              <p className={`text-sm ${theme.text.secondary} mb-6`}>
                Are you sure you want to activate{" "}
                <strong>{admin.full_name}</strong>? They will be able to access
                the system again.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleToggleUserStatus(admin.id, "activate");
                    setActiveModal(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                >
                  Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Users Confirmation Modal */}
      {activeModal === "delete" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Icon icon="mdi:alert" className="text-3xl text-red-600" />
              </div>
              <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
                Delete All Users?
              </h2>
              <p className={`text-sm ${theme.text.secondary} mb-6`}>
                Are you sure you want to delete all users under{" "}
                <strong>{admin.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmAction("Delete")}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Users Modal */}
      {activeModal === "viewUsers" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-2xl rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className={`sticky top-4 right-4 p-2 rounded-full hover:${theme.background.input} transition-colors z-10 float-right`}
            >
              <Icon
                icon="mdi:close"
                className={`text-xl ${theme.text.tertiary}`}
              />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-inherit">
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>
                Users under {admin.name}
              </h2>
              <p className={`text-sm ${theme.text.secondary}`}>
                Total: {adminUsers.length} users
              </p>
            </div>

            {/* Users List */}
            <div className="p-6 space-y-3">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Icon
                    icon="mdi:loading"
                    className={`animate-spin text-3xl ${theme.text.tertiary}`}
                  />
                </div>
              ) : adminUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Icon
                    icon="mdi:account-group-outline"
                    className={`text-5xl ${theme.text.tertiary} mb-3`}
                  />
                  <p className={`text-sm ${theme.text.secondary}`}>
                    No users found for this admin
                  </p>
                </div>
              ) : (
                adminUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`${theme.background.input} rounded-lg p-4 border ${theme.border.secondary} hover:border-blue-500 transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium ${theme.text.primary} text-sm`}
                          >
                            {user.full_name || user.name}
                          </h4>
                          <p
                            className={`text-xs ${theme.text.secondary} truncate`}
                          >
                            {user.house_number || user.houseNumber} •{" "}
                            {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              <Icon
                                icon={
                                  user.status === "active"
                                    ? "mdi:check-circle"
                                    : "mdi:close-circle"
                                }
                                className="text-xs"
                              />
                              {user.status?.charAt(0).toUpperCase() +
                                user.status?.slice(1) || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User Actions */}
                      <div className="flex items-center gap-1">
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Icon
                            icon="mdi:eye"
                            className="text-blue-600 dark:text-blue-400 text-sm"
                          />
                        </button>

                        {/* Toggle Status */}
                        {user.status === "active" ? (
                          <button
                            onClick={() =>
                              handleToggleUserStatus(user.id, "deactivate")
                            }
                            className="p-1.5 rounded-full bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 transition-colors"
                            title="Deactivate User"
                          >
                            <Icon
                              icon="mdi:account-off"
                              className="text-yellow-600 dark:text-yellow-400 text-sm"
                            />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleToggleUserStatus(user.id, "activate")
                            }
                            className="p-1.5 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 transition-colors"
                            title="Activate User"
                          >
                            <Icon
                              icon="mdi:account-check"
                              className="text-green-600 dark:text-green-400 text-sm"
                            />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 transition-colors"
                          title="Delete User"
                        >
                          <Icon
                            icon="mdi:delete"
                            className="text-red-600 dark:text-red-400 text-sm"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Admin Details Modal */}
      {activeModal === "viewDetails" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-lg rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className={`absolute right-4 top-4 p-2 rounded-full hover:${theme.background.input} transition-colors z-10`}
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
                Administrator Details
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Admin Number & Name & Role */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {adminIndex}
                    </span>
                  </div>
                  <h3 className={`text-lg font-semibold ${theme.text.primary}`}>
                    {admin.full_name}
                  </h3>
                </div>
                <p className={`text-sm ${theme.text.secondary}`}>
                  {admin.role || "Administrator"}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <DetailItem
                  icon="mdi:phone"
                  label="Phone"
                  value={admin.phone || "N/A"}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:email"
                  label="Email"
                  value={admin.email || "N/A"}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:home"
                  label="House"
                  value={admin.house_number || "Not Assigned"}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:map-marker"
                  label="Address"
                  value={admin.address || "N/A"}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:account-group"
                  label="Total Users"
                  value={(admin.residents_count || 0).toString()}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:calendar"
                  label="Join Date"
                  value={
                    admin.created_at
                      ? new Date(admin.created_at).toLocaleDateString()
                      : "N/A"
                  }
                  theme={theme}
                />
              </div>

              {/* Status */}
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      admin.status === "active" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${theme.text.secondary}`}
                  >
                    {admin.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`${theme.background.input} px-6 py-4 rounded-b-2xl border-t ${theme.border.secondary} flex justify-end`}
            >
              <button
                onClick={() => setActiveModal(null)}
                className={`text-sm font-medium px-4 py-2 rounded-lg ${theme.text.link} hover:${theme.background.card} transition-colors`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        theme={theme}
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
};

export default AdminUsersActions;
