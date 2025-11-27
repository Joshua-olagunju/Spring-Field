import { useState } from "react";
import { Icon } from "@iconify/react";
import { useUser } from "../../../../context/useUser";
import { API_BASE_URL } from "../../../config/apiConfig";

export const GenerateAccountTokenModal = ({ theme, isOpen, onClose }) => {
  const { authToken, isAuthenticated } = useUser();
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

    if (!isAuthenticated || !authToken) {
      setError("Authentication required. Please log in again.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/otp/generate-landlord`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
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

  const copyToClipboard = async () => {
    if (!generatedOtp) return;

    try {
      const textToCopy = generatedOtp.otp_code;

      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for iOS and older browsers
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch (err) {
      console.error("Copy failed:", err);
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
                    className="px-3 py-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs font-medium rounded transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-500/50 flex items-center gap-1"
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
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-500/50 flex items-center justify-center gap-2"
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
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
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

export const GenerateSecurityTokenModal = ({ theme, isOpen, onClose }) => {
  const { authToken, isAuthenticated } = useUser();
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
      setError("Please enter security personnel name");
      return;
    }
    if (!recipientEmail.trim()) {
      setError("Please enter security personnel email");
      return;
    }

    if (!isAuthenticated || !authToken) {
      setError("Authentication required. Please log in again.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/otp/generate-security`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
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
        // Show detailed error if available
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat();
          setError(errorMessages.join(". "));
        } else {
          setError(
            result.message || "Failed to generate security personnel OTP"
          );
        }
      }
    } catch (error) {
      console.error("Error generating security OTP:", error);
      setError("Error generating OTP. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedOtp) return;

    try {
      const textToCopy = generatedOtp.otp_code;

      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for iOS and older browsers
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch (err) {
      console.error("Copy failed:", err);
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
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Icon icon="mdi:shield-account" className="text-white text-3xl" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>
              Generate Security Account
            </h2>
            <p className={`text-sm ${theme.text.secondary}`}>
              Create an access token for security personnel registration
            </p>
          </div>

          {!generatedOtp ? (
            // Form
            <div className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Security Personnel Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${theme.border.primary} ${theme.background.input} ${theme.text.primary} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${theme.border.primary} ${theme.background.input} ${theme.text.primary} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Token Expires In (Hours)
                </label>
                <select
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
                  className={`w-full p-3 rounded-lg border ${theme.border.primary} ${theme.background.input} ${theme.text.primary} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={48}>2 days</option>
                  <option value={72}>3 days</option>
                  <option value={168}>1 week</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full p-3 rounded-lg border ${theme.border.primary} ${theme.background.input} ${theme.text.primary} focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none`}
                  placeholder="Purpose of this security account..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleClose}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium ${theme.button.secondary} transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateToken}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
          ) : (
            // Success State
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:check" className="text-white text-3xl" />
              </div>

              <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
                Security OTP Generated!
              </h3>

              <p className={`text-sm ${theme.text.secondary} mb-6`}>
                Share this code with {generatedOtp.recipient_name} to create
                their security account
              </p>

              <div
                className={`${theme.background.secondary} p-4 rounded-lg mb-4`}
              >
                <label
                  className={`block text-sm font-medium ${theme.text.secondary} mb-2`}
                >
                  Security Account OTP
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-1 font-mono text-2xl font-bold ${theme.text.primary} text-center py-2`}
                  >
                    {generatedOtp.otp_code}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className={`p-2 rounded-lg ${theme.button.secondary} hover:${theme.button.secondaryHover} transition-all`}
                  >
                    <Icon
                      icon={copied ? "mdi:check" : "mdi:content-copy"}
                      className={copied ? "text-green-600" : ""}
                    />
                  </button>
                </div>
              </div>

              <div
                className={`text-left ${theme.background.tertiary} p-4 rounded-lg mb-6 space-y-2`}
              >
                <div className="flex justify-between">
                  <span className={`text-sm ${theme.text.secondary}`}>
                    Recipient:
                  </span>
                  <span className={`text-sm font-medium ${theme.text.primary}`}>
                    {generatedOtp.recipient_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${theme.text.secondary}`}>
                    Email:
                  </span>
                  <span className={`text-sm ${theme.text.primary}`}>
                    {generatedOtp.recipient_email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${theme.text.secondary}`}>
                    Expires:
                  </span>
                  <span className={`text-sm ${theme.text.primary}`}>
                    {new Date(generatedOtp.expires_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${theme.text.secondary}`}>
                    Role:
                  </span>
                  <span className={`text-sm font-medium text-purple-600`}>
                    Security Personnel
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium ${theme.button.secondary} transition-all flex items-center justify-center gap-2`}
                >
                  <Icon icon="mdi:plus-circle" />
                  Generate Another
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
