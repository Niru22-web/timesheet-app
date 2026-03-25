/**
 * Global Error Handler with Toast Integration
 */

import { getErrorMessage, ERROR_MESSAGES } from './messageUtils';

// Global toast instance - will be set by the ToastProvider
let globalToast: any = null;

export const setGlobalToast = (toastInstance: any) => {
  globalToast = toastInstance;
};

export const getGlobalToast = () => {
  if (!globalToast) {
    console.warn('Global toast not initialized. Make sure ToastProvider is used.');
    return {
      success: console.log,
      error: console.error,
      warning: console.warn,
      info: console.log
    };
  }
  return globalToast;
};

// Enhanced error handler with automatic toast notifications
export const handleError = (error: any, customMessage?: string, showToast: boolean = true) => {
  const message = customMessage || getErrorMessage(error);
  
  // Log error for debugging
  console.error('Global Error Handler:', error);
  
  // Show toast notification if enabled and toast is available
  if (showToast && globalToast) {
    globalToast.error(message);
  }
  
  return message;
};

// Success handler with automatic toast notifications
export const handleSuccess = (action: string, customMessage?: string, showToast: boolean = true) => {
  const message = customMessage || `✅ ${action}`;
  
  // Show toast notification if enabled and toast is available
  if (showToast && globalToast) {
    globalToast.success(message);
  }
  
  return message;
};

// Loading handler
export const handleLoading = (action: string) => {
  return `⏳ ${action}`;
};

// Specific error handlers for common scenarios
export const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    const message = error.config?.url?.includes('/auth/login') 
      ? ERROR_MESSAGES.INVALID_CREDENTIALS 
      : ERROR_MESSAGES.SESSION_EXPIRED;
    
    handleError(error, message);
    return message;
  }
  
  return handleError(error);
};

export const handleNetworkError = (error: any) => {
  if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return handleError(error, ERROR_MESSAGES.NETWORK_ERROR);
  }
  
  return handleError(error);
};

export const handleValidationError = (error: any) => {
  if (error.response?.status === 400) {
    return handleError(error, ERROR_MESSAGES.VALIDATION_ERROR);
  }
  
  return handleError(error);
};

export const handleForbiddenError = (error: any) => {
  if (error.response?.status === 403) {
    return handleError(error, ERROR_MESSAGES.ACCESS_DENIED);
  }
  
  return handleError(error);
};

export const handleNotFoundError = (error: any) => {
  if (error.response?.status === 404) {
    return handleError(error, ERROR_MESSAGES.NOT_FOUND);
  }
  
  return handleError(error);
};

export const handleServerError = (error: any) => {
  if (error.response?.status >= 500) {
    return handleError(error, ERROR_MESSAGES.SERVER_ERROR);
  }
  
  return handleError(error);
};

// Main error dispatcher
export const dispatchError = (error: any) => {
  const status = error.response?.status;
  
  switch (status) {
    case 400:
      return handleValidationError(error);
    case 401:
      return handleAuthError(error);
    case 403:
      return handleForbiddenError(error);
    case 404:
      return handleNotFoundError(error);
    case 500:
    case 502:
    case 503:
    case 504:
      return handleServerError(error);
    default:
      if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        return handleNetworkError(error);
      }
      return handleError(error);
  }
};
