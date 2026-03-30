import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  CheckBadgeIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  IdentificationIcon,
  AcademicCapIcon,
  HeartIcon,
  ArrowsRightLeftIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const EmployeeRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || ''; // Fallback for backward compatibility

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(!!tokenParam || !!emailParam);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [employeeInfo, setEmployeeInfo] = useState<any>(null);
  const [registrationToken, setRegistrationToken] = useState<string>(tokenParam);

  const [formData, setFormData] = useState({
    email: emailParam,
    password: '',
    confirmPassword: '',
    dob: '',
    doj: new Date().toISOString().split('T')[0], // Default to today
    education: '',
    institutionName: '',
    yearOfCompletion: '',
    maritalStatus: '',
    gender: '',
    permanentAddress: '',
    currentAddress: '',
    currentPinCode: '',
    guardianName: '',
    guardianAddress: '',
    guardianNumber: '',
    personalEmail: '',
    personalMobile: '',
    pan: '',
    aadhaar: '',
    // Bank Details
    bankName: '',
    accountHolderName: '',
    bankAccountNumber: '',
    ifscCode: '',
    branchName: '',
  });

  const [files, setFiles] = useState<{
    panFile: File | null;
    aadhaarFile: File | null;
    employeePhoto: File | null;
    bankStatementFile: File | null;
  }>({
    panFile: null,
    aadhaarFile: null,
    employeePhoto: null,
    bankStatementFile: null,
  });

  useEffect(() => {
    if (tokenParam) {
      fetchEmployeeInfoByToken();
    } else if (emailParam) {
      fetchEmployeeInfoByEmail();
    }
  }, [tokenParam, emailParam]);

  const fetchEmployeeInfoByToken = async () => {
    try {
      setIsFetchingInfo(true);
      const response = await API.get(`/registration/validate?token=${tokenParam}`);
      setEmployeeInfo(response.data.employee);
      setFormData(prev => ({ 
        ...prev, 
        email: response.data.employee.officeEmail 
      }));
      setRegistrationToken(tokenParam);
    } catch (err: any) {
      console.error('Failed to validate registration token:', err);
      setErrors({ global: err.response?.data?.error || 'Registration link invalid or expired.' });
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const fetchEmployeeInfoByEmail = async () => {
    try {
      setIsFetchingInfo(true);
      const response = await API.get(`/employees/by-email?email=${emailParam}`);
      setEmployeeInfo(response.data);
      setFormData(prev => ({ ...prev, email: response.data.officeEmail }));
    } catch (err: any) {
      console.error('Failed to fetch employee info:', err);
      setErrors({ global: err.response?.data?.error || 'Registration link invalid or expired.' });
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Password validation
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Personal details validation
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.doj) newErrors.doj = 'Date of joining is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Education validation
    if (!formData.education) newErrors.education = 'Education qualification is required';
    if (!formData.institutionName) newErrors.institutionName = 'Institution name is required';
    if (!formData.yearOfCompletion) newErrors.yearOfCompletion = 'Year of completion is required';

    // Address validation
    if (!formData.permanentAddress) newErrors.permanentAddress = 'Permanent address is required';
    if (!formData.currentAddress) newErrors.currentAddress = 'Current address is required';
    
    // PIN code validation (optional but validated if provided)
    if (formData.currentPinCode && !/^\d{6}$/.test(formData.currentPinCode)) {
      newErrors.currentPinCode = 'PIN code must be 6 digits';
    }

    // Contact validation (optional fields but validated if provided)
    if (formData.personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)) {
      newErrors.personalEmail = 'Invalid email format';
    }
    
    if (formData.personalMobile && !/^[6-9]\d{9}$/.test(formData.personalMobile.replace(/\s/g, ''))) {
      newErrors.personalMobile = 'Invalid mobile number format';
    }

    // ID validation
    if (!formData.pan) newErrors.pan = 'PAN number is required';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) newErrors.pan = 'Invalid PAN format (e.g., ABCDE1234F)';
    
    if (!formData.aadhaar) newErrors.aadhaar = 'Aadhaar number is required';
    else if (!/^\d{4}\s\d{4}\s\d{4}$/.test(formData.aadhaar) && !/^\d{12}$/.test(formData.aadhaar)) newErrors.aadhaar = 'Invalid Aadhaar format (e.g., 1234 5678 9012)';

    // Guardian validation (optional fields but validated if provided)
    if (formData.guardianName && !formData.guardianName.trim()) {
      newErrors.guardianName = 'Guardian name cannot be empty';
    }
    
    if (formData.guardianNumber && !/^[6-9]\d{9}$/.test(formData.guardianNumber.replace(/\s/g, ''))) {
      newErrors.guardianNumber = 'Invalid mobile number format';
    }
    
    if (formData.guardianAddress && !formData.guardianAddress.trim()) {
      newErrors.guardianAddress = 'Guardian address cannot be empty';
    }

    // Document validation
    if (!files.panFile) newErrors.panFile = 'Please attach PAN card copy';
    if (!files.aadhaarFile) newErrors.aadhaarFile = 'Please attach Aadhaar card copy';
    if (!files.employeePhoto) newErrors.employeePhoto = 'Please attach employee photo';

    // Bank details validation (optional but validated if provided)
    if (formData.bankName && !formData.bankName.trim()) {
      newErrors.bankName = 'Bank name cannot be empty';
    }
    
    if (formData.accountHolderName && !formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name cannot be empty';
    }
    
    if (formData.bankAccountNumber && !/^\d{9,18}$/.test(formData.bankAccountNumber)) {
      newErrors.bankAccountNumber = 'Account number must be numeric (9-18 digits)';
    }
    
    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Invalid IFSC code format (e.g., SBIN0001234)';
    }
    
    if (formData.branchName && !formData.branchName.trim()) {
      newErrors.branchName = 'Branch name cannot be empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      
      // Enhanced file validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = {
        panFile: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        aadhaarFile: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        employeePhoto: ['image/jpeg', 'image/jpg', 'image/png'],
        bankStatementFile: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      };
      
      // Check file size
      if (file.size > maxSize) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: `File size too large. Maximum size is 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
        }));
        return;
      }
      
      // Check file type
      const allowedMimes = allowedTypes[name as keyof typeof allowedTypes];
      if (!allowedMimes.includes(file.type)) {
        const extensions = name === 'employeePhoto' ? 'JPG, JPEG, PNG' : 'PDF, JPG, JPEG, PNG';
        setErrors(prev => ({ 
          ...prev, 
          [name]: `Invalid file type. ${extensions} files only.` 
        }));
        return;
      }
      
      // Check filename length and characters
      if (file.name.length > 255) {
        setErrors(prev => ({ 
          ...prev, 
          [name]: 'File name too long. Maximum 255 characters allowed.' 
        }));
        return;
      }
      
      setFiles(prev => ({ ...prev, [name]: file }));
      if (errors[name]) {
        setErrors(prev => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
      }
    }
  };

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length <= 12) {
      const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
      return formatted.trim();
    }
    return value;
  };

  const formatMobile = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length <= 10) {
      return cleaned;
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Add token if available (new token-based registration)
      if (registrationToken) {
        data.append('token', registrationToken);
      }

      if (files.panFile) data.append('panFile', files.panFile);
      if (files.aadhaarFile) data.append('aadhaarFile', files.aadhaarFile);
      if (files.employeePhoto) data.append('employeePhoto', files.employeePhoto);
      if (files.bankStatementFile) data.append('bankStatementFile', files.bankStatementFile);

      await API.post('/employees/complete-profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Failed to complete registration. Please try again.';
      
      if (err.response) {
        // Server responded with error
        console.error('Server error response:', err.response.data);
        errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;
        
        // Show additional details if available
        if (err.response.data?.details) {
          console.error('Error details:', err.response.data.details);
        }
      } else if (err.request) {
        // Network error
        console.error('Network error:', err.request);
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Other error
        console.error('Other error:', err.message);
        errorMessage = err.message || errorMessage;
      }
      
      setErrors({ global: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingInfo) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600">Retrieving employee credentials...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 space-y-6 text-center">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckBadgeIcon className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Registration Submitted!</h2>
            <p className="text-gray-600 mt-2">Your profile has been submitted for admin approval. You will be notified once your account is activated. Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <style>{`
        .form-container {
          max-height: 60vh;
        }
        .form-container::-webkit-scrollbar {
          width: 8px;
        }
        .form-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .form-container::-webkit-scrollbar-thumb {
          background: #cbd5f5;
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        .form-container::-webkit-scrollbar-thumb:hover {
          background: #a5b4fc;
        }
        .form-container::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
      `}</style>
      
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-white">
          <h1 className="text-2xl font-semibold text-gray-900">Complete Your Registration</h1>
          <p className="text-sm text-gray-600 mt-1">Fill in your details to get started</p>
          <div className="mt-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Step 1 of 1
            </span>
          </div>
        </div>

        {errors.global && (
          <div className="mx-8 mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 flex items-center gap-3">
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{errors.global}</span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="form-container overflow-y-auto px-8 py-6 space-y-6">
          
          {employeeInfo && (
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <BriefcaseIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Employee Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="display-employeeId" className="block text-sm font-medium text-gray-700">Employee Code</label>
                  <input
                    id="display-employeeId"
                    type="text"
                    value={employeeInfo.employeeId || 'AUTO-GENERATED'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="display-firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    id="display-firstName"
                    type="text"
                    value={employeeInfo.firstName || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="display-lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    id="display-lastName"
                    type="text"
                    value={employeeInfo.lastName || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="display-officeEmail" className="block text-sm font-medium text-gray-700">Email ID</label>
                  <input
                    id="display-officeEmail"
                    type="text"
                    value={employeeInfo.officeEmail || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="display-designation" className="block text-sm font-medium text-gray-700">Designation</label>
                  <input
                    id="display-designation"
                    type="text"
                    value={employeeInfo.designation || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="display-department" className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    id="display-department"
                    type="text"
                    value={employeeInfo.department || 'Accounting'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Setup Section */}
            <div className="bg-white rounded-xl">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <LockClosedIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Account Setup</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Create Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-white rounded-xl">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.dob ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.dob && (
                    <p className="text-xs text-red-600 mt-1">{errors.dob}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="doj" className="block text-sm font-medium text-gray-700">
                    Date of Joining *
                  </label>
                  <input
                    id="doj"
                    name="doj"
                    type="date"
                    value={formData.doj}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.doj ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.doj && (
                    <p className="text-xs text-red-600 mt-1">{errors.doj}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.gender ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-xs text-red-600 mt-1">{errors.gender}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
                    Marital Status *
                  </label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.maritalStatus ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                  {errors.maritalStatus && (
                    <p className="text-xs text-red-600 mt-1">{errors.maritalStatus}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="bg-white rounded-xl">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Contact Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="personalEmail" className="block text-sm font-medium text-gray-700">
                    Personal Email (Optional)
                  </label>
                  <input
                    id="personalEmail"
                    name="personalEmail"
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={formData.personalEmail}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.personalEmail ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.personalEmail && (
                    <p className="text-xs text-red-600 mt-1">{errors.personalEmail}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="personalMobile" className="block text-sm font-medium text-gray-700">
                    Personal Mobile (Optional)
                  </label>
                  <input
                    id="personalMobile"
                    name="personalMobile"
                    type="tel"
                    placeholder="+91 00000 00000"
                    value={formData.personalMobile}
                    onChange={(e) => {
                      const formatted = formatMobile(e.target.value);
                      setFormData(prev => ({ ...prev, personalMobile: formatted }));
                    }}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.personalMobile ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.personalMobile && (
                    <p className="text-xs text-red-600 mt-1">{errors.personalMobile}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4">
                <div className="space-y-1">
                  <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-700">
                    Current Address *
                  </label>
                  <textarea
                    id="currentAddress"
                    name="currentAddress"
                    placeholder="Enter your current address"
                    rows={3}
                    value={formData.currentAddress}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none ${
                      errors.currentAddress ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.currentAddress && (
                    <p className="text-xs text-red-600 mt-1">{errors.currentAddress}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700">
                    Permanent Address *
                  </label>
                  <textarea
                    id="permanentAddress"
                    name="permanentAddress"
                    placeholder="Enter your permanent address"
                    rows={3}
                    value={formData.permanentAddress}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none ${
                      errors.permanentAddress ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.permanentAddress && (
                    <p className="text-xs text-red-600 mt-1">{errors.permanentAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="bg-white rounded-xl">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <AcademicCapIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Job Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                    Education *
                  </label>
                  <select
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.education ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select Qualification</option>
                    <option value="Associate">Associate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="Professional (CA/CS/CMA)">Professional (CA/CS/CMA)</option>
                    <option value="PhD">PhD</option>
                  </select>
                  {errors.education && (
                    <p className="text-xs text-red-600 mt-1">{errors.education}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700">
                    Institution Name *
                  </label>
                  <input
                    id="institutionName"
                    name="institutionName"
                    type="text"
                    placeholder="University/College Name"
                    value={formData.institutionName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.institutionName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.institutionName && (
                    <p className="text-xs text-red-600 mt-1">{errors.institutionName}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="yearOfCompletion" className="block text-sm font-medium text-gray-700">
                    Year of Completion *
                  </label>
                  <input
                    id="yearOfCompletion"
                    name="yearOfCompletion"
                    type="number"
                    placeholder="2023"
                    value={formData.yearOfCompletion}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.yearOfCompletion ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.yearOfCompletion && (
                    <p className="text-xs text-red-600 mt-1">{errors.yearOfCompletion}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Identification Section */}
            <div className="bg-white rounded-xl">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <IdentificationIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Identification Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="pan" className="block text-sm font-medium text-gray-700">
                    PAN Number *
                  </label>
                  <input
                    id="pan"
                    name="pan"
                    type="text"
                    placeholder="ABCDE1234F"
                    value={formData.pan}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.pan ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.pan && (
                    <p className="text-xs text-red-600 mt-1">{errors.pan}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700">
                    Aadhaar Number *
                  </label>
                  <input
                    id="aadhaar"
                    name="aadhaar"
                    type="text"
                    placeholder="1234 5678 9012"
                    value={formData.aadhaar}
                    onChange={(e) => {
                      const formatted = formatAadhaar(e.target.value);
                      setFormData(prev => ({ ...prev, aadhaar: formatted }));
                    }}
                    className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.aadhaar ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.aadhaar && (
                    <p className="text-xs text-red-600 mt-1">{errors.aadhaar}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">PAN Card Document *</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                    files.panFile ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400 bg-gray-50/50'
                  }`}>
                    <input
                      type="file"
                      id="panFile"
                      name="panFile"
                      aria-label="Upload PAN Card Document"
                      title="Upload PAN Card Document"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <div className="flex flex-col items-center text-center gap-2">
                      <DocumentArrowUpIcon className={`w-8 h-8 ${files.panFile ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium text-gray-700">
                        {files.panFile ? files.panFile.name : 'Upload PAN (PDF, Image)'}
                      </p>
                      <p className="text-xs text-gray-500">Format: PDF/JPG/PNG · Max 5MB</p>
                    </div>
                  </div>
                  {errors.panFile && (
                    <p className="text-xs text-red-600 mt-1">{errors.panFile}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Aadhaar Card Document *</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                    files.aadhaarFile ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400 bg-gray-50/50'
                  }`}>
                    <input
                      type="file"
                      id="aadhaarFile"
                      name="aadhaarFile"
                      aria-label="Upload Aadhaar Card Document"
                      title="Upload Aadhaar Card Document"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <div className="flex flex-col items-center text-center gap-2">
                      <DocumentArrowUpIcon className={`w-8 h-8 ${files.aadhaarFile ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium text-gray-700">
                        {files.aadhaarFile ? files.aadhaarFile.name : 'Upload Aadhaar (PDF, Image)'}
                      </p>
                      <p className="text-xs text-gray-500">Format: PDF/JPG/PNG · Max 5MB</p>
                    </div>
                  </div>
                  {errors.aadhaarFile && (
                    <p className="text-xs text-red-600 mt-1">{errors.aadhaarFile}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Employee Photo *</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                    files.employeePhoto ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400 bg-gray-50/50'
                  }`}>
                    <input
                      type="file"
                      id="employeePhoto"
                      name="employeePhoto"
                      aria-label="Upload Employee Photo"
                      title="Upload Employee Photo"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".jpg,.jpeg,.png"
                    />
                    <div className="flex flex-col items-center text-center gap-2">
                      <UserIcon className={`w-8 h-8 ${files.employeePhoto ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium text-gray-700">
                        {files.employeePhoto ? files.employeePhoto.name : 'Upload Photo (JPG, PNG)'}
                      </p>
                      <p className="text-xs text-gray-500">Format: JPG/PNG · Max 5MB</p>
                    </div>
                  </div>
                  {errors.employeePhoto && (
                    <p className="text-xs text-red-600 mt-1">{errors.employeePhoto}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Bank Statement (Optional)</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                    files.bankStatementFile ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400 bg-gray-50/50'
                  }`}>
                    <input
                      type="file"
                      id="bankStatementFile"
                      name="bankStatementFile"
                      aria-label="Upload Bank Statement"
                      title="Upload Bank Statement"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <div className="flex flex-col items-center text-center gap-2">
                      <DocumentArrowUpIcon className={`w-8 h-8 ${files.bankStatementFile ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium text-gray-700">
                        {files.bankStatementFile ? files.bankStatementFile.name : 'Upload Bank Statement (PDF, Image)'}
                      </p>
                      <p className="text-xs text-gray-500">Format: PDF/JPG/PNG · Max 5MB</p>
                    </div>
                  </div>
                  {errors.bankStatementFile && (
                    <p className="text-xs text-red-600 mt-1">{errors.bankStatementFile}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-4">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Processing..." : "Complete Registration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegistration;

