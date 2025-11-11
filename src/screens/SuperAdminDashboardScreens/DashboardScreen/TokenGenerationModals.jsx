import { useState } from "react";
import { Icon } from "@iconify/react";

export const GenerateAccountTokenModal = ({ theme, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateToken = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem("authToken");

      const response = await fetch(
        "http://localhost:8000/api/admin/generate-account-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("Account Token Generated:", result.token);
        alert(`Account Token Generated Successfully!\nToken: ${result.token}`);
        onClose();
      } else {
        alert("Failed to generate account token. Please try again.");
      }
    } catch (error) {
      console.error("Error generating account token:", error);
      alert("Error generating account token");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Icon icon="mdi:account-plus" className="text-3xl text-green-600" />
          </div>

          {/* Title */}
          <h2
            className={`text-xl font-bold ${theme.text.primary} mb-2 text-center`}
          >
            Generate Account Token
          </h2>

          {/* Description */}
          <p className={`text-sm ${theme.text.secondary} mb-4 text-center`}>
            This action will generate a registration token for account creation
            for new administrators in the system.
          </p>

          {/* Info Box */}
          <div
            className={`${theme.background.input} p-4 rounded-lg mb-6 border ${theme.border.secondary}`}
          >
            <p className={`text-xs font-medium ${theme.text.secondary} mb-2`}>
              What this does:
            </p>
            <ul
              className={`text-xs ${theme.text.secondary} space-y-1 list-disc list-inside`}
            >
              <li>Generates a unique registration token</li>
              <li>Token can be shared with new admin users</li>
              <li>Token enables secure account creation</li>
              <li>Token expires after use or time limit</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateToken}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Icon icon="mdi:plus-circle" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GenerateVisitorTokenModal = ({ theme, isOpen, onClose }) => {
  const [visitorName, setVisitorName] = useState("");
  const [stayType, setStayType] = useState("short");
  const [duration, setDuration] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateToken = async () => {
    // Validation
    if (!visitorName.trim()) {
      setError("Please enter visitor name");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const authToken = localStorage.getItem("authToken");

      // Prepare payload
      const payload = {
        visitor_name: visitorName,
        stay_type: stayType,
      };

      // Add duration only for long stay
      if (stayType === "long") {
        payload.duration_days = parseInt(duration);
      }

      const response = await fetch(
        "http://localhost:8000/api/admin/generate-visitor-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("Visitor Token Generated:", result.token);
        alert(
          `Visitor Token Generated Successfully!\nToken: ${result.token}\nExpires: ${result.expires_at}`
        );
        // Reset form
        setVisitorName("");
        setStayType("short");
        setDuration("1");
        onClose();
      } else {
        setError("Failed to generate visitor token. Please try again.");
      }
    } catch (error) {
      console.error("Error generating visitor token:", error);
      setError("Error generating visitor token");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon icon="mdi:qrcode-scan" className="text-3xl text-blue-600" />
          </div>

          {/* Title */}
          <h2
            className={`text-xl font-bold ${theme.text.primary} mb-2 text-center`}
          >
            Generate Visitor Token
          </h2>

          {/* Description */}
          <p className={`text-sm ${theme.text.secondary} mb-6 text-center`}>
            Create a secure access token for expected visitors to the estate
          </p>

          {/* Form */}
          <div className="space-y-4">
            {/* Visitor Name Input */}
            <div>
              <label
                className={`block text-sm font-medium ${theme.text.primary} mb-2`}
              >
                Visitor Name
              </label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => {
                  setVisitorName(e.target.value);
                  setError("");
                }}
                placeholder="Enter visitor's full name"
                className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-blue-500 transition-colors`}
                disabled={isLoading}
              />
            </div>

            {/* Stay Type Selection */}
            <div>
              <label
                className={`block text-sm font-medium ${theme.text.primary} mb-2`}
              >
                Stay Type
              </label>
              <select
                value={stayType}
                onChange={(e) => {
                  setStayType(e.target.value);
                  setError("");
                }}
                className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-blue-500 transition-colors cursor-pointer`}
                disabled={isLoading}
              >
                <option value="short">Short Stay (12 hours)</option>
                <option value="long">Long Stay</option>
              </select>
            </div>

            {/* Duration Selection (only for long stay) */}
            {stayType === "long" && (
              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Duration (Days)
                </label>
                <select
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    setError("");
                  }}
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-blue-500 transition-colors cursor-pointer`}
                  disabled={isLoading}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <option key={day} value={day}>
                      {day} day{day > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Info Box */}
            <div
              className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
            >
              <p className={`text-xs ${theme.text.secondary}`}>
                {stayType === "short"
                  ? "🕐 Token will expire in 12 hours"
                  : `📅 Token will expire in ${duration} day${
                      parseInt(duration) > 1 ? "s" : ""
                    }`}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-300">
                <p className="text-xs text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateToken}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Icon icon="mdi:plus-circle" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
