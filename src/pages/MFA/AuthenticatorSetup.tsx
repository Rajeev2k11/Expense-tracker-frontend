import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Copy, Check } from 'lucide-react';

const AuthenticatorSetup: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const secretKey = 'MOB7EMRTODRTUDG51EMF6J2ATKDTFES4';

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    navigate('/mfa/verify-code');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication</h1>
          <p className="mt-2 text-gray-600">
            Add an extra layer of security to your account using an authenticator app.
          </p>
        </div>

        {/* QR Code Section */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scan QR Code</h3>
          <div className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-lg inline-block mb-4">
            {/* Placeholder for QR Code - In real app, generate actual QR */}
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
              <div className="text-center text-gray-500">
                <div className="text-sm mb-2">QR Code</div>
                <div className="text-xs">(Would be generated here)</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code with your authenticator app to set up Multi-factor authentication.
          </p>
        </div>

        {/* Secret Key Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Secret Key:</span>
            <button
              onClick={handleCopySecret}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <code className="text-sm bg-white px-3 py-2 rounded border border-gray-300 font-mono block break-all">
            {secretKey}
          </code>
          <p className="text-xs text-gray-600 mt-2">Can't scan? Enter the secret key manually.</p>
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to set up MFA:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
            <li>Scan the QR code above with your authenticator app</li>
            <li>Enter the 6-digit code from your app to verify</li>
            <li>Your account will be protected with MFA</li>
          </ol>
        </div>

        {/* Verification Input */}
        <div className="space-y-4">
          <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
            Enter Verification Code
          </label>
          <input
            type="text"
            id="verificationCode"
            maxLength={6}
            placeholder="Enter 6-digit code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
          />
          <button
            onClick={handleVerify}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatorSetup;