import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToastHelpers } from '../ui/Toast';
import { APP_CONFIG } from '../../config/appConfig';

// UI Components
import Button from '../ui/Button';
import Input from '../ui/Input';
import Logo from '../ui/Logo';

const ModernLoginLayout: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToastHelpers();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login successful!', 'Welcome back to the portal');
        
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
        toast.error('Login failed', 'Please check your credentials and try again');
      }
    } catch (err) {
      toast.error('Connection error', 'Unable to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Side - Login Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col gap-6">
              {/* Logo and Header */}
              <div className="flex flex-col items-center gap-4 text-center">
                <Logo variant="image" size="lg" className="max-w-[200px]" />
                <div className="flex flex-col items-center gap-1">
                  <h1 className="text-2xl font-bold">Login to your account</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your email below to login to your account
                  </p>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  {/* Email Field */}
                  <div className="grid gap-2">
                    <label 
                      htmlFor="email" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      required
                      className="h-9"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <label 
                        htmlFor="password" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        className="h-9 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="h-9"
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Login'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/login-image.jpg"
          alt="Timesheet Management"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </div>
  );
};

export default ModernLoginLayout;
