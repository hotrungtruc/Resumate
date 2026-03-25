import axios from 'axios';
import { authEventEmitter } from '../utils/authEvents';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 seconds timeout
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling authentication errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }

      // Emit event for components to react to
      authEventEmitter.loginRequired();

      // Only redirect if in browser and not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Give auth context time to process before redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      }
    }

    // Handle 429 Too Many Requests - rate limited
    if (error.response?.status === 429) {
      authEventEmitter.authError('Too many requests. Please wait a moment and try again.');
    }

    return Promise.reject(error);
  }
);

export default api;
