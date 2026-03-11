import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ChevronLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const UserRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email address';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrors({ global: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-6 sm:p-10 animate-fade-in relative overflow-hidden">
      {/* Soft decorative background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary-600/[0.04] rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary-600/[0.02] rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 flex flex-col gap-8">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-secondary-500 hover:text-primary-600 transition-colors font-bold text-sm uppercase tracking-widest pl-2 group w-fit"
        >
          <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        {/* Card */}
        <Card className="p-8 md:p-12 shadow-3xl bg-white/95 backdrop-blur-3xl">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-md mb-6 transition-transform hover:rotate-6">
              <span className="text-white text-3xl font-extrabold">+</span>
            </div>
            <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Create New Account</h1>
            <p className="text-secondary-500 font-medium mt-2">Join ashish shah & associate to manage your workspace efficiently.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="firstName"
                label="First Name"
                placeholder="Rahul"
                value={formData.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                leftIcon={<UserIcon />}
              />
              <Input
                name="lastName"
                label="Last Name"
                placeholder="Varma"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                leftIcon={<UserIcon />}
              />
            </div>

            <Input
              name="email"
              label="Email Address"
              type="email"
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              leftIcon={<EnvelopeIcon />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                leftIcon={<LockClosedIcon />}
              />
              <Input
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                leftIcon={<ShieldCheckIcon />}
              />
            </div>

            {errors.global && (
              <div className="bg-danger-50 text-danger-600 px-4 py-3 rounded-lg text-sm font-bold border border-danger-100 flex items-center gap-3 animate-in shake-in duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-danger-500 shadow-sm" />
                {errors.global}
              </div>
            )}

            <div className="pt-4 flex flex-col gap-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-14 px-8 font-extrabold shadow-md"
                rightIcon={<ArrowRightIcon className="w-5 h-5 ml-2" />}
              >
                Complete Registration
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-secondary-100 flex items-center justify-between opacity-50">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-secondary-400" />
              <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Self Provisioning</span>
            </div>
            <div className="flex items-center gap-3">
              <GlobeAltIcon className="w-5 h-5 text-secondary-400" />
              <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest">Portal Access Only</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserRegistration;
