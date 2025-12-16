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

function getBase() {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
  return base.replace(/\/+$/, '');
}

// Default request timeout for remote API calls (ms)
const DEFAULT_TIMEOUT = 10000;

// Helper to call the real backend register endpoint. If `VITE_API_BASE_URL` is set
// (Vite env var) the call will go to that host; otherwise it will fall back to
// the local `/api` proxy (useful for MSW/mocks during development).
export async function registerUser(payload: unknown) {
  const trimmed = getBase();
  // Build URL like '<base>/api/v1/users/register' when base is set,
  // or '/api/v1/users/register' for same-origin requests when base is empty.
  const url = trimmed ? `${trimmed}/api/v1/users/register` : '/api/v1/users/register';
  console.debug('[api] registerUser ->', url);
  return api.post(url, payload, { timeout: DEFAULT_TIMEOUT });
}

// Authentication & MFA helpers
export async function setupPassword(payload: { userId?: string; token?: string; password: string }) {
  const trimmed = getBase();
  const url = trimmed ? `${trimmed}/api/v1/users/setup-password` : '/api/v1/users/setup-password';
  console.debug('[api] setupPassword ->', url);
  return api.post(url, payload, { timeout: DEFAULT_TIMEOUT });
}

export async function selectMfaMethod(payload: { userId: string; method: 'authenticator' | 'passkey' }) {
  const trimmed = getBase();
  const url = trimmed ? `${trimmed}/api/v1/users/select-mfa-method` : '/api/v1/users/select-mfa-method';
  console.debug('[api] selectMfaMethod ->', url);
  return api.post(url, payload, { timeout: DEFAULT_TIMEOUT });
}

export async function verifyMfa(payload: { userId: string; method: string; code?: string }) {
  const trimmed = getBase();
  const url = trimmed ? `${trimmed}/api/v1/users/verify-mfa` : '/api/v1/users/verify-mfa';
  console.debug('[api] verifyMfa ->', url);
  return api.post(url, payload, { timeout: DEFAULT_TIMEOUT });
}

export async function passkeyAuthOptions(payload: { userId: string; action: 'register' | 'authenticate' }) {
  const trimmed = getBase();
  const url = trimmed ? `${trimmed}/api/v1/users/passkey-auth-options` : '/api/v1/users/passkey-auth-options';
  console.debug('[api] passkeyAuthOptions ->', url);
  return api.post(url, payload, { timeout: DEFAULT_TIMEOUT });
}

export async function passkeyAuthVerify(payload: { userId: string; action: string; credential: unknown }) {
  const trimmed = getBase();
  const url = trimmed ? `${trimmed}/api/v1/users/passkey-auth-verify` : '/api/v1/users/passkey-auth-verify';
  console.debug('[api] passkeyAuthVerify ->', url);
  return api.post(url, payload, { timeout: DEFAULT_TIMEOUT });
}

export async function loginUser(payload: { email: string; password?: string }) {
  const trimmed = getBase();
  const url = trimmed ? `${trimmed}/api/v1/users/login` : '/api/v1/users/login';
  console.debug('[api] loginUser ->', url, payload.email ? `(email: ${payload.email})` : '');
  return api.post(url, payload, { timeout: DEFAULT_TIMEOUT });
}

export async function fetchUsers() {
  const trimmed = getBase();
  const url = trimmed ? `${trimmed}/api/v1/users` : '/api/v1/users';
  console.debug('[api] fetchUsers ->', url);
  return api.get(url, { timeout: DEFAULT_TIMEOUT });
}

export async function getUser(userId: string) {
  const trimmed = getBase();
  const url = trimmed ? `${trimmed}/api/v1/users/${userId}` : `/api/v1/users/${userId}`;
  console.debug('[api] getUser ->', url);
  return api.get(url, { timeout: DEFAULT_TIMEOUT });
}

export async function inviteUser(payload: { team: string; email: string; role: string; name: string }) {
  const trimmed = getBase();
  const url = trimmed ? `${trimmed}/api/v1/users/invite` : '/api/v1/users/invite';
  console.debug('[api] inviteUser ->', url, payload);
  try {
    const resp = await api.post(url, payload, { timeout: DEFAULT_TIMEOUT });
    console.debug('[api] inviteUser <-', resp.status, resp.data);
    return resp;
  } catch (err) {
    // Log server response body if available for easier debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e: any = err;
    console.error('[api] inviteUser error ->', e?.response?.status, e?.response?.data || e.message || e);
    throw err;
  }
}
