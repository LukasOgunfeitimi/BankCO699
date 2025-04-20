import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";

function Transfer() {
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleTransfer = async () => {
    setError("");
    setSuccessMessage("");
    const token = localStorage.getItem("token");

    if (!recipientId) {
      setError("Please enter the recipient's ID.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount to transfer.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: parseInt(recipientId),
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Transfer successful!");
        setRecipientId("");
        setAmount("");
        // Optionally, you might want to refresh the balance on the dashboard
      } else {
        setError(data.error || "Transfer failed.");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex justify-center p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Transfer Funds</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}
        <div className="space-y-4">
          <div>
            <label htmlFor="recipientId" className="block text-gray-700 text-sm font-bold mb-2">
              Recipient ID:
            </label>
            <input
              type="number"
              id="recipientId"
              placeholder="Enter recipient's user ID"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
              Amount to Transfer:
            </label>
            <input
              type="number"
              id="amount"
              placeholder="Enter amount"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <button
            onClick={handleTransfer}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Transfer
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Transfer;