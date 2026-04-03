import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';

// Icons
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserPlusIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// UI Components
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Auth3DLayoutProps {
  mode?: 'login' | 'signup';
}

const Auth3DLayout: React.FC<Auth3DLayoutProps> = ({ mode = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup') {
      if (!name) {
        newErrors.name = 'Name is required';
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let success = false;
      
      if (mode === 'signup') {
        success = await register(name, email, password);
        if (success) {
          toast.success('Account created! Welcome to our platform');
        }
      } else {
        success = await login(email, password);
        if (success) {
          toast.success('Login successful! Welcome back');
        }
      }

      if (success) {
        // Redirect based on user role
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const userRole = user.role?.toLowerCase();
          
          if (userRole === 'admin') navigate('/admin');
          else if (userRole === 'partner') navigate('/partner');
          else if (userRole === 'manager') navigate('/manager');
          else if (userRole === 'user' || userRole === 'employee') navigate('/employee');
          else navigate('/');
        }
      } else {
        toast.error('Authentication failed: Please check your credentials');
      }
    } catch (err) {
      toast.error('Connection error: Unable to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0F172A]'
        : 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50'
    }`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100/20 rounded-full blur-3xl" />
          </>
        )}
      </div>

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - 3D Illustration */}
          <div className="hidden lg:flex flex-col items-center justify-center p-8">
            <div className="relative">
              {/* 3D Scene Container */}
              <div className="relative w-full max-w-md">
                {/* Main illustration placeholder */}
                <div className={`aspect-square backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex items-center justify-center ${
                  isDark
                    ? 'bg-slate-800/50 border border-slate-700/50'
                    : 'bg-white/40 border border-white/20'
                }`}>
                  <div className="text-center space-y-6">
                    {/* 3D Workspace Illustration */}
                    <div className="relative">
                      <div className="w-48 h-48 mx-auto relative">
                        {/* Desk */}
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-700 to-amber-800 rounded-lg shadow-lg" />
                        
                        {/* Laptop */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-16 bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-lg shadow-xl">
                          <div className="absolute top-2 left-2 right-2 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-sm" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gray-700 rounded-b-sm" />
                        </div>
                        
                        {/* Person */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                          <div className="w-12 h-12 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full shadow-lg" />
                          <div className="w-8 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-b-lg mx-auto mt-1" />
                        </div>
                        
                        {/* Coffee cup */}
                        <div className="absolute bottom-4 right-8 w-3 h-4 bg-gradient-to-b from-amber-600 to-amber-700 rounded-b-sm" />
                      </div>
                      
                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400/20 rounded-full animate-bounce" />
                      <div className="absolute top-1/2 -left-6 w-6 h-6 bg-sky-400/20 rounded-full animate-pulse" />
                      <div className="absolute -bottom-4 right-2 w-4 h-4 bg-cyan-400/20 rounded-full animate-bounce [animation-delay:1s]" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className={`text-xl font-semibold ${ isDark ? 'text-slate-100' : 'text-gray-800' }`}>
                        {mode === 'signup' ? 'Start Your Journey' : 'Welcome Back'}
                      </h3>
                      <p className={`text-sm max-w-xs mx-auto ${ isDark ? 'text-slate-400' : 'text-gray-600' }`}>
                        {mode === 'signup' 
                          ? 'Join thousands of professionals managing their time efficiently'
                          : 'Continue your productive workflow with our intelligent platform'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative cards */}
                <div className={`absolute -top-4 -right-4 w-20 h-20 backdrop-blur-sm rounded-2xl shadow-lg transform rotate-12 ${
                  isDark ? 'bg-slate-700/40 border border-slate-600/30' : 'bg-white/30 border border-white/20'
                }`} />
                <div className={`absolute -bottom-4 -left-4 w-16 h-16 backdrop-blur-sm rounded-2xl shadow-lg transform -rotate-12 ${
                  isDark ? 'bg-slate-700/40 border border-slate-600/30' : 'bg-white/30 border border-white/20'
                }`} />
              </div>
            </div>
          </div>

          {/* Right Side - Glassmorphism Card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Glass Card */}
              <div className={`backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 ${
                isDark
                  ? 'bg-slate-800/70 border border-slate-700/50 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5)]'
                  : 'bg-white/60 border border-white/30 shadow-2xl'
              }`}>
                
                {/* Header */}
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h1 className={`text-2xl font-bold ${ isDark ? 'text-slate-50' : 'text-gray-900' }`}>
                      {mode === 'signup' ? 'Create account' : 'Login'}
                    </h1>
                    <p className={`text-sm ${ isDark ? 'text-slate-400' : 'text-gray-600' }`}>
                      {mode === 'signup' 
                        ? 'Sign up to get started with your account'
                        : 'Welcome back! Please enter your details'
                      }
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Name Field (Signup only) */}
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <label className={`text-sm font-medium ${ isDark ? 'text-slate-300' : 'text-gray-700' }`}>
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserPlusIcon className={`h-5 w-5 ${ isDark ? 'text-slate-500' : 'text-gray-400' }`} />
                        </div>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                          className={`pl-10 h-11 rounded-xl ${ isDark ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-500' : 'bg-white/50 border-gray-200' }`}
                          error={errors.name}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-400 text-xs flex items-center gap-1">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${ isDark ? 'text-slate-300' : 'text-gray-700' }`}>
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className={`h-5 w-5 ${ isDark ? 'text-slate-500' : 'text-gray-400' }`} />
                      </div>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        className={`pl-10 h-11 rounded-xl ${ isDark ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-500' : 'bg-white/50 border-gray-200' }`}
                        error={errors.email}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-xs flex items-center gap-1">
                        <ExclamationTriangleIcon className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={`text-sm font-medium ${ isDark ? 'text-slate-300' : 'text-gray-700' }`}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className={`text-sm underline ${ isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700' }`}
                      >
                        Forgot your password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className={`h-5 w-5 ${ isDark ? 'text-slate-500' : 'text-gray-400' }`} />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        className={`pl-10 pr-10 h-11 rounded-xl ${ isDark ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-500' : 'bg-white/50 border-gray-200' }`}
                        error={errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className={`h-5 w-5 ${ isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600' }`} />
                        ) : (
                          <EyeIcon className={`h-5 w-5 ${ isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600' }`} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs flex items-center gap-1">
                        <ExclamationTriangleIcon className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field (Signup only) */}
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <label className={`text-sm font-medium ${ isDark ? 'text-slate-300' : 'text-gray-700' }`}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockClosedIcon className={`h-5 w-5 ${ isDark ? 'text-slate-500' : 'text-gray-400' }`} />
                        </div>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                          className={`pl-10 pr-10 h-11 rounded-xl ${ isDark ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-500' : 'bg-white/50 border-gray-200' }`}
                          error={errors.confirmPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className={`h-5 w-5 ${ isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600' }`} />
                          ) : (
                            <EyeIcon className={`h-5 w-5 ${ isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600' }`} />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-xs flex items-center gap-1">
                          <ExclamationTriangleIcon className="h-3 w-3" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    disabled={isLoading}
                    isLoading={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {mode === 'signup' ? 'Create account' : 'Login'}
                        <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Footer Links */}
                <div className="text-center space-y-4 pt-4">
                  <div className={`text-xs ${ isDark ? 'text-slate-500' : 'text-gray-500' }`}>
                    By continuing, you agree to our{' '}
                    <a href="#" className={`underline ${ isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700' }`}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className={`underline ${ isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700' }`}>
                      Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth3DLayout;
