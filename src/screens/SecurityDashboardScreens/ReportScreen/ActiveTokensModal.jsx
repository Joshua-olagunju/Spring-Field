import { useState, useEffect } from "react";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { API_BASE_URL } from "../../../config/apiConfig";

const ActiveTokensModal = ({ theme, isOpen, onClose }) => {
  const { authToken } = useUser();
  const [activeTokens, setActiveTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState(null);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch active tokens
  const fetchActiveTokens = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/visitor-tokens/active-entries`,
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
        setActiveTokens(result.data || []);
      } else {
        console.error("Failed to fetch active tokens:", result.message);
      }
    } catch (error) {
      console.error("Error fetching active tokens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActiveTokens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Filter tokens based on search
  const filteredTokens = activeTokens.filter(
    (token) =>
      token.visitor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.visitor_phone?.includes(searchQuery) ||
      token.resident_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.house_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckoutClick = (token) => {
    setSelectedToken(token);
    setShowCheckoutConfirm(true);
  };

  const handleCheckoutConfirm = async () => {
    if (!selectedToken) return;

    try {
      setIsCheckingOut(true);

      // We need to get the token string - for now we'll use the exit-visitor endpoint with entry_id
      const response = await fetch(
        `${API_BASE_URL}/api/visitor-tokens/exit-visitor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              authToken || localStorage.getItem("authToken")
            }`,
          },
          body: JSON.stringify({
            entry_id: selectedToken.id,
            note: "Checked out via Active Tokens modal",
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh the list
        await fetchActiveTokens();
        setShowCheckoutConfirm(false);
        setSelectedToken(null);
      } else {
        alert(result.message || "Failed to check out visitor");
      }
    } catch (error) {
      console.error("Error checking out visitor:", error);
      alert("Error checking out visitor");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), "MMM dd, hh:mm a");
  };

  const calculateDuration = (enteredAt) => {
    const now = new Date();
    const entered = new Date(enteredAt);
    const diffMinutes = Math.floor((now - entered) / 1000 / 60);

    if (diffMinutes < 60) {
      return `${diffMinutes} mins`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}h ${mins}m`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`${theme.background.card} w-full max-w-4xl rounded-2xl ${theme.shadow.large} relative max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-xl sm:text-2xl font-bold ${theme.text.primary}`}
              >
                Active Visitor Tokens
              </h2>
              <p className={`text-sm ${theme.text.secondary} mt-1`}>
                Visitors currently on premises
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${theme.background.input} hover:${theme.background.card} transition-colors`}
            >
              <Icon
                icon="mdi:close"
                className={`text-xl ${theme.text.secondary}`}
              />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${theme.background.input} border ${theme.border.secondary}`}
            >
              <Icon
                icon="mdi:magnify"
                className={`text-lg ${theme.text.tertiary}`}
              />
              <input
                type="text"
                placeholder="Search by visitor name, phone, resident..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent text-sm ${theme.text.primary} placeholder-current placeholder-opacity-40 outline-none`}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full ${theme.background.input}`}>
              <span className={`text-sm ${theme.text.secondary}`}>
                Total Active:{" "}
                <span className={`font-bold ${theme.text.primary}`}>
                  {activeTokens.length}
                </span>
              </span>
            </div>
            {searchQuery && (
              <div
                className={`px-3 py-1 rounded-full ${theme.background.input}`}
              >
                <span className={`text-sm ${theme.text.secondary}`}>
                  Showing:{" "}
                  <span className={`font-bold ${theme.text.primary}`}>
                    {filteredTokens.length}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon
                icon="mdi:loading"
                className={`animate-spin text-4xl ${theme.text.tertiary}`}
              />
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Icon
                  icon="mdi:account-off-outline"
                  className={`text-6xl ${theme.text.tertiary} mb-3 mx-auto opacity-50`}
                />
                <p className={`text-sm ${theme.text.secondary}`}>
                  {searchQuery
                    ? "No active tokens match your search"
                    : "No active visitors on premises"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTokens.map((token) => (
                <div
                  key={token.id}
                  className={`${theme.background.secondary} rounded-xl p-4 border ${theme.border.secondary} hover:border-green-500 transition-all`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Token Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <h3
                          className={`font-semibold ${theme.text.primary} text-base truncate`}
                        >
                          {token.visitor_name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:phone"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span className={theme.text.secondary}>
                            {token.visitor_phone || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:account"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span className={theme.text.secondary}>
                            Host: {token.resident_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:home"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span className={theme.text.secondary}>
                            {token.house_number}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:clock-outline"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span className={theme.text.secondary}>
                            Duration: {calculateDuration(token.entered_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:login"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span className={theme.text.secondary}>
                            Entered: {formatDateTime(token.entered_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:shield-account"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span className={theme.text.secondary}>
                            By: {token.guard_name}
                          </span>
                        </div>
                      </div>

                      {token.note && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <Icon
                            icon="mdi:note-text"
                            className={`text-base ${theme.text.tertiary} mt-0.5`}
                          />
                          <span
                            className={`text-xs ${theme.text.tertiary} italic`}
                          >
                            {token.note}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={() => handleCheckoutClick(token)}
                      className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <Icon icon="mdi:logout" className="text-lg" />
                      Check Out
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checkout Confirmation Modal */}
      {showCheckoutConfirm && selectedToken && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isCheckingOut && setShowCheckoutConfirm(false)}
          />
          <div
            className={`${theme.background.card} w-full max-w-md rounded-2xl ${theme.shadow.large} relative p-6`}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  icon="mdi:logout"
                  className="text-3xl text-red-600 dark:text-red-400"
                />
              </div>
              <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
                Check Out Visitor?
              </h3>
              <p className={`text-sm ${theme.text.secondary}`}>
                Are you sure you want to check out{" "}
                <span className="font-semibold">
                  {selectedToken.visitor_name}
                </span>
                ?
              </p>
              <p className={`text-xs ${theme.text.tertiary} mt-2`}>
                Duration on premises:{" "}
                {calculateDuration(selectedToken.entered_at)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckoutConfirm(false)}
                disabled={isCheckingOut}
                className={`flex-1 px-4 py-3 rounded-lg border ${theme.border.secondary} ${theme.text.secondary} hover:${theme.background.secondary} transition-colors font-medium`}
              >
                Cancel
              </button>
              <button
                onClick={handleCheckoutConfirm}
                disabled={isCheckingOut}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <Icon icon="mdi:loading" className="text-lg animate-spin" />
                    Checking Out...
                  </>
                ) : (
                  "Confirm Check Out"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTokensModal;
