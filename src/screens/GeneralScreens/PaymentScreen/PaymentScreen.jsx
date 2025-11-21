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
  const [paymentLogs, setPaymentLogs] = useState([]);

  // For landlord toggle
  const [landlordType, setLandlordType] = useState("landlord_with_tenants");

  // Payment logging helper
  const logPayment = (message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data
    };
    console.log(`[PAYMENT LOG] ${message}`, data);
    setPaymentLogs(prev => [...prev, logEntry]);
    
    // Also save to localStorage for persistence
    try {
      const existingLogs = JSON.parse(localStorage.getItem('payment_logs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('payment_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to save log to localStorage:', e);
    }
  };

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
      // Clear previous logs
      setPaymentLogs([]);
      localStorage.removeItem('payment_logs');
      
      setIsPaymentLoading(true);
      logPayment('🚀 STARTING PAYMENT PROCESS');
      console.log('🚀 STARTING PAYMENT PROCESS');
      logPayment('Plan Details', { plan, packageType });
      logPayment('User Info', { id: user?.id, email: user?.email, role: user?.role });
      logPayment('Auth Token', authToken ? 'Present' : 'Missing');
      logPayment('API Base URL', API_BASE_URL);
      console.log('Plan:', plan);
      console.log('Package Type:', packageType);
      console.log('User:', user);
      
      // Ensure we have user and token
      if (!user || !authToken) {
        console.error('❌ Missing user or auth token');
        alert('Authentication required. Please login again.');
        setIsPaymentLoading(false);
        return;
      }

      // Check if plan has a plan_id (required for Flutterwave)
      if (!plan.plan_id) {
        console.error('❌ Plan ID missing:', plan);
        alert('Payment plan not available yet. Please try again later.');
        setIsPaymentLoading(false);
        return;
      }

      // First, initialize payment with backend to create payment record
      console.log('🔄 Calling backend payment initialization...');
      
      // Determine the correct package_type for backend
      // Frontend uses 'user_package', 'landlord_with_tenants', 'landlord_alone'
      // Backend expects 'tenant', 'landlord_with_tenants', 'landlord_alone'
      const backendPackageType = packageType === 'user_package' ? 'tenant' : packageType;
      
      console.log('📤 Initialization request data:', {
        package_type: backendPackageType,
        period: plan.period,
        amount: plan.amount,
        plan_id: plan.plan_id,
        api_url: `${API_BASE_URL}/api/payments/initialize`,
        auth_token: authToken ? 'Present' : 'Missing'
      });
      
      const initResponse = await fetch(`${API_BASE_URL}/api/payments/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          package_type: backendPackageType,
          period: plan.period,
          amount: plan.amount,
          plan_id: plan.plan_id
        })
      });

      console.log('📥 Backend initialization response status:', initResponse.status);
      const initResult = await initResponse.json();
      console.log('📥 Backend initialization response:', initResult);

      if (!initResponse.ok || !initResult.success) {
        console.error('❌ Backend initialization failed:', {
          status: initResponse.status,
          message: initResult.message,
          error: initResult.error,
          full_response: initResult
        });
        alert(`Payment initialization failed: ${initResult.message || 'Unknown error'}`);
        setIsPaymentLoading(false);
        return;
      }
      
      console.log('✅ Backend initialization successful, data:', initResult.data);

      // Use the transaction reference from backend
      const paymentData = {
        tx_ref: initResult.data.tx_ref,
        amount: initResult.data.amount,
        currency: initResult.data.currency,
        plan_id: initResult.data.plan_id, // Store plan ID for meta only
        customer: initResult.data.customer,
        customization: initResult.data.customization
      };

      logPayment('Payment data prepared from backend', paymentData);
      console.log('Payment data from backend:', paymentData);

      // Check if Flutterwave script is loaded
      if (!window.FlutterwaveCheckout) {
        logPayment('⚠️ Flutterwave script not loaded yet, waiting...');
        console.log('Waiting for Flutterwave script to load...');
        
        // Wait for script to load (it's in index.html)
        let retries = 0;
        const checkScript = setInterval(() => {
          retries++;
          if (window.FlutterwaveCheckout) {
            clearInterval(checkScript);
            logPayment('✅ Flutterwave script loaded after ' + retries + ' attempts');
            console.log('Flutterwave script loaded successfully');
            initiateFlutterwavePayment(paymentData, plan);
          } else if (retries > 20) {
            clearInterval(checkScript);
            logPayment('❌ Flutterwave script failed to load after 20 attempts');
            console.error('Failed to load Flutterwave script');
            alert('Failed to load payment gateway. Please refresh the page and try again.');
            setIsPaymentLoading(false);
          }
        }, 200);
      } else {
        logPayment('✅ Flutterwave script already loaded');
        console.log('Flutterwave script already loaded');
        initiateFlutterwavePayment(paymentData, plan);
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      alert("Payment initialization error. Please try again.");
      setIsPaymentLoading(false);
    }
  };

  const initiateFlutterwavePayment = (paymentData, planDetails) => {
    console.log('🚀 Opening Flutterwave modal with data:', paymentData);
    console.log('💳 Payment options enabled: card, banktransfer, ussd, mobilemoney, account, barter');
    console.log('👤 User context:', {
      user_id: user?.id,
      auth_token: authToken ? 'Present' : 'Missing',
      api_base: API_BASE_URL
    });
    
    // Ensure we have the verification URL ready
    const verificationUrl = `${API_BASE_URL}/api/payments/verify`;
    console.log('🔍 Verification URL:', verificationUrl);
    
    logPayment('Opening Flutterwave modal', {
      tx_ref: paymentData.tx_ref,
      amount: paymentData.amount,
      customer: paymentData.customer
    });
    
    try {
      window.FlutterwaveCheckout({
        public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: paymentData.tx_ref,
        amount: paymentData.amount,
        currency: paymentData.currency || 'NGN',
        payment_options: "card,banktransfer,ussd,mobilemoney,account,barter",
        customer: paymentData.customer,
        customization: paymentData.customization,
        meta: {
          consumer_id: user?.id,
          consumer_mac: paymentData.tx_ref,
          plan_id: paymentData.plan_id,
          package_type: planDetails?.period || 'monthly'
        },
      callback: async function (response) {
        // Immediately alert to prevent modal close
        alert('⏳ Payment callback received! Processing verification...\n\nDO NOT CLOSE THIS PAGE!');
        
        logPayment('🎉 FLUTTERWAVE PAYMENT CALLBACK TRIGGERED');
        logPayment('=== FULL PAYMENT RESPONSE ===', response);
        logPayment('Response Status', response.status);
        logPayment('Transaction ID', response.transaction_id);
        logPayment('TX Ref', response.tx_ref);
        logPayment('Charge Response Code', response.charge_response_code);
        logPayment('Charge Response Message', response.charge_response_message);
        
        console.log('🎉 FLUTTERWAVE PAYMENT CALLBACK TRIGGERED');
        console.log('=== FULL PAYMENT RESPONSE ===');
        console.log('Response Object:', JSON.stringify(response, null, 2));
        console.log('Response Status:', response.status);
        console.log('Transaction ID:', response.transaction_id);
        console.log('TX Ref:', response.tx_ref);
        console.log('Charge Response Code:', response.charge_response_code);
        console.log('Charge Response Message:', response.charge_response_message);
        console.log('Auth Token Available:', authToken ? 'YES' : 'NO');
        console.log('User ID:', user?.id);
        console.log('==============================');
        
        setIsPaymentLoading(true);

        // ALWAYS call verification regardless of Flutterwave response status
        // This ensures test payments work properly
        logPayment('🔄 CALLING VERIFICATION (regardless of Flutterwave status)');
        logPayment('⚠️ IMPORTANT: In test mode, we verify ALL payment attempts');
        console.log('🔄 CALLING VERIFICATION (regardless of Flutterwave status)...');
        console.log('⚠️ IMPORTANT: In test mode, we verify ALL payment attempts');

        // In test mode, ALWAYS verify the payment regardless of status
        // This is because test payments should always succeed
        if (response.tx_ref) {
          logPayment('✅ Payment response received, starting verification process');
          console.log('✅ Payment response received, starting verification process...');
          console.log('Verification details:', {
            tx_ref: response.tx_ref,
            transaction_id: response.transaction_id,
            amount: response.amount,
            status: response.status,
            api_url: `${API_BASE_URL}/api/payments/verify/${response.tx_ref}`,
            auth_token: authToken ? 'Present' : 'Missing',
            user_id: user?.id,
            is_test_payment: response.tx_ref?.includes('SF_') || false
          });
          
          try {
            logPayment('📤 SENDING VERIFICATION REQUEST TO BACKEND');
            logPayment('Verification URL', `${API_BASE_URL}/api/payments/verify/${response.tx_ref}`);
            logPayment('Auth Token Status', authToken ? 'Present' : 'Missing');
            
            console.log('📤 SENDING VERIFICATION REQUEST TO BACKEND...');
            console.log('Auth Token for verification:', authToken ? `Present (${authToken.substring(0, 20)}...)` : 'Missing');
            console.log('Verification URL:', `${API_BASE_URL}/api/payments/verify/${response.tx_ref}`);
            console.log('User ID for verification:', user?.id);
            
            alert('📤 Sending verification request to backend...\nURL: ' + `${API_BASE_URL}/api/payments/verify/${response.tx_ref}`);
            
            // Verify payment with backend using the same tx_ref that was initialized
            const verifyResponse = await fetch(`${API_BASE_URL}/api/payments/verify/${response.tx_ref}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
                "Accept": "application/json",
              },
            });
            
            logPayment('📥 Verification response received', {
              status: verifyResponse.status,
              ok: verifyResponse.ok,
              statusText: verifyResponse.statusText
            });
            
            console.log('📥 Verification response received');
            console.log('Response status:', verifyResponse.status);
            console.log('Response ok:', verifyResponse.ok);
            console.log('Response headers:', Object.fromEntries(verifyResponse.headers.entries()));

            alert('📥 Verification response received!\nStatus: ' + verifyResponse.status + '\nOK: ' + verifyResponse.ok);

            let verifyResult;
            try {
              verifyResult = await verifyResponse.json();
              logPayment('📥 Backend verification response parsed', verifyResult);
              console.log('📥 Backend verification response received:', verifyResult);
            } catch (parseError) {
              console.error('❌ Failed to parse verification response:', parseError);
              alert(`⚠️ Payment successful but response parsing failed.\nPlease contact support with reference: ${response.tx_ref}`);
              setIsPaymentLoading(false);
              return;
            }

            if (verifyResponse.ok && verifyResult && verifyResult.success) {
              logPayment('🎉 PAYMENT VERIFICATION SUCCESSFUL!', verifyResult.data);
              console.log('🎉 PAYMENT VERIFICATION SUCCESSFUL!');
              console.log('Payment details:', {
                transaction_id: response.transaction_id,
                tx_ref: response.tx_ref,
                amount: response.amount,
                user_payment_count: verifyResult.data?.user_payment_count,
                months_added: verifyResult.data?.months_added,
                subscription_id: verifyResult.data?.subscription?.id
              });
              
              alert(`🎉 Payment Successful & Verified!\nTransaction ID: ${response.transaction_id}\nReference: ${response.tx_ref}\nAmount: ₦${new Intl.NumberFormat().format(response.amount)}\n\nYour subscription has been activated!\nPayments Count: ${verifyResult.data.user_payment_count}\nMonths Added: ${verifyResult.data.months_added}`);
              
              // Refresh packages to show updated status
              setTimeout(() => {
                console.log('🔄 Refreshing page to show updated payment status...');
                window.location.reload();
              }, 3000);
            } else {
              logPayment('❌ Verification failed', {
                response_ok: verifyResponse.ok,
                status: verifyResponse.status,
                result: verifyResult
              });
              console.error('❌ Verification failed:', {
                response_ok: verifyResponse.ok,
                status: verifyResponse.status,
                result: verifyResult
              });
              
              // Show detailed error
              const errorDetails = `Status: ${verifyResponse.status}\nOK: ${verifyResponse.ok}\nMessage: ${verifyResult?.message || 'Unknown'}\nData: ${JSON.stringify(verifyResult?.data || {})}`;
              alert(`⚠️ VERIFICATION FAILED!\n\n${errorDetails}\n\nReference: ${response.tx_ref}\n\nCheck console for full logs.`);
            }
          } catch (error) {
            logPayment('❌ Payment verification error (EXCEPTION)', {
              error: error.message,
              stack: error.stack
            });
            console.error('Payment verification error:', error);
            alert(`⚠️ VERIFICATION EXCEPTION!\n\nError: ${error.message}\nReference: ${response.tx_ref}\n\nCheck console for full logs.`);
          }
        } else {
          logPayment('❌ No transaction reference in payment response', {
            response: response,
            has_tx_ref: !!response.tx_ref
          });
          console.log('❌ No transaction reference in payment response:', {
            response: response,
            has_tx_ref: !!response.tx_ref
          });
          alert(`❌ NO TX_REF!\n\nPayment callback received but no transaction reference.\nResponse status: ${response.status}\n\nCheck console for full response.`);
        }
        
        logPayment('Payment callback processing complete');
        setIsPaymentLoading(false);
      },
      onclose: function () {
        logPayment('🔒 Flutterwave payment modal closed (User cancelled or closed)');
        console.log('🔒 Flutterwave payment modal closed');
        
        // Show logs when modal closes
        const logs = JSON.parse(localStorage.getItem('payment_logs') || '[]');
        console.log('=== PAYMENT LOGS ON MODAL CLOSE ===');
        console.table(logs);
        
        alert('⚠️ Payment modal closed!\n\nCheck console for payment logs.\n\nTotal log entries: ' + logs.length);
        setIsPaymentLoading(false);
      },
      });
      
      logPayment('✅ Flutterwave checkout modal launched successfully');
      console.log('✅ Flutterwave checkout configured and launched');
    } catch (error) {
      logPayment('❌ Error launching Flutterwave modal', {
        error: error.message,
        stack: error.stack
      });
      console.error('Error launching Flutterwave modal:', error);
      alert('Failed to open payment modal. Error: ' + error.message);
      setIsPaymentLoading(false);
    }
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

      {/* Debug Section - Remove in production */}
      {user?.role === 'landlord' && (
        <div className="w-full px-0 mt-8">
          <div className="max-w-4xl mx-auto">
            <div className={`${theme.background.card} ${theme.shadow.medium} rounded-2xl p-4 border ${theme.border.secondary}`}>
              <h4 className={`text-sm font-semibold ${theme.text.primary} mb-2`}>
                Debug Info (Landlord with Tenants)
              </h4>
              <div className="text-xs space-y-1">
                <p className={theme.text.secondary}>
                  Monthly: ₦7,000 (Plan ID: 227503) | 6 Months: ₦42,000 (Plan ID: 227507) | Yearly: ₦84,000 (Plan ID: 227508)
                </p>
                <p className={theme.text.secondary}>
                  Test Mode: Payments will always succeed and post to database
                </p>
                <p className={theme.text.secondary}>
                  Use any test card (4187427415564246) for testing
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Loading Overlay */}
      {isPaymentLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
          <div
            className={`${theme.background.card} rounded-2xl p-6 text-center ${theme.shadow.large}`}
          >
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`${theme.text.primary} font-medium`}>
              {isPaymentLoading ? "Processing Payment..." : "Initializing Payment..."}
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
