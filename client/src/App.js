import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001"; // Replace with your server URL

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed. Try again.");
      }
    } catch (err) {
      setError("Login failed. Try again.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300">
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        No account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/login");
      } else {
        setError(data.error || "Registration failed. Try again.");
      }
    } catch (err) {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition duration-300">
          Register
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

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

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Dashboard</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <p className="text-center text-gray-700 mb-4">
        Your balance: <strong className="text-blue-600">${balance}</strong>
      </p>
      <div className="space-y-4">
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <h3 className="text-xl font-bold text-center text-gray-800 mt-6 mb-4">Transaction History</h3>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-3 border border-gray-300 rounded-lg"
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
  );
}

export default App;