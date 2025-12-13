import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key } from 'lucide-react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { useAppDispatch } from '../../redux/hooks';
import { passkeyAuthOptions, passkeyAuthVerify } from '../../redux/slices/authSlice';

const PasskeySetup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      if (!user?.id) throw new Error('No user found');
      const options = await dispatch(passkeyAuthOptions({ userId: user.id, action: 'register' })).unwrap();
      const attResp = await startRegistration(options as any);
      await dispatch(passkeyAuthVerify({ userId: user.id, action: 'register', credential: attResp })).unwrap();
      setStatus('Passkey registered successfully. You can now authenticate using your device.');
    } catch (err: any) {
      setStatus('Registration failed: ' + (err?.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      if (!user?.id) throw new Error('No user found');
      const options = await dispatch(passkeyAuthOptions({ userId: user.id, action: 'authenticate' })).unwrap();
      const assertion = await startAuthentication(options as any);
      await dispatch(passkeyAuthVerify({ userId: user.id, action: 'authenticate', credential: assertion })).unwrap();
      setStatus('Authentication successful — MFA verified.');
      navigate('/mfa/success');
    } catch (err: any) {
      setStatus('Authentication failed: ' + (err?.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Passkey (WebAuthn) Setup</h1>
            <p className="text-gray-600">Register a passkey and use your device (biometrics/security key) to authenticate.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Register a Passkey</h3>
              <p className="text-sm text-gray-600 mb-4">This will prompt your browser/device to create a passkey (biometric or security key).</p>
              <button onClick={handleRegister} disabled={isLoading} className="w-full py-2 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                {isLoading ? 'Working...' : 'Register Passkey'}
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Authenticate with Passkey</h3>
              <p className="text-sm text-gray-600 mb-4">Use your registered passkey to authenticate.</p>
              <button onClick={handleAuthenticate} disabled={isLoading} className="w-full py-2 px-4 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
                {isLoading ? 'Working...' : 'Authenticate'}
              </button>
            </div>

            {status && (
              <div className="mt-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">{status}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasskeySetup;
