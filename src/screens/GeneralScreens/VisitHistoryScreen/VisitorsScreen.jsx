import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../../config/apiConfig";
import useStore from "../../../store/useStore";
import TokenDetailModal from "../../SecurityDashboardScreens/ReportScreen/TokenDetailModal";

const VisitorsScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken } = useUser();
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  // Fetch visitor entries from API with pagination
  const fetchVisitorEntries = useCallback(
    async (page = 1, search = "") => {
      try {
        setIsLoading(true);
        // For admin users, fetch all entries; for regular users, fetch their entries
        const userData = useStore.getState().user;
        const userRole = userData?.role;
        const endpoint =
          userRole === "admin" || userRole === "super_admin"
            ? `${API_BASE_URL}/api/visitor-tokens/all-entries`
            : `${API_BASE_URL}/api/visitor-tokens/my-entries`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          const allEntries = result.data.entries || [];

          // Filter by search query
          let filteredEntries = allEntries;
          if (search.trim()) {
            const searchLower = search.toLowerCase();
            filteredEntries = allEntries.filter(
              (entry) =>
                entry.visitor_name?.toLowerCase().includes(searchLower) ||
                entry.resident_name?.toLowerCase().includes(searchLower) ||
                entry.house_number?.toLowerCase().includes(searchLower) ||
                entry.visitor_phone?.toLowerCase().includes(searchLower)
            );
          }

          // Paginate
          const perPage = 20;
          const totalPages = Math.ceil(filteredEntries.length / perPage);
          const startIndex = (page - 1) * perPage;
          const endIndex = startIndex + perPage;
          const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

          setVisitors(paginatedEntries);
          setPagination({
            current_page: page,
            last_page: totalPages,
            total: filteredEntries.length,
            per_page: perPage,
          });
        }
      } catch {
        // Error fetching entries
      } finally {
        setIsLoading(false);
      }
    },
    [authToken]
  );

  useEffect(() => {
    fetchVisitorEntries(1, searchQuery);
  }, [fetchVisitorEntries, searchQuery]);

  const handleCardClick = (visitor) => {
    setSelectedVisitor(visitor);
    setIsModalOpen(true);
  };

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
      <div className="w-full px-0">
        <div className="max-w-full mx-auto px-0 md:px-4">
          {/* Header */}
          <div className="mb-6">
            <h1
              className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
            >
              Visitors Log
            </h1>
            <p className={`text-sm sm:text-base ${theme.text.secondary}`}>
              Complete history of all visitor entries and token usage
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 px-4 md:px-0">
            <div
              className={`relative max-w-md flex items-center gap-2 px-3 py-2 rounded-lg ${theme.background.card} ${theme.shadow.small} border ${theme.border.secondary}`}
            >
              <Icon
                icon="mdi:magnify"
                className={`text-xl ${theme.text.secondary} flex-shrink-0`}
              />
              <input
                type="text"
                placeholder="Search by visitor name, host, house number, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 min-w-0 bg-transparent text-sm ${theme.text.primary} placeholder-current placeholder-opacity-40 outline-none overflow-hidden text-ellipsis`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`p-1 rounded-full hover:${theme.background.secondary} transition-colors flex-shrink-0`}
                >
                  <Icon
                    icon="mdi:close"
                    className={`text-base ${theme.text.tertiary}`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Visitor Cards */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon
                  icon="mdi:loading"
                  className={`animate-spin text-4xl ${theme.text.tertiary}`}
                />
              </div>
            ) : visitors.length === 0 ? (
              <div
                className={`${theme.background.card} rounded-xl ${theme.shadow.small} p-8 sm:p-12 text-center`}
              >
                <Icon
                  icon="mdi:clipboard-text-clock-outline"
                  className={`text-6xl ${theme.text.tertiary} mb-4 mx-auto`}
                />
                <p className={`text-base ${theme.text.secondary} mb-1`}>
                  No visitor records yet
                </p>
                <p className={`text-sm ${theme.text.tertiary}`}>
                  Your verified visitor entries will appear here
                </p>
              </div>
            ) : (
              visitors.map((visitor) => (
                <button
                  key={visitor.id}
                  onClick={() => handleCardClick(visitor)}
                  className={`w-full ${theme.background.card} rounded-xl ${theme.shadow.small} p-4 sm:p-5 hover:${theme.shadow.medium} transition-all text-left border ${theme.border.secondary} hover:border-blue-500`}
                >
                  <div className="flex items-center gap-4">
                    {/* Left: Avatar & Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold ${theme.text.primary} mb-1 text-base sm:text-lg truncate`}
                      >
                        {visitor.visitor_name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <p
                          className={`text-xs sm:text-sm ${theme.text.secondary} truncate`}
                        >
                          Host: {visitor.resident_name} • {visitor.house_number}
                        </p>
                      </div>
                    </div>

                    {/* Right: Duration & Status */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex flex-col items-end gap-2">
                        {/* Duration */}
                        <div className="flex items-center gap-1.5">
                          <Icon
                            icon="mdi:clock-outline"
                            className={`text-base ${theme.text.tertiary}`}
                          />
                          <span
                            className={`text-xs sm:text-sm font-semibold ${theme.text.primary}`}
                          >
                            {(() => {
                              const enteredAt = new Date(visitor.entered_at);
                              const exitedAt = visitor.exited_at
                                ? new Date(visitor.exited_at)
                                : new Date();
                              const diffMinutes = Math.floor(
                                (exitedAt - enteredAt) / 1000 / 60
                              );

                              if (diffMinutes < 60) {
                                return `${diffMinutes} mins`;
                              } else {
                                const hours = Math.floor(diffMinutes / 60);
                                const mins = diffMinutes % 60;
                                return mins > 0
                                  ? `${hours}h ${mins}m`
                                  : `${hours}h`;
                              }
                            })()}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            visitor.exited_at
                              ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          }`}
                        >
                          <Icon
                            icon={
                              visitor.exited_at
                                ? "mdi:check-circle"
                                : "mdi:clock-check"
                            }
                            className="text-sm"
                          />
                          {visitor.exited_at ? "Completed" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Pagination */}
          {!isLoading && visitors.length > 0 && pagination.last_page > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 px-4 md:px-0">
              {/* Previous Button */}
              <button
                onClick={() =>
                  fetchVisitorEntries(pagination.current_page - 1, searchQuery)
                }
                disabled={pagination.current_page === 1}
                className={`p-2 rounded-lg ${theme.background.card} ${theme.shadow.small} border ${theme.border.secondary} disabled:opacity-50 disabled:cursor-not-allowed hover:${theme.shadow.medium} transition-all`}
              >
                <Icon
                  icon="mdi:chevron-left"
                  className={`text-xl ${theme.text.primary}`}
                />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and adjacent pages
                    return (
                      page === 1 ||
                      page === pagination.last_page ||
                      Math.abs(page - pagination.current_page) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center gap-2">
                        {showEllipsis && (
                          <span className={`${theme.text.tertiary} px-2`}>
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => fetchVisitorEntries(page, searchQuery)}
                          className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                            page === pagination.current_page
                              ? "bg-blue-600 text-white shadow-md"
                              : `${theme.background.card} ${theme.text.primary} ${theme.shadow.small} border ${theme.border.secondary} hover:${theme.shadow.medium}`
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              {/* Next Button */}
              <button
                onClick={() =>
                  fetchVisitorEntries(pagination.current_page + 1, searchQuery)
                }
                disabled={pagination.current_page === pagination.last_page}
                className={`p-2 rounded-lg ${theme.background.card} ${theme.shadow.small} border ${theme.border.secondary} disabled:opacity-50 disabled:cursor-not-allowed hover:${theme.shadow.medium} transition-all`}
              >
                <Icon
                  icon="mdi:chevron-right"
                  className={`text-xl ${theme.text.primary}`}
                />
              </button>
            </div>
          )}

          {/* Results Info */}
          {!isLoading && visitors.length > 0 && (
            <div
              className={`mt-4 text-center ${theme.text.secondary} text-sm px-4 md:px-0`}
            >
              Showing {(pagination.current_page - 1) * pagination.per_page + 1}{" "}
              -{" "}
              {Math.min(
                pagination.current_page * pagination.per_page,
                pagination.total
              )}{" "}
              of {pagination.total} visitors
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <TokenDetailModal
        theme={theme}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVisitor(null);
        }}
        tokenData={selectedVisitor}
      />
    </div>
  );
};

export default VisitorsScreen;
