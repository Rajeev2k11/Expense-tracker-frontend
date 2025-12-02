import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Fingerprint, User, Key, Shield } from 'lucide-react';

const Passkey: React.FC = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'fingerprint' | 'face' | 'securitykey' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthenticate = async () => {
    if (!method) {
      setError('Please choose a passkey method to continue.');
      return;
    }
    setError(null);
    setIsProcessing(true);

    // NOTE: This is a client-side simulated demo for local/testing purposes.
    // A real implementation would use WebAuthn APIs (`navigator.credentials`) and
    // server-side challenge/verification over HTTPS.
    setTimeout(() => {
      setIsProcessing(false);
      // On success, navigate to the MFA success page.
      navigate('/mfa/success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Set up Passkey</h1>
            <p className="text-gray-600">Passkeys let you sign in using biometrics or a security key. It's more secure and fast.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div
              onClick={() => setMethod('fingerprint')}
              className={`p-4 rounded-xl border cursor-pointer ${method === 'fingerprint' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Fingerprint className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-semibold">Fingerprint</div>
                  <div className="text-xs text-gray-600">Use your device fingerprint sensor</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => setMethod('face')}
              className={`p-4 rounded-xl border cursor-pointer ${method === 'face' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <User className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-semibold">Face ID</div>
                  <div className="text-xs text-gray-600">Use device face recognition</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => setMethod('securitykey')}
              className={`p-4 rounded-xl border cursor-pointer ${method === 'securitykey' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Key className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-semibold">Security Key</div>
                  <div className="text-xs text-gray-600">Use a USB/NFC hardware key</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-900 mb-2">Quick guide</div>
            <ul className="text-xs text-gray-600 list-disc ml-5">
              <li>Passkeys are backed by your device (biometrics) or a hardware key.</li>
              <li>They require a secure server-side challenge and verification in production.</li>
              <li>Local demo here simulates the flow; real WebAuthn needs HTTPS and backend support.</li>
            </ul>
          </div>

          {error && <div className="text-xs text-red-600 mb-3">{error}</div>}

          <div className="flex gap-3 items-center">
            <button
              onClick={handleAuthenticate}
              disabled={isProcessing}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-70"
            >
              {isProcessing ? 'Processing...' : 'Authenticate & Enable'}
            </button>

            <button
              onClick={() => navigate('/mfa/setup')}
              className="text-sm text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Passkey;
