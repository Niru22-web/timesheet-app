import axios, { AxiosInstance } from "axios";
import { loadingManager } from "./utils/loadingManager";

const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Start global freeze for any outgoing data request
  if (config.method !== 'get') {
    loadingManager.startLoading("Syncing with database...");
  } else {
    // For GET, maybe use a more subtle message
    loadingManager.startLoading("Fetching latest records...");
  }

  return config;
});

API.interceptors.response.use(
  (response) => {
    loadingManager.stopLoading();
    return response;
  },
  (error) => {
    loadingManager.stopLoading();
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - Clearing auth and redirecting to login');
      
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page to prevent infinite loops
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/forgot-password') && 
          !window.location.pathname.includes('/reset-password') &&
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;