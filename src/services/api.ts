import axios from 'axios';
import { dashboard, transactions, expenses as mockExpenses, teams } from '../mocks/data';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: if server returns HTML (index.html) because MSW didn't intercept,
// return local mock data for known endpoints so the UI doesn't crash.
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (typeof data === 'string' && data.trim().toLowerCase().startsWith('<!doctype')) {
      const url = response.config.url || '';
      if (url.includes('/dashboard/stats')) {
        return { ...response, data: dashboard.stats };
      }
      if (url.includes('/dashboard/spending')) {
        return { ...response, data: dashboard.spending };
      }
      if (url.includes('/dashboard/categories')) {
        return { ...response, data: dashboard.categories };
      }
      if (url.includes('/transactions')) {
        return { ...response, data: transactions };
      }
      if (url.includes('/teams')) {
        return { ...response, data: teams };
      }
      if (url.includes('/expenses')) {
        return { ...response, data: mockExpenses };
      }
    }
    return response;
  },
  (error) => Promise.reject(error),
);

export default api;

// Helper to call the real backend register endpoint. If `VITE_API_BASE_URL` is set
// (Vite env var) the call will go to that host; otherwise it will fall back to
// the local `/api` proxy (useful for MSW/mocks during development).
export async function registerUser(payload: unknown) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const trimmed = base.replace(/\/+$/, '');
  // Build URL like '<base>/api/v1/users/register' when base is set,
  // or '/api/v1/users/register' for same-origin requests when base is empty.
  const url = trimmed ? `${trimmed}/api/v1/users/register` : '/api/v1/users/register';
  return axios.post(url, payload);
}

// Authentication & MFA helpers
export async function setupPassword(payload: { userId?: string; token?: string; password: string }) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const trimmed = base.replace(/\/+$/, '');
  const url = trimmed ? `${trimmed}/api/v1/users/setup-password` : '/api/v1/users/setup-password';
  return axios.post(url, payload);
}

export async function selectMfaMethod(payload: { userId: string; method: 'authenticator' | 'passkey' }) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const trimmed = base.replace(/\/+$/, '');
  const url = trimmed ? `${trimmed}/api/v1/users/select-mfa-method` : '/api/v1/users/select-mfa-method';
  return axios.post(url, payload);
}

export async function verifyMfa(payload: { userId: string; method: string; code?: string }) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const trimmed = base.replace(/\/+$/, '');
  const url = trimmed ? `${trimmed}/api/v1/users/verify-mfa` : '/api/v1/users/verify-mfa';
  return axios.post(url, payload);
}

export async function passkeyAuthOptions(payload: { userId: string; action: 'register' | 'authenticate' }) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const trimmed = base.replace(/\/+$/, '');
  const url = trimmed ? `${trimmed}/api/v1/users/passkey-auth-options` : '/api/v1/users/passkey-auth-options';
  return axios.post(url, payload);
}

export async function passkeyAuthVerify(payload: { userId: string; action: string; credential: unknown }) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const trimmed = base.replace(/\/+$/, '');
  const url = trimmed ? `${trimmed}/api/v1/users/passkey-auth-verify` : '/api/v1/users/passkey-auth-verify';
  return axios.post(url, payload);
}

export async function loginUser(payload: { email: string; password?: string }) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const trimmed = base.replace(/\/+$/, '');
  const url = trimmed ? `${trimmed}/api/v1/users/login` : '/api/v1/users/login';
  return axios.post(url, payload);
}

export async function fetchUsers() {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const trimmed = base.replace(/\/+$/, '');
  const url = trimmed ? `${trimmed}/api/v1/users` : '/api/v1/users';
  return axios.get(url);
}

export async function getUser(userId: string) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const trimmed = base.replace(/\/+$/, '');
  const url = trimmed ? `${trimmed}/api/v1/users/${userId}` : `/api/v1/users/${userId}`;
  return axios.get(url);
}

export async function inviteUser(payload: { email: string; role?: string }) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const trimmed = base.replace(/\/+$/, '');
  const url = trimmed ? `${trimmed}/api/v1/users/invite` : '/api/v1/users/invite';
  return axios.post(url, payload);
}
