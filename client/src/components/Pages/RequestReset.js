import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';

function RequestReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReqReset = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/requestreset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLocaleLowerCase() }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("If we find a matching account, we will send you an email with instructions to reset your password.");
      } else {
        setMessage(data.error || "Registration failed. Try again.");
      }
    } catch (err) {
      setMessage("Registration failed. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
        <h1 className="text-center text-gray-700 mb-4">
          Please enter your email address to receive a password reset link.
        </h1>
        {message && <p className="text-blue-500 text-center mb-4">{message}</p>}
        <form onSubmit={handleReqReset} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition duration-300">
            Reset password
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RequestReset;