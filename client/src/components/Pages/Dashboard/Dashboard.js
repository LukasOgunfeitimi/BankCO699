import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import '../../../index.css';
import { API_URL } from "../../../config"

function Dashboard() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchData = async () => {
        // Fetch balance
        const balanceResponse = await fetch(`${API_URL}/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const balanceData = await balanceResponse.json();
        if (balanceResponse.ok) {
          setBalance(balanceData.balance);
        } else {
          setError(balanceData.error);
        }
  
        // Fetch transactions
        const transactionsResponse = await fetch(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const transactionsData = await transactionsResponse.json();
        if (transactionsResponse.ok) {
          setTransactions(transactionsData.transactions);
        } else {
          setError(transactionsData.error);
        }
      };
  
      fetchData();
    }, [navigate]);
    
    const handleDeposit = async () => {
      console.log(API_URL)
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.newBalance);
        setAmount("");
        // Refresh transactions
        const transactionsResponse = await fetch(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const transactionsData = await transactionsResponse.json();
        if (transactionsResponse.ok) {
          setTransactions(transactionsData.transactions);
        }
      } else {
        setError(data.error);
      }
    };
  
    const handleWithdraw = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.newBalance);
        setAmount("");
        // Refresh transactions
        const transactionsResponse = await fetch(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const transactionsData = await transactionsResponse.json();
        if (transactionsResponse.ok) {
          setTransactions(transactionsData.transactions);
        }
      } else {
        setError(data.error);
      }
    };

    return (
      <div className="flex justify-center p-8">
        <div className="flex gap-8 w-full max-w-6xl">
          {/* Left Panel: Actions */}
          <div className="bg-white p-8 rounded-xl shadow-2xl w-1/2">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Dashboard</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <p className="text-center text-gray-700 mb-4">
              Your balance: <strong className="text-blue-600">${balance}</strong>
            </p>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                onClick={handleDeposit}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Deposit
              </button>
              <button
                onClick={handleWithdraw}
                className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition duration-300"
              >
                Withdraw
              </button>
            </div>
          </div>
  
          {/* Right Panel: Transaction History */}
          <div className="bg-white p-8 rounded-xl shadow-2xl w-1/2 h-[600px] overflow-y-auto">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Transaction History</h3>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <p>
                    <strong>{transaction.type}</strong>: ${transaction.amount}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
 
    );
    
    
  }

export default Dashboard