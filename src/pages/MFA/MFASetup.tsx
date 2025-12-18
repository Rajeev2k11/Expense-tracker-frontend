import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Shield, Smartphone, Key } from 'lucide-react';
import { selectMfaMethod } from '../../features/mfaSetup/mfaSetupSlice';
import type { AppDispatch, RootState } from '@/store';

const MFASetup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedMethod, setSelectedMethod] = useState<'authenticator' | 'passkey'>('authenticator');
  
  const { loading, error, challengeId, mfaMethodSelected } = useSelector(
    (state: RootState) => state.mfaSetup
  );

  // Passkey flow is handled in a separate page (`/mfa/passkey`).
  console.log('challengeId', challengeId);
  useEffect(() => {
    // Navigate to authenticator setup when MFA method is successfully selected
    if (mfaMethodSelected && selectedMethod === 'authenticator') {
      navigate('/mfa/authenticator-setup');
    } else if (mfaMethodSelected && selectedMethod === 'passkey') {
      navigate('/mfa/passkey');
    }
  }, [mfaMethodSelected, selectedMethod, navigate]);

  const handleContinue = async () => {
    if (!challengeId) {
      console.error('No challengeId available');
      return;
    }

    const mfaMethod = selectedMethod === 'authenticator' ? 'TOTP' : 'PASSKEY';
    await dispatch(selectMfaMethod({ challengeId, mfaMethod }));
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

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

            {/* Passkey methods moved to a dedicated page */}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={loading || !challengeId}
            className={`w-full py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm ${
              loading || !challengeId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting up...
              </span>
            ) : (
              selectedMethod === 'passkey' ? 'Continue to Passkey Setup' : 'Continue'
            )}
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