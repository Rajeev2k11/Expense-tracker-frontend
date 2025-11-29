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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Enable Multi-Factor Authentication</h1>
          <p className="mt-2 text-gray-600">
            Choose a method to add an extra layer of security to your account
          </p>
        </div>

        {/* Method Selection */}
        <div className="space-y-4">
          {/* Authenticator App Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === 'authenticator'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod('authenticator')}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'authenticator'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedMethod === 'authenticator' && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <Smartphone className="w-6 h-6 text-gray-700" />
              <span className="font-medium text-gray-900">Authenticator App</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 ml-8">
              Use an app like Google Authenticator or Authy to generate verification codes
            </p>
          </div>

          {/* Passkey Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === 'passkey'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod('passkey')}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'passkey'
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedMethod === 'passkey' && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <Key className="w-6 h-6 text-gray-700" />
              <span className="font-medium text-gray-900">Passkey</span>
            </div>
            <p className="mt-2 text-sm text-gray-600 ml-8">
              Use biometric authentication or a security key for quick and secure access
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Continue
        </button>

        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 inline mr-1" />
          Back to previous step
        </button>
      </div>
    </div>
  );
};

export default MFASetup;