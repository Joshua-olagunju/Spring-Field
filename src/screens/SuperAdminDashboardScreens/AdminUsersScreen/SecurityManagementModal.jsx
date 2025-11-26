import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../../config/apiConfig";
import ViewSecurityModal from "./ViewSecurityModal";

const SecurityManagementModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { authToken } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [securityPersonnel, setSecurityPersonnel] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSecurity, setSelectedSecurity] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionModal, setActionModal] = useState({
    type: null,
    securityId: null,
    securityName: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch security personnel from API
  const fetchSecurityPersonnel = useCallback(
    async (page = currentPage) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/super-admin/security?page=${page}&per_page=20`,
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
          // Check if data is paginated
          if (result.data.data) {
            setSecurityPersonnel(result.data.data || []);
            setPagination({
              current_page: result.data.current_page,
              last_page: result.data.last_page,
              total: result.data.total,
              per_page: result.data.per_page,
            });
          } else {
            setSecurityPersonnel(result.data || []);
            setPagination(null);
          }
        } else {
          console.error("Failed to fetch security personnel:", result.message);
        }
      } catch (error) {
        console.error("Error fetching security personnel:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [authToken, currentPage]
  );

  useEffect(() => {
    if (isOpen) {
      fetchSecurityPersonnel();
    }
  }, [isOpen, fetchSecurityPersonnel]);

  // Refresh security personnel list
  const refreshSecurityPersonnel = async () => {
    await fetchSecurityPersonnel(currentPage);
  };

  // Handle activate security personnel
  const handleActivate = async (securityId) => {
    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/users/${securityId}/activate`,
        {
          method: "PATCH",
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
        setActionModal({ type: null, securityId: null, securityName: "" });
        await refreshSecurityPersonnel();
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

  // Handle deactivate security personnel
  const handleDeactivate = async (securityId) => {
    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/users/${securityId}/deactivate`,
        {
          method: "PATCH",
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
        setActionModal({ type: null, securityId: null, securityName: "" });
        await refreshSecurityPersonnel();
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

  // Handle delete security personnel
  const handleDelete = async (securityId) => {
    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/users/${securityId}`,
        {
          method: "DELETE",
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
        setActionModal({ type: null, securityId: null, securityName: "" });
        await refreshSecurityPersonnel();
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

  // Filter security personnel based on search query
  const filteredSecurity = securityPersonnel.filter(
    (person) =>
      person.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.phone?.includes(searchQuery)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] ${theme.background.card} rounded-2xl ${theme.shadow.large} overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme.border.secondary}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Icon
                  icon="mdi:shield-account"
                  className="text-white text-xl"
                />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${theme.text.primary}`}>
                  Security Personnel
                </h2>
                <p className={`text-sm ${theme.text.secondary}`}>
                  Manage security accounts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:${theme.background.input} transition-colors`}
            >
              <Icon
                icon="mdi:close"
                className={`text-2xl ${theme.text.secondary}`}
              />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b ${theme.border.secondary}">
          <div
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg ${theme.background.input} border ${theme.border.secondary}`}
          >
            <Icon
              icon="mdi:magnify"
              className={`text-lg ${theme.text.tertiary}`}
            />
            <input
              type="text"
              placeholder="Search security personnel..."
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
            <div className="mt-2">
              <span className={`text-sm ${theme.text.secondary}`}>
                Found {filteredSecurity.length} of {securityPersonnel.length}{" "}
                security personnel
              </span>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {pagination && (
          <div className="px-6 py-3 border-b ${theme.border.secondary}">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme.text.secondary}`}>
                Total Security Personnel: {pagination.total}
              </span>
              <span className={`text-sm ${theme.text.secondary}`}>
                Page {pagination.current_page} of {pagination.last_page}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon
                icon="mdi:loading"
                className={`animate-spin text-4xl ${theme.text.tertiary}`}
              />
            </div>
          ) : filteredSecurity.length === 0 ? (
            <div className="text-center py-12">
              <Icon
                icon="mdi:shield-account-outline"
                className={`text-6xl ${theme.text.tertiary} mb-4 mx-auto`}
              />
              <p className={`text-base ${theme.text.secondary} mb-1`}>
                {searchQuery
                  ? "No security personnel found"
                  : "No security personnel registered"}
              </p>
              <p className={`text-sm ${theme.text.tertiary}`}>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Security personnel records will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSecurity.map((person, index) => (
                <div
                  key={person.id}
                  className={`${theme.background.input} rounded-xl p-4 border ${theme.border.secondary} hover:border-indigo-500 transition-all`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Number Badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {index + 1 + (currentPage - 1) * 20}
                      </span>
                    </div>

                    {/* Person Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3
                        className={`font-semibold ${theme.text.primary} text-base truncate`}
                      >
                        {person.full_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-sm ${theme.text.secondary}`}>
                          <Icon icon="mdi:phone" className="inline mr-1" />
                          {person.phone}
                        </span>
                        {person.email && (
                          <span className={`text-sm ${theme.text.secondary}`}>
                            <Icon icon="mdi:email" className="inline mr-1" />
                            {person.email}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            person.status_active
                              ? theme.status.success
                              : theme.status.error
                          }`}
                        >
                          <Icon
                            icon={
                              person.status_active
                                ? "mdi:check-circle"
                                : "mdi:close-circle"
                            }
                            className="text-sm"
                          />
                          {person.status_active ? "Active" : "Inactive"}
                        </span>

                        {/* Registration Date */}
                        <span className={`text-xs ${theme.text.tertiary}`}>
                          <Icon icon="mdi:calendar" className="inline mr-1" />
                          Joined{" "}
                          {new Date(person.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* View Details */}
                      <button
                        onClick={() => {
                          setSelectedSecurity({
                            ...person,
                            index: index + 1 + (currentPage - 1) * 20,
                          });
                          setShowViewModal(true);
                        }}
                        className="p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
                        title="View Details"
                      >
                        <Icon
                          icon="mdi:eye"
                          className="text-blue-600 dark:text-blue-400 text-sm"
                        />
                      </button>

                      {/* Toggle Status */}
                      {person.status_active ? (
                        <button
                          onClick={() =>
                            setActionModal({
                              type: "deactivate",
                              securityId: person.id,
                              securityName: person.full_name,
                            })
                          }
                          className="p-1.5 rounded-full bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 transition-colors"
                          title="Deactivate"
                        >
                          <Icon
                            icon="mdi:account-off"
                            className="text-yellow-600 dark:text-yellow-400 text-sm"
                          />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setActionModal({
                              type: "activate",
                              securityId: person.id,
                              securityName: person.full_name,
                            })
                          }
                          className="p-1.5 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 transition-colors"
                          title="Activate"
                        >
                          <Icon
                            icon="mdi:account-check"
                            className="text-green-600 dark:text-green-400 text-sm"
                          />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "delete",
                            securityId: person.id,
                            securityName: person.full_name,
                          })
                        }
                        className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 transition-colors"
                        title="Delete"
                      >
                        <Icon
                          icon="mdi:delete"
                          className="text-red-600 dark:text-red-400 text-sm"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && pagination && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t ${theme.border.secondary}">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentPage(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  pagination.current_page === 1
                    ? `${theme.background.input} ${theme.text.tertiary} cursor-not-allowed opacity-50`
                    : `bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg`
                }`}
              >
                <Icon icon="mdi:chevron-left" className="text-lg" />
                Previous
              </button>

              <div
                className={`px-4 py-2 ${theme.background.card} rounded-lg border ${theme.border.secondary}`}
              >
                <span className={`text-sm font-medium ${theme.text.primary}`}>
                  {pagination.current_page} / {pagination.last_page}
                </span>
              </div>

              <button
                onClick={() => setCurrentPage(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  pagination.current_page === pagination.last_page
                    ? `${theme.background.input} ${theme.text.tertiary} cursor-not-allowed opacity-50`
                    : `bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg`
                }`}
              >
                Next
                <Icon icon="mdi:chevron-right" className="text-lg" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${theme.border.secondary}`}>
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${theme.background.input} hover:${theme.background.secondary} ${theme.text.primary}`}
          >
            Close
          </button>
        </div>
      </div>

      {/* View Security Modal */}
      {showViewModal && selectedSecurity && (
        <ViewSecurityModal
          isOpen={showViewModal}
          security={selectedSecurity}
          securityIndex={selectedSecurity.index}
          theme={theme}
          onClose={() => {
            setShowViewModal(false);
            setSelectedSecurity(null);
          }}
        />
      )}

      {/* Activate Confirmation Modal */}
      {actionModal.type === "activate" && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              setActionModal({ type: null, securityId: null, securityName: "" })
            }
          />
          <div
            className={`relative ${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} p-6`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <Icon
                  icon="mdi:account-check"
                  className="text-3xl text-green-600 dark:text-green-400"
                />
              </div>
              <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
                Activate Security Personnel
              </h3>
              <p className={`text-sm ${theme.text.secondary} mb-6`}>
                Are you sure you want to activate{" "}
                <span className="font-semibold">
                  {actionModal.securityName}
                </span>
                ? They will be able to access their account.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() =>
                    setActionModal({
                      type: null,
                      securityId: null,
                      securityName: "",
                    })
                  }
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${theme.background.input} hover:${theme.background.secondary} ${theme.text.primary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleActivate(actionModal.securityId)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Activating..." : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {actionModal.type === "deactivate" && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              setActionModal({ type: null, securityId: null, securityName: "" })
            }
          />
          <div
            className={`relative ${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} p-6`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
                <Icon
                  icon="mdi:account-off"
                  className="text-3xl text-yellow-600 dark:text-yellow-400"
                />
              </div>
              <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
                Deactivate Security Personnel
              </h3>
              <p className={`text-sm ${theme.text.secondary} mb-6`}>
                Are you sure you want to deactivate{" "}
                <span className="font-semibold">
                  {actionModal.securityName}
                </span>
                ? They will not be able to access their account.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() =>
                    setActionModal({
                      type: null,
                      securityId: null,
                      securityName: "",
                    })
                  }
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${theme.background.input} hover:${theme.background.secondary} ${theme.text.primary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeactivate(actionModal.securityId)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-yellow-600 hover:bg-yellow-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Deactivating..." : "Deactivate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {actionModal.type === "delete" && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              setActionModal({ type: null, securityId: null, securityName: "" })
            }
          />
          <div
            className={`relative ${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} p-6`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                <Icon
                  icon="mdi:delete-alert"
                  className="text-3xl text-red-600 dark:text-red-400"
                />
              </div>
              <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
                Delete Security Personnel
              </h3>
              <p className={`text-sm ${theme.text.secondary} mb-6`}>
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold">
                  {actionModal.securityName}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() =>
                    setActionModal({
                      type: null,
                      securityId: null,
                      securityName: "",
                    })
                  }
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${theme.background.input} hover:${theme.background.secondary} ${theme.text.primary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(actionModal.securityId)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityManagementModal;
