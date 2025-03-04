import axios, { AxiosError } from 'axios';

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}

// Update this URL to match where your Swagger UI is running
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:44314/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    // In development, when using self-signed certs
    withCredentials: true
});

// Request interceptor for adding auth token - Don't comment this out!
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;