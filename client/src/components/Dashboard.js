import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import '../index.css';

const API_URL = "http://localhost:3001"; // Replace with your server URL

function Dashboard() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
  
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

    const handleTransfer = async() => {

    }
  
    const handleLogout = () => {
      localStorage.removeItem("token"); // Clear the token
      navigate("/login"); // Redirect to the login page
    };
  
    return (
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
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
            onClick={handleTransfer}
            className="w-full bg-yellow-600 text-white p-3 rounded-lg hover:bg-yellow-700 transition duration-300"
          >
            Transfer
          </button>
          <button
            onClick={handleWithdraw}
            className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition duration-300"
          >
            Withdraw
          </button>
        </div>
        <h3 className="text-xl font-bold text-center text-gray-800 mt-6 mb-4">Transaction History</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
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
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition duration-300"
        >
          Logout
        </button>
      </div>
    );
  }

export default Dashboard