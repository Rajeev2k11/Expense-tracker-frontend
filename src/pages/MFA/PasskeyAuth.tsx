import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Key } from 'lucide-react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useAppDispatch } from '../../redux/hooks';
import { passkeyAuthOptions, passkeyAuthVerify } from '../../redux/slices/authSlice';

const PasskeyAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuthenticate = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      if (!user?.id) throw new Error('No user found');
      const options = await dispatch(passkeyAuthOptions({ userId: user.id, action: 'authenticate' })).unwrap();
      const assertion = await startAuthentication(options as any);
      const verify = await dispatch(passkeyAuthVerify({ userId: user.id, action: 'authenticate', credential: assertion })).unwrap();
      if (verify?.token) {
        localStorage.setItem('token', verify.token);
        localStorage.setItem('user', JSON.stringify(verify.user));
      }
      setStatus('Authentication successful');
      navigate('/');
    } catch (err: any) {
      setStatus('Authentication failed: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Passkey Authentication</h1>
            <p className="text-gray-600">Use your registered passkey (security key or biometrics) to sign in.</p>
          </div>

          <div className="space-y-4">
            <button onClick={handleAuthenticate} disabled={loading} className="w-full py-2 px-4 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
              {loading ? 'Working...' : 'Authenticate with Passkey'}
            </button>

            {status && (
              <div className="mt-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">{status}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasskeyAuth;
