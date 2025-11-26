import { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Html5Qrcode } from "html5-qrcode";
import { API_BASE_URL } from "../../../config/apiConfig";

const TokenVerificationModal = ({ theme, isOpen, onClose }) => {
  const [verificationMode, setVerificationMode] = useState(null); // 'input' or 'scan'
  const [tokenInput, setTokenInput] = useState("");
  const [currentToken, setCurrentToken] = useState(""); // Track the current token being verified
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGrantingEntry, setIsGrantingEntry] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const html5QrCodeRef = useRef(null);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        setIsScanning(false);
      } catch {
        // Error stopping scanner
      }
    }
  }, []);

  const handleTokenVerification = useCallback(async (token) => {
    setIsVerifying(true);
    setErrorMessage("");
    setCurrentToken(token); // Track the token being verified

    try {
      const authToken =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!authToken) {
        setErrorMessage("Authentication required. Please log in again.");
        setIsVerifying(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/visitor-tokens/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success && result.isValid) {
        setVerificationResult({
          isValid: true,
          isGranted: result.isGranted || false, // Check if already granted
          entryId: result.data.entry_id, // For checkout
          visitorInfo: {
            name: result.data.visitorInfo.name,
            phone: result.data.visitorInfo.phone,
            stayType: result.data.visitorInfo.stayType,
            expiresAt: result.data.visitorInfo.expiresAt,
            note: result.data.visitorInfo.note,
            enteredAt: result.data.visitorInfo.enteredAt, // For already granted tokens
          },
          generatedBy: {
            name: result.data.generatedBy.name,
            phone: result.data.generatedBy.phone,
            house_number: result.data.generatedBy.house_number,
            address: result.data.generatedBy.address,
            house_type: result.data.generatedBy.house_type,
            role: result.data.generatedBy.role,
            generatedAt: result.data.generatedBy.generatedAt,
          },
          grantedBy: result.data.grantedBy, // For already granted tokens
          tokenId: result.data.token_id,
        });
      } else {
        setVerificationResult({
          isValid: false,
          message: result.message || "Invalid or expired token",
        });
      }
    } catch {
      setErrorMessage("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (isScanning) {
      stopScanner();
    }
    setVerificationMode(null);
    setTokenInput("");
    setCurrentToken("");
    setVerificationResult(null);
    setSuccessMessage("");
    setErrorMessage("");
    setIsVerifying(false);
    setIsGrantingEntry(false);
    setIsCheckingOut(false);
    onClose();
  }, [isScanning, stopScanner, onClose]);

  const startScanner = useCallback(async () => {
    try {
      setIsScanning(true);
      setErrorMessage("");

      // First, get available cameras using the correct API
      let cameras = [];
      try {
        // This method will trigger user permissions according to docs
        cameras = await Html5Qrcode.getCameras();

        if (!cameras || cameras.length === 0) {
          throw new Error("No cameras found on this device");
        }
      } catch {
        throw new Error(
          "Failed to access camera. Please allow camera permission when prompted."
        );
      }

      // Initialize the QR code scanner
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      // Choose camera - prefer back camera for mobile
      let selectedCamera = cameras[0]; // Default to first camera

      // Try to find back/rear camera
      const backCamera = cameras.find(
        (camera) =>
          camera.label.toLowerCase().includes("back") ||
          camera.label.toLowerCase().includes("rear") ||
          camera.label.toLowerCase().includes("environment")
      );

      if (backCamera) {
        selectedCamera = backCamera;
      } else {
        // Using default camera
      }

      // Start scanning with the selected camera
      await html5QrCode.start(
        selectedCamera.id, // Use camera ID as per documentation
        {
          fps: 10, // Frame per seconds for QR code scanning
          qrbox: { width: 250, height: 320 }, // Bounded box UI
        },
        (decodedText) => {
          // Success callback - code is read
          handleTokenVerification(decodedText);
          stopScanner();
        },
        () => {
          // Error callback - parse error, ignore it as per docs
        }
      );
    } catch (err) {
      let errorMsg = "Failed to start camera scanner. ";

      if (
        err.message.includes("Permission denied") ||
        err.message.includes("NotAllowedError")
      ) {
        // Close modal on camera permission denial
        handleClose();
        return;
      } else if (err.message.includes("No cameras found")) {
        errorMsg += "No camera devices found on your device.";
      } else if (err.message.includes("Failed to access camera")) {
        errorMsg +=
          "Could not access camera. Please ensure camera permissions are granted.";
      } else if (err.message.includes("secure context")) {
        errorMsg += "Camera requires HTTPS. Please use a secure connection.";
      } else {
        errorMsg += `${err.message}`;
      }

      // Add localhost specific guidance
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        if (window.location.protocol !== "https:") {
          errorMsg +=
            " On localhost, try using HTTPS (https://localhost:5173) for better camera support.";
        }
      }

      setErrorMessage(errorMsg);
      setIsScanning(false);
    }
  }, [handleTokenVerification, stopScanner, handleClose]);

  const handleGrantEntry = async () => {
    setIsGrantingEntry(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const authToken =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!authToken) {
        setErrorMessage("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/visitor-tokens/grant-entry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token: currentToken, // Use the verified token
            visitor_name: verificationResult.visitorInfo.name,
            visitor_phone: verificationResult.visitorInfo.phone,
            note: `Entry granted via ${
              verificationMode === "scan" ? "QR scan" : "manual input"
            }`,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(
          `✅ Entry granted successfully! ${verificationResult.visitorInfo.name} has been allowed access to the premises.`
        );
        // Auto-close modal after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setErrorMessage(result.message || "Failed to grant entry");
      }
    } catch {
      setErrorMessage("Failed to grant entry. Please try again.");
    } finally {
      setIsGrantingEntry(false);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const authToken =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!authToken) {
        setErrorMessage("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/visitor-tokens/exit-visitor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            entry_id: verificationResult.entryId, // Use entry_id for checkout
            note: `Checked out via ${
              verificationMode === "scan" ? "QR scan" : "manual input"
            }`,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(
          `✅ Check out successful! ${verificationResult.visitorInfo.name} has been checked out of the premises.`
        );
        // Auto-close modal after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setErrorMessage(result.message || "Failed to check out visitor");
      }
    } catch {
      setErrorMessage("Failed to check out visitor. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        stopScanner();
      }
    };
  }, [stopScanner]);

  // Auto-start camera when scan mode is selected
  useEffect(() => {
    if (verificationMode === "scan" && !isScanning && !verificationResult) {
      // Small delay to ensure DOM element is ready
      setTimeout(() => {
        startScanner();
      }, 100);
    }
  }, [verificationMode, isScanning, verificationResult, startScanner]);

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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${theme.text.primary}`}>
              Verify Token
            </h2>
            <button
              onClick={handleClose}
              className={`p-2 rounded-full ${theme.background.input} hover:${theme.background.card} transition-colors`}
            >
              <Icon
                icon="mdi:close"
                className={`text-xl ${theme.text.secondary}`}
              />
            </button>
          </div>

          {/* Mode Selection */}
          {!verificationMode && !verificationResult && (
            <div className="space-y-4">
              <p className={`text-sm ${theme.text.secondary} text-center mb-6`}>
                Choose how you want to verify the token
              </p>

              <button
                onClick={() => setVerificationMode("input")}
                className="w-full p-4 border-2 border-purple-300 dark:border-purple-600 rounded-xl hover:border-purple-500 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:keyboard"
                    className="text-2xl text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold ${theme.text.primary}`}>
                    Input Token
                  </h3>
                  <p className={`text-sm ${theme.text.secondary}`}>
                    Type the token manually
                  </p>
                </div>
              </button>

              <button
                onClick={() => setVerificationMode("scan")}
                className="w-full p-4 border-2 border-purple-300 dark:border-purple-600 rounded-xl hover:border-purple-500 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Icon
                    icon="mdi:qrcode-scan"
                    className="text-2xl text-green-600 dark:text-green-400"
                  />
                </div>
                <div className="text-left">
                  <h3 className={`font-semibold ${theme.text.primary}`}>
                    Scan QR Code
                  </h3>
                  <p className={`text-sm ${theme.text.secondary}`}>
                    Use camera to scan
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Input Mode */}
          {verificationMode === "input" && !verificationResult && (
            <div className="space-y-4">
              <button
                onClick={() => setVerificationMode(null)}
                className={`flex items-center gap-2 text-sm ${theme.text.secondary} hover:${theme.text.primary} transition-colors mb-4`}
              >
                <Icon icon="mdi:arrow-left" />
                Back
              </button>

              <div>
                <label
                  className={`block text-sm font-medium ${theme.text.primary} mb-2`}
                >
                  Enter Token
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="VT-XXXXXXXXX"
                  className={`w-full px-4 py-3 rounded-lg ${theme.background.input} ${theme.text.primary} border ${theme.border.secondary} focus:outline-none focus:border-purple-500 transition-colors`}
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700">
                  <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" />
                    {errorMessage}
                  </p>
                </div>
              )}

              <button
                onClick={() => handleTokenVerification(tokenInput)}
                disabled={!tokenInput.trim() || isVerifying}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check-circle" />
                    Verify Token
                  </>
                )}
              </button>
            </div>
          )}

          {/* Scanner Mode */}
          {verificationMode === "scan" && !verificationResult && (
            <div className="space-y-4">
              <button
                onClick={() => setVerificationMode(null)}
                className={`flex items-center gap-2 text-sm ${theme.text.secondary} hover:${theme.text.primary} transition-colors mb-4`}
              >
                <Icon icon="mdi:arrow-left" />
                Back
              </button>

              <div className="text-center">
                {/* Localhost Warning */}
                {(window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1") &&
                  window.location.protocol !== "https:" && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
                      <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                        <Icon
                          icon="mdi:alert"
                          className="mt-0.5 flex-shrink-0"
                        />
                        <span>
                          <strong>Localhost Camera Issue:</strong> Most browsers
                          block camera access on HTTP localhost.
                          <br />
                          <strong>Solution:</strong> Use your ngrok URL instead:{" "}
                          <br />
                          <code className="bg-amber-200 dark:bg-amber-800 px-1 rounded text-xs">
                            Use the ngrok tunnel you're already running
                          </code>
                        </span>
                      </p>
                    </div>
                  )}

                <div
                  id="qr-reader"
                  className="mx-auto rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600"
                  style={{ width: "280px", height: "300px" }}
                />

                {!isScanning && !errorMessage && (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Icon
                        icon="mdi:loading"
                        className={`text-3xl ${theme.text.primary} animate-spin`}
                      />
                      <span
                        className={`${theme.text.primary} text-sm font-medium`}
                      >
                        Starting Camera...
                      </span>
                      <p
                        className={`text-xs ${theme.text.secondary} text-center px-4`}
                      >
                        Please allow camera access when prompted
                        <br />
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          📷 Click "Allow" in the browser permission dialog
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700">
                      <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                        <Icon icon="mdi:alert-circle" />
                        {errorMessage}
                      </p>
                    </div>
                    <button
                      onClick={startScanner}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon icon="mdi:refresh" />
                      Try Again
                    </button>
                  </div>
                )}

                {isScanning && (
                  <div className="mt-4">
                    <p className={`text-sm ${theme.text.secondary} mb-4`}>
                      Point camera at QR code to scan
                    </p>
                    <button
                      onClick={() => {
                        stopScanner();
                        setVerificationMode(null); // Go back to mode selection
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      <Icon icon="mdi:stop" />
                      Stop Scanner
                    </button>
                  </div>
                )}

                {isVerifying && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Icon
                      icon="mdi:loading"
                      className={`animate-spin ${theme.text.primary}`}
                    />
                    <span className={theme.text.primary}>
                      Verifying token...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className="space-y-4">
              {verificationResult.isValid ? (
                // Success Result
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        icon="mdi:check-circle"
                        className="text-3xl text-green-600 dark:text-green-400"
                      />
                    </div>
                    <h3 className={`text-lg font-bold ${theme.text.primary}`}>
                      Token Verified
                    </h3>
                    <p className={`text-sm ${theme.text.secondary}`}>
                      Valid visitor token found
                    </p>
                  </div>

                  <div
                    className={`${theme.background.input} p-4 rounded-lg space-y-3`}
                  >
                    <h4
                      className={`font-semibold ${theme.text.primary} flex items-center gap-2 justify-center`}
                    >
                      <Icon icon="mdi:account" className="text-lg" />
                      Visitor Information
                    </h4>
                    <div className="space-y-2 text-start">
                      <p className={`text-sm ${theme.text.secondary}`}>
                        <span className="font-medium">Name:</span>{" "}
                        {verificationResult.visitorInfo.name}
                      </p>
                      <p className={`text-sm ${theme.text.secondary}`}>
                        <span className="font-medium">Stay Type:</span>{" "}
                        {verificationResult.visitorInfo.stayType === "short"
                          ? "Short (12 hours)"
                          : "Long (1-7 days)"}
                      </p>
                      <p className={`text-sm ${theme.text.secondary}`}>
                        <span className="font-medium">Expires:</span>{" "}
                        {new Date(
                          verificationResult.visitorInfo.expiresAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`${theme.background.input} p-4 mt-3 rounded-lg space-y-3`}
                  >
                    <h4
                      className={`font-semibold ${theme.text.primary} flex items-center gap-2 justify-center`}
                    >
                      <Icon icon="mdi:account-tie" className="text-lg" />
                      Generated By
                    </h4>
                    <div className="space-y-2 text-start">
                      <p className={`text-sm ${theme.text.secondary}`}>
                        <span className="font-medium">Name:</span>{" "}
                        {verificationResult.generatedBy.name}
                      </p>
                      <p className={`text-sm ${theme.text.secondary}`}>
                        <span className="font-medium">Phone:</span>{" "}
                        {verificationResult.generatedBy.phone || "Not provided"}
                      </p>
                      <p className={`text-sm ${theme.text.secondary}`}>
                        <span className="font-medium">Role:</span>{" "}
                        {verificationResult.generatedBy.role}
                      </p>
                      {verificationResult.generatedBy.house_number && (
                        <p className={`text-sm ${theme.text.secondary}`}>
                          <span className="font-medium">House Number:</span>{" "}
                          {verificationResult.generatedBy.house_number}
                        </p>
                      )}
                      {verificationResult.generatedBy.address && (
                        <p className={`text-sm ${theme.text.secondary}`}>
                          <span className="font-medium">Address:</span>{" "}
                          {verificationResult.generatedBy.address}
                        </p>
                      )}
                      {verificationResult.generatedBy.house_type && (
                        <p className={`text-sm ${theme.text.secondary}`}>
                          <span className="font-medium">House Type:</span>{" "}
                          {verificationResult.generatedBy.house_type ===
                          "room_self"
                            ? "Room Self"
                            : verificationResult.generatedBy.house_type ===
                              "room_and_parlor"
                            ? "Room and Parlor"
                            : verificationResult.generatedBy.house_type ===
                              "2_bedroom"
                            ? "2-Bedroom"
                            : verificationResult.generatedBy.house_type ===
                              "3_bedroom"
                            ? "3-Bedroom"
                            : verificationResult.generatedBy.house_type ===
                              "duplex"
                            ? "Duplex"
                            : verificationResult.generatedBy.house_type}
                        </p>
                      )}
                      <p className={`text-sm ${theme.text.secondary}`}>
                        <span className="font-medium">Generated:</span>{" "}
                        {new Date(
                          verificationResult.generatedBy.generatedAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Show entry/granted info if token is already granted */}
                  {verificationResult.isGranted &&
                    verificationResult.visitorInfo.enteredAt && (
                      <div
                        className={`${theme.background.input} p-4 mt-3 rounded-lg space-y-3 border-2 border-green-500`}
                      >
                        <h4
                          className={`font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 justify-center`}
                        >
                          <Icon icon="mdi:check-circle" className="text-lg" />
                          Access Already Granted
                        </h4>
                        <div className="space-y-2 text-start">
                          <p className={`text-sm ${theme.text.secondary}`}>
                            <span className="font-medium">Entered At:</span>{" "}
                            {new Date(
                              verificationResult.visitorInfo.enteredAt
                            ).toLocaleString()}
                          </p>
                          {verificationResult.grantedBy && (
                            <p className={`text-sm ${theme.text.secondary}`}>
                              <span className="font-medium">Granted By:</span>{" "}
                              {verificationResult.grantedBy.name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Success/Error Messages */}
                  {successMessage && (
                    <div className="mb-4 p-4 rounded-lg bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700">
                      <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                        <Icon icon="mdi:check-circle" />
                        {successMessage}
                      </p>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700">
                      <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                        <Icon icon="mdi:alert-circle" />
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleClose}
                      disabled={isGrantingEntry || isCheckingOut}
                      className={`flex-1 px-4 py-3 rounded-lg ${theme.background.input} ${theme.text.primary} font-medium hover:${theme.background.card} transition-colors disabled:opacity-50`}
                    >
                      {successMessage ? "Close" : "Cancel"}
                    </button>

                    {/* Show Grant Entry or Check Out button based on isGranted */}
                    {verificationResult.isGranted ? (
                      <button
                        onClick={handleCheckout}
                        disabled={
                          isCheckingOut || isGrantingEntry || successMessage
                        }
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isCheckingOut ? (
                          <>
                            <Icon icon="mdi:loading" className="animate-spin" />
                            Checking Out...
                          </>
                        ) : (
                          <>
                            <Icon icon="mdi:logout" />
                            Check Out Visitor
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleGrantEntry}
                        disabled={
                          isGrantingEntry || isCheckingOut || successMessage
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isGrantingEntry ? (
                          <>
                            <Icon icon="mdi:loading" className="animate-spin" />
                            Granting Entry...
                          </>
                        ) : (
                          <>
                            <Icon icon="mdi:check-circle" />
                            Grant Entry
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Error Result
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon
                      icon="mdi:close-circle"
                      className="text-3xl text-red-600 dark:text-red-400"
                    />
                  </div>
                  <h3
                    className={`text-lg font-bold ${theme.text.primary} mb-2`}
                  >
                    Invalid Token
                  </h3>
                  <p className={`text-sm ${theme.text.secondary} mb-6`}>
                    {verificationResult.message}
                  </p>
                  <button
                    onClick={() => {
                      setVerificationResult(null);
                      setVerificationMode(null);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenVerificationModal;
