import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';
import {
  LockClosedIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const EmployeeRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Page States
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    dob: '',
    joiningDate: '',
    gender: '',
    maritalStatus: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Real-time password validation
  const passwordRules = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'Upper & lowercase letters', regex: /^(?=.*[a-z])(?=.*[A-Z]).*$/ },
    { label: 'Numbers & special characters', regex: /^(?=.*[0-9])(?=.*[!@#$%^&*]).*$/ },
  ];

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setIsValidating(false);
      setTokenValid(false);
      setErrorReason('missing');
      return;
    }

    try {
      const response = await API.get(`/auth/validate-registration-token?token=${token}`);
      if (response.data.valid) {
        setTokenValid(true);
        setEmail(response.data.email);
        setFullName(`${response.data.firstName} ${response.data.lastName}`);
      } else {
        setTokenValid(false);
        setErrorReason(response.data.reason);
      }
    } catch (err: any) {
      setTokenValid(false);
      setErrorReason(err.response?.data?.reason || 'invalid');
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.dob) errors.dob = 'Date of birth is required';
    if (!formData.joiningDate) errors.joiningDate = 'Joining date is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.maritalStatus) errors.maritalStatus = 'Marital status is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await API.post('/auth/complete-registration', {
        token,
        ...formData
      });
      setIsSuccess(true);
    } catch (err: any) {
      setFormErrors({ global: err.response?.data?.message || 'Failed to complete registration. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium animate-pulse">Validating your registration link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid || errorReason) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-transform hover:rotate-12">
                <ExclamationTriangleIcon className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h2>
              <p className="text-gray-600 mb-8">
                {errorReason === 'expired' 
                  ? 'This registration link has expired for your security. Links are valid for 24 hours.' 
                  : errorReason === 'used'
                  ? 'This registration link has already been used to activate an account.'
                  : 'We couldn\'t verify this registration link. It may be missing or tampered with.'}
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/forgot-password')} // Or a specific request link page
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Request New Link
                </button>
                <Link 
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 text-gray-600 font-semibold py-3 hover:text-blue-600 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 text-slate-900">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100"
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckBadgeIcon className="w-16 h-16" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Registration Successful!</h2>
          <p className="text-slate-600 mb-10 leading-relaxed">
            Welcome to the team, <b>{fullName}</b>! Your account has been activated successfully and is pending administrative approval.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-[1.02]"
          >
            Go to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden text-slate-900">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/10 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -45, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-400/10 blur-[100px] rounded-full" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white overflow-hidden">
          <div className="p-8 sm:p-12">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6 group cursor-pointer transition-transform hover:rotate-12 duration-300">
                <span className="text-white text-3xl font-black italic tracking-tighter">A</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Complete Your Registration</h1>
              <p className="text-slate-500 mt-2 font-medium">Activate your account to join the <b>ASA Timesheet Portal</b></p>
              
              <div className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100">
                <InformationCircleIcon className="w-4 h-4" />
                Welcome, {fullName}
              </div>
            </div>

            {formErrors.global && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700"
              >
                <XCircleIcon className="w-6 h-6 shrink-0" />
                <p className="text-sm font-medium">{formErrors.global}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Account Security Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <LockClosedIcon className="w-5 h-5 font-bold" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Account Security</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Create Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <LockClosedIcon className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoFocus
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-slate-900 font-medium focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <LockClosedIcon className="w-5 h-5" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-slate-900 font-medium focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicators */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {passwordRules.map((rule, idx) => {
                    const isValid = rule.regex.test(formData.password);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        {isValid ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 text-slate-300" />
                        )}
                        <span className={`text-xs font-semibold ${isValid ? 'text-green-600' : 'text-slate-500'}`}>
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Personal Information Section */}
              <div>
                <div className="flex items-center gap-3 mb-6 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-5 h-5 font-bold" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Date of Birth</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <input
                        type="date"
                        name="dob"
                        title="Date of Birth"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-medium focus:ring-4 focus:ring-blue-600/10 transition-all cursor-pointer"
                      />
                    </div>
                    {formErrors.dob && <p className="text-xs text-red-600 font-bold ml-1">{formErrors.dob}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Date of Joining</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <input
                        type="date"
                        name="joiningDate"
                        title="Date of Joining"
                        value={formData.joiningDate}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-medium focus:ring-4 focus:ring-blue-600/10 transition-all cursor-pointer"
                      />
                    </div>
                    {formErrors.joiningDate && <p className="text-xs text-red-600 font-bold ml-1">{formErrors.joiningDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Gender</label>
                    <div className="relative group">
                      <select
                        name="gender"
                        title="Select Gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 font-medium focus:ring-4 focus:ring-blue-600/10 transition-all cursor-pointer appearance-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                        <ArrowRightIcon className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                    {formErrors.gender && <p className="text-xs text-red-600 font-bold ml-1">{formErrors.gender}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Marital Status</label>
                    <div className="relative group">
                      <select
                        name="maritalStatus"
                        title="Select Marital Status"
                        value={formData.maritalStatus}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 font-medium focus:ring-4 focus:ring-blue-600/10 transition-all cursor-pointer appearance-none"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                        <ArrowRightIcon className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                    {formErrors.maritalStatus && <p className="text-xs text-red-600 font-bold ml-1">{formErrors.maritalStatus}</p>}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg py-5 rounded-[1.5rem] shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <div className="mt-6 flex justify-center">
                  <Link to="/login" className="text-slate-500 font-bold hover:text-blue-600 transition-colors flex items-center gap-2">
                    <ChevronLeftIcon className="w-4 h-4" />
                    Cancel and return to Sign In
                  </Link>
                </div>
              </div>
            </form>
          </div>
          
          <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-center gap-6">
            <div className="flex items-center gap-2 opacity-60">
              <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Secure Portal</span>
            </div>
            <div className="flex items-center gap-2 opacity-60">
              <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">ASA Official</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeRegistration;
