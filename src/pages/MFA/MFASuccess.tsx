import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const MFASuccess: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/auth/login');
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
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Multi-Factor Authentication
            </h1>
            <p className="text-gray-600">
              MFA is enabled on your account. You can disable it below.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Success Message */}
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Authorized by MFA
              </h3>
              <p className="text-gray-600">
                Your account has been successfully authenticated with Multi-Factor Authentication. 
                You can now proceed to login.
              </p>
            </div>

            {/* Go to Login Button */}
            <button
              onClick={handleGoToLogin}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Go to Login
            </button>
          </div>

          {/* Additional Options */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Manage MFA Settings
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              You can disable MFA or manage your authenticator app settings from your account settings.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Account Settings →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFASuccess;