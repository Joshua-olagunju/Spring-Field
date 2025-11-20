import { useState } from "react";
import { Icon } from "@iconify/react";
import { API_BASE_URL } from "../../src/config/apiConfig";

const FlutterwaveSimulationModal = ({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
  onError,
}) => {
  const [selectedCard, setSelectedCard] = useState("successful");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState("card-selection");

  const testCards = {
    successful: {
      number: "5531 8866 5214 2950",
      name: "Success Card",
      cvv: "123",
      expiry: "12/28",
      description: "This card will complete payment successfully",
      color: "from-green-500 to-green-600",
    },
    failed: {
      number: "5143 0105 2233 9965",
      name: "Failed Card",
      cvv: "456",
      expiry: "09/26",
      description: "This card will fail due to insufficient funds",
      color: "from-red-500 to-red-600",
    },
    insufficient_funds: {
      number: "5506 9224 0063 4930",
      name: "Insufficient Funds Card",
      cvv: "789",
      expiry: "03/27",
      description: "This card will fail due to insufficient balance",
      color: "from-orange-500 to-orange-600",
    },
  };

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    setStep("processing");

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const outcome = selectedCard === "successful" ? "success" : "failed";

      if (outcome === "success") {
        const verificationResponse = await fetch(
          `${API_BASE_URL}/api/payments/simulation/verify/${paymentData.tx_ref}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const result = await verificationResponse.json();

        if (result.success && result.data.status === "successful") {
          setStep("result");
          setTimeout(() => {
            onSuccess({
              status: "successful",
              tx_ref: paymentData.tx_ref,
              transaction_id: result.data.transaction_id,
              message: "Payment completed successfully",
            });
            onClose();
          }, 2000);
        } else {
          throw new Error("Payment verification failed");
        }
      } else {
        setStep("result");
        setTimeout(() => {
          onError({
            status: "failed",
            message: "Payment failed due to insufficient funds",
          });
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Simulation payment error:", error);
      onError({
        status: "error",
        message: "Payment simulation encountered an error",
      });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCardSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
          <Icon icon="mdi:credit-card" className="text-white text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Flutterwave Simulation
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Complete your payment using test cards
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <Icon icon="mdi:information" />
            <span>This is a simulation environment for testing</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Select Test Scenario:</h3>
        {Object.entries(testCards).map(([key, card]) => (
          <div
            key={key}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedCard === key
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedCard(key)}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={selectedCard === key}
                onChange={() => setSelectedCard(key)}
                className="mt-1"
              />
              <div className="flex-1">
                <div
                  className={`w-full h-20 rounded-lg bg-gradient-to-r ${card.color} p-3 text-white text-xs mb-2`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono">{card.number}</p>
                      <p className="mt-1">{card.name}</p>
                    </div>
                    <div className="text-right">
                      <p>{card.expiry}</p>
                      <p>CVV: {card.cvv}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-900">Amount:</span>
          <span className="font-bold text-lg text-gray-900">
            ₦{new Intl.NumberFormat().format(paymentData.amount)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Transaction Reference:</span>
          <span className="text-sm font-mono text-gray-900">
            {paymentData.tx_ref}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Customer:</span>
          <span className="text-sm text-gray-900">
            {paymentData.customer.email}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
        >
          Pay ₦{new Intl.NumberFormat().format(paymentData.amount)}
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Processing Payment...
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Please wait while we process your payment
      </p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-yellow-800 text-sm">
          <Icon icon="mdi:lock" />
          <span>Secure simulation in progress</span>
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    const isSuccess = selectedCard === "successful";
    return (
      <div className="text-center py-8">
        <div
          className={`w-16 h-16 rounded-full ${
            isSuccess ? "bg-green-100" : "bg-red-100"
          } flex items-center justify-center mx-auto mb-4`}
        >
          <Icon
            icon={isSuccess ? "mdi:check" : "mdi:close"}
            className={`text-2xl ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          />
        </div>
        <h3
          className={`text-lg font-medium mb-2 ${
            isSuccess ? "text-green-800" : "text-red-800"
          }`}
        >
          {isSuccess ? "Payment Successful!" : "Payment Failed"}
        </h3>
        <p className="text-gray-600 text-sm">
          {isSuccess
            ? "Your subscription has been activated successfully."
            : "The payment could not be completed at this time."}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            {step === "card-selection"
              ? "Payment Simulation"
              : step === "processing"
              ? "Processing..."
              : "Payment Result"}
          </h2>
          {step === "card-selection" && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon icon="mdi:close" className="text-gray-500 text-xl" />
            </button>
          )}
        </div>

        <div className="px-6 py-6">
          {step === "card-selection" && renderCardSelection()}
          {step === "processing" && renderProcessing()}
          {step === "result" && renderResult()}
        </div>
      </div>
    </div>
  );
};

export default FlutterwaveSimulationModal;
