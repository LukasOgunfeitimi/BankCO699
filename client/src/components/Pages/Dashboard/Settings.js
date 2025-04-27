import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { API_URL } from "../../../config";

const Settings = () => {
  const { token } = useOutletContext();
  const navigate = useNavigate();

  // User state
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    accountNum: ""
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmNewPassword: ""
  });

  // UI state
  const [status, setStatus] = useState({
    isLoading: false,
    error: null,
    success: null
  });

  // Fetch user settings on component mount
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setStatus(prev => ({ ...prev, isLoading: true }));
        const response = await fetch(`${API_URL}/userinfo`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error("Failed to load settings");
        }

        const data = await response.json();
        setUserData({
          username: data.name,
          email: data.email,
          accountNum: data.account_num
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: error.message || "An error occurred while loading settings"
        }));
      } finally {
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchUserSettings();
  }, [token]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData(prev => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setStatus({ isLoading: true, error: null, success: null });

      const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: userData.username
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      setStatus({
        isLoading: false,
        error: null,
        success: "Profile updated successfully!"
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.newPassword) {
      setStatus(prev => ({
        ...prev,
        error: "Please enter a new password"
      }));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setStatus(prev => ({
        ...prev,
        error: "Passwords do not match"
      }));
      return;
    }

    try {
      setStatus({ isLoading: true, error: null, success: null });

      const response = await fetch(`${API_URL}/settings/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update password");
      }

      setStatus({
        isLoading: false,
        error: null,
        success: "Password updated successfully!"
      });

      // Clear password fields
      setPasswordData({
        newPassword: "",
        confirmNewPassword: ""
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            Account Settings
          </h1>
          <p className="text-gray-500 text-center mt-2">
            Manage your profile and security settings
          </p>
        </header>

        {/* Status messages */}
        {status.error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-between">
            <span>{status.error}</span>
            <button
              onClick={() => setStatus(prev => ({ ...prev, error: null }))}
              className="text-red-700 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}
        {status.success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center justify-between">
            <span>{status.success}</span>
            <button
              onClick={() => setStatus(prev => ({ ...prev, success: null }))}
              className="text-green-700 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Profile Section */}
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
              <p className="text-sm text-gray-500">Update your basic information</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={userData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  value={userData.email}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="accountNum" className="block text-sm font-medium text-gray-700">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNum"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  value={userData.accountNum}
                  disabled
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status.isLoading}
              className="w-full flex justify-center items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <span>{status.isLoading ? "Updating..." : "Update Profile"}</span>
            </button>
          </form>

          {/* Password Section */}
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-800">Password Security</h2>
              <p className="text-sm text-gray-500">Update your password</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status.isLoading}
              className="w-full flex justify-center items-center space-x-2 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              <span>{status.isLoading ? "Updating..." : "Change Password"}</span>
            </button>
          </form>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full mt-8 text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Settings;