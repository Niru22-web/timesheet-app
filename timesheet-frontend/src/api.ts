import axios, { AxiosInstance } from "axios";
import { loadingManager } from "./utils/loadingManager";
import { getErrorMessage, ERROR_MESSAGES } from "./utils/messageUtils";
import { dispatchError, handleSuccess } from "./utils/globalErrorHandler";

const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    // Debug: Log the token being sent
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'with token:', token.substring(0, 20) + '...');
  }

  // Start global loading for ALL requests (Modern SaaS style)
  // We don't block the screen here, just trigger the top progress bar
  const isBlocking = false; // Minimal blocking
  loadingManager.startLoading(undefined, isBlocking);

  return config;
});

API.interceptors.response.use(
  (response) => {
    loadingManager.stopLoading(false);
    
    // 🔥 Auto-refresh on successful updates
    const isUpdateRequest = ['PUT', 'POST', 'DELETE'].includes(response.config.method?.toUpperCase() || '');
    const isProfileOrDataUpdate = response.config.url?.includes('/employees/') || 
                               response.config.url?.includes('/profile') ||
                               response.config.url?.includes('/dashboard');
    
    if (isUpdateRequest && isProfileOrDataUpdate) {
      // Trigger a custom event for components to listen to
      window.dispatchEvent(new CustomEvent('data-updated', { 
        detail: { type: response.config.url, data: response.data } 
      }));
      
      // Show success toast for successful updates
      if (response.config.url?.includes('/profile')) {
        handleSuccess('Profile updated successfully');
      } else if (response.config.url?.includes('/profile-photo')) {
        handleSuccess('Profile photo updated successfully');
      } else if (response.config.url?.includes('/password')) {
        handleSuccess('Password changed successfully');
      }
    }
    
    return response;
  },
  (error) => {
    loadingManager.stopLoading(false);
    
    // Use global error handler for consistent error messages
    dispatchError(error);
    
    // Handle 401 Unauthorized errors (special case for login)
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - Checking if this is a login failure');
      
      // Check if this is a login failure - don't logout immediately
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!isLoginRequest) {
        console.log('401 Unauthorized - Clearing auth and redirecting to login');
        
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on auth pages to prevent infinite loops
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/forgot-password') && 
            !window.location.pathname.includes('/reset-password') &&
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      } else {
        console.log('401 on login request - not redirecting');
      }
    }
    
    return Promise.reject(error);
  }
);


export default API;