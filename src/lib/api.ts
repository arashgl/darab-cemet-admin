import axios from "axios";
// Create an axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Variable to store interceptor IDs
let apiInterceptorId: number | null = null;
let uploadApiInterceptorId: number | null = null;

// Add a request interceptor to include the auth token on every request
export const setupApiInterceptors = (token: string) => {
  // Remove previous interceptor if exists
  if (apiInterceptorId !== null) {
    api.interceptors.request.eject(apiInterceptorId);
  }

  // Add new interceptor and store its ID
  apiInterceptorId = api.interceptors.request.use(
    (config) => {
      // Always get the latest token (either from param or localStorage)
      const currentToken = token || localStorage.getItem("token");
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Special instance for uploading files (with multipart/form-data)
export const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Add a request interceptor to include the auth token on upload requests
export const setupUploadApiInterceptors = (token: string) => {
  // Remove previous interceptor if exists
  if (uploadApiInterceptorId !== null) {
    uploadApi.interceptors.request.eject(uploadApiInterceptorId);
  }

  // Add new interceptor and store its ID
  uploadApiInterceptorId = uploadApi.interceptors.request.use(
    (config) => {
      // Always get the latest token (either from param or localStorage)
      const currentToken = token || localStorage.getItem("token");
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default api;
