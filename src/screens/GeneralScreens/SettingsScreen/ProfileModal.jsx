import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { API_BASE_URL } from "../../../config/apiConfig";

const ProfileModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { authToken, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userRole, setUserRole] = useState("");

  // Profile data
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
  });

  // Fetch user profile on mount
  useEffect(() => {
    if (isOpen && !isEditMode) {
      fetchUserProfile();
    }
  }, [isOpen, isEditMode]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const data = result.data;
        setProfileData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
        });
        // Get user role from response or context
        const role = data.role || user?.role || "";
        setUserRole(role);
      } else {
        setError(result.message || "Failed to load profile");
      }
    } catch (err) {
      setError("Error loading profile. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMode = () => {
    const editableData = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      phone: profileData.phone,
      address: profileData.address,
    };
    setEditData(editableData);
    setIsEditMode(true);
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!editData.first_name.trim()) {
      setError("First name is required");
      return;
    }
    if (!editData.last_name.trim()) {
      setError("Last name is required");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Prepare the data to send
      const dataToSend = {
        first_name: editData.first_name,
        last_name: editData.last_name,
        phone: editData.phone,
        address: editData.address,
      };

      const response = await fetch(`${API_BASE_URL}/api/settings/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess("Profile updated successfully!");
        setProfileData({
          ...profileData,
          first_name: editData.first_name,
          last_name: editData.last_name,
          phone: editData.phone,
          address: editData.address,
        });
        setIsEditMode(false);

        // Clear success message after 2 seconds
        setTimeout(() => {
          setSuccess("");
        }, 2000);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Error updating profile. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsEditMode(false);
    setError("");
    setSuccess("");
    onClose();
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          {/* Header with Edit/Close */}
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${theme.text.primary}`}>
              {isEditMode ? "Edit Profile" : "Your Profile"}
            </h2>
            {!isEditMode && (
              <button
                onClick={handleEditMode}
                className={`p-2 rounded-lg ${theme.background.input} hover:${theme.background.card} transition-colors`}
                title="Edit profile"
              >
                <Icon
                  icon="mdi:pencil"
                  className={`text-lg ${theme.text.primary}`}
                />
              </button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Icon
                icon="mdi:loading"
                className={`animate-spin text-4xl ${theme.text.tertiary}`}
              />
            </div>
          )}

          {/* Content */}
          {!isLoading && (
            <>
              {isEditMode ? (
                // Edit Mode Form
                <div className="space-y-4">
                  {/* First Name */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editData.first_name}
                      onChange={(e) => {
                        setEditData({
                          ...editData,
                          first_name: e.target.value,
                        });
                        setError("");
                      }}
                      placeholder="Enter first name"
                      className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-blue-500 transition-colors`}
                      disabled={isSaving}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editData.last_name}
                      onChange={(e) => {
                        setEditData({ ...editData, last_name: e.target.value });
                        setError("");
                      }}
                      placeholder="Enter last name"
                      className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-blue-500 transition-colors`}
                      disabled={isSaving}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => {
                        setEditData({ ...editData, phone: e.target.value });
                        setError("");
                      }}
                      placeholder="Enter phone number"
                      className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-blue-500 transition-colors`}
                      disabled={isSaving}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                    >
                      Address {userRole !== "landlord" && "(View Only)"}
                    </label>
                    <textarea
                      value={editData.address}
                      onChange={(e) => {
                        setEditData({ ...editData, address: e.target.value });
                        setError("");
                      }}
                      placeholder="Enter address"
                      className={`w-full px-4 py-2 rounded-lg ${
                        theme.background.input
                      } ${theme.text.primary} border ${
                        theme.border.secondary
                      } ${
                        userRole === "landlord"
                          ? "focus:outline-none focus:border-blue-500"
                          : "opacity-75 cursor-not-allowed"
                      } transition-colors resize-none`}
                      rows="3"
                      disabled={isSaving || userRole !== "landlord"}
                      readOnly={userRole !== "landlord"}
                    />
                    {userRole !== "landlord" && (
                      <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                        Only landlords can edit the address field
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-100 border border-red-300">
                      <p className="text-xs text-red-800 flex items-center gap-2">
                        <Icon icon="mdi:alert-circle" />
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="p-3 rounded-lg bg-green-100 border border-green-300">
                      <p className="text-xs text-green-800 flex items-center gap-2">
                        <Icon icon="mdi:check-circle" />
                        {success}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors disabled:opacity-50`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={
                        isSaving ||
                        !editData.first_name.trim() ||
                        !editData.last_name.trim()
                      }
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Icon icon="mdi:loading" className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:check" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Icon
                        icon="mdi:account"
                        className="text-white text-5xl"
                      />
                    </div>
                  </div>

                  {/* Profile Fields */}
                  <div>
                    <p
                      className={`text-xs font-medium ${theme.text.secondary} mb-1`}
                    >
                      FIRST NAME
                    </p>
                    <p
                      className={`text-base ${theme.text.primary} font-semibold`}
                    >
                      {profileData.first_name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-xs font-medium ${theme.text.secondary} mb-1`}
                    >
                      LAST NAME
                    </p>
                    <p
                      className={`text-base ${theme.text.primary} font-semibold`}
                    >
                      {profileData.last_name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-xs font-medium ${theme.text.secondary} mb-1`}
                    >
                      EMAIL
                    </p>
                    <p
                      className={`text-base ${theme.text.primary} font-semibold break-all`}
                    >
                      {profileData.email || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-xs font-medium ${theme.text.secondary} mb-1`}
                    >
                      PHONE NUMBER
                    </p>
                    <p
                      className={`text-base ${theme.text.primary} font-semibold`}
                    >
                      {profileData.phone || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p
                      className={`text-xs font-medium ${theme.text.secondary} mb-1`}
                    >
                      ADDRESS
                    </p>
                    <p
                      className={`text-base ${theme.text.primary} font-semibold`}
                    >
                      {profileData.address || "Not provided"}
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-100 border border-red-300">
                      <p className="text-xs text-red-800 flex items-center gap-2">
                        <Icon icon="mdi:alert-circle" />
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                  >
                    Close
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
