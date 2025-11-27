import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../../config/apiConfig";

// Transaction Details Modal Component
const TransactionDetailsModal = ({ transaction, theme, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPeriodTypeLabel = (periodType) => {
    switch (periodType) {
      case "monthly":
        return "Monthly Plan";
      case "quarterly":
        return "Quarterly Plan";
      case "6months":
        return "6 Months Plan";
      case "yearly":
        return "Yearly Plan";
      default:
        return "Subscription Plan";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "super":
        return "Super Admin";
      case "landlord":
        return "Landlord";
      case "resident":
        return "Resident";
      case "security":
        return "Security";
      default:
        return role;
    }
  };

  const getHouseTypeLabel = (houseType) => {
    if (!houseType) return "N/A";
    return houseType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${theme.text.primary}`}>
              Transaction Details
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${theme.background.input} hover:${theme.background.card} transition-colors`}
            >
              <Icon
                icon="mdi:close"
                className={`text-xl ${theme.text.primary}`}
              />
            </button>
          </div>

          {/* User Info */}
          <div className={`${theme.background.input} p-4 rounded-lg mb-4`}>
            <h3
              className={`font-medium ${theme.text.primary} mb-3 flex items-center gap-2`}
            >
              <Icon icon="mdi:account" className="text-lg" />
              User Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${theme.text.secondary}`}>Name:</span>
                <span className={`text-sm ${theme.text.primary} font-medium`}>
                  {transaction.user?.full_name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme.text.secondary}`}>Role:</span>
                <span className={`text-sm ${theme.text.primary} capitalize`}>
                  {getRoleLabel(transaction.user?.role)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme.text.secondary}`}>
                  House Type:
                </span>
                <span className={`text-sm ${theme.text.primary}`}>
                  {getHouseTypeLabel(transaction.user?.house_type)}
                </span>
              </div>
              {transaction.user?.email && (
                <div className="flex justify-between">
                  <span className={`text-sm ${theme.text.secondary}`}>
                    Email:
                  </span>
                  <span className={`text-sm ${theme.text.primary}`}>
                    {transaction.user.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Transaction ID */}
          <div className={`${theme.background.input} p-4 rounded-lg mb-4`}>
            <p className={`text-xs font-medium ${theme.text.secondary} mb-2`}>
              Transaction ID
            </p>
            <p className={`text-sm font-mono ${theme.text.primary} break-all`}>
              {transaction.flutterwave_txn_id || transaction.id}
            </p>
          </div>

          {/* Amount & Plan */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Icon
                icon="mdi:check-circle"
                className="text-2xl text-green-600"
              />
              <div>
                <p className={`font-medium ${theme.text.primary}`}>
                  Paid Successfully
                </p>
                <p className={`text-sm ${theme.text.secondary}`}>
                  Payment Status
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${theme.text.primary}`}>
                {formatCurrency(transaction.amount)}
              </p>
              <p className={`text-sm ${theme.text.secondary}`}>
                {getPeriodTypeLabel(transaction.period_type)}
              </p>
            </div>
          </div>

          {/* Payment Period */}
          <div className={`${theme.background.input} p-4 rounded-lg mb-4`}>
            <h3
              className={`font-medium ${theme.text.primary} mb-3 flex items-center gap-2`}
            >
              <Icon icon="mdi:calendar" className="text-lg" />
              Payment Period
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${theme.text.secondary}`}>
                  Start Date:
                </span>
                <span className={`text-sm ${theme.text.primary}`}>
                  {transaction.period_start
                    ? formatDate(transaction.period_start)
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme.text.secondary}`}>
                  End Date:
                </span>
                <span className={`text-sm ${theme.text.primary}`}>
                  {transaction.period_end
                    ? formatDate(transaction.period_end)
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Timeline */}
          <div className={`${theme.background.input} p-4 rounded-lg mb-4`}>
            <h3
              className={`font-medium ${theme.text.primary} mb-3 flex items-center gap-2`}
            >
              <Icon icon="mdi:clock" className="text-lg" />
              Transaction Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${theme.text.secondary}`}>
                  Created:
                </span>
                <span className={`text-sm ${theme.text.primary}`}>
                  {formatDate(transaction.created_at)}
                </span>
              </div>
              {transaction.paid_at && (
                <div className="flex justify-between">
                  <span className={`text-sm ${theme.text.secondary}`}>
                    Paid:
                  </span>
                  <span className={`text-sm ${theme.text.primary}`}>
                    {formatDate(transaction.paid_at)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Gateway */}
          {transaction.flutterwave_plan_id && (
            <div className={`${theme.background.input} p-4 rounded-lg mb-4`}>
              <h3
                className={`font-medium ${theme.text.primary} mb-3 flex items-center gap-2`}
              >
                <Icon icon="mdi:credit-card-outline" className="text-lg" />
                Payment Gateway
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${theme.text.secondary}`}>
                    Provider:
                  </span>
                  <span className={`text-sm ${theme.text.primary}`}>
                    Flutterwave
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${theme.text.secondary}`}>
                    Plan ID:
                  </span>
                  <span className={`text-sm ${theme.text.primary} font-mono`}>
                    {transaction.flutterwave_plan_id}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Transaction Card Component
const TransactionCard = ({ transaction, theme, onClick }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPeriodTypeLabel = (periodType) => {
    switch (periodType) {
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      case "6months":
        return "6 Months";
      case "yearly":
        return "Yearly";
      default:
        return "Subscription";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "super":
        return "Super Admin";
      case "landlord":
        return "Landlord";
      case "resident":
        return "Resident";
      case "security":
        return "Security";
      default:
        return role;
    }
  };

  const getHouseTypeLabel = (houseType) => {
    if (!houseType) return "N/A";
    return houseType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div
      onClick={onClick}
      className={`${theme.background.card} rounded-xl p-4 border ${theme.border.secondary} ${theme.shadow.medium} hover:${theme.shadow.large} transition-all cursor-pointer active:scale-95`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Icon icon="mdi:check-circle" className="text-lg text-green-600" />
          </div>
          <div>
            <p className={`font-medium ${theme.text.primary}`}>
              {transaction.user?.full_name || "Unknown User"}
            </p>
            <p className={`text-sm ${theme.text.secondary}`}>
              {getRoleLabel(transaction.user?.role)} •{" "}
              {getHouseTypeLabel(transaction.user?.house_type)}
            </p>
          </div>
        </div>
        <Icon
          icon="mdi:chevron-right"
          className={`text-xl ${theme.text.secondary}`}
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`text-2xl font-bold ${theme.text.primary}`}>
            {formatCurrency(transaction.amount)}
          </p>
          <p className={`text-xs ${theme.text.tertiary}`}>
            {getPeriodTypeLabel(transaction.period_type)} Plan
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <Icon icon="mdi:calendar" className={`${theme.text.secondary}`} />
          <span className={theme.text.secondary}>
            {formatDate(transaction.created_at)}
          </span>
        </div>
        {transaction.paid_at && (
          <div className="flex items-center gap-1">
            <Icon icon="mdi:check" className="text-green-600" />
            <span className="text-green-600 text-xs">
              Paid {formatDate(transaction.paid_at)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Transactions Component
const SuperAdminTransactions = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTransactions = useCallback(
    async (page = currentPage) => {
      try {
        setIsLoading(true);
        setError("");

        const token = authToken;
        if (!token) {
          setError("Authentication required. Please login again.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/super-admin/transactions?page=${page}&per_page=20`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        // Check if response is ok before parsing
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          let errorMessage = "Failed to fetch transactions";
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        const result = await response.json();
        // Transactions API response received

        if (response.ok && result.success) {
          // Handle paginated response
          if (result.data && Array.isArray(result.data.data)) {
            setTransactions(result.data.data);
            setPagination({
              current_page: result.data.current_page,
              last_page: result.data.last_page,
              total: result.data.total,
              per_page: result.data.per_page,
            });
          }
          // Handle direct array response
          else if (Array.isArray(result.data)) {
            setTransactions(result.data);
            setPagination(null);
          }
          // Handle no data
          else {
            setTransactions([]);
            setPagination(null);
          }
        } else {
          console.error("API Error:", result);
          setError(result.message || "Failed to fetch transactions");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Error fetching transactions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [authToken, currentPage]
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleCardClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.user?.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.user?.email
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.user?.role
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.user?.house_type
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.flutterwave_txn_id
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-16 pb-20 w-full relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: isDarkMode
            ? "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(17, 24, 39))"
            : "linear-gradient(to bottom right, rgb(249, 250, 251), rgb(243, 244, 246), rgb(249, 250, 251))",
        }}
      />

      {/* Content */}
      <div className="w-full px-0 pt-12">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1
              className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
            >
              All Transactions
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              View all successful payment transactions
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div
              className={`relative max-w-md flex items-center gap-1 px-3 py-2 rounded-lg ${theme.background.card} ${theme.shadow.small} border ${theme.border.secondary}`}
            >
              <Icon
                icon="mdi:magnify"
                className={`text-lg ${theme.text.tertiary}`}
              />
              <input
                type="text"
                placeholder="Search by name, email, role, or house type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 min-w-0 bg-transparent text-sm ${theme.text.primary} placeholder-current placeholder-opacity-40 outline-none overflow-hidden text-ellipsis`}
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
            {searchQuery && (
              <div className="mt-2 px-1">
                <span className={`text-sm ${theme.text.secondary}`}>
                  Found {filteredTransactions.length} of {transactions.length}{" "}
                  transactions
                </span>
              </div>
            )}
          </div>

          {/* Pagination Info */}
          {pagination && (
            <div
              className={`${theme.background.card} rounded-lg p-3 ${theme.shadow.small} border ${theme.border.secondary} mb-6`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme.text.secondary}`}>
                  Total Transactions: {pagination.total}
                </span>
                <span className={`text-sm ${theme.text.secondary}`}>
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className={`${theme.text.secondary}`}>
                  Loading transactions...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div
              className={`${theme.background.card} rounded-xl p-6 border border-red-300 bg-red-50 dark:bg-red-900/20`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  icon="mdi:alert-circle"
                  className="text-red-600 text-2xl"
                />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-400">
                    Error Loading Transactions
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {error}
                  </p>
                </div>
              </div>
              <button
                onClick={() => fetchTransactions()}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500/50"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Transactions State */}
          {!isLoading && !error && filteredTransactions.length === 0 && (
            <div
              className={`${theme.background.card} rounded-xl p-8 text-center ${theme.shadow.medium}`}
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  icon="mdi:receipt-text-outline"
                  className="text-3xl text-purple-600 dark:text-purple-400"
                />
              </div>
              <h3 className={`font-medium ${theme.text.primary} mb-2`}>
                {searchQuery
                  ? "No Matching Transactions"
                  : "No Transactions Found"}
              </h3>
              <p className={`${theme.text.secondary} text-sm`}>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Successful payment transactions will appear here"}
              </p>
            </div>
          )}

          {/* Transactions List */}
          {!isLoading && !error && filteredTransactions.length > 0 && (
            <>
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    theme={theme}
                    onClick={() => handleCardClick(transaction)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.last_page > 1 && !searchQuery && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentPage(pagination.current_page - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={pagination.current_page === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      pagination.current_page === 1
                        ? `${theme.background.input} ${theme.text.tertiary} cursor-not-allowed opacity-50`
                        : `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg`
                    }`}
                  >
                    <Icon icon="mdi:chevron-left" className="text-lg" />
                    Previous
                  </button>

                  <div
                    className={`px-4 py-2 ${theme.background.card} rounded-lg border ${theme.border.secondary} ${theme.shadow.small}`}
                  >
                    <span
                      className={`text-sm font-medium ${theme.text.primary}`}
                    >
                      {pagination.current_page} / {pagination.last_page}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage(pagination.current_page + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={pagination.current_page === pagination.last_page}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      pagination.current_page === pagination.last_page
                        ? `${theme.background.input} ${theme.text.tertiary} cursor-not-allowed opacity-50`
                        : `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg`
                    }`}
                  >
                    Next
                    <Icon icon="mdi:chevron-right" className="text-lg" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        theme={theme}
        isOpen={showModal}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default SuperAdminTransactions;
