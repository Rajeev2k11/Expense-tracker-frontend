import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Key, Fingerprint, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { clearError } from '../../features/auth/loginSlice';

/**
 * Passkey Login Verification Component
 * 
 * This component handles passkey-based MFA verification during login:
 * 
 * 1. User arrives here after login with email/password when mfaMethod is PASSKEY
 * 2. The challengeId is stored in Redux from the login response
 * 3. When user clicks "Use Passkey":
 *    - Backend is called to get WebAuthn challenge options
 *    - Converts base64url challenge to ArrayBuffer
 *    - Calls navigator.credentials.get() with the options
 *    - User authenticates using their device's biometric or security key
 * 4. After successful authentication:
 *    - Converts credential response to base64url for transmission
 *    - Calls verify-login-mfa API with challengeId and credential
 *    - Backend verifies the assertion and returns auth token
 * 5. On success, user is logged in and redirected to dashboard
 * 
 * API Payload Structure:
 * POST /api/v1/users/verify-login-mfa
 * {
 *   "challengeId": "string",
 *   "credential": {
 *     "id": "string",
 *     "rawId": "base64url",
 *     "type": "public-key",
 *     "response": {
 *       "authenticatorData": "base64url",
 *       "clientDataJSON": "base64url",
 *       "signature": "base64url",
 *       "userHandle": "base64url"
 *     }
 *   }
 * }
 */

// WebAuthn helper functions for base64url encoding (RFC 4648)
const arrayBufferToBase64url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const base64urlToArrayBuffer = (base64url: string): ArrayBuffer => {
  let base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('Invalid base64url string');
    }
    base64 += new Array(5 - pad).join('=');
  }
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const PasskeyVerify: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { verifyLoginMfaPasskey } = useAuth();

  const { challengeId, mfaMethod, loading, error } = useAppSelector((state) => state.auth);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!challengeId || (mfaMethod && mfaMethod !== 'PASSKEY')) {
      navigate('/auth/login', { replace: true });
    }
  }, [challengeId, mfaMethod, navigate]);

  const handleUsePasskey = async () => {
    if (!challengeId) return;

    try {
      setIsAuthenticating(true);
      setLocalError(null);

      if (error) {
        dispatch(clearError());
      }

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('Passkeys are not supported in this browser. Please use a modern browser like Chrome, Firefox, Safari, or Edge.');
      }

      // Use challengeId directly as WebAuthn challenge
      const assertionOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64urlToArrayBuffer(challengeId),
        rpId: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
        timeout: 60000,
        userVerification: 'preferred',
      };

      // Get the credential from the authenticator
      const credential = await navigator.credentials.get({
        publicKey: assertionOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to authenticate with passkey. Please try again.');
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      // Prepare credential data for backend
      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: arrayBufferToBase64url(response.authenticatorData),
          clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
          signature: arrayBufferToBase64url(response.signature),
          userHandle: response.userHandle ? arrayBufferToBase64url(response.userHandle) : '',
        },
      };

      setAuthenticated(true);

      // Verify with backend
      await verifyLoginMfaPasskey(challengeId, credentialData);

      // Navigate to dashboard on success
      navigate('/');

    } catch (err: unknown) {
      console.error('Passkey authentication error:', err);
      
      const error = err as Error & { name?: string };
      
      if (error.name === 'NotAllowedError') {
        setLocalError('Authentication was cancelled or not allowed. Please try again.');
      } else if (error.name === 'InvalidStateError') {
        setLocalError('No passkey found for this account. Please use a different login method.');
      } else if (error.name === 'NotSupportedError') {
        setLocalError('Your device does not support passkeys. Please try a different authentication method.');
      } else if (error.message) {
        setLocalError(error.message);
      } else {
        setLocalError('Failed to authenticate with passkey. Please try again.');
      }
      
      setAuthenticated(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Back Button - Top Left */}
      <button
        onClick={() => navigate('/auth/login')}
        className="absolute top-6 left-6 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Login
      </button>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-2xl">
                  <Shield className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Passkey Verification
              </h1>
              <p className="text-gray-600">
                Use your device's biometric authentication or security key to complete login
              </p>
            </div>

            {/* Info Section */}
            <div className="space-y-4 mb-8">
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Fingerprint className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">Biometric Authentication</h3>
                    <p className="text-sm text-indigo-800">
                      Use your fingerprint, face recognition, or device PIN to verify your identity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Key className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-1">Secure & Fast</h3>
                    <p className="text-sm text-purple-800">
                      Passkeys provide the highest level of security without requiring passwords.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">Authentication Failed</p>
                  <p className="text-sm text-red-700">{displayError}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {authenticated && !displayError && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-800 font-medium">Authentication Successful!</p>
                  <p className="text-sm text-green-700">Logging you in...</p>
                </div>
              </div>
            )}

            {/* Use Passkey Button */}
            <button
              onClick={handleUsePasskey}
              disabled={isAuthenticating || loading || authenticated || !challengeId}
              className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-3 ${
                isAuthenticating || loading
                  ? 'bg-indigo-400 text-white cursor-wait'
                  : authenticated
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : !challengeId
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isAuthenticating || loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : authenticated ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Authenticated</span>
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  <span>Use Passkey</span>
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Click the button above to authenticate with your passkey
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasskeyVerify;
