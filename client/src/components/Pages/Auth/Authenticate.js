import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function EmailTotpAuth({ onSuccess }) {
  const [emailCode, setEmailCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const navigate = useNavigate();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (emailCode.length === 6 && totpCode.length === 6) {
      handleSubmit();
    }
    // eslint-disable-next-line
  }, [emailCode, totpCode]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verifyCodes(emailCode, totpCode);

      if (response.success) {
        setSuccess(true);
        localStorage.setItem('token', response.token);
        if (onSuccess) {
          setTimeout(() => onSuccess(), 800);
        } else {
          setTimeout(() => navigate('/dashboard'), 1200);
        }
      } else {
        setError('Invalid authentication codes');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setError('');
    try {
      await sendEmailCode();
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch (err) {
      setError('Failed to send email code.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-blue-100"
        autoComplete="off"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Two-Factor Authentication</h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">Authenticated! Redirecting...</p>}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Email Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={emailCode}
              onChange={(e) => {
                if (/^\d{0,6}$/.test(e.target.value)) setEmailCode(e.target.value);
              }}
              maxLength={6}
              disabled={loading || success}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg tracking-widest text-center"
              placeholder="Enter 6-digit code"
              autoFocus
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={sendingEmail || loading || success}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                sendingEmail || loading || success
                  ? 'bg-blue-200 text-blue-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </button>
          </div>
          {emailSent && <p className="text-green-500 text-xs mt-2">Email sent!</p>}
        </div>
        <div className="mb-8">
          <label className="block text-gray-700 mb-2 font-medium">TOTP Code</label>
          <input
            type="text"
            value={totpCode}
            onChange={(e) => {
              if (/^\d{0,6}$/.test(e.target.value)) setTotpCode(e.target.value);
            }}
            maxLength={6}
            disabled={loading || success}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg tracking-widest text-center"
            placeholder="Enter 6-digit code"
            inputMode="numeric"
          />
        </div>
        <button
          type="submit"
          disabled={loading || success || emailCode.length !== 6 || totpCode.length !== 6}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            loading || success || emailCode.length !== 6 || totpCode.length !== 6
              ? 'bg-blue-200 text-blue-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Verifying...
            </span>
          ) : (
            'Verify'
          )}
        </button>
      </form>
    </div>
  );
}

// Placeholder function for actual API call
const verifyCodes = async (emailCode, totpCode) => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      if (emailCode === '123456' && totpCode === '654321') {
        resolve({ success: true, token: 'actual-jwt-token' });
      } else {
        resolve({ success: false });
      }
    }, 1000);
  });
};

// Placeholder for sending email code
const sendEmailCode = async () => {
  // Replace with actual API call to send email code
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

export default EmailTotpAuth;