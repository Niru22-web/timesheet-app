import axios, { AxiosInstance } from "axios";
import { loadingManager } from "./utils/loadingManager";
import { getErrorMessage, ERROR_MESSAGES } from "./utils/messageUtils";
import { dispatchError, handleSuccess } from "./utils/globalErrorHandler";

const rawBaseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
const baseURL = rawBaseURL.replace(/\/$/, '') + '/';

const API: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Debug: Log API Base URL on startup
console.log('🚀 API Base URL initialized as:', API.defaults.baseURL);

API.interceptors.request.use((config) => {
  // 🔥 Normalize URL: Remove leading slash if present to prevent Axios from overriding baseURL path
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
    console.log(`🔧 Normalized Request URL to: ${config.url}`);
  }

  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('📡 API Request:', config.method?.toUpperCase(), config.url, 'with token (truncated)');
  }

  // Start global loading
  loadingManager.startLoading(undefined, false);

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
      
      // Don't auto-logout on 401 errors for approval/employee management operations
      // These might be authorization errors (user doesn't have permission) not authentication errors
      const isApprovalOperation = error.config?.url?.includes('/employees/approve-employee') ||
                                 error.config?.url?.includes('/employees/reject-employee') ||
                                 error.config?.url?.includes('/notifications/approve-employee');
      
      if (!isLoginRequest && !isApprovalOperation) {
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
        console.log('401 on login or approval request - not redirecting');
      }
    }
    
    return Promise.reject(error);
  }
);


export default API;