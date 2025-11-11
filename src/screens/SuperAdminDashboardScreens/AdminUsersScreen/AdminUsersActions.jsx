import { useState } from "react";
import { Icon } from "@iconify/react";

const AdminUsersActions = ({ theme, admin, onClose }) => {
  const [activeModal, setActiveModal] = useState(null); // 'deactivate', 'delete', 'viewUsers', 'viewDetails'
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mock users data for the selected admin
  const adminUsers = [
    {
      id: 1,
      name: "Alice Johnson",
      phone: "+234 812 111 2222",
      email: "alice@gmail.com",
      houseNumber: "Block A, Unit 1",
      status: "active",
    },
    {
      id: 2,
      name: "Bob Smith",
      phone: "+234 812 333 4444",
      email: "bob@gmail.com",
      houseNumber: "Block A, Unit 2",
      status: "active",
    },
    {
      id: 3,
      name: "Carol Davis",
      phone: "+234 812 555 6666",
      email: "carol@gmail.com",
      houseNumber: "Block A, Unit 3",
      status: "inactive",
    },
  ];

  const handleDeactivate = () => {
    setActiveModal("deactivate");
  };

  const handleDelete = () => {
    setActiveModal("delete");
  };

  const handleViewUsers = () => {
    setActiveModal("viewUsers");
  };

  const handleViewDetails = () => {
    setActiveModal("viewDetails");
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
            className={`absolute right-0 mt-2 w-48 ${theme.background.card} rounded-lg ${theme.shadow.medium} border ${theme.border.secondary} overflow-hidden z-40`}
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
                handleDeactivate();
                setIsMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-yellow-50 transition-colors text-yellow-700 border-b ${theme.border.secondary}`}
            >
              <Icon icon="mdi:pause-circle" className="text-lg" />
              <span className="text-sm font-medium">Deactivate Admin</span>
            </button>

            <button
              onClick={() => {
                handleDelete();
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-700"
            >
              <Icon icon="mdi:trash-can" className="text-lg" />
              <span className="text-sm font-medium">Delete Users</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Deactivate Admin Confirmation Modal */}
      {activeModal === "deactivate" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative`}
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
                <strong>{admin.name}</strong>? They will not be able to access
                the system.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmAction("Deactivate")}
                  className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-colors"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Users Confirmation Modal */}
      {activeModal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-2xl rounded-2xl ${theme.shadow.large} relative max-h-[80vh] overflow-y-auto`}
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
              {adminUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`${theme.background.input} rounded-lg p-4 border ${theme.border.secondary}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${theme.text.primary}`}>
                          {index + 1}. {user.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                      <p className={`text-sm ${theme.text.secondary}`}>
                        {user.email}
                      </p>
                      <p className={`text-xs ${theme.text.tertiary}`}>
                        {user.phone} • {user.houseNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Admin Details Modal */}
      {activeModal === "viewDetails" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-lg rounded-2xl ${theme.shadow.large} relative`}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
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
                Administrator Details
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Name & Role */}
              <div>
                <h3
                  className={`text-lg font-semibold ${theme.text.primary} mb-1`}
                >
                  {admin.name}
                </h3>
                <p className={`text-sm ${theme.text.secondary}`}>
                  {admin.role}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <DetailItem
                  icon="mdi:phone"
                  label="Phone"
                  value={admin.phone}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:email"
                  label="Email"
                  value={admin.email}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:home"
                  label="House"
                  value={admin.houseNumber}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:map-marker"
                  label="Address"
                  value={admin.address}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:account-group"
                  label="Total Users"
                  value={admin.totalUsers.toString()}
                  theme={theme}
                />
                <DetailItem
                  icon="mdi:calendar"
                  label="Join Date"
                  value={new Date(admin.joinDate).toLocaleDateString()}
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
    </>
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

export default AdminUsersActions;
