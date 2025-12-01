import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Base axios instance for JSON API calls
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Axios instance for file uploads (multipart/form-data)
 */
export const uploadClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

/**
 * Request interceptor to add auth token to all requests
 */
const addAuthInterceptor = (client: typeof apiClient) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

/**
 * Response interceptor for global error handling
 * - 401: Clear auth and redirect to login
 */
const addResponseInterceptor = (client: typeof apiClient) => {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to both clients
addAuthInterceptor(apiClient);
addAuthInterceptor(uploadClient);
addResponseInterceptor(apiClient);
addResponseInterceptor(uploadClient);

export { API_BASE_URL };
