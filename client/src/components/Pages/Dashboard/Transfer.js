import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaArrowLeft, FaExchangeAlt, FaUser, FaMoneyBillWave } from "react-icons/fa";
import { API_URL } from "../../../config";
import AuthModal from "../../Tools/AuthModal";

function Transfer() {
  const { token } = useOutletContext();
  const [recipientAccountNum, setRecipientAccountNum] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState(null);

  const navigate = useNavigate();

  const requestAuthForTransfer = () => {
    if (!recipientAccountNum) {
      setError("Please enter the recipient's account number");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount to transfer");
      return;
    }

    setPendingTransfer({
      recipientAccountNum: parseInt(recipientAccountNum),
      amount: parseFloat(amount),
    });
    setAuthOpen(true);
  };

  const handleAuthSuccess = async (emailCode, totpCode) => {
    setAuthOpen(false);
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...pendingTransfer,
          emailCode,
          totpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Transfer completed successfully!");
        setRecipientAccountNum("");
        setAmount("");
      } else {
        setError(data.error || "Transfer failed. Please try again.");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
      setPendingTransfer(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center text-blue-100 hover:text-white transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back
              </button>
              <h2 className="text-2xl font-bold flex items-center">
                <FaExchangeAlt className="mr-3" />
                Transfer Funds
              </h2>
              <div className="w-6"></div> {/* Spacer for alignment */}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestAuthForTransfer();
            }}
            className="p-6 space-y-6"
          >
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="recipientAccountNum"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Recipient Account Number
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="recipientAccountNum"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border-gray-300 rounded-md"
                    placeholder="123456"
                    value={recipientAccountNum}
                    onChange={(e) => setRecipientAccountNum(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Transfer Amount
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-3 border-gray-300 rounded-md"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaExchangeAlt className="-ml-1 mr-2" />
                      Transfer Funds
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Need help? Contact our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              support team
            </a>
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authOpen}
        onSuccess={handleAuthSuccess}
        onCancel={() => setAuthOpen(false)}
      />
    </div>
  );
}

export default Transfer;