import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useSearchParams } from "react-router-dom";
import '../index.css';
import { API_URL } from "../config"

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkPasswordAgain = useCallback((value) => {
    setError("");
    setPasswordAgain(value);
    if (value !== password) {
      setError("Passwords do not match");
    }
  }, [password])

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) {
      setToken(t);
      console.log("Token from URL:", t);
    }
  }, [searchParams]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== passwordAgain) {
      setError("Password do not match, please try again.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token }),
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
    <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Enter your new password</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password again"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={passwordAgain}
          onChange={(e) => checkPasswordAgain(e.target.value)}
        />
        <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition duration-300">
          Reset
        </button>
      </form>
    </div>
  );
}


export default ResetPassword;