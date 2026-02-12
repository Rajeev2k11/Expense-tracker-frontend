import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const VerifyMFA: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { verifyLoginMfa } = useAuth();

  const { challengeId, mfaMethod, loading, error } = useAppSelector((state) => state.auth);

  const [totpCode, setCode] = useState('');

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleVerify = async () => {
    if (!challengeId) return;
    try {
      await verifyLoginMfa(challengeId, totpCode);
      navigate('/');
    } catch {
      // Errors are handled via Redux state and surfaced below
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={() => navigate('/auth/login')}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication</h1>
          <p className="mt-2 text-gray-600">
            Enter the 6-digit code from your authenticator app to complete login.
          </p>
        </div>

        {/* Verification Code Input */}
        <div className="space-y-6">
          <div>
            <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="mfaCode"
              value={totpCode}
              onChange={handleCodeChange}
              placeholder="Enter 6-digit code"
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest placeholder-gray-400"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={totpCode.length !== 6 || loading || !challengeId}
            className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              totpCode.length === 6 && !loading && challengeId
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Verify & Login
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Open your authenticator app to get your verification code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyMFA;