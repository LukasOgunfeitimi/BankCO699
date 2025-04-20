import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";

function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUsername(data.username);
          setEmail(data.email);
        } else {
          setError(data.error || "Failed to load settings.");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setError("An unexpected error occurred while loading settings.");
      }
    };

    fetchUserSettings();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    setError("");
    setSuccessMessage("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Profile updated successfully!");
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("An unexpected error occurred while updating profile.");
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccessMessage("");
    const token = localStorage.getItem("token");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/settings/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Password updated successfully!");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setError(data.error || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setError("An unexpected error occurred while updating password.");
    }
  };

  return (
    <div className="flex justify-center p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Settings</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

        <div className="space-y-6">
          {/* Profile Settings */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Profile Information</h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-1">
                  Username:
                </label>
                <input
                  type="text"
                  id="username"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-1">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Password Change */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Change Password</h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-1">
                  New Password:
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold mb-1">
                  Confirm New Password:
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              <button
                onClick={handleChangePassword}
                className="w-full bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition duration-300"
              >
                Change Password
              </button>
            </div>
          </div>

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

export default Settings;