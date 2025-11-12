import { useState } from "react";
import { Icon } from "@iconify/react";

export const GenerateUserTokenModal = ({ theme, isOpen, onClose }) => {
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
      const response = await fetch(
        "http://localhost:8000/api/admin/generate-user-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            recipient_name: recipientName.trim(),
            recipient_email: recipientEmail.trim(),
            expires_in_hours: 72,
          }),
        }
      );

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedOtp.otp_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            {generatedOtp ? "Resident Token Generated! ✅" : "Generate Resident Token"}
          </h2>

          {/* Description */}
          <p className={`text-sm ${theme.text.secondary} mb-4 text-center`}>
            {generatedOtp
              ? "Share this token with the resident to enable registration"
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
                  <li>They become linked under your account</li>
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
                  <li>Resident becomes linked under your account</li>
                  <li>You can manage their access & visitors</li>
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

export const GenerateVisitorTokenModal = ({ theme, isOpen, onClose }) => {
  const [visitorName, setVisitorName] = useState("");
  const [stayType, setStayType] = useState("short");
  const [duration, setDuration] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedToken, setGeneratedToken] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateToken = async () => {
    if (!visitorName.trim()) {
      setError("Please enter visitor's name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/admin/generate-visitor-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            visitor_name: visitorName,
            stay_type: stayType,
            duration: parseInt(duration),
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setGeneratedToken(result.data);
        setVisitorName("");
      } else {
        setError(result.message || "Failed to generate visitor token");
      }
    } catch (err) {
      setError("Error generating token. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedToken.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedToken(null);
    setVisitorName("");
    setStayType("short");
    setDuration("1");
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
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <Icon icon="mdi:qrcode-scan" className="text-3xl text-purple-600" />
          </div>

          {/* Title */}
          <h2
            className={`text-xl font-bold ${theme.text.primary} mb-2 text-center`}
          >
            {generatedToken
              ? "Visitor Token Generated!"
              : "Generate Visitor Token"}
          </h2>

          {/* Description */}
          <p className={`text-sm ${theme.text.secondary} mb-4 text-center`}>
            {generatedToken
              ? "Share this token with your visitor"
              : "Create a secure access token for an expected visitor"}
          </p>

          {/* Content */}
          {generatedToken ? (
            <div className="space-y-4">
              {/* Generated Token Display */}
              <div
                className={`${theme.background.input} p-4 rounded-lg border-2 border-purple-500`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2`}
                >
                  🔐 Access Token:
                </p>
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-gray-900 p-3 rounded border border-purple-300">
                  <code className="text-sm font-mono text-purple-600 truncate">
                    {generatedToken.token}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    <Icon
                      icon={copied ? "mdi:check" : "mdi:content-copy"}
                      className="text-sm"
                    />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Token Details */}
              <div
                className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
              >
                <p className={`text-xs ${theme.text.secondary} mb-2`}>
                  👤 <strong>Visitor:</strong> {generatedToken.visitor_name}
                </p>
                <p className={`text-xs ${theme.text.secondary} mb-2`}>
                  🕐 <strong>Stay Type:</strong>{" "}
                  {generatedToken.stay_type === "short"
                    ? "Short (12 hours)"
                    : "Long (1-7 days)"}
                </p>
                <p className={`text-xs ${theme.text.secondary}`}>
                  ⏰ <strong>Expires:</strong>{" "}
                  {new Date(generatedToken.expires_at).toLocaleString()}
                </p>
              </div>

              {/* Instructions */}
              <div
                className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2`}
                >
                  📝 How to use this token:
                </p>
                <ol
                  className={`text-xs ${theme.text.secondary} space-y-1 list-decimal list-inside`}
                >
                  <li>Copy the token above</li>
                  <li>Share it with your visitor</li>
                  <li>Visitor presents token at gate/entrance</li>
                  <li>Security scans/verifies token</li>
                  <li>Token expires after the stay duration ends</li>
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
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:plus-circle" />
                  Generate More
                </button>
              </div>
            </div>
          ) : (
            // Form
            <div className="space-y-4">
              {/* Visitor Name */}
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
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-purple-500 transition-colors`}
                  disabled={isLoading}
                />
              </div>

              {/* Stay Type */}
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
                    setDuration("1");
                    setError("");
                  }}
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-purple-500 transition-colors cursor-pointer`}
                  disabled={isLoading}
                >
                  <option value="short">Short (12 hours)</option>
                  <option value="long">Long (1-7 days)</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Duration ({stayType === "short" ? "hours" : "days"})
                </label>
                <select
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    setError("");
                  }}
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-purple-500 transition-colors cursor-pointer`}
                  disabled={isLoading}
                >
                  {stayType === "short" ? (
                    <>
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="4">4 hours</option>
                      <option value="6">6 hours</option>
                      <option value="12">12 hours</option>
                    </>
                  ) : (
                    <>
                      <option value="1">1 day</option>
                      <option value="2">2 days</option>
                      <option value="3">3 days</option>
                      <option value="5">5 days</option>
                      <option value="7">7 days</option>
                    </>
                  )}
                </select>
              </div>

              {/* Info Box */}
              <div
                className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2`}
                >
                  ℹ️ About Visitor Tokens:
                </p>
                <ul
                  className={`text-xs ${theme.text.secondary} space-y-1 list-disc list-inside`}
                >
                  <li>Generates a unique secure access token</li>
                  <li>Token provides temporary access for visitors</li>
                  <li>Choose between short (12h) or long (1-7 days)</li>
                  <li>Token is QR scannable at gate/entrance</li>
                  <li>Automatically expires after duration ends</li>
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
                  disabled={isLoading || !visitorName.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
