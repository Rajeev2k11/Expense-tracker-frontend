import axios from 'axios';
import { dashboard, transactions, expenses as mockExpenses, teams } from '../mocks/data';

const api = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
});

// api.interceptors.request.use((config) => {
  
// });

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
