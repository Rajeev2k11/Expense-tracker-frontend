import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { setupPassword } from '../../redux/slices/authSlice';

const SetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasLetter: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [showRequirements, setShowRequirements] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const specialCharacters = '@#*%_()$';

  const validatePassword = (password: string) => {
    const checks = {
      minLength: password.length >= 6,
      hasLetter: /[a-zA-Z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: new RegExp(`[${specialCharacters.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password),
    };
    setPasswordChecks(checks);
    return Object.values(checks).every(Boolean);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    
    // Show requirements only when user starts typing
    if (password.length > 0 && !showRequirements) {
      setShowRequirements(true);
    }
    
    validatePassword(password);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSetupPassword = () => {
    if (isSetupEnabled) {
      // Call API to set password then navigate to MFA setup
      // Use token from invite link when present (preferred) — do not send userId
      if (tokenParam) {
        // Persist token immediately so subsequent requests include Authorization header
        try {
          localStorage.setItem('token', tokenParam);
        } catch {}

        dispatch(setupPassword({ token: tokenParam, password: newPassword }))
          .unwrap()
          .then((resp: any) => {
            // If backend returned a token or challengeId, ensure they're stored
            if (resp?.token) localStorage.setItem('token', resp.token);
            if (resp?.challengeId) localStorage.setItem('mfaChallengeId', resp.challengeId);
            navigate('/mfa/setup');
          })
          .catch((e) => console.error('Setup password failed', e));
        return;
      }

      // Fallback (older flows): try to use local user id
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : null;
      if (user?.id) {
        dispatch(setupPassword({ userId: user.id, password: newPassword }))
          .unwrap()
          .then((resp: any) => {
            if (resp?.token) localStorage.setItem('token', resp.token);
            if (resp?.challengeId) localStorage.setItem('mfaChallengeId', resp.challengeId);
            navigate('/mfa/setup');
          })
          .catch((e) => console.error('Setup password failed', e));
      } else {
        navigate('/mfa/setup');
      }
    }
  };


  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';
  const isSetupEnabled = isPasswordStrong && passwordsMatch;

  const getStrengthText = () => {
    const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
    if (passedChecks === 0) return 'Weak';
    if (passedChecks <= 2) return 'Fair';
    if (passedChecks <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
    if (passedChecks === 0) return 'text-red-500';
    if (passedChecks <= 2) return 'text-orange-500';
    if (passedChecks <= 4) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Setup Password</h1>
          <p className="mt-2 text-gray-600">Create a secure password to protect your account</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          {/* New Password Section */}
          <div className="mb-6">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={handleNewPasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your new password"
            />
          </div>

          {/* Password Strength Indicator - Only show when user starts typing */}
          {showRequirements && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${getStrengthColor()}`}>
                  {getStrengthText()}
                </span>
                <span className="text-xs text-gray-500">
                  {Object.values(passwordChecks).filter(Boolean).length}/5 requirements
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getStrengthText() === 'Weak' ? 'bg-red-500 w-1/5' :
                    getStrengthText() === 'Fair' ? 'bg-orange-500 w-2/5' :
                    getStrengthText() === 'Good' ? 'bg-blue-500 w-3/4' :
                    'bg-green-500 w-full'
                  }`}
                />
              </div>

              {/* Password Requirements */}
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Password must include:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className={`flex items-center ${passwordChecks.minLength ? 'text-green-500' : 'text-gray-400'}`}>
                    <span className="mr-2">{passwordChecks.minLength ? '✓' : '•'}</span>
                    At least 6 characters ({newPassword.length}/6)
                  </li>
                  <li className={`flex items-center ${passwordChecks.hasLetter ? 'text-green-500' : 'text-gray-400'}`}>
                    <span className="mr-2">{passwordChecks.hasLetter ? '✓' : '•'}</span>
                    At least one letter (a-z, A-Z)
                  </li>
                  <li className={`flex items-center ${passwordChecks.hasUppercase ? 'text-green-500' : 'text-gray-400'}`}>
                    <span className="mr-2">{passwordChecks.hasUppercase ? '✓' : '•'}</span>
                    At least one uppercase letter (A-Z)
                  </li>
                  <li className={`flex items-center ${passwordChecks.hasNumber ? 'text-green-500' : 'text-gray-400'}`}>
                    <span className="mr-2">{passwordChecks.hasNumber ? '✓' : '•'}</span>
                    At least one number (0-9)
                  </li>
                  <li className={`flex items-center ${passwordChecks.hasSpecialChar ? 'text-green-500' : 'text-gray-400'}`}>
                    <span className="mr-2">{passwordChecks.hasSpecialChar ? '✓' : '•'}</span>
                    At least one special character (@#*%_()$)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Confirm Password Section */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
            {confirmPassword && (
              <p className={`text-sm mt-2 ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Setup Password Button */}
          <button
            type="button"
            onClick={handleSetupPassword}
            disabled={!isSetupEnabled}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isSetupEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Setup Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;