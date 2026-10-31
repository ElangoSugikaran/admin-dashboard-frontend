import axios from 'axios';

// The Fastify API URL. Default to standard local port if env variable is missing.
const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // <-- This is the secret to making the cookie work!
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns a 401 Unauthorized, we can redirect to login
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
