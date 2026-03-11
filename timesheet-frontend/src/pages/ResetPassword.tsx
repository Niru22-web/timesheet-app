import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LockClosedIcon,
  ArrowLeftIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import API from '../api';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setTokenValid(false);
    } else {
      // Validate token
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await API.get(`/auth/validate-reset-token?token=${token}`);
      
      if (response.status === 200) {
        setTokenValid(true);
      } else {
        setError(response.data?.message || 'Invalid or expired reset link.');
        setTokenValid(false);
      }
    } catch (err: any) {
      console.error('Validate token error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to validate reset link. Please try again.');
      }
      setTokenValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await API.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (response.status === 200) {
        setSuccess('Password has been successfully reset. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data?.message || 'Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-6">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-danger-600" />
          </div>
          <h2 className="text-xl font-bold text-secondary-900 mb-2">Invalid Reset Link</h2>
          <p className="text-secondary-600 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/forgot-password')}
            variant="primary"
            fullWidth
          >
            Request New Reset Link
          </Button>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Set New Password</h1>
            <p className="text-secondary-500 font-medium">
              Choose a strong password for your account
            </p>
          </div>
        </div>

        {/* Reset Password Card */}
        <Card className="p-8 md:p-12 shadow-3xl bg-white/95 backdrop-blur-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              leftIcon={<LockClosedIcon />}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              leftIcon={<LockClosedIcon />}
            />

            <div className="text-xs text-secondary-500 space-y-1">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 8 characters long</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Include numbers and special characters</li>
              </ul>
            </div>

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
              >
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
