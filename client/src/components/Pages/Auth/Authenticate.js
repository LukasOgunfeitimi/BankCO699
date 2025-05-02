import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { API_URL } from "../../../config";
function EmailTotpAuth({ onSuccess }) {
  const { token } = useOutletContext();
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
		onSuccess(emailCode, totpCode)
    }
  }, [emailCode, totpCode]);

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setError('');
    try {
	  const sendEmailCodeResponse = await fetch(`${API_URL}/sendemailcode`, {
		method: "POST",
		headers: { Authorization: `Bearer ${token}` },
	  });
	  const userInfoData = await sendEmailCodeResponse.json();
	  if (sendEmailCodeResponse.ok) {
		setEmailSent(true);
	  } else {
		setEmailSent(false)
		setError(userInfoData.error || 'Failed to send an email code');
	  }
    } catch (err) {
      setError('Failed to send email code.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form
        onSubmit={()=>{}}
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
			disabled={!emailSent || loading || success}
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
      </form>
    </div>
  );
}

export default EmailTotpAuth;