import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { ShareTokenImage } from "./ShareTokenImage";
import { useUser } from "../../../../context/useUser";
import { API_BASE_URL } from "../../../config/apiConfig";

export const GenerateVisitorTokenModal = ({ theme, isOpen, onClose }) => {
  const { authToken, isAuthenticated, user } = useUser();
  const navigate = useNavigate();
  const qrRef = useRef();
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [stayType, setStayType] = useState("short");
  const [duration, setDuration] = useState("1");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedToken, setGeneratedToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  // Get the correct subscription path based on user role
  const getSubscriptionPath = () => {
    if (user?.role === "landlord") {
      return "/admin/subscription";
    }
    return "/subscription"; // Default for regular users
  };

  // Check subscription status when modal opens
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      setIsCheckingSubscription(true);

      // If user is super admin, bypass subscription check
      if (user?.role === "super") {
        setSubscriptionStatus({ has_active_subscription: true });
        setIsCheckingSubscription(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/payments/subscription-status`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSubscriptionStatus(result.data);
      } else {
        console.error("Failed to check subscription status:", result.message);
        setError("Failed to check subscription status");
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setError("Error checking subscription status");
    } finally {
      setIsCheckingSubscription(false);
    }
  }, [authToken, user?.role, setError, setSubscriptionStatus]);

  useEffect(() => {
    if (isOpen && isAuthenticated && authToken) {
      checkSubscriptionStatus();
    }
  }, [isOpen, isAuthenticated, authToken, checkSubscriptionStatus]);

  const handleGenerateToken = async () => {
    if (!visitorName.trim()) {
      setError("Please enter visitor's name");
      return;
    }

    if (!isAuthenticated || !authToken) {
      setError("Authentication required. Please log in again.");
      return;
    }

    // Check if user has active subscription (skip for super admin)
    if (
      user?.role !== "super" &&
      !subscriptionStatus?.has_active_subscription
    ) {
      setError(
        "Active subscription required to generate visitor tokens. Please subscribe to a plan."
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/visitor-tokens/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            issued_for_name: visitorName,
            issued_for_phone: visitorPhone,
            visit_type: stayType,
            duration: parseInt(duration),
            note: note,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setGeneratedToken(result.data);
        setVisitorName("");
        setVisitorPhone("");
        setNote("");
      } else if (result.requires_subscription) {
        setError(result.message || "Subscription required to generate tokens");
        // You might want to show a payment modal here
      } else {
        setError(
          result.message ||
            `Failed to generate visitor token: ${response.status}`
        );
      }
    } catch (err) {
      setError("Error generating token. Please check console for details.");
      console.error("Token generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedToken) return;

    try {
      const textToCopy = generatedToken.token_code;

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

  const copyMessageToClipboard = () => {
    const expiryDate = new Date(generatedToken.expires_at).toLocaleString();
    const stayTypeText =
      generatedToken.stay_type === "short"
        ? "Short (12 hours)"
        : "Long (1-7 days)";

    const message = `SPRINGFIELD ESTATE - VISITOR ACCESS TOKEN

Dear ${generatedToken.visitor_name},

Your visitor access token has been generated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCESS TOKEN: ${generatedToken.token}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Visitor: ${generatedToken.visitor_name}
Stay Type: ${stayTypeText}
Expires: ${expiryDate}

INSTRUCTIONS:
1. Present this token at the gate/entrance
2. Security will scan the QR code
3. You will be granted access for the specified duration
4. Token will automatically expire after the stay

Generated: ${new Date().toLocaleString()}
Springfield Estate Security System`;

    navigator.clipboard.writeText(message);
    setMessageCopied(true);
    setTimeout(() => setMessageCopied(false), 2000);
  };

  const downloadQRCodeWithToken = () => {
    const shareTokenImage = ShareTokenImage({
      qrCanvasRef: qrRef,
      token: generatedToken.token,
      visitorName: generatedToken.visitor_name,
    });
    shareTokenImage.downloadImage();
  };

  const shareQRCode = () => {
    const shareTokenImage = ShareTokenImage({
      qrCanvasRef: qrRef,
      token: generatedToken.token,
      visitorName: generatedToken.visitor_name,
    });
    shareTokenImage.shareImage();
  };

  const handleReset = () => {
    setGeneratedToken(null);
    setVisitorName("");
    setVisitorPhone("");
    setStayType("short");
    setDuration("1");
    setNote("");
    setError("");
    setSubscriptionStatus(null);
    setIsCheckingSubscription(true);
    // Re-check subscription status
    if (isAuthenticated && authToken) {
      checkSubscriptionStatus();
    }
  };

  const handleClose = () => {
    setGeneratedToken(null);
    setVisitorName("");
    setVisitorPhone("");
    setStayType("short");
    setDuration("1");
    setNote("");
    setError("");
    setSubscriptionStatus(null);
    setIsCheckingSubscription(true);
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
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            <Icon
              icon="mdi:qrcode"
              className="text-3xl text-purple-600 dark:text-purple-400"
            />
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
          {isCheckingSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={`${theme.text.secondary} text-sm`}>
                    Checking subscription status...
                  </p>
                </div>
              </div>
            </div>
          ) : subscriptionStatus &&
            !subscriptionStatus.has_active_subscription &&
            user?.role !== "super" ? (
            <div className="space-y-4">
              {/* Subscription Required Warning */}
              <div className="p-4 rounded-lg bg-orange-100 border border-orange-300">
                <div className="flex items-start gap-3">
                  <Icon
                    icon="mdi:alert-circle"
                    className="text-orange-600 text-xl mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-medium text-orange-800 text-sm">
                      Payment Required
                    </h4>
                    <p className="text-orange-700 text-xs mt-1">
                      {subscriptionStatus?.payment_status?.payment_ratio && (
                        <>
                          Payment status:{" "}
                          {subscriptionStatus.payment_status.payment_ratio} -{" "}
                        </>
                      )}
                      {subscriptionStatus?.payment_status?.status_message ||
                        "You must make payment to generate visitor tokens. Monthly payment required from registration date."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center py-4">
                <button
                  onClick={() => navigate(getSubscriptionPath())}
                  className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <Icon icon="mdi:credit-card" />
                  View Subscription Plans
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  {subscriptionStatus?.payment_status?.payment_ratio
                    ? `Current status: ${subscriptionStatus.payment_status.payment_ratio} (${subscriptionStatus.payment_status.status_message})`
                    : "Choose from our affordable monthly, 6-month, or yearly plans"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-300 dark:border-gray-600">
                <button
                  onClick={handleClose}
                  className={`flex-1 px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          ) : generatedToken ? (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div
                className={`${theme.background.input} p-6 rounded-lg border-2 border-purple-500 flex justify-center`}
              >
                <div ref={qrRef} className="bg-white p-4 rounded-lg">
                  <QRCode
                    value={generatedToken.token}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* Token Display */}
              <div
                className={`${theme.background.input} p-4 rounded-lg border-2 border-purple-500`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2 flex items-center gap-1`}
                >
                  <Icon icon="mdi:lock" className="text-sm" />
                  Access Token:
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
                <p
                  className={`text-xs ${theme.text.secondary} mb-2 flex items-center gap-1`}
                >
                  <Icon icon="mdi:account" className="text-sm" />
                  <strong>Visitor:</strong> {generatedToken.visitor_name}
                  {generatedToken.visitor_phone &&
                    ` (${generatedToken.visitor_phone})`}
                </p>
                <p
                  className={`text-xs ${theme.text.secondary} mb-2 flex items-center gap-1`}
                >
                  <Icon icon="mdi:clock" className="text-sm" />
                  <strong>Stay Type:</strong>{" "}
                  {generatedToken.stay_type === "short"
                    ? "Short (12 hours)"
                    : "Long (1-7 days)"}
                </p>
                <p
                  className={`text-xs ${theme.text.secondary} flex items-center gap-1`}
                >
                  <Icon icon="mdi:timer-end" className="text-sm" />
                  <strong>Expires:</strong>{" "}
                  {new Date(generatedToken.expires_at).toLocaleString()}
                </p>
              </div>

              {/* Instructions */}
              <div
                className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2 flex items-center gap-1`}
                >
                  <Icon icon="mdi:information" className="text-sm" />
                  How to use this token:
                </p>
                <ol
                  className={`text-xs ${theme.text.secondary} space-y-1 list-decimal list-inside`}
                >
                  <li>Share the QR code image or copy the message</li>
                  <li>Visitor scans QR code or presents token at gate</li>
                  <li>Security verifies the token</li>
                  <li>Visitor gains access for duration specified</li>
                  <li>Token automatically expires after stay duration</li>
                </ol>
              </div>

              {/* Sharing Options */}
              <div className="space-y-2">
                <p
                  className={`text-xs font-medium ${theme.text.secondary} text-center flex items-center justify-center gap-1`}
                >
                  <Icon icon="mdi:share-variant" className="text-sm" />
                  Share Options:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={downloadQRCodeWithToken}
                    className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:download" />
                    Download QR
                  </button>
                  <button
                    onClick={shareQRCode}
                    className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:share-variant" />
                    Share
                  </button>
                </div>
              </div>

              {/* Copy Message Option */}
              <div
                className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2 flex items-center gap-1`}
                >
                  <Icon icon="mdi:message-text" className="text-sm" />
                  Copy Message with Details:
                </p>
                <button
                  onClick={copyMessageToClipboard}
                  className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Icon
                    icon={messageCopied ? "mdi:check" : "mdi:content-copy"}
                    className="text-sm"
                  />
                  {messageCopied ? "Message Copied!" : "Copy Full Message"}
                </button>
                <p className={`text-xs ${theme.text.secondary} mt-2 italic`}>
                  Includes complete token details and Springfield Estate
                  branding.
                </p>
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

              {/* Visitor Phone */}
              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Visitor Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={visitorPhone}
                  onChange={(e) => {
                    setVisitorPhone(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter visitor's phone number"
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

              {/* Note */}
              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setError("");
                  }}
                  placeholder="Any additional information or instructions"
                  className={`w-full px-4 py-2 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-purple-500 transition-colors resize-none`}
                  rows={3}
                  maxLength={500}
                  disabled={isLoading}
                />
                {note.length > 0 && (
                  <p className={`text-xs ${theme.text.tertiary} mt-1`}>
                    {note.length}/500 characters
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div
                className={`${theme.background.input} p-3 rounded-lg border ${theme.border.secondary}`}
              >
                <p
                  className={`text-xs font-medium ${theme.text.secondary} mb-2 flex items-center gap-1`}
                >
                  <Icon icon="mdi:information-outline" className="text-sm" />
                  About Visitor Tokens:
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
