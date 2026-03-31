import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LockClosedIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import API from '../api';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { themeMode, toggleTheme } = useTheme();

  // Password validation state
  const passwordRules = {
    length: newPassword.length >= 8,
    hasUpperLower: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    hasNumberSpecial: /[0-9]/.test(newPassword) || /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  useEffect(() => {
    if (!token) {
      setStatus({ type: 'error', message: 'Invalid or missing reset token.' });
      setTokenValid(false);
    } else {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await API.get(`/auth/validate-reset-token?token=${token}`);
      if (response.status === 200) {
        setTokenValid(true);
      } else {
        setStatus({ type: 'error', message: 'This reset link has expired or is invalid.' });
        setTokenValid(false);
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to validate reset link.' });
      setTokenValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordRules.length || !passwordRules.hasUpperLower || !passwordRules.hasNumberSpecial) {
      setStatus({ type: 'error', message: 'Please fulfill all password requirements.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await API.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (response.status === 200) {
        setStatus({ type: 'success', message: 'Your password has been updated successfully.' });
      } else {
        setStatus({ type: 'error', message: response.data?.message || 'Failed to update password.' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'An error occurred during password reset.' });
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
    <div className="flex items-center gap-2 text-xs font-bold transition-all duration-300">
      <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${met ? 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400' : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-400'}`}>
        {met ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
      </div>
      <span className={met ? 'text-success-700 dark:text-success-400' : 'text-secondary-500 dark:text-secondary-400'}>{label}</span>
    </div>
  );

  if (tokenValid === null) {
    return (
      <div className="min-h-screen animate-mesh flex items-center justify-center bg-white dark:bg-secondary-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-secondary-600 dark:text-secondary-400 font-bold">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-mesh flex items-center justify-center p-4 sm:p-6 overflow-hidden relative font-sans selection:bg-primary-100 selection:text-primary-900">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px] animate-float delay-neg-5s pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Back Link */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/login')}
          className="absolute -top-12 left-0 flex items-center gap-2 text-sm font-bold text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          Back to Sign In
        </motion.button>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/20 dark:border-white/5 relative overflow-hidden">
          
          <div className="text-center mb-10">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl mb-6 transform rotate-3"
            >
              <span className="text-white text-3xl font-black">A</span>
            </motion.div>
            
            <h1 className="text-3xl font-black text-secondary-900 dark:text-white mb-2 tracking-tight">
              {status.type === 'success' ? 'Password Updated!' : 'Set New Password'}
            </h1>
            <p className="text-secondary-500 dark:text-secondary-400 font-medium">
              {status.type === 'success' 
                ? 'Your password has been updated successfully.' 
                : 'Choose a strong password for your account'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status.type === 'success' ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-success-50 dark:bg-success-900/10 border border-success-100 dark:border-success-900/30 rounded-[1.5rem] p-6 text-center">
                   <div className="w-14 h-14 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-success-500/20">
                      <CheckCircleIcon className="w-8 h-8 text-white" />
                   </div>
                   <p className="text-success-800 dark:text-success-300 font-bold mb-1">Success!</p>
                   <p className="text-success-600 dark:text-success-400 text-sm">You can now sign in with your new password.</p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full h-14 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Go to Login
                </button>
              </motion.div>
            ) : tokenValid === false ? (
              <motion.div 
                key="token-error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-danger-50 dark:bg-danger-900/10 border border-danger-100 dark:border-danger-900/30 rounded-[1.5rem] p-6 text-center">
                   <div className="w-14 h-14 bg-danger-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-danger-500/20">
                      <ExclamationTriangleIcon className="w-8 h-8 text-white" />
                   </div>
                   <p className="text-danger-800 dark:text-danger-300 font-bold mb-1">Reset Link Expired</p>
                   <p className="text-danger-600 dark:text-danger-400 text-sm">{status.message}</p>
                </div>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full h-14 bg-secondary-900 dark:bg-white dark:text-secondary-900 text-white rounded-2xl font-black text-lg shadow-xl transition-all hover:scale-[1.02]"
                >
                  Request New Reset Link
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="space-y-6">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300 ml-1">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-11 pr-12 py-4 bg-white/50 dark:bg-black/20 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-white font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary-400 hover:text-primary-500 transition-colors"
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300 ml-1">Confirm New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ShieldCheckIcon className="h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-11 pr-4 py-4 bg-white/50 dark:bg-black/20 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Rules */}
                <div className="bg-secondary-50/50 dark:bg-white/5 rounded-2xl p-5 space-y-3">
                  <p className="text-[10px] uppercase tracking-wider font-black text-secondary-400 dark:text-secondary-500 mb-2">Password Requirements</p>
                  <ValidationItem label="Minimum 8 characters" met={passwordRules.length} />
                  <ValidationItem label="Uppercase & Lowercase letters" met={passwordRules.hasUpperLower} />
                  <ValidationItem label="Numbers or Special characters" met={passwordRules.hasNumberSpecial} />
                </div>

                {status.message && status.type === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 border border-danger-100 dark:border-danger-900/30 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-danger-500" />
                    {status.message}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 relative overflow-hidden group rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 transition-all group-hover:scale-105" />
                  <div className="relative flex items-center justify-center gap-2 text-white font-black text-lg">
                    {isLoading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Update Password
                        <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 text-secondary-900 dark:text-white transition-all shadow-lg z-50"
      >
        {themeMode === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
      </button>

      <div className="absolute bottom-8 text-[10px] uppercase tracking-[0.2em] font-black text-secondary-400/50 dark:text-white/20 select-none">
        Secure Password Reset • ASA Timesheet Portal
      </div>
    </div>
  );
};

export default ResetPassword;
