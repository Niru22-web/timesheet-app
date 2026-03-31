import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  UserIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../config/appConfig';
import Button from '../components/ui/Button';


const SimpleLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { login } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const navigate = useNavigate();


  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const userRole = user.role?.toLowerCase();
          
          if (userRole === 'admin') navigate('/admin');
          else if (userRole === 'partner') navigate('/partner');
          else if (userRole === 'manager') navigate('/manager');
          else if (userRole === 'user' || userRole === 'employee') navigate('/employee');
          else navigate('/');
        } else {
          navigate('/');
        }
      } else {
        setError('Incorrect email or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
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
        {/* Left Side: Branding & Welcome */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-600/10 to-primary-900/5 relative overflow-hidden border-r border-white/20 dark:border-white/5">
          <div className="relative z-20">
             <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-3 mb-12"
            >
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
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
                Welcome to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
                  ASA Timesheet Portal
                </span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg text-secondary-600 dark:text-secondary-400 max-w-md font-medium leading-relaxed"
              >
                Streamline your workflow with ASA's premium timesheet management system. Designed for efficiency, built for you.
              </motion.p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-6 relative z-20"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-secondary-800 bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center">
                   <UserIcon className="w-5 h-5 text-secondary-500" />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-secondary-500 dark:text-secondary-400">
              Joined by 500+ employees
            </p>
          </motion.div>

          {/* Decorative Background Elements for Left Side */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-30 select-none">
             <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]" />
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px]" />
          </div>
        </div>

        {/* Right Side: Login Form */}
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
              Sign In
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-secondary-500 dark:text-secondary-400 font-medium"
            >
              Enter your credentials to access your portal.
            </motion.p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300 ml-1">Email or Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ashishshah.com"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-white/50 dark:bg-black/20 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-white font-medium"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-4 bg-white/50 dark:bg-black/20 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-400 text-secondary-900 dark:text-white font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center space-x-3 px-1"
            >
              <div 
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                  rememberMe 
                    ? 'bg-primary-600 border-primary-600 shadow-sm' 
                    : 'bg-white/50 dark:bg-black/20 border-secondary-300 dark:border-secondary-600'
                }`}
              >
                {rememberMe && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3px]" />}
              </div>
              <span 
                onClick={() => setRememberMe(!rememberMe)}
                className="text-sm font-semibold text-secondary-600 dark:text-secondary-400 cursor-pointer select-none"
              >
                Remember me for 30 days
              </span>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-xl text-sm font-bold border border-danger-100 dark:border-danger-900/30 flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-danger-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="pt-2"
            >
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
                      Sign In to Portal
                      <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center text-sm font-bold text-secondary-500 dark:text-secondary-500 pt-4"
            >
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => window.location.href = "mailto:info@ashishshah.com?subject=Access%20Request%20-%20ASA%20Timesheet%20Portal&body=Hello%20HR,%0D%0A%0D%0AI%20would%20like%20to%20request%20an%20account%20for%20the%20ASA%20Timesheet%20Portal.%0D%0A%0D%0AMy%20details:%0D%0AName:%20%0D%0AEmployee%20ID:%20"}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 underline underline-offset-4"
              >
                Contact HR
              </button>
            </motion.p>
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

      {/* Modern Light/Dark Mode Hint (Implicitly supported by system theme) */}

      <div className="absolute bottom-8 text-[10px] uppercase tracking-[0.2em] font-black text-secondary-400/50 dark:text-white/20 select-none">
        Secure Access • Powered by ASA Insights
      </div>
    </div>
  );
};

export default SimpleLogin;
