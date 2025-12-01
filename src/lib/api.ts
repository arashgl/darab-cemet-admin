import axios from 'axios';
// Create an axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export enum PostSection {
  OCCASIONS = 'مناسبت ها',
  ANNOUNCEMENTS = 'اطلاعیه ها',
  NEWS = 'اخبار ها',
  ACHIEVEMENTS = 'افتخارات',
  SLIDER = 'اسلایدر',
  HR = 'منابع انسانی',
}
export const sections = [
  { value: PostSection.OCCASIONS, label: 'مناسبت ها' },
  { value: PostSection.ANNOUNCEMENTS, label: 'اطلاعیه ها' },
  { value: PostSection.NEWS, label: 'اخبار ها' },
  { value: PostSection.ACHIEVEMENTS, label: 'افتخارات' },
  { value: PostSection.SLIDER, label: 'اسلایدر' },
];

// Add request interceptor to dynamically add auth token
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

// Special instance for uploading files (with multipart/form-data)
export const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add request interceptor to upload API for auth token
uploadApi.interceptors.request.use(
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

uploadApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
