import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAuthStatus, useAuthError } from '../../redux/hooks';
import { signup } from '../../redux/slices/authSlice';
import type { Role } from '../../types';

const roles = ['CEO','CTO','CFO','Founder','Manager','Team Leader','HR','Employee','Client','Designer','Developer','Marketing','Sales','Support'] as Role[];

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Please select a role'),
});

type Form = z.infer<typeof schema>;

const Signup: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAuthStatus();
  const authError = useAuthError();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Form>();

  const onSubmit = async (data: Form) => {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();
      Object.entries(fieldErrors).forEach(([key, messages]) => {
        const msg = Array.isArray(messages) && messages.length ? messages[0] : 'Invalid';
        setError(key as keyof Form, { type: 'manual', message: msg });
      });
      return;
    }
    try {
      await dispatch(signup(parsed.data as Form & { password: string })).unwrap();
      navigate('/');
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      // Map server message to field error when possible
      setError('email', { type: 'manual', message: msg });
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
          <h2 className="text-xl font-semibold text-gray-900">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">Join Expense Manager</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input 
            {...register('fullName')}
            placeholder="Full Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
          {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}

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

          <select 
            {...register('role')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          >
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}

          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-gray-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;