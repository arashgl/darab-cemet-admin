import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create base axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create upload axios instance
export const uploadClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
const addResponseInterceptor = (client: typeof apiClient) => {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear auth state on 401
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors
addAuthInterceptor(apiClient);
addAuthInterceptor(uploadClient);
addResponseInterceptor(apiClient);
addResponseInterceptor(uploadClient);

export { API_BASE_URL };
