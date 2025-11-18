import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useUser } from "../../../../context/useUser";
import UserDetailsModal from "../../../../components/AdminComponents/UserDetailsModal";

const LandlordUsersActions = ({ theme, user, userIndex, onUserUpdate }) => {
  const { authToken } = useUser();
  const [activeModal, setActiveModal] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState("below");
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  // User management API calls
  const handleActivateUser = async () => {
    try {
      const token = authToken || localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:8000/api/landlord/users/${user.id}/activate`,
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
        // Refresh users list
        if (onUserUpdate) onUserUpdate();
        setActiveModal(null);
      } else {
        console.error(
          "Failed to activate user:",
          result.message || response.statusText
        );
        if (response.status === 401) {
          console.error("Auth token may be invalid");
        }
      }
    } catch (error) {
      console.error("Error activating user:", error);
    }
  };

  const handleDeactivateUser = async () => {
    try {
      const token = authToken || localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:8000/api/landlord/users/${user.id}/deactivate`,
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
        // Refresh users list
        if (onUserUpdate) onUserUpdate();
        setActiveModal(null);
      } else {
        console.error(
          "Failed to deactivate user:",
          result.message || response.statusText
        );
        if (response.status === 401) {
          console.error("Auth token may be invalid");
        }
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = authToken || localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:8000/api/landlord/users/${user.id}`,
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
        if (onUserUpdate) onUserUpdate();
        setActiveModal(null);
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
  useEffect(() => {
    if (isMenuOpen && menuButtonRef.current) {
      const buttonRect = menuButtonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // If there's more space above than below, position menu above
      if (spaceAbove > spaceBelow && spaceBelow < 200) {
        setMenuPosition("above");
      } else {
        setMenuPosition("below");
      }
    }
  }, [isMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const handleViewDetails = () => {
    setIsMenuOpen(false);
    setActiveModal("viewDetails");
  };

  const handleDeactivate = () => {
    setIsMenuOpen(false);
    setActiveModal("deactivate");
  };

  const handleActivate = () => {
    setIsMenuOpen(false);
    setActiveModal("activate");
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    setActiveModal("delete");
  };

  const confirmAction = async (action) => {
    if (action === "deactivate") {
      await handleDeactivateUser();
    } else if (action === "activate") {
      await handleActivateUser();
    } else if (action === "delete") {
      await handleDeleteUser();
    }
    setActiveModal(null);
  };

  return (
    <>
      {/* Three-dot menu button */}
      <div className="relative">
        <button
          ref={menuButtonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-full ${theme.background.input} hover:${theme.background.card} transition-colors`}
        >
          <Icon
            icon="mdi:dots-vertical"
            className={`text-lg ${theme.text.secondary}`}
          />
        </button>

        {/* Dropdown menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className={`absolute right-0 w-48 ${theme.background.modal} ${
              theme.shadow.large
            } rounded-xl border ${theme.border.secondary} py-2 z-50 ${
              menuPosition === "above" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <button
              onClick={handleViewDetails}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.secondary} transition-colors`}
            >
              <Icon
                icon="mdi:eye"
                className={`text-lg ${theme.text.primary}`}
              />
              <span className={`text-sm ${theme.text.primary}`}>
                View Details
              </span>
            </button>

            {user.status === "active" ? (
              <button
                onClick={handleDeactivate}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.secondary} transition-colors`}
              >
                <Icon
                  icon="mdi:account-cancel"
                  className="text-lg text-yellow-600 dark:text-yellow-400"
                />
                <span className={`text-sm ${theme.text.primary}`}>
                  Deactivate User
                </span>
              </button>
            ) : (
              <button
                onClick={handleActivate}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.secondary} transition-colors`}
              >
                <Icon
                  icon="mdi:account-check"
                  className="text-lg text-green-600 dark:text-green-400"
                />
                <span className={`text-sm ${theme.text.primary}`}>
                  Activate User
                </span>
              </button>
            )}

            <button
              onClick={handleDelete}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.secondary} transition-colors`}
            >
              <Icon icon="mdi:delete" className="text-lg text-red-600" />
              <span className={`text-sm ${theme.text.primary}`}>
                Delete User
              </span>
            </button>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <UserDetailsModal
        user={user}
        theme={theme}
        isOpen={activeModal === "viewDetails"}
        onClose={() => setActiveModal(null)}
      />

      {/* Deactivate Confirmation Modal */}
      {activeModal === "deactivate" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative`}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  icon="mdi:account-cancel"
                  className="text-3xl text-yellow-600 dark:text-yellow-400"
                />
              </div>
              <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>
                Deactivate User
              </h3>
              <p className={`text-sm ${theme.text.secondary} mb-6`}>
                Are you sure you want to deactivate {user.name}? They will not
                be able to access the system until reactivated.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`flex-1 px-4 py-3 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmAction("deactivate")}
                  className="flex-1 px-4 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-colors"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activate Confirmation Modal */}
      {activeModal === "activate" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative`}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  icon="mdi:account-check"
                  className="text-3xl text-green-600 dark:text-green-400"
                />
              </div>
              <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>
                Activate User
              </h3>
              <p className={`text-sm ${theme.text.secondary} mb-6`}>
                Are you sure you want to activate {user.full_name}? They will be
                able to access the system again.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`flex-1 px-4 py-3 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmAction("activate")}
                  className="flex-1 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                >
                  Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === "delete" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative`}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:delete" className="text-3xl text-red-600" />
              </div>
              <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>
                Delete User
              </h3>
              <p className={`text-sm ${theme.text.secondary} mb-6`}>
                Are you sure you want to permanently delete {user.name}? This
                action cannot be undone and all user data will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className={`flex-1 px-4 py-3 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmAction("Delete")}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LandlordUsersActions;
