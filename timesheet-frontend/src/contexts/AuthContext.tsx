import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API from '../api';
import { useToast } from './ToastContext';
import { getErrorMessage, ERROR_MESSAGES } from '../utils/messageUtils';

interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  position?: string;
  department?: string;
  status?: string;
  officeEmail?: string;
  profile?: {
    employeePhotoUrl?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  refreshToken: () => Promise<boolean>; // 🔥 Add token refresh capability
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token and user data on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await API.post('/auth/refresh', { token });
      
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Validate input before sending request
    if (!email || !password) {
      toast.error('❌ Email and password are required');
      return false;
    }

    if (!email.includes('@') || email.length < 5) {
      toast.error('❌ Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      toast.error('❌ Password must be at least 6 characters long');
      return false;
    }

    try {
      // Log request payload for debugging
      console.log('🔐 Login request payload:', { email, password: '***' });
      
      const response = await API.post('/auth/login', {
        email: email.trim(),
        password: password
      });

      console.log('🔐 Login response:', response.data);

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('Login failed:', response.data);
        // Show more specific error message from backend
        const errorMessage = response.data?.message || response.data?.error || 'Login failed. Please check your credentials.';
        toast.error(`❌ ${errorMessage}`);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid credentials';
        toast.error(`❌ ${errorMessage}`);
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('❌ Network connection failed. Please check if the backend server is running and accessible.');
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        toast.error('❌ Connection refused. The server may be down or not accepting connections.');
      } else if (error.response?.status === 500) {
        toast.error('❌ Server error occurred. Please try again later.');
      } else {
        toast.error(`❌ Login failed: ${error.message || 'Unknown error'}`);
      }
      
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await API.post('/auth/register', {
        name,
        email,
        password
      });

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('Registration failed:', response.data);
        const errorMessage = response.data?.error || 'Registration failed. Please try again.';
        toast.error(`❌ ${errorMessage}`);
        return false;
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(`❌ Registration failed: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    loading,
    refreshToken // 🔥 Export refresh function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
