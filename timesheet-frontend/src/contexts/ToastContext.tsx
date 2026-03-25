import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import ToastContainer, { Toast } from '../components/ui/ToastContainer';
import { setGlobalToast } from '../utils/globalErrorHandler';

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (message: string, action?: Toast['action']) => void;
  error: (message: string, action?: Toast['action']) => void;
  warning: (message: string, action?: Toast['action']) => void;
  info: (message: string, action?: Toast['action']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setToasts((prev) => [newToast, ...prev]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message: string, action?: Toast['action']) => {
    showToast({ message, type: 'success', action });
  };

  const error = (message: string, action?: Toast['action']) => {
    showToast({ message, type: 'error', duration: 0, action });
  };

  const warning = (message: string, action?: Toast['action']) => {
    showToast({ message, type: 'warning', action });
  };

  const info = (message: string, action?: Toast['action']) => {
    showToast({ message, type: 'info', action });
  };

  // Register global toast instance for error handlers
  useEffect(() => {
    const toastInstance = { success, error, warning, info };
    setGlobalToast(toastInstance);
  }, []);

  const value: ToastContextType = {
    showToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};
