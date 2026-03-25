import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

// Icons
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// UI Components
import Button from '../ui/Button';
import Input from '../ui/Input';

const MobileForgotPasswordLayout: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const toast = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Check if response is empty or not JSON
      const text = await response.text();
      let data;
      
      try {
        data = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', text);
        data = { success: false, message: 'Invalid server response' };
      }

      if (response.ok && data.success) {
        setIsSubmitted(true);
        toast.success('Reset link sent! Check your email for password reset instructions');
      } else {
        // Show actual error from backend
        const errorMessage = data?.message || `Server error (${response.status})`;
        toast.error(`Request failed: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        toast.error('Connection error: Unable to connect to the server. Please check if the server is running.');
      } else {
        toast.error('Request failed: An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center p-4">
        {/* Mobile Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-200/20 rounded-full blur-2xl" />
          <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-teal-200/20 rounded-full blur-xl" />
        </div>

        <div className="relative w-full max-w-sm">
          {/* Success Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 space-y-6">
            
            {/* Success Icon */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Check Your Email
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We've sent password reset instructions to
                </p>
                <p className="text-blue-600 font-medium text-sm">
                  {email}
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-green-50/50 backdrop-blur-sm rounded-xl p-4 border border-green-200">
              <h3 className="font-medium text-gray-800 mb-3 text-sm">What's next?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Check your email inbox</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Click the reset link in the email</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Create your new password</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  Back to Login
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Button>
              
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setErrors({});
                }}
                className="w-full h-11 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl font-medium hover:bg-white/80 transition-all duration-200 text-gray-700 text-sm"
              >
                Try Different Email
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                Didn't receive the email? Check your spam folder
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Mobile Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-200/20 rounded-full blur-2xl" />
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-sky-200/20 rounded-full blur-xl" />
        <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-blue-100/20 rounded-full blur-xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Mobile Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <EnvelopeIcon className="h-6 w-6 text-white" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Forgot Password?
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                No worries! Enter your email and we'll send you a reset link
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="pl-10 h-10 bg-white/60 border-gray-200 rounded-lg text-sm"
                  error={errors.email}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Send Reset Link
                  <EnvelopeIcon className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Back Link */}
          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium underline flex items-center gap-2 mx-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Sign In
            </button>
          </div>

          {/* Footer */}
          <div className="text-center space-y-3 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                Privacy
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation Hint */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileForgotPasswordLayout;
