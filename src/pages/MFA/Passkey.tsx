import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Shield, Key, Fingerprint, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { RootState, AppDispatch } from '@/store';
import { verifyMfaSetup } from '@/features/mfaSetup/mfaSetupSlice';

/**
 * Passkey (WebAuthn) Setup Component
 * 
 * This component handles the complete passkey registration flow:
 * 
 * 1. User arrives here after selecting "Passkey" method in MFASetup page
 * 2. The Redux store contains 'options' from the backend (selectMfaMethod response)
 * 3. When user clicks "Create Passkey":
 *    - Parses the WebAuthn options from the store
 *    - Converts base64 strings to ArrayBuffers required by WebAuthn API
 *    - Calls navigator.credentials.create() with the options
 *    - User authenticates using their device's biometric sensor or security key
 * 4. After successful credential creation:
 *    - Converts the credential response back to base64 for transmission
 *    - Calls verifyMfaSetup API with challengeId and credential data
 *    - Backend verifies the attestation and stores the public key
 * 5. On success, redirects to MFASuccess page
 * 
 * WebAuthn Flow:
 * - Challenge: Random bytes from server to prevent replay attacks
 * - User: User identification containing id, name, displayName
 * - PublicKeyCredentialCreationOptions: Configuration for credential creation
 * - Attestation: Proof of the authenticator's legitimacy
 * 
 * API Payload Structure:
 * POST /v1/users/verify-mfa-setup
 * {
 *   "challengeId": "string",
 *   "credential": {
 *     "id": "string",
 *     "rawId": "base64",
 *     "type": "public-key",
 *     "response": {
 *       "attestationObject": "base64",
 *       "clientDataJSON": "base64"
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
  // Convert to base64url: replace +/= with -_
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const base64urlToArrayBuffer = (base64url: string): ArrayBuffer => {
  // Convert base64url to base64
  let base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Add padding if needed
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

const Passkey: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isCreating, setIsCreating] = useState(false);
  const [passkeyCreated, setPasskeyCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentialInfo, setCredentialInfo] = useState<{
    id: string;
    type: string;
  } | null>(null);

  const { challengeId, options, loading,  successPasskey, error: storeError } = useSelector(
    (state: RootState) => state.mfaSetup
  );

  useEffect(() => {
    if (successPasskey) {
      // Navigate to success page after successful verification
      setTimeout(() => {
        navigate('/mfa/success');
      }, 1500);
    }
  }, [successPasskey, navigate]);

  const handleCreatePasskey = async () => {
    try {
      setIsCreating(true);
      setError(null);

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser. Please use a modern browser like Chrome, Firefox, Safari, or Edge.');
      }

      // Validate that we have options from the server
      if (!options || Object.keys(options).length === 0) {
        throw new Error('Passkey options not available. Please select MFA method first.');
      }
   
      // options example :
      //   "challenge": "1234567890",
      //   "user": {
      //     "id": "1234567890",
      //     "name": "John Doe",
      //     "displayName": "John Doe"
      //   },
      //   "excludeCredentials": [
      //     {
      //       "id": "1234567890",
      //       "type": "public-key"
      //     }
      //   ]
      // }
      
 

      // Parse the options received from the server
      const optionsData = options as Record<string, unknown>;
      const userData = optionsData.user as Record<string, unknown>;
      const excludeCreds = (optionsData.excludeCredentials as Record<string, unknown>[]) || [];
      
      const publicKeyCredentialCreationOptions = {
        ...optionsData,
        challenge: base64urlToArrayBuffer(optionsData.challenge as string),
        user: {
          ...userData,
          id: base64urlToArrayBuffer(userData.id as string),
        },
        excludeCredentials: excludeCreds.map((cred: Record<string, unknown>) => ({
          ...cred,
          id: base64urlToArrayBuffer(cred.id as string),
        })),
      } as PublicKeyCredentialCreationOptions;

      // Create the credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create passkey. Please try again.');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Prepare the credential data to send to server (using base64url encoding)
      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: arrayBufferToBase64url(response.attestationObject),
          clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
        },
      };

      setCredentialInfo({
        id: credential.id,
        type: credential.type,
      });

      setPasskeyCreated(true);

      // Verify the passkey with the backend
      await dispatch(verifyMfaSetup({
        challengeId: challengeId!,
        credential: credentialData,
      })).unwrap();

    } catch (err: unknown) {
      console.error('Passkey creation error:', err);
      
      const error = err as Error & { name?: string };
      
      // Handle specific WebAuthn errors
      if (error.name === 'NotAllowedError') {
        setError('Passkey creation was cancelled or not allowed. Please try again.');
      } else if (error.name === 'InvalidStateError') {
        setError('This passkey already exists. Please use a different authenticator.');
      } else if (error.name === 'NotSupportedError') {
        setError('Your device does not support passkeys. Please try a different authentication method.');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to create passkey. Please try again.');
      }
      
      setPasskeyCreated(false);
    } finally {
      setIsCreating(false);
    }
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

      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Information */}
            <div className="p-8 lg:p-12 bg-linear-to-br from-indigo-50 to-purple-50">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <div className="bg-indigo-100 p-3 rounded-2xl">
                    <Shield className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Passkey Authentication
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Use biometric authentication or security keys to secure your account with passkeys.
                </p>
              </div>

              {/* Features Section */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Passwordless Security</h3>
                      <p className="text-sm text-gray-600">
                        No passwords to remember or type. Just use your fingerprint, face, or device PIN.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Fingerprint className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Biometric Protection</h3>
                      <p className="text-sm text-gray-600">
                        Uses your device's built-in biometric sensors for secure authentication.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Key className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phishing Resistant</h3>
                      <p className="text-sm text-gray-600">
                        Passkeys can't be phished or stolen, providing the highest level of security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Compatibility Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Compatible with:</strong> Face ID, Touch ID, Windows Hello, Android Biometrics, and security keys.
                </p>
              </div>
            </div>

            {/* Right Side - Create Passkey */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Key className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Setup Your Passkey</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-indigo-900 mb-1">Click Create Passkey</h4>
                      <p className="text-sm text-indigo-800">
                        Start the passkey creation process by clicking the button below.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-1">Authenticate</h4>
                      <p className="text-sm text-purple-800">
                        Use your device's biometric sensor or security key when prompted.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Complete Setup</h4>
                      <p className="text-sm text-green-800">
                        Your passkey will be created and your account will be secured.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Passkey Button & Status */}
              <div className="space-y-4">
                {/* Error Message */}
                {(error || storeError) && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-800 font-medium">Error</p>
                      <p className="text-sm text-red-700">{error || storeError}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {passkeyCreated && successPasskey && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-green-800 font-medium">Passkey Created Successfully!</p>
                      <p className="text-sm text-green-700">
                        Your account is now secured with passkey authentication.
                      </p>
                      {credentialInfo && (
                        <p className="text-xs text-green-600 mt-2 font-mono">
                          ID: {credentialInfo.id.slice(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Create Button */}
                <button
                  onClick={handleCreatePasskey}
                  disabled={isCreating || loading || passkeyCreated}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${
                    isCreating || loading
                      ? 'bg-indigo-400 text-white cursor-wait'
                      : passkeyCreated && successPasskey
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {isCreating || loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Passkey...</span>
                    </>
                  ) : passkeyCreated && successPasskey ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Passkey Created</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      <span>Create Passkey</span>
                    </>
                  )}
                </button>

                {/* Help Text */}
                {!passkeyCreated && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Make sure your device supports biometric authentication or has a security key available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Passkey;

