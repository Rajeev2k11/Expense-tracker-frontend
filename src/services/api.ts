import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Don't add auth header for MFA setup endpoints (they use challengeId instead)
    const publicEndpoints = [
      '/v1/users/setup-password',
      '/v1/users/select-mfa-method',
      '/v1/users/verify-mfa',
      '/v1/users/verify-login-mfa',
      '/v1/users/signup-admin'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
