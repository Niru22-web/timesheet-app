import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { APP_CONFIG } from '../../config/appConfig';

// UI Components
import Button from '../ui/Button';
import Input from '../ui/Input';
import Logo from '../ui/Logo';
import TimesheetPhoto from '../ui/TimesheetPhoto';

const SplitAuthLayout: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful! Welcome back to the portal');
        
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
        toast.error('Login failed: Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please check your connection.');
      toast.error('Connection error: Unable to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: "Time Tracking",
      description: "Efficiently track and manage employee work hours"
    },
    {
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      title: "Project Management",
      description: "Organize and monitor projects across teams"
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: "Secure Access",
      description: "Enterprise-grade security for your data"
    },
    {
      icon: <CheckCircleIcon className="h-6 w-6" />,
      title: "Easy Reporting",
      description: "Generate comprehensive reports with one click"
    }
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="text-center space-y-6 mb-6">
            <Logo size="lg" className="mx-auto" />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Employee Management Portal
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Streamline your workforce management
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                leftIcon={<EnvelopeIcon />}
                variant="outlined"
                size="lg"
              />

              <div className="space-y-2">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  leftIcon={<LockClosedIcon />}
                  rightIcon={showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                  variant="outlined"
                  size="lg"
                />
              </div>

              {error && (
                <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 px-4 py-3 rounded-lg text-sm font-medium border border-danger-200 dark:border-danger-800">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                size="lg"
                className="h-12 font-semibold"
                rightIcon={<ArrowRightIcon className="h-5 w-5" />}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                  Contact your administrator
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Branding and Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-lg space-y-12">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Streamline Your Workforce Management
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Experience the power of modern employee management with our comprehensive platform designed for efficiency and growth.
              </p>
            </div>

            {/* Timesheet Photo */}
            <div className="flex justify-center">
              <TimesheetPhoto size="lg" showCaption={false} useActualImage={true} />
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-white/80 text-sm">Companies</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-white/80 text-sm">Employees</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-white/80 text-sm">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitAuthLayout;
