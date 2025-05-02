import React from 'react';
import EmailTotpAuth from '../Pages/Auth/Authenticate';

const AuthModal = ({ open, onSuccess, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onCancel}
        >
          ×
        </button>
        <EmailTotpAuth onSuccess={onSuccess} />
      </div>
    </div>
  );
};

export default AuthModal;