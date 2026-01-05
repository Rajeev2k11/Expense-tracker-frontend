import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

type F = { 
  email: string; 
  password: string;
};

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<F>();

  const onSubmit = async (d: F) => {
    if (!d.email) return setError('email', { type: 'required', message: 'Email required' });
    if (!d.password) return setError('password', { type: 'required', message: 'Password required' });

    try {
      const result = await login(d.email, d.password);

      if (result.requiresMfa && result.mfaMethod === 'TOTP') {
        navigate('/mfa/verify-code');
        return;
      }

      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError('root', { type: 'manual', message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-gray-900 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
          <p className="text-gray-500 text-sm mt-1">Access your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input 
            {...register('email')}
            placeholder="Email Address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}

          <input 
            {...register('password')}
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}

          {errors.root && (
            <p className="text-red-500 text-xs text-center">{errors.root.message}</p>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Need an account?{' '}
            <Link to="/auth/signup" className="text-gray-900 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;