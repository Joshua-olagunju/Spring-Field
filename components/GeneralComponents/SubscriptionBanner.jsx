import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../src/config/apiConfig";

const SubscriptionBanner = ({ isPwaVisible }) => {
  const { user, authToken } = useUser();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerType, setBannerType] = useState("warning"); // warning, danger, info
  const [daysRemaining, setDaysRemaining] = useState(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only show for residents and landlords
    if (
      !user ||
      !authToken ||
      (user.role !== "resident" && user.role !== "landlord")
    ) {
      setShowBanner(false);
      return;
    }

    // Don't show when PWA banner is visible
    if (isPwaVisible) {
      setShowBanner(false);
      return;
    }

    fetchSubscriptionStatus();
    // Check every 60 seconds (reduced from 30 to prevent flickering)
    const interval = setInterval(fetchSubscriptionStatus, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authToken, isPwaVisible]);

  const fetchSubscriptionStatus = async () => {
    if (!authToken || !user) return;

    try {
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
        const data = result.data;

        // Check if user has active subscription/payment status
        if (!data.has_active_subscription || !data.can_generate_tokens) {
          setBannerType("danger");
          const monthsBehind = data.payment_status?.months_behind || 0;

          if (monthsBehind > 0) {
            setBannerMessage(
              ` You are ${monthsBehind} month${
                monthsBehind !== 1 ? "s" : ""
              } behind on payments! Please pay to generate visitor tokens.`
            );
          } else {
            setBannerMessage(
              " No active subscription! You cannot generate visitor tokens without an active subscription."
            );
          }
          setDaysRemaining(0);
          animateBanner();
          return;
        }

        // If user has active subscription and can generate tokens
        // Calculate days remaining based on registration date + payment count
        const registrationDate = new Date(
          data.payment_status.registration_date
        );
        const paymentCount = data.payment_status.payment_count;
        const requiredPayments = data.payment_status.required_payments;

        // Calculate expiry date: registration date + payment_count months
        const expiryDate = new Date(registrationDate);
        expiryDate.setMonth(expiryDate.getMonth() + paymentCount);

        const now = new Date();
        const timeDiff = expiryDate - now;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        setDaysRemaining(daysLeft);

        // Show banner only if 3 days or less remaining
        if (daysLeft <= 3 && daysLeft > 0) {
          setBannerType("warning");
          setBannerMessage(
            ` Your subscription expires in ${daysLeft} day${
              daysLeft !== 1 ? "s" : ""
            }. Please renew to continue using services.`
          );
          animateBanner();
        } else if (daysLeft <= 0) {
          setBannerType("danger");
          const monthsBehind = requiredPayments - paymentCount;
          setBannerMessage(
            ` Your subscription has expired! You are ${monthsBehind} month${
              monthsBehind !== 1 ? "s" : ""
            } behind. Renew now to generate visitor tokens.`
          );
          animateBanner();
        } else {
          // Subscription is active with more than 3 days remaining - hide banner
          setShowBanner(false);
          hasAnimated.current = false;
        }
      } else {
        // If API call fails, assume no subscription
        setBannerType("danger");
        setBannerMessage(
          " Unable to verify subscription. You may not be able to generate visitor tokens."
        );
        setDaysRemaining(null);
        animateBanner();
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      // On error, show warning banner
      setBannerType("info");
      setBannerMessage(
        "ℹ Unable to check subscription status. Please refresh the page."
      );
      setDaysRemaining(null);
      animateBanner();
    }
  };

  const animateBanner = () => {
    // Only animate once when first showing
    if (!hasAnimated.current) {
      hasAnimated.current = true;
    }
    setShowBanner(true);
  };

  if (!showBanner) return null;

  const getBannerColors = () => {
    switch (bannerType) {
      case "danger":
        return {
          bg: "bg-red-600",
          border: "border-red-700",
          text: "text-white",
          icon: "mdi:alert-circle",
        };
      case "warning":
        return {
          bg: "bg-orange-600",
          border: "border-orange-700",
          text: "text-white",
          icon: "mdi:alert",
        };
      case "info":
        return {
          bg: "bg-blue-600",
          border: "border-blue-700",
          text: "text-white",
          icon: "mdi:information",
        };
      default:
        return {
          bg: "bg-orange-600",
          border: "border-orange-700",
          text: "text-white",
          icon: "mdi:alert",
        };
    }
  };

  const colors = getBannerColors();

  // Determine the correct payment route based on user role
  const getPaymentRoute = () => {
    if (user?.role === "landlord") {
      return "/admin/subscription";
    }
    return "/subscription"; // resident
  };

  const handleRenewClick = () => {
    navigate(getPaymentRoute());
  };

  return (
    <div
      className={`fixed left-0 mt-2 right-0 z-[999] ${colors.bg} ${colors.border} border-b ${colors.text} transition-all duration-500 ease-in-out animate-slideDown`}
      style={{
        top: "max(88px, calc(env(safe-area-inset-top) + 64px))", // Below TopNavBar
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        {/* Icon and Message */}
        <div className="flex items-center gap-3 flex-1">
          <Icon
            icon={colors.icon}
            className={`text-2xl sm:text-3xl ${colors.text} animate-pulse`}
          />
          <p className="text-xs sm:text-sm font-medium leading-tight">
            {bannerMessage}
          </p>
        </div>

        {/* Action Button (Optional - Navigate to subscriptions/payments) */}
        {daysRemaining !== null && daysRemaining <= 3 && (
          <button
            onClick={handleRenewClick}
            className="ml-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-gray-900 rounded-md text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap shadow-md"
          >
            Renew Now
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={() => setShowBanner(false)}
          className={`ml-3 p-1 rounded-md hover:bg-white/20 transition-colors ${colors.text}`}
          aria-label="Close banner"
        >
          <Icon icon="mdi:close" className="text-xl" />
        </button>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideDown {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionBanner;
