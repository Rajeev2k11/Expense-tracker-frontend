import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Copy, Check, Smartphone, Scan } from 'lucide-react';
import { useAppDispatch } from '../../redux/hooks';
import { verifyMfa } from '../../redux/slices/authSlice';
import QRCode from 'react-qr-code';

const AuthenticatorSetup: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const secretKey = localStorage.getItem('mfaSecret') || 'MOB7EMRTODRTUDG51EMF6J2ATKDTFES4';
  const qrImageUrl = localStorage.getItem('mfaQr');
  const otpauthUrl = localStorage.getItem('mfaOtpAuth');

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      const challengeId = localStorage.getItem('mfaChallengeId');
      if (challengeId) {
        dispatch(verifyMfa({ challengeId, totpCode: verificationCode }))
          .unwrap()
          .then(() => navigate('/mfa/success'))
          .catch((e) => console.error('Verify MFA failed', e));
        return;
      }

      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      if (user?.id) {
        dispatch(verifyMfa({ userId: user.id, method: 'authenticator', code: verificationCode }))
          .unwrap()
          .then(() => navigate('/mfa/success'))
          .catch((e) => console.error('Verify MFA failed', e));
      } else {
        navigate('/mfa/success');
      }
    }
  };

  const dispatch = useAppDispatch();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
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

      <div className="max-w-6xl w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - QR Code & Setup */}
            <div className="p-8 lg:p-12 bg-linear-to-br from-blue-50 to-indigo-50">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <div className="bg-blue-100 p-3 rounded-2xl">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Multi-Factor Authentication
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Add an extra layer of security to your account using an authenticator app.
                </p>
              </div>

              {/* QR Code Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Scan className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Scan QR Code</h3>
                </div>
                
                <div className="flex justify-center mb-4">
                  {otpauthUrl ? (
                    <div className="bg-white p-3 rounded">
                      <QRCode value={otpauthUrl} size={192} />
                    </div>
                  ) : qrImageUrl ? (
                    <img src={qrImageUrl} alt="Authenticator QR" className="w-48 h-48 rounded" />
                  ) : (
                    <div className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                        <div className="text-center text-gray-500">
                          <div className="text-sm mb-2">QR Code</div>
                          <div className="text-xs">Would be generated here</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code with your authenticator app to set up Multi-factor authentication.
                </p>
              </div>

              {/* Secret Key Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-700">Secret Key:</span>
                  <button
                    onClick={handleCopySecret}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <code className="text-sm bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 font-mono block break-all">
                  {secretKey}
                </code>
                <p className="text-xs text-gray-500 mt-3">
                  Can't scan? Enter the secret key manually in your authenticator app.
                </p>
              </div>
            </div>

            {/* Right Side - Instructions & Verification */}
            <div className="p-8 lg:p-12">
              {/* Setup Instructions */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Setup Instructions</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Install Authenticator App</h4>
                      <p className="text-sm text-green-800">
                        Download Google Authenticator, Authy, or any authenticator app from your app store.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Scan QR Code</h4>
                      <p className="text-sm text-blue-800">
                        Open your authenticator app and scan the QR code on the left.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-1">Enter Verification Code</h4>
                      <p className="text-sm text-purple-800">
                        Enter the 6-digit code from your authenticator app below to verify.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-1">Complete Setup</h4>
                      <p className="text-sm text-indigo-800">
                        Your account will be protected with Multi-Factor Authentication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Verification Code</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                      6-digit code from your authenticator app
                    </label>
                    <input
                      type="text"
                      id="verificationCode"
                      value={verificationCode}
                      onChange={handleCodeChange}
                      maxLength={6}
                      placeholder="000000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl font-mono tracking-widest placeholder-gray-400"
                    />
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={verificationCode.length !== 6}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      verificationCode.length === 6
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Verify & Continue
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Open your authenticator app to get the verification code
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatorSetup;