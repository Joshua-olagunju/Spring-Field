import { useState } from "react";
import { Icon } from "@iconify/react";

export const GenerateAccountTokenModal = ({ theme, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateToken = async () => {
    // Validation
    if (!recipientName.trim()) {
      setError("Please enter recipient name");
      return;
    }
    if (!recipientEmail.trim()) {
      setError("Please enter recipient email");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const authToken = localStorage.getItem("authToken");

      const response = await fetch(
        "http://localhost:8000/api/otp/generate-landlord",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            recipient_name: recipientName,
            recipient_email: recipientEmail,
            expires_in_hours: parseInt(expiresInHours),
            description: description || undefined,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setGeneratedOtp(result.data);
        setRecipientName("");
        setRecipientEmail("");
        setExpiresInHours(24);
        setDescription("");
      } else {
        setError(result.message || "Failed to generate landlord OTP");
      }
    } catch (error) {
      console.error("Error generating landlord OTP:", error);
      setError("Error generating OTP. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedOtp) {
      navigator.clipboard.writeText(generatedOtp.otp_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setGeneratedOtp(null);
    setRecipientName("");
    setRecipientEmail("");
    setExpiresInHours(24);
    setDescription("");
    setError("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
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
            {generatedOtp ? "Landlord OTP Generated!" : "Generate Landlord OTP"}
          </h2>

          {/* Description */}
          <p className={`text-sm ${theme.text.secondary} mb-4 text-center`}>
            {generatedOtp
              ? "Share this OTP with the landlord to enable registration"
              : "Create a registration OTP for a new landlord in the system"}
          </p>

          {/* OTP Display Section */}
          {generatedOtp ? (
            <div className="space-y-4">
              {/* OTP Code Card */}
              <div
                className={`${theme.background.input} p-4 rounded-lg border-2 border-green-500`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2`}
                >
                  📋 Registration OTP Code:
                </p>
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-gray-900 p-3 rounded border border-green-300">
                  <code className="text-lg font-bold text-green-600">
                    {generatedOtp.otp_code}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                  >
                    <Icon
                      icon={copied ? "mdi:check" : "mdi:content-copy"}
                      className="text-sm"
                    />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Details */}
              <div
                className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
              >
                <p className={`text-xs ${theme.text.secondary} mb-2`}>
                  📧 <strong>Recipient:</strong> {generatedOtp.recipient_name} (
                  {generatedOtp.recipient_email})
                </p>
                <p className={`text-xs ${theme.text.secondary}`}>
                  ⏱️ <strong>Expires:</strong>{" "}
                  {new Date(generatedOtp.expires_at).toLocaleString()}
                </p>
              </div>

              {/* Instructions */}
              <div
                className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2`}
                >
                  📝 How to share this OTP:
                </p>
                <ol
                  className={`text-xs ${theme.text.secondary} space-y-1 list-decimal list-inside`}
                >
                  <li>Copy the OTP code above</li>
                  <li>Share it with the landlord (via email, message, etc.)</li>
                  <li>They go to /signup-otp and enter this code</li>
                  <li>They create their account as a landlord</li>
                  <li>They can then manage properties and residents</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-300 dark:border-gray-600">
                <button
                  onClick={handleClose}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Close
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:plus-circle" />
                  Generate More
                </button>
              </div>
            </div>
          ) : (
            // Form Section
            <div className="space-y-4">
              {/* Recipient Name */}
              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter landlord's full name"
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-green-500 transition-colors`}
                  disabled={isLoading}
                />
              </div>

              {/* Recipient Email */}
              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => {
                    setRecipientEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter landlord's email"
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-green-500 transition-colors`}
                  disabled={isLoading}
                />
              </div>

              {/* Expiry Time */}
              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Expires In (Hours)
                </label>
                <select
                  value={expiresInHours}
                  onChange={(e) => {
                    setExpiresInHours(e.target.value);
                    setError("");
                  }}
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-green-500 transition-colors cursor-pointer`}
                  disabled={isLoading}
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours (recommended)</option>
                  <option value="48">48 hours</option>
                  <option value="72">3 days</option>
                  <option value="168">7 days</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError("");
                  }}
                  placeholder="Add any notes about this landlord OTP"
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-green-500 transition-colors resize-none`}
                  rows="2"
                  disabled={isLoading}
                />
              </div>

              {/* Info Box */}
              <div
                className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2`}
                >
                  ℹ️ About Landlord OTP:
                </p>
                <ul
                  className={`text-xs ${theme.text.secondary} space-y-1 list-disc list-inside`}
                >
                  <li>Generates a unique 6-digit registration code</li>
                  <li>OTP can be shared with new landlords</li>
                  <li>Enables secure account creation for landlords</li>
                  <li>OTP expires after the selected time period</li>
                  <li>Expires automatically after use</li>
                </ul>
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateToken}
                  disabled={
                    isLoading || !recipientName.trim() || !recipientEmail.trim()
                  }
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
                      Generate OTP
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
