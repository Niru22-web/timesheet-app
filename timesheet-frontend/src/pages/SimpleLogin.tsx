import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONFIG } from '../config/appConfig';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SimpleLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        // Get user role from localStorage and redirect accordingly
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const userRole = user.role?.toLowerCase();
          
          // Role-based redirection
          if (userRole === 'admin') {
            navigate('/admin');
          } else if (userRole === 'partner') {
            navigate('/partner');
          } else if (userRole === 'manager') {
            navigate('/manager');
          } else if (userRole === 'user' || userRole === 'employee') {
            navigate('/employee');
          } else {
            // Fallback to dashboard
            navigate('/');
          }
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
    <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-6 sm:p-10 animate-fade-in relative overflow-hidden">
      {/* Soft decorative background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary-600/[0.04] rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary-600/[0.02] rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 flex flex-col gap-8">
        {/* Branding Area */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <span className="text-white text-3xl font-extrabold">A</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">{APP_CONFIG.COMPANY_NAME}</h1>
            <p className="text-secondary-500 font-medium tracking-wide italic">Employee Management Portal</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-8 md:p-12 shadow-3xl bg-white/95 backdrop-blur-3xl">
          <div className="mb-8 border-b border-secondary-100 pb-6">
            <h2 className="text-2xl font-bold text-secondary-900">Sign In</h2>
            <p className="text-secondary-500 font-medium mt-1">Please enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@ashishshah.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<EnvelopeIcon />}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<LockClosedIcon />}
              />
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest px-2 py-1 mt-1"
                >
                  {showPassword ? "Hide" : "Show"} Password
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest px-2 py-1 mt-1"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg text-sm font-bold border border-danger-100 flex items-center gap-3 animate-in shake-in duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-danger-500 shadow-sm" />
                {error}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-14 px-8 font-extrabold shadow-md"
                rightIcon={<ArrowRightIcon className="w-5 h-5 ml-2" />}
              >
                Sign In to Portal
              </Button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-secondary-100 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3 group cursor-help">
              <ShieldCheckIcon className="w-5 h-5 text-secondary-400 group-hover:text-primary-500 transition-colors" />
              <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Secure Entry</span>
            </div>
            <div className="flex items-center gap-3">
              <GlobeAltIcon className="w-5 h-5 text-secondary-400" />
              <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Network Stable</span>
            </div>
          </div>
        </Card>

        {/* Support Link Area */}
        <div className="text-center">
          <p className="text-sm font-medium text-secondary-500">
            Need help accessing your account?{' '}
            <button className="text-primary-600 hover:text-primary-700 font-extrabold hover:underline">Contact Support</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
