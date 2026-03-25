/**
 * Enhanced Toast Utilities with Loading States
 */

import { useToast } from '../contexts/ToastContext';

export interface ToastUtils {
  loading: (message: string) => string;
  success: (id: string, message: string) => void;
  error: (id: string, message: string) => void;
  update: (id: string, options: { message?: string; type?: 'success' | 'error' | 'warning' | 'info'; isLoading?: boolean }) => void;
}

export const useToastUtils = (): ToastUtils => {
  const toast = useToast();

  const loading = (message: string): string => {
    // Generate a unique ID for this toast
    const id = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Show loading toast
    toast.showToast({
      id,
      message: `⏳ ${message}`,
      type: 'info',
      duration: 0 // Don't auto-close loading toasts
    });
    
    return id;
  };

  const success = (id: string, message: string): void => {
    toast.update({
      id,
      message: `✅ ${message}`,
      type: 'success',
      duration: 3000
    });
  };

  const error = (id: string, message: string): void => {
    toast.update({
      id,
      message: `❌ ${message}`,
      type: 'error',
      duration: 0 // Error toasts stay until dismissed
    });
  };

  const update = (id: string, options: { 
    message?: string; 
    type?: 'success' | 'error' | 'warning' | 'info'; 
    isLoading?: boolean 
  }): void => {
    const { message, type = 'info', isLoading = false } = options;
    
    let displayMessage = message;
    if (isLoading) {
      displayMessage = `⏳ ${message}`;
    } else if (type === 'success') {
      displayMessage = `✅ ${message}`;
    } else if (type === 'error') {
      displayMessage = `❌ ${message}`;
    } else if (type === 'warning') {
      displayMessage = `⚠️ ${message}`;
    }

    toast.update({
      id,
      message: displayMessage,
      type,
      duration: isLoading ? 0 : (type === 'error' ? 0 : 3000)
    });
  };

  return {
    loading,
    success,
    error,
    update
  };
};

/**
 * Higher-order function for async operations with automatic toast feedback
 */
export const withToastFeedback = async <T>(
  asyncFn: () => Promise<T>,
  loadingMessage: string,
  successMessage: string,
  toastUtils: ToastUtils
): Promise<T> => {
  const toastId = toastUtils.loading(loadingMessage);
  
  try {
    const result = await asyncFn();
    toastUtils.success(toastId, successMessage);
    return result;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Operation failed';
    toastUtils.error(toastId, errorMessage);
    throw error;
  }
};

/**
 * Predefined toast messages for common operations
 */
export const TOAST_MESSAGES = {
  // Loading messages
  LOADING: {
    LOGIN: 'Logging in...',
    REGISTER: 'Creating account...',
    SAVE: 'Saving changes...',
    UPLOAD: 'Uploading file...',
    DELETE: 'Deleting item...',
    UPDATE: 'Updating...',
    FETCH: 'Loading data...'
  },
  
  // Success messages
  SUCCESS: {
    LOGIN: 'Login successful!',
    REGISTER: 'Account created successfully!',
    SAVE: 'Changes saved successfully!',
    UPLOAD: 'File uploaded successfully!',
    DELETE: 'Item deleted successfully!',
    UPDATE: 'Updated successfully!',
    CREATE: 'Created successfully!'
  },
  
  // Error messages
  ERROR: {
    NETWORK: 'Network error. Please check your connection.',
    SERVER: 'Server error. Please try again later.',
    VALIDATION: 'Please check your input and try again.',
    UNAUTHORIZED: 'Please login to continue.',
    FORBIDDEN: 'You don\'t have permission to perform this action.',
    NOT_FOUND: 'Requested resource not found.',
    GENERIC: 'Something went wrong. Please try again.'
  }
} as const;
