import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import API from '../api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await API.post('/auth/forgot-password', { email });

      if (response.status === 200) {
        setSuccess('Password reset link has been sent to your email address.');
        setEmail('');
      } else {
        setError(response.data?.message || 'Failed to send reset link. Please try again.');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-6 sm:p-10 animate-fade-in relative overflow-hidden">
      {/* Soft decorative background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary-600/[0.04] rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary-600/[0.02] rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 flex flex-col gap-8">
        {/* Back to Login */}
        <div className="flex items-center">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-secondary-600 hover:text-primary-600 font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Sign In
          </button>
        </div>

        {/* Branding Area */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <span className="text-white text-3xl font-extrabold">A</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Reset Your Password</h1>
            <p className="text-secondary-500 font-medium">
              Enter your registered email address and we will send you a password reset link.
            </p>
          </div>
        </div>

        {/* Forgot Password Card */}
        <Card className="p-8 md:p-12 shadow-3xl bg-white/95 backdrop-blur-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@ashishshah.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<EnvelopeIcon />}
            />

            {error && (
              <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg text-sm font-bold border border-danger-100 flex items-center gap-3 animate-in shake-in duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-danger-500 shadow-sm" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-success-50 text-success-600 px-4 py-3 rounded-lg text-sm font-bold border border-success-100 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 shadow-sm" />
                {success}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-14 px-8 font-extrabold shadow-md"
                rightIcon={<PaperAirplaneIcon className="w-5 h-5 ml-2" />}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        </Card>

        {/* Additional Help */}
        <div className="text-center">
          <p className="text-sm font-medium text-secondary-500">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary-600 hover:text-primary-700 font-extrabold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
