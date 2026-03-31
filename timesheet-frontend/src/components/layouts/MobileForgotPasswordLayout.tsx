import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';

const MobileForgotPasswordLayout: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { success: false, message: 'Invalid response' };
      }

      if (response.ok && data.success) {
        setStatus({ type: 'success', message: 'Reset link sent successfully. Please check your email.' });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.message || 'Email not found or failed to send link.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen animate-mesh flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-primary-100 selection:text-primary-900">
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-400/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-indigo-400/20 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
           <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl mb-2">
              <span className="text-white text-3xl font-black">A</span>
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white tracking-tight">ASA Portal</h2>
          </motion.div>
        </div>

        <div className="glass-card rounded-[2rem] p-8 shadow-2xl border border-white/20 dark:border-white/5 relative overflow-hidden">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-secondary-900 dark:text-white mb-2 underline decoration-primary-500/30 decoration-4 underline-offset-4">Forgot Password</h3>
            <p className="text-secondary-500 dark:text-secondary-400 text-sm font-medium">Enter your registered email below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-white/50 dark:bg-black/20 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-white font-medium text-sm transition-all"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`${
                    status.type === 'success' 
                      ? 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 border-success-100 dark:border-success-900/30' 
                      : 'bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 border-danger-100 dark:border-danger-900/30'
                  } px-4 py-3 rounded-xl text-xs font-bold border flex items-center gap-3`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${status.type === 'success' ? 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-danger-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 relative overflow-hidden group rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600" />
              <div className="relative flex items-center justify-center gap-2 text-white font-black text-base">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </div>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2 mx-auto"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Theme Toggle - Mobile */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-secondary-900 dark:text-white z-50 shadow-lg"
      >
        {themeMode === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
      </button>

      <div className="absolute bottom-6 text-[10px] uppercase tracking-widest font-bold text-secondary-400/50 dark:text-white/20 text-center">
        Secure Recovery • ASA Insights
      </div>
    </div>
  );
};

export default MobileForgotPasswordLayout;
