import { useState } from "react";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../../config/apiConfig";
import useStore from "../../../store/useStore";
import ViewSecurityModal from "./ViewSecurityModal";

const SecurityActions = ({
  theme,
  security,
  securityIndex,
  onSecurityUpdate,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeactivate = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/users/${security.id}/deactivate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useStore.getState().authToken}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setShowDeactivateModal(false);
        setShowMenu(false);
        if (onSecurityUpdate) onSecurityUpdate();
      } else {
        alert(result.message || "Failed to deactivate security personnel");
      }
    } catch (error) {
      console.error("Error deactivating security personnel:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivate = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/users/${security.id}/activate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useStore.getState().authToken}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setShowMenu(false);
        if (onSecurityUpdate) onSecurityUpdate();
      } else {
        alert(result.message || "Failed to activate security personnel");
      }
    } catch (error) {
      console.error("Error activating security personnel:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/users/${security.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useStore.getState().authToken}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setShowDeleteModal(false);
        setShowMenu(false);
        if (onSecurityUpdate) onSecurityUpdate();
      } else {
        alert(result.message || "Failed to delete security personnel");
      }
    } catch (error) {
      console.error("Error deleting security personnel:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* 3-Dot Menu Button */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`p-2 rounded-lg hover:${theme.background.input} transition-colors`}
        >
          <Icon
            icon="mdi:dots-vertical"
            className={`text-xl ${theme.text.secondary}`}
          />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div
              className={`absolute right-0 top-full mt-2 w-48 ${theme.background.card} rounded-lg ${theme.shadow.medium} border ${theme.border.secondary} z-50 overflow-hidden`}
            >
              <button
                onClick={() => {
                  setShowViewModal(true);
                  setShowMenu(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.input} transition-colors ${theme.text.primary}`}
              >
                <Icon icon="mdi:eye" className="text-lg text-blue-500" />
                <span className="text-sm font-medium">View Details</span>
              </button>

              {security.status_active ? (
                <button
                  onClick={() => {
                    setShowDeactivateModal(true);
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.input} transition-colors border-t ${theme.border.secondary}`}
                >
                  <Icon
                    icon="mdi:account-off"
                    className="text-lg text-orange-500"
                  />
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Deactivate
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  disabled={isProcessing}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.input} transition-colors border-t ${theme.border.secondary}`}
                >
                  <Icon
                    icon={isProcessing ? "mdi:loading" : "mdi:account-check"}
                    className={`text-lg text-green-500 ${
                      isProcessing ? "animate-spin" : ""
                    }`}
                  />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {isProcessing ? "Activating..." : "Activate"}
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setShowMenu(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:${theme.background.input} transition-colors border-t ${theme.border.secondary}`}
              >
                <Icon icon="mdi:delete" className="text-lg text-red-500" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Delete
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && (
        <ViewSecurityModal
          theme={theme}
          security={security}
          securityIndex={securityIndex}
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeactivateModal(false)}
          />
          <div
            className={`relative w-full max-w-md ${theme.background.card} rounded-2xl ${theme.shadow.large} p-6`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Icon
                  icon="mdi:alert"
                  className="text-2xl text-orange-600 dark:text-orange-400"
                />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>
                  Deactivate Security Personnel
                </h3>
                <p className={`text-sm ${theme.text.secondary}`}>
                  Are you sure you want to deactivate{" "}
                  <span className="font-semibold">{security.full_name}</span>?
                  They will not be able to access their account.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                disabled={isProcessing}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${theme.background.input} hover:${theme.background.secondary} ${theme.text.primary}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div
            className={`relative w-full max-w-md ${theme.background.card} rounded-2xl ${theme.shadow.large} p-6`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Icon
                  icon="mdi:delete-alert"
                  className="text-2xl text-red-600 dark:text-red-400"
                />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>
                  Delete Security Personnel
                </h3>
                <p className={`text-sm ${theme.text.secondary} mb-3`}>
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold">{security.full_name}</span>?
                </p>
                <p className={`text-sm ${theme.text.tertiary}`}>
                  ⚠️ This action cannot be undone. All associated data will be
                  removed.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${theme.background.input} hover:${theme.background.secondary} ${theme.text.primary}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SecurityActions;
