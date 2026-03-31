'use client';

import { useState, useEffect } from 'react';
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
import { getApiUrl, API_CONFIG } from '../../../config/api.config';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useTheme();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Reset link sent successfully. Please check your email.' });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Email not found or failed to send link.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animate-mesh flex items-center justify-center p-4 sm:p-6 overflow-hidden relative font-sans selection:bg-primary-100 selection:text-primary-900">
      
      {/* Floating background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 rounded-full blur-[100px] animate-float delay-neg-5s pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-indigo-400/10 rounded-full blur-[80px] animate-float delay-neg-2s pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 glass-card rounded-[2rem] overflow-hidden shadow-2xl relative z-10"
      >
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-600/10 to-primary-900/5 relative overflow-hidden border-r border-white/20 dark:border-white/5">
          <div className="relative z-20">
             <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onClick={() => navigate('/login')}
              className="flex items-center gap-3 mb-12 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                <span className="text-white text-2xl font-black">A</span>
              </div>
              <span className="text-xl font-bold text-secondary-900 dark:text-white tracking-tight">ASA Portal</span>
            </motion.div>
            
            <div className="space-y-6 mt-20">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-5xl font-black text-secondary-900 dark:text-white leading-[1.1] tracking-tight"
              >
                Recover Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
                  Account
                </span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg text-secondary-600 dark:text-secondary-400 max-w-md font-medium leading-relaxed"
              >
                Enter your registered email to receive recovery instructions. We'll help you get back to your dashboard in no time.
              </motion.p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-4 relative z-20"
          >
             <div className="w-10 h-10 rounded-full border-2 border-white dark:border-secondary-800 bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-primary-500" />
             </div>
             <div>
               <p className="text-sm font-bold text-secondary-900 dark:text-white">Secure Recovery</p>
               <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400 font-sans">We'll never share your email with anyone.</p>
             </div>
          </motion.div>

          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-30 select-none">
             <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]" />
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px]" />
          </div>
        </div>

        {/* Right Side: Recovery Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:hidden flex justify-center mb-8"
            >
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl mb-4">
                <span className="text-white text-3xl font-black">A</span>
              </div>
            </motion.div>

            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-secondary-900 dark:text-white mb-2 tracking-tight"
            >
              Forgot Password
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-secondary-500 dark:text-secondary-400 font-medium"
            >
              No worries! Enter your email to reset your account.
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300 ml-1">Registered Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-white/50 dark:bg-black/20 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-white font-medium"
                />
              </div>
            </motion.div>

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
                  } px-4 py-3 rounded-xl text-sm font-bold border flex items-center gap-3`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${status.type === 'success' ? 'bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-danger-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 relative overflow-hidden group rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 transition-all group-hover:scale-105" />
                <div className="relative flex items-center justify-center gap-2 text-white font-black text-lg">
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center pt-4"
            >
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors group"
              >
                <ArrowLeftIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>

      {/* Theme Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={toggleTheme}
        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 text-secondary-900 dark:text-white transition-all shadow-lg z-50"
        aria-label="Toggle Theme"
      >
        {themeMode === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
      </motion.button>

      <div className="absolute bottom-8 text-[10px] uppercase tracking-[0.2em] font-black text-secondary-400/50 dark:text-white/20 select-none">
        Secure Account Recovery • Powered by ASA Insights
      </div>
    </div>
  );
}

