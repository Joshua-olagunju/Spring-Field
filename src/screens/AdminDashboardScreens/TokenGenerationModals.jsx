import { useState } from "react";
import { Icon } from "@iconify/react";
import { useUser } from "../../../context/useUser";
import { API_BASE_URL } from "../../config/apiConfig";

export const GenerateUserTokenModal = ({
  theme,
  isOpen,
  onClose,
  adminContext = null,
}) => {
  const { authToken, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateToken = async () => {
    if (!recipientName.trim() || !recipientEmail.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Choose API endpoint based on context
      const endpoint = adminContext
        ? `${API_BASE_URL}/api/super-admin/generate-user-token-for-landlord`
        : `${API_BASE_URL}/api/admin/generate-user-token`;

      const payload = adminContext
        ? {
            recipient_name: recipientName.trim(),
            recipient_email: recipientEmail.trim(),
            expires_in_hours: 72,
            landlord_id: adminContext.id,
            landlord_house_number: adminContext.house_number,
            landlord_address: adminContext.address,
          }
        : {
            recipient_name: recipientName.trim(),
            recipient_email: recipientEmail.trim(),
            expires_in_hours: 72,
            admin_house_number: user?.house_number || user?.house?.house_number,
            admin_address: user?.address || user?.house?.address,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            authToken || localStorage.getItem("authToken")
          }`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setGeneratedOtp(result.data);
        setRecipientName("");
        setRecipientEmail("");
      } else {
        setError(result.message || "Failed to generate token");
      }
    } catch (err) {
      setError("Error generating token. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedOtp) return;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedOtp.otp_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for iOS and older browsers
        const textArea = document.createElement("textarea");
        textArea.value = generatedOtp.otp_code;
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
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon icon="mdi:account-plus" className="text-3xl text-blue-600" />
          </div>

          {/* Title */}
          <h2
            className={`text-xl font-bold ${theme.text.primary} mb-2 text-center`}
          >
            {generatedOtp
              ? "Resident Token Generated! ✅"
              : adminContext
              ? `Generate Token for ${adminContext.name}`
              : "Generate Resident Token"}
          </h2>

          {/* Description */}
          <p className={`text-sm ${theme.text.secondary} mb-4 text-center`}>
            {generatedOtp
              ? "Share this token with the resident to enable registration"
              : adminContext
              ? `Creating a registration token on behalf of ${adminContext.name}`
              : "Create a registration token for a new resident"}
          </p>

          {/* Content */}
          {generatedOtp ? (
            <div className="space-y-4">
              {/* Generated Token Display */}
              <div
                className={`${theme.background.input} p-4 rounded-lg border-2 border-blue-500`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2`}
                >
                  � Registration Token Code:
                </p>
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-gray-900 p-3 rounded border border-blue-300">
                  <code className="text-lg font-bold text-blue-600">
                    {generatedOtp.otp_code}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                  >
                    <Icon
                      icon={copied ? "mdi:check" : "mdi:content-copy"}
                      className="text-sm"
                    />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Resident Details */}
              <div
                className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
              >
                <p className={`text-xs ${theme.text.secondary} mb-2`}>
                  � <strong>Resident:</strong> {generatedOtp.recipient_name} (
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
                  📝 Next Steps:
                </p>
                <ol
                  className={`text-xs ${theme.text.secondary} space-y-1 list-decimal list-inside`}
                >
                  <li>Copy the token code above</li>
                  <li>Share it with the resident</li>
                  <li>Resident goes to signup page</li>
                  <li>They enter this token to register</li>
                  <li>
                    {adminContext
                      ? `Resident becomes linked under ${adminContext.name}'s account`
                      : "Resident becomes linked under your account"}
                  </li>
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
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:plus-circle" />
                  Generate More
                </button>
              </div>
            </div>
          ) : (
            // Form
            <div className="space-y-4">
              {/* Recipient Name */}
              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Resident Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter resident's full name"
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-blue-500 transition-colors`}
                  disabled={isLoading}
                />
              </div>

              {/* Recipient Email */}
              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Resident Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => {
                    setRecipientEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter resident's email"
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-blue-500 transition-colors`}
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
                  ℹ️ How This Works:
                </p>
                <ul
                  className={`text-xs ${theme.text.secondary} space-y-1 list-disc list-inside`}
                >
                  <li>Token generated from name & email only</li>
                  <li>Share token with resident via email/message</li>
                  <li>Resident enters token at signup page</li>
                  <li>
                    {adminContext
                      ? `Resident becomes linked under ${adminContext.name}'s account`
                      : "Resident becomes linked under your account"}
                  </li>
                  <li>
                    {adminContext
                      ? `${adminContext.name} can manage their access & visitors`
                      : "You can manage their access & visitors"}
                  </li>
                  <li>Token expires after 72 hours</li>
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
                      Generate Token
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
