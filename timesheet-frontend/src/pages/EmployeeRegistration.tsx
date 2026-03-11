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
      const response = await API.get(`/api/registration/validate?token=${tokenParam}`);
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
      const response = await API.get(`/api/employees/by-email?email=${emailParam}`);
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

      await API.post('/api/employees/complete-profile', data, {
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
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-secondary-500">Retrieving employee credentials...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-6 animate-fade-in text-center">
        <Card className="w-full max-w-md p-10 space-y-6 shadow-3xl">
          <div className="w-20 h-20 bg-warning-50 text-warning-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckBadgeIcon className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 leading-tight">Registration Submitted!</h2>
            <p className="text-secondary-500 mt-2 font-medium">Your profile has been submitted for admin approval. You will be notified once your account is activated. Redirecting to login...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Aesthetic Background Elements */}
      <div className="fixed top-0 right-0 w-1/3 h-1/2 bg-primary-600/[0.03] rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-1/3 h-1/2 bg-primary-600/[0.02] rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-secondary-900 tracking-tight">Personnel Registration</h1>
          <p className="text-secondary-500 font-medium mt-3">Please complete your identity profile to activate your account credentials.</p>
        </div>

        {errors.global && (
          <div className="mb-6 bg-danger-50 text-danger-700 p-4 rounded-xl border border-danger-100 flex items-center gap-3 animate-shake">
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="text-sm font-bold">{errors.global}</span>
          </div>
        )}

        {employeeInfo && (
          <Card className="p-8 shadow-xl border-t-4 border-primary-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                <BriefcaseIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 tracking-tight">Employee Information (System Generated)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Employee Code"
                value={employeeInfo.employeeId || 'AUTO-GENERATED'}
                disabled
                leftIcon={<IdentificationIcon />}
              />
              <Input
                label="First Name"
                value={employeeInfo.firstName}
                disabled
                leftIcon={<UserIcon />}
              />
              <Input
                label="Last Name"
                value={employeeInfo.lastName}
                disabled
                leftIcon={<UserIcon />}
              />
              <Input
                label="Email ID"
                value={employeeInfo.officeEmail}
                disabled
                leftIcon={<EnvelopeIcon />}
              />
              <Input
                label="Designation"
                value={employeeInfo.designation}
                disabled
                leftIcon={<BriefcaseIcon />}
              />
              <Input
                label="Date of Joining"
                value={employeeInfo.dateOfJoining || new Date().toISOString().split('T')[0]}
                type="date"
                disabled
                leftIcon={<CalendarIcon />}
              />
              <Input
                label="Department"
                value={employeeInfo.department || 'Accounting'}
                disabled
                leftIcon={<BriefcaseIcon />}
              />
              <Input
                label="Software Role"
                value={employeeInfo.role}
                disabled
                leftIcon={<ShieldCheckIcon />}
              />
              <Input
                label="Reporting Manager"
                value={employeeInfo.reportingManager?.name || 'Not Assigned'}
                disabled
                leftIcon={<UserIcon />}
              />
              <Input
                label="Reporting Partner"
                value={employeeInfo.reportingPartner?.name || 'Not Assigned'}
                disabled
                leftIcon={<UserIcon />}
              />
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          {/* Section 1: Security Setup */}
          <Card className="p-8 shadow-xl border-t-4 border-primary-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
                <LockClosedIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 tracking-tight">Account Security Setup</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                name="password"
                label="Create Password"
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
          </Card>

          {/* Section 2: Education Details */}
          <Card className="p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <AcademicCapIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 tracking-tight">Educational Qualification</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Select
                name="education"
                label="Highest Qualification"
                value={formData.education}
                onChange={handleInputChange}
                error={errors.education}
                leftIcon={<AcademicCapIcon />}
              >
                <option value="">Select Qualification</option>
                <option value="Associate">Associate</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="Professional (CA/CS/CMA)">Professional (CA/CS/CMA)</option>
                <option value="PhD">PhD</option>
              </Select>
              <Input
                name="institutionName"
                label="Institution Name"
                placeholder="University/College Name"
                value={formData.institutionName}
                onChange={handleInputChange}
                error={errors.institutionName}
                leftIcon={<BriefcaseIcon />}
              />
              <Input
                name="yearOfCompletion"
                label="Year of Completion"
                type="number"
                placeholder="2023"
                value={formData.yearOfCompletion}
                onChange={handleInputChange}
                error={errors.yearOfCompletion}
                leftIcon={<CalendarIcon />}
              />
            </div>
          </Card>

          {/* Section 2: Personal Identity */}
          <Card className="p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <UserIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 tracking-tight">Personal Identity Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input
                name="dob"
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                error={errors.dob}
                leftIcon={<CalendarIcon />}
              />
              <Input
                name="doj"
                label="Date of Joining"
                type="date"
                value={formData.doj}
                onChange={handleInputChange}
                error={errors.doj}
                leftIcon={<CalendarIcon />}
              />
              <Select
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleInputChange}
                error={errors.gender}
                leftIcon={<ArrowsRightLeftIcon />}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
              <Select
                name="maritalStatus"
                label="Marital Status"
                value={formData.maritalStatus}
                onChange={handleInputChange}
                error={errors.maritalStatus}
                leftIcon={<HeartIcon />}
              >
                <option value="">Select status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </Select>
            </div>
          </Card>

          {/* Section 3: Contact Details */}
          <Card className="p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <EnvelopeIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 tracking-tight">Personal Contact Info</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Input
                name="personalEmail"
                label="Self Email ID (Optional)"
                type="email"
                placeholder="yourname@gmail.com"
                value={formData.personalEmail}
                onChange={handleInputChange}
                error={errors.personalEmail}
                leftIcon={<EnvelopeIcon />}
              />
              <Input
                name="personalMobile"
                label="Self Mobile Number (Optional)"
                placeholder="+91 00000 00000"
                value={formData.personalMobile}
                onChange={(e) => {
                  const formatted = formatMobile(e.target.value);
                  setFormData(prev => ({ ...prev, personalMobile: formatted }));
                }}
                error={errors.personalMobile}
                leftIcon={<PhoneIcon />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              <Input
                name="currentAddress"
                label="Address - Current"
                placeholder="Street address in Mumbai..."
                multiline
                rows={2}
                value={formData.currentAddress}
                onChange={handleInputChange}
                error={errors.currentAddress}
                leftIcon={<MapPinIcon />}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  name="currentPinCode"
                  label="PIN Code of Current Address (Optional)"
                  placeholder="400001"
                  value={formData.currentPinCode}
                  onChange={handleInputChange}
                  error={errors.currentPinCode}
                  leftIcon={<IdentificationIcon />}
                />
              </div>
              <Input
                name="permanentAddress"
                label="Address - Permanent"
                placeholder="Complete secondary address..."
                multiline
                rows={2}
                value={formData.permanentAddress}
                onChange={handleInputChange}
                error={errors.permanentAddress}
                leftIcon={<MapPinIcon />}
              />
            </div>
          </Card>

          {/* Section 4: Guardian Details */}
          <Card className="p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 tracking-tight">Guardian Information (Local) - Optional</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <Input
                name="guardianName"
                label="Guardian Name (Optional)"
                placeholder="Relation's name"
                value={formData.guardianName}
                onChange={handleInputChange}
                error={errors.guardianName}
                leftIcon={<UserIcon />}
              />
              <Input
                name="guardianNumber"
                label="Guardian Contact Number (Optional)"
                placeholder="+91 00000 00000"
                value={formData.guardianNumber}
                onChange={(e) => {
                  const formatted = formatMobile(e.target.value);
                  setFormData(prev => ({ ...prev, guardianNumber: formatted }));
                }}
                error={errors.guardianNumber}
                leftIcon={<PhoneIcon />}
              />
              <div className="md:col-span-2">
                <Input
                  name="guardianAddress"
                  label="Guardian/Relation Address (Optional)"
                  placeholder="Address in Mumbai..."
                  multiline
                  rows={2}
                  value={formData.guardianAddress}
                  onChange={handleInputChange}
                  error={errors.guardianAddress}
                  leftIcon={<MapPinIcon />}
                />
              </div>
            </div>
          </Card>

          {/* Section 5: Identification & Documents */}
          <Card className="p-8 shadow-xl border-b-4 border-indigo-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <IdentificationIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 tracking-tight">Identification Verification & Documents</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Input
                name="pan"
                label="PAN Card Number"
                placeholder="ABCDE1234F"
                value={formData.pan}
                onChange={handleInputChange}
                error={errors.pan}
                leftIcon={<IdentificationIcon />}
              />
              <Input
                name="aadhaar"
                label="Aadhaar Card Number"
                placeholder="1234 5678 9012"
                value={formData.aadhaar}
                onChange={(e) => {
                  const formatted = formatAadhaar(e.target.value);
                  setFormData(prev => ({ ...prev, aadhaar: formatted }));
                }}
                error={errors.aadhaar}
                leftIcon={<IdentificationIcon />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-secondary-700 block px-1">Attach PAN Copy</label>
                <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${files.panFile ? 'border-primary-500 bg-primary-50/30' : 'border-secondary-200 hover:border-primary-400 bg-secondary-50/50'}`}>
                  <input
                    type="file"
                    name="panFile"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="flex flex-col items-center text-center gap-2">
                    <DocumentArrowUpIcon className={`w-8 h-8 ${files.panFile ? 'text-primary-600' : 'text-secondary-400'}`} />
                    <p className="text-sm font-bold text-secondary-700">{files.panFile ? files.panFile.name : 'Upload PAN (PDF, Image)'}</p>
                    <p className="text-[10px] text-secondary-400 uppercase font-bold tracking-wider">Format: PDF/JPG/PNG · Max 5MB</p>
                  </div>
                </div>
                {errors.panFile && <p className="text-xs font-bold text-danger-500">{errors.panFile}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-secondary-700 block px-1">Attach Aadhaar Copy</label>
                <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${files.aadhaarFile ? 'border-primary-500 bg-primary-50/30' : 'border-secondary-200 hover:border-primary-400 bg-secondary-50/50'}`}>
                  <input
                    type="file"
                    name="aadhaarFile"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="flex flex-col items-center text-center gap-2">
                    <DocumentArrowUpIcon className={`w-8 h-8 ${files.aadhaarFile ? 'text-primary-600' : 'text-secondary-400'}`} />
                    <p className="text-sm font-bold text-secondary-700">{files.aadhaarFile ? files.aadhaarFile.name : 'Upload Aadhaar (PDF, Image)'}</p>
                    <p className="text-[10px] text-secondary-400 uppercase font-bold tracking-wider">Format: PDF/JPG/PNG · Max 5MB</p>
                  </div>
                </div>
                {errors.aadhaarFile && <p className="text-xs font-bold text-danger-500">{errors.aadhaarFile}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-secondary-700 block px-1">Employee Photo</label>
                <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${files.employeePhoto ? 'border-primary-500 bg-primary-50/30' : 'border-secondary-200 hover:border-primary-400 bg-secondary-50/50'}`}>
                  <input
                    type="file"
                    name="employeePhoto"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".jpg,.jpeg,.png"
                  />
                  <div className="flex flex-col items-center text-center gap-2">
                    <UserIcon className={`w-8 h-8 ${files.employeePhoto ? 'text-primary-600' : 'text-secondary-400'}`} />
                    <p className="text-sm font-bold text-secondary-700">{files.employeePhoto ? files.employeePhoto.name : 'Upload Photo (JPG, PNG)'}</p>
                    <p className="text-[10px] text-secondary-400 uppercase font-bold tracking-wider">Format: JPG/PNG · Max 5MB</p>
                  </div>
                </div>
                {errors.employeePhoto && <p className="text-xs font-bold text-danger-500">{errors.employeePhoto}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-secondary-700 block px-1">Bank Statement (Optional)</label>
                <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${files.bankStatementFile ? 'border-primary-500 bg-primary-50/30' : 'border-secondary-200 hover:border-primary-400 bg-secondary-50/50'}`}>
                  <input
                    type="file"
                    name="bankStatementFile"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="flex flex-col items-center text-center gap-2">
                    <DocumentArrowUpIcon className={`w-8 h-8 ${files.bankStatementFile ? 'text-primary-600' : 'text-secondary-400'}`} />
                    <p className="text-sm font-bold text-secondary-700">{files.bankStatementFile ? files.bankStatementFile.name : 'Upload Bank Statement (PDF, Image)'}</p>
                    <p className="text-[10px] text-secondary-400 uppercase font-bold tracking-wider">Format: PDF/JPG/PNG · Max 5MB</p>
                  </div>
                </div>
                {errors.bankStatementFile && <p className="text-xs font-bold text-danger-500">{errors.bankStatementFile}</p>}
              </div>
            </div>
          </Card>

          {/* Section 5: Bank Details */}
          <Card className="p-8 shadow-xl border-t-4 border-emerald-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <BriefcaseIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 tracking-tight">Bank Details (Optional)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                name="bankName"
                label="Bank Name"
                placeholder="State Bank of India"
                value={formData.bankName}
                onChange={handleInputChange}
                error={errors.bankName}
                leftIcon={<BriefcaseIcon />}
              />
              <Input
                name="accountHolderName"
                label="Account Holder Name"
                placeholder="John Doe"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                error={errors.accountHolderName}
                leftIcon={<UserIcon />}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                name="bankAccountNumber"
                label="Bank Account Number"
                placeholder="1234567890123456"
                value={formData.bankAccountNumber}
                onChange={handleInputChange}
                error={errors.bankAccountNumber}
                leftIcon={<IdentificationIcon />}
              />
              <Input
                name="ifscCode"
                label="IFSC Code"
                placeholder="SBIN0001234"
                value={formData.ifscCode}
                onChange={handleInputChange}
                error={errors.ifscCode}
                leftIcon={<ShieldCheckIcon />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              <Input
                name="branchName"
                label="Branch Name"
                placeholder="Main Branch, Mumbai"
                value={formData.branchName}
                onChange={handleInputChange}
                error={errors.branchName}
                leftIcon={<MapPinIcon />}
              />
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              className="h-14 font-bold border-secondary-200 text-secondary-600"
              onClick={() => navigate('/login')}
            >
              Cancel Activation
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              className="h-14 font-extrabold shadow-lg shadow-primary-500/20"
            >
              Activate My Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegistration;

