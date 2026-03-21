import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastHelpers } from '../ui/Toast';

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

const ForgotPassword3DLayout: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const toast = useToastHelpers();

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
        toast.success('Reset link sent!', 'Check your email for password reset instructions');
      } else {
        // Show actual error from backend
        const errorMessage = data?.message || `Server error (${response.status})`;
        toast.error('Request failed', errorMessage);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        toast.error('Connection error', 'Unable to connect to the server. Please check if the server is running.');
      } else {
        toast.error('Request failed', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center p-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Side - 3D Illustration */}
            <div className="hidden lg:flex flex-col items-center justify-center p-8">
              <div className="relative">
                {/* 3D Scene Container */}
                <div className="relative w-full max-w-md">
                  {/* Success illustration */}
                  <div className="aspect-square bg-white/40 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 flex items-center justify-center">
                    <div className="text-center space-y-6">
                      {/* Email sent illustration */}
                      <div className="relative">
                        <div className="w-48 h-48 mx-auto relative">
                          {/* Mail envelope */}
                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-20 bg-gradient-to-b from-blue-500 to-blue-600 rounded-lg shadow-xl">
                            <div className="absolute top-2 left-2 right-2 h-16 bg-gradient-to-b from-white to-gray-100 rounded-t-sm" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-blue-700 rounded-b-sm" />
                          </div>
                          
                          {/* Flying envelope */}
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-12 bg-gradient-to-b from-sky-400 to-sky-500 rounded-lg shadow-lg animate-bounce">
                            <div className="absolute top-1 left-1 right-1 h-10 bg-gradient-to-b from-white to-gray-100 rounded-t-sm" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-sky-600 rounded-b-sm" />
                          </div>
                          
                          {/* Check mark */}
                          <div className="absolute -top-8 right-8 w-12 h-12 bg-gradient-to-b from-green-400 to-green-500 rounded-full shadow-lg flex items-center justify-center">
                            <CheckCircleIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        
                        {/* Floating elements */}
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400/20 rounded-full animate-bounce" />
                        <div className="absolute top-1/2 -left-6 w-6 h-6 bg-sky-400/20 rounded-full animate-pulse" />
                        <div className="absolute -bottom-4 right-2 w-4 h-4 bg-cyan-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Reset Link Sent!
                        </h3>
                        <p className="text-gray-600 text-sm max-w-xs mx-auto">
                          We've sent password reset instructions to your email
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative cards */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 transform rotate-12" />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 transform -rotate-12" />
                </div>
              </div>
            </div>

            {/* Right Side - Glassmorphism Card */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Glass Card */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 space-y-6">
                  
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-b from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircleIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        Check Your Email
                      </h1>
                      <p className="text-gray-600 text-sm">
                        We've sent a password reset link to
                      </p>
                      <p className="text-blue-600 font-medium">
                        {email}
                      </p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                    <h3 className="font-medium text-gray-800 mb-2">What's next?</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>Check your email inbox</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>Click the reset link in the email</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
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
                      className="w-full h-11 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl font-medium hover:bg-white/70 transition-all duration-200 text-gray-700"
                    >
                      Send to different email
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-4">
                    <p className="text-xs text-gray-500">
                      Didn't receive the email? Check your spam folder or try a different email address.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - 3D Illustration */}
          <div className="hidden lg:flex flex-col items-center justify-center p-8">
            <div className="relative">
              {/* 3D Scene Container */}
              <div className="relative w-full max-w-md">
                {/* Main illustration placeholder */}
                <div className="aspect-square bg-white/40 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 flex items-center justify-center">
                  <div className="text-center space-y-6">
                    {/* 3D Password Reset Illustration */}
                    <div className="relative">
                      <div className="w-48 h-48 mx-auto relative">
                        {/* Lock */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-lg shadow-xl">
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-sm" />
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-600 rounded-full" />
                        </div>
                        
                        {/* Key */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-lg shadow-lg transform rotate-12 animate-pulse" />
                        
                        {/* Mail */}
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-14 h-10 bg-gradient-to-b from-sky-400 to-sky-500 rounded-lg shadow-lg">
                          <div className="absolute top-1 left-1 right-1 h-8 bg-gradient-to-b from-white to-gray-100 rounded-t-sm" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-sky-600 rounded-b-sm" />
                        </div>
                      </div>
                      
                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400/20 rounded-full animate-bounce" />
                      <div className="absolute top-1/2 -left-6 w-6 h-6 bg-sky-400/20 rounded-full animate-pulse" />
                      <div className="absolute -bottom-4 right-2 w-4 h-4 bg-cyan-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Forgot Password?
                      </h3>
                      <p className="text-gray-600 text-sm max-w-xs mx-auto">
                        No worries! We'll send you reset instructions
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative cards */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 transform rotate-12" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 transform -rotate-12" />
              </div>
            </div>
          </div>

          {/* Right Side - Glassmorphism Card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Glass Card */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Forgot Password
                    </h1>
                    <p className="text-gray-600 text-sm">
                      No worries! Enter your email and we'll send you a reset link
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        className="pl-10 h-11 bg-white/50 border-gray-200 rounded-xl"
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
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending reset link...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Send Reset Link
                        <EnvelopeIcon className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium underline flex items-center gap-2 mx-auto"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Login
                  </button>
                </div>

                {/* Footer Links */}
                <div className="text-center space-y-4 pt-4">
                  <div className="text-xs text-gray-500">
                    By continuing, you agree to our{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 underline">
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

export default ForgotPassword3DLayout;
