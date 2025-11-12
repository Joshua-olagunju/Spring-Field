import { Icon } from "@iconify/react";
import { useTheme } from "../../context/useTheme";

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`${theme.background.card} w-full max-w-sm rounded-2xl ${theme.shadow.large} relative p-6`}
      >
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <Icon icon="mdi:logout" className="text-3xl text-red-600" />
        </div>

        {/* Title */}
        <h2
          className={`text-xl font-bold ${theme.text.primary} mb-2 text-center`}
        >
          Logout Confirmation
        </h2>

        {/* Message */}
        <p className={`text-sm ${theme.text.secondary} mb-6 text-center`}>
          Are you sure you want to logout? You will need to login again to
          access your account.
        </p>

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
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Icon icon="mdi:loading" className="animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <Icon icon="mdi:logout" />
                Logout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
