import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Smartphone, Key } from 'lucide-react';

const MFASetup: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<'authenticator' | 'passkey'>('authenticator');

  const handleContinue = () => {
    if (selectedMethod === 'authenticator') {
      navigate('/mfa/authenticator-setup');
    }
    // Passkey implementation can be added later
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Back Button - Top Left */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Enable Multi-Factor Authentication
            </h1>
            <p className="text-gray-600">
              Choose a method to add an extra layer of security to your account
            </p>
          </div>

          {/* Method Selection */}
          <div className="space-y-4 mb-8">
            {/* Authenticator App Option */}
            <div
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedMethod === 'authenticator'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedMethod('authenticator')}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedMethod === 'authenticator'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedMethod === 'authenticator' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-gray-700" />
                  <span className="font-semibold text-gray-900">Authenticator App</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 ml-8">
                Use an app like Google Authenticator or Authy to generate verification codes
              </p>
            </div>

            {/* Passkey Option */}
            <div
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedMethod === 'passkey'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedMethod('passkey')}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedMethod === 'passkey'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedMethod === 'passkey' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Key className="w-6 h-6 text-gray-700" />
                  <span className="font-semibold text-gray-900">Passkey</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 ml-8">
                Use biometric authentication or a security key for quick and secure access
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            Continue
          </button>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Why enable MFA?
            </h4>
            <p className="text-xs text-gray-600">
              Multi-Factor Authentication adds an extra layer of security to your account by requiring 
              more than just a password to sign in. This helps protect your account from unauthorized access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFASetup;