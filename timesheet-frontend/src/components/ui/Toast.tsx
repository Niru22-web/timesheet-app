import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts(prev => [...prev, newToast]);

    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const { theme } = useTheme();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast: Toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const getIcon = () => {
    const iconClasses = 'h-6 w-6 flex-shrink-0';
    
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClasses} text-success-500`} />;
      case 'error':
        return <XCircleIcon className={`${iconClasses} text-danger-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClasses} text-warning-500`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClasses} text-info-500`} />;
    }
  };

  const getBackgroundClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800';
      case 'error':
        return 'bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800';
      case 'info':
        return 'bg-info-50 border-info-200 dark:bg-info-900/20 dark:border-info-800';
    }
  };

  const getTextClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'text-success-800 dark:text-success-200';
      case 'error':
        return 'text-danger-800 dark:text-danger-200';
      case 'warning':
        return 'text-warning-800 dark:text-warning-200';
      case 'info':
        return 'text-info-800 dark:text-info-200';
    }
  };

  return (
    <div
      className={`
        max-w-sm w-full rounded-lg border p-4 shadow-lg
        ${getBackgroundClasses()}
        ${getTextClasses()}
        transform transition-all duration-200 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            className={`
              inline-flex rounded-md p-1.5 transition-colors
              hover:bg-black/10 dark:hover:bg-white/10
              ${getTextClasses()}
            `}
            onClick={handleRemove}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>) =>
      addToast({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>) =>
      addToast({ type: 'error', title, message, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>) =>
      addToast({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>) =>
      addToast({ type: 'info', title, message, ...options }),
  };
};

export default ToastProvider;
