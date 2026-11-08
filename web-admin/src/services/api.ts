import axios from 'axios';
import router from '../router';

const API_BASE = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      
      // If we are already trying to refresh, don't try again to avoid infinite loop
      if (originalRequest.url.includes('/auth/refresh')) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          router.push('/login');
          return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refreshToken });
          const { access_token, refresh_token: new_refresh_token } = res.data;
          
          localStorage.setItem('token', access_token);
          localStorage.setItem('refresh_token', new_refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          router.push('/login');
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
