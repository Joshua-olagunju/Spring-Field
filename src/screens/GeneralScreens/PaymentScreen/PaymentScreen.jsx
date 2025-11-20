import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../../context/useTheme";
import { useUser } from "../../../../context/useUser";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../../config/apiConfig";

const PaymentScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { authToken, user } = useUser();
  const [packages, setPackages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // For landlord toggle
  const [landlordType, setLandlordType] = useState("landlord_with_tenants");

  // Carousel refs
  const carouselRef = useRef(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Sync carousel indicators with manual scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (!carouselRef.current) return;

      const cardWidth = carouselRef.current.children[0]?.offsetWidth || 300;
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardIndex = Math.round(scrollLeft / (cardWidth + 16)); // card width + gap

      setActiveCardIndex(Math.max(0, Math.min(2, cardIndex)));
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", handleScroll);
      return () => carousel.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/payments/packages`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setPackages(result.data.packages);
        } else {
          console.error("Failed to fetch packages:", result.message);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [authToken]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const initializeFlutterwavePayment = async (plan, packageType) => {
    try {
      setIsPaymentLoading(true);

      // Initialize payment with backend
      const response = await fetch(`${API_BASE_URL}/api/payments/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          package_type: packageType,
          period: plan.period,
          amount: plan.amount,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Load Flutterwave inline script if not already loaded
        if (!window.FlutterwaveCheckout) {
          const script = document.createElement("script");
          script.src = "https://checkout.flutterwave.com/v3.js";
          script.async = true;
          document.body.appendChild(script);

          script.onload = () => {
            initiateFlutterwavePayment(result.data);
          };
        } else {
          initiateFlutterwavePayment(result.data);
        }
      } else {
        console.error("Payment initialization failed:", result.message);
        alert("Failed to initialize payment. Please try again.");
        setIsPaymentLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment error. Please try again.");
      setIsPaymentLoading(false);
    }
  };

  const initiateFlutterwavePayment = (paymentData) => {
    window.FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: paymentData.tx_ref,
      amount: paymentData.amount,
      currency: paymentData.currency,
      customer: paymentData.customer,
      customizations: paymentData.customization,
      callback: function (response) {
        // Payment successful
        setIsPaymentLoading(false);

        // Show success message
        alert("Payment successful! Your subscription has been activated.");

        // Optionally refresh packages or redirect
        // fetchPackages(); // Removed since fetchPackages is now inside useEffect
      },
      onclose: function () {
        // Payment cancelled or closed
        setIsPaymentLoading(false);
      },
    });
  };

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;

    const cardWidth = carouselRef.current.children[0]?.offsetWidth || 300;
    const scrollAmount = cardWidth + 16; // card width + gap

    if (direction === "left") {
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      setActiveCardIndex(Math.max(0, activeCardIndex - 1));
    } else {
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setActiveCardIndex(Math.min(2, activeCardIndex + 1)); // Max 3 cards (0, 1, 2)
    }
  };

  const renderPlanCard = (plan, packageKey, packageData) => (
    <div
      key={plan.period}
      className="min-w-[280px] sm:min-w-[300px] lg:flex-1 lg:min-w-0 flex-shrink-0"
    >
      <div
        className={`${theme.background.card} ${theme.shadow.medium} rounded-2xl p-6 border ${theme.border.secondary} relative overflow-hidden h-full`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w- h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 transform -translate-x-12 translate-y-12"></div>
        </div>

        {/* Card Content */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
              <Icon icon="mdi:calendar-clock" className="text-white text-xl" />
            </div>
            <h3
              className={`text-lg font-bold ${theme.text.primary} mb-2 capitalize`}
            >
              {plan.period === "6months"
                ? "6 Months Plan"
                : `${plan.period} Plan`}
            </h3>
            <p className={`text-sm ${theme.text.secondary}`}>
              {packageData.title}
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {/* Price Display */}
            <div className="text-center mb-6">
              <p className={`font-bold text-3xl ${theme.text.primary} mb-2`}>
                {formatCurrency(plan.amount)}
              </p>
              <p className={`text-sm ${theme.text.secondary}`}>
                {plan.duration} month{plan.duration > 1 ? "s" : ""}
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={() => initializeFlutterwavePayment(plan, packageKey)}
              disabled={isPaymentLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${theme.button.primary} hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon icon="mdi:credit-card" className="text-lg" />
                Pay
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
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
      <div className="w-full px-0">
        <div className="max-w-full mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className={`${theme.text.secondary}`}>
                  Loading subscription packages...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="text-center mb-6">
                  <h1
                    className={`text-2xl sm:text-3xl font-bold ${theme.text.primary} mb-2`}
                  >
                    Choose Your Subscription
                  </h1>
                  <p className={`${theme.text.secondary} text-sm sm:text-base`}>
                    Select the perfect plan for your needs
                  </p>
                </div>

                {/* Landlord Toggle */}
                {user?.role === "landlord" && (
                  <div className="flex justify-center mb-8">
                    <div
                      className={`${theme.background.card} ${theme.shadow.medium} rounded-xl p-1 border ${theme.border.secondary}`}
                    >
                      <div className="flex">
                        <button
                          onClick={() =>
                            setLandlordType("landlord_with_tenants")
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            landlordType === "landlord_with_tenants"
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                              : `${theme.text.secondary} hover:${theme.text.primary}`
                          }`}
                        >
                          With Tenants
                        </button>
                        <button
                          onClick={() => setLandlordType("landlord_alone")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            landlordType === "landlord_alone"
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                              : `${theme.text.secondary} hover:${theme.text.primary}`
                          }`}
                        >
                          Living Alone
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subscription Cards */}
              <div className="w-full px-0">
                <div className="max-w-6xl mx-auto">
                  <div className="relative">
                    {/* Carousel Navigation - Only on mobile/tablet */}
                    <button
                      onClick={() => scrollCarousel("left")}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full ${theme.background.card} ${theme.shadow.medium} border ${theme.border.secondary} lg:hidden flex items-center justify-center ${theme.text.primary} hover:bg-blue-50 transition-all`}
                      style={{
                        display: activeCardIndex === 0 ? "none" : "flex",
                      }}
                    >
                      <Icon icon="mdi:chevron-left" className="text-xl" />
                    </button>

                    <button
                      onClick={() => scrollCarousel("right")}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full ${theme.background.card} ${theme.shadow.medium} border ${theme.border.secondary} lg:hidden flex items-center justify-center ${theme.text.primary} hover:bg-blue-50 transition-all`}
                      style={{
                        display: activeCardIndex === 2 ? "none" : "flex",
                      }}
                    >
                      <Icon icon="mdi:chevron-right" className="text-xl" />
                    </button>

                    {/* Cards Container */}
                    <div
                      ref={carouselRef}
                      className="flex gap-4 overflow-x-auto lg:overflow-x-visible scrollbar-hide scroll-smooth pb-4"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {(() => {
                        // Get the appropriate package data
                        let currentPackage;
                        let packageKey;

                        if (user?.role === "landlord") {
                          currentPackage = packages[landlordType];
                          packageKey = landlordType;
                        } else {
                          // For regular users, get the first (and only) package
                          const firstPackageKey = Object.keys(packages)[0];
                          currentPackage = packages[firstPackageKey];
                          packageKey = firstPackageKey;
                        }

                        // Render 3 individual plan cards
                        return currentPackage?.plans?.map((plan) =>
                          renderPlanCard(plan, packageKey, currentPackage)
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Carousel Indicators - Only show on mobile/tablet */}
                <div className="flex justify-center mt-6 gap-2 lg:hidden">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === activeCardIndex
                          ? "bg-blue-600 w-8"
                          : `${theme.background.input} border ${theme.border.secondary}`
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Features Section */}
              <div className="w-full px-0 mt-12">
                <div className="max-w-4xl mx-auto">
                  <div
                    className={`${theme.background.card} ${theme.shadow.medium} rounded-2xl p-6 border ${theme.border.secondary}`}
                  >
                    <h3
                      className={`text-lg font-bold ${theme.text.primary} mb-4 text-center`}
                    >
                      What's Included
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          icon: "mdi:shield-check",
                          title: "Secure Access",
                          desc: "24/7 secure visitor management",
                        },
                        {
                          icon: "mdi:qrcode",
                          title: "QR Codes",
                          desc: "Generate secure visitor tokens",
                        },
                        {
                          icon: "mdi:history",
                          title: "Visit History",
                          desc: "Track all visitor activities",
                        },
                        {
                          icon: "mdi:bell-outline",
                          title: "Notifications",
                          desc: "Real-time visitor alerts",
                        },
                        {
                          icon: "mdi:phone",
                          title: "Mobile Support",
                          desc: "Works on all devices",
                        },
                        {
                          icon: "mdi:headphones",
                          title: "24/7 Support",
                          desc: "Round-the-clock assistance",
                        },
                      ].map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Icon
                              icon={feature.icon}
                              className="text-white text-sm"
                            />
                          </div>
                          <div>
                            <h4
                              className={`font-medium ${theme.text.primary} text-sm`}
                            >
                              {feature.title}
                            </h4>
                            <p className={`text-xs ${theme.text.secondary}`}>
                              {feature.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Loading Overlay */}
      {isPaymentLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
          <div
            className={`${theme.background.card} rounded-2xl p-6 text-center ${theme.shadow.large}`}
          >
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`${theme.text.primary} font-medium`}>
              Initializing Payment...
            </p>
            <p className={`${theme.text.secondary} text-sm`}>
              Please wait while we process your request
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentScreen;
