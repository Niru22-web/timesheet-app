import React, { useState, useEffect, useMemo } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getLoadingMessage, getSuccessMessage } from '../utils/messageUtils';
import {
    PencilSquareIcon,
    CameraIcon,
    ArrowUpTrayIcon,
    LockClosedIcon,
    KeyIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

// UI Components
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

// Redesign Components
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileDetails from '../components/profile/ProfileDetails';
import ProfileInsights from '../components/profile/ProfileInsights';

import './Profile.css';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // Form states for editing
    const [formData, setFormData] = useState({
        personalMobile: '',
        personalEmail: '',
        pan: '',
        aadhaar: '',
        dob: '',
        education: '',
        maritalStatus: '',
        gender: '',
        currentAddress: '',
        permanentAddress: '',
        salary: '',
        seniorityLevel: '',
        experience: '',
        employmentType: '',
        skills: '' // comma separated string for input
    });

    // Profile photo state
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [photoModalOpen, setPhotoModalOpen] = useState(false);
    
    // Change password state
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchProfile();
        }
    }, [user?.id]);

    // Auto-refresh profile data every 30 seconds
    useEffect(() => {
        if (!user?.id) return;
        
        const interval = setInterval(() => {
            fetchProfile();
        }, 30000); // refresh every 30 seconds
        
        return () => clearInterval(interval);
    }, [user?.id]);

    // 🔥 Listen for global data update events
    useEffect(() => {
        const handleDataUpdate = (event: CustomEvent) => {
            console.log('🔄 Global data update event received:', event.detail);
            if (event.detail.type?.includes('/employees/') || event.detail.type?.includes('/profile')) {
                fetchProfile();
            }
        };

        window.addEventListener('data-updated', handleDataUpdate as EventListener);
        return () => window.removeEventListener('data-updated', handleDataUpdate as EventListener);
    }, [user?.id]);

    const fetchProfile = async () => {
        if (!user?.email) return;
        try {
            setLoading(true);
            const res = await API.get(`/employees/by-email?email=${user.email}`);
            const data = res.data.data;
            
            // 🔥 Always use fresh data from API - don't merge with old state
            setProfileData(data);
            
            // Initialize form data with existing profile data
            const profile = data.profile || {};
            setFormData({
                personalMobile: profile.personalMobile || '',
                personalEmail: profile.personalEmail || '',
                pan: profile.pan || '',
                aadhaar: profile.aadhaar || '',
                dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
                education: profile.education || '',
                maritalStatus: profile.maritalStatus || '',
                gender: profile.gender || '',
                currentAddress: profile.currentAddress || '',
                permanentAddress: profile.permanentAddress || '',
                salary: profile.salary?.toString() || '',
                seniorityLevel: profile.seniorityLevel || '',
                experience: profile.experience || '',
                employmentType: profile.employmentType || '',
                skills: profile.skills ? profile.skills.join(', ') : ''
            });
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = () => {
        setEditModalOpen(true);
    };

    const handleSaveProfile = async () => {
        try {
            setSavingProfile(true);
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
            
            const response = await API.put(`/employees/${profileData.id}`, {
                profile: {
                    ...formData,
                    skills: skillsArray
                }
            });
            
            // 🔥 Force refresh with fresh data - don't rely on old state
            await fetchProfile();
            setEditModalOpen(false);
            toast.success(getSuccessMessage('profile'));
        } catch (err) {
            console.error('Failed to update profile:', err);
            // Error is handled by global interceptor, but we can show a specific message if needed
        } finally {
            setSavingProfile(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Profile photo handlers
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                setPhotoError('Only JPEG, JPG, and PNG files are allowed');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setPhotoError('File size must be less than 5MB');
                return;
            }
            setPhotoError('');
            setProfilePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = async () => {
        if (!profilePhoto) return;
        setUploadingPhoto(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append('profilePhoto', profilePhoto);
            
            const response = await API.post('/employees/profile-photo', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            // 🔥 Force refresh with fresh data after photo upload
            await fetchProfile();
            setProfilePhoto(null);
            setPhotoPreview('');
            setPhotoModalOpen(false);
            toast.success(getSuccessMessage('photo'));
        } catch (error: any) {
            setPhotoError(error.response?.data?.error || 'Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
        setPasswordError('');
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        setPasswordLoading(true);
        try {
            await API.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordModalOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success(getSuccessMessage('password'));
        } catch (error: any) {
            setPasswordError(error.response?.data?.error || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const completenessPercentage = useMemo(() => {
        if (!profileData || !profileData.profile) return 0;
        const profile = profileData.profile;
        const fields = [
            'personalMobile', 'personalEmail', 'pan', 'aadhaar', 
            'dob', 'education', 'maritalStatus', 'gender', 
            'currentAddress', 'permanentAddress', 'salary', 
            'seniorityLevel', 'experience', 'employmentType', 'skills'
        ];
        const filled = fields.filter(f => {
            if (f === 'skills') return profile.skills && profile.skills.length > 0;
            return !!profile[f];
        }).length;
        return Math.round((filled / fields.length) * 100);
    }, [profileData]);

    const photoUrl = useMemo(() => {
        if (profileData?.profile?.employeePhotoUrl) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL;
            const url = `${baseUrl}${profileData.profile.employeePhotoUrl}`;
            // Add timestamp to prevent caching
            return `${url}?t=${Date.now()}`;
        }
        return "/default-avatar.png";
    }, [profileData?.profile?.employeePhotoUrl]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="profile-container">
            <ProfileSidebar 
                details={profileData} 
                photoUrl={photoUrl}
                onPhotoClick={() => setPhotoModalOpen(true)}
                onEditClick={handleEditProfile}
                onPasswordClick={() => setPasswordModalOpen(true)}
                onStatusToggle={() => {}}
            />
            
            <ProfileDetails details={profileData} />
            
            <ProfileInsights 
                details={profileData} 
                completeness={completenessPercentage}
                onUpdateClick={handleEditProfile}
            />

            {/* Profile Photo Upload Modal */}
            <Modal
                isOpen={photoModalOpen}
                onClose={() => {
                    setPhotoModalOpen(false);
                    setProfilePhoto(null);
                    setPhotoPreview('');
                    setPhotoError('');
                }}
                title="Update Profile Photo"
                size="sm"
            >
                <div className="flex flex-col items-center space-y-6">
                    <div className="relative group">
                        <Avatar 
                            name={`${profileData.firstName} ${profileData.lastName}`} 
                            size="2xl" 
                            src={photoPreview || photoUrl}
                            border
                        />
                        <button
                            onClick={() => document.getElementById('profile-photo-input')?.click()}
                            title="Change Profile Photo"
                            aria-label="Change Profile Photo"
                            className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                        >
                            <CameraIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <input
                        id="profile-photo-input"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handlePhotoChange}
                        className="hidden"
                        title="Upload profile photo"
                        aria-label="Upload profile photo"
                    />

                    {photoError && (
                        <div className="w-full bg-red-50 text-red-600 p-2 rounded-md text-sm text-center">
                            {photoError}
                        </div>
                    )}

                    <div className="flex w-full gap-3 pt-4">
                        <Button 
                            variant="secondary" 
                            fullWidth 
                            onClick={() => setPhotoModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={handlePhotoUpload}
                            isLoading={uploadingPhoto}
                            disabled={!profilePhoto}
                        >
                            {uploadingPhoto ? getLoadingMessage('photo') : 'Save Photo'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Professional Profile"
                size="lg"
            >
                <div className="max-h-[60vh] overflow-y-auto px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Personal Mobile"
                            value={formData.personalMobile}
                            onChange={(e) => handleInputChange('personalMobile', e.target.value)}
                        />
                        <Input
                            label="Personal Email"
                            value={formData.personalEmail}
                            onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                        />
                        <Input
                            label="PAN Number"
                            value={formData.pan}
                            onChange={(e) => handleInputChange('pan', e.target.value)}
                        />
                        <Input
                            label="Aadhaar Number"
                            value={formData.aadhaar}
                            onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                        />
                        <Input
                            label="Date of Birth"
                            type="date"
                            value={formData.dob}
                            onChange={(e) => handleInputChange('dob', e.target.value)}
                        />
                        <Input
                            label="Education"
                            value={formData.education}
                            onChange={(e) => handleInputChange('education', e.target.value)}
                        />
                        <div className="space-y-1.5 flex flex-col">
                            <label htmlFor="marital-status-select" className="text-sm font-medium text-secondary-700 ml-0.5">Marital Status</label>
                            <select
                                id="marital-status-select"
                                className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
                                value={formData.maritalStatus}
                                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                                aria-label="Marital Status"
                                title="Marital Status"
                            >
                                <option value="">Select Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                            </select>
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <label htmlFor="gender-select" className="text-sm font-medium text-secondary-700 ml-0.5">Gender</label>
                            <select
                                id="gender-select"
                                className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                aria-label="Gender"
                                title="Gender"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <Input
                            label="Salary (LPA)"
                            type="number"
                            value={formData.salary}
                            onChange={(e) => handleInputChange('salary', e.target.value)}
                        />
                        <Input
                            label="Seniority Level"
                            placeholder="e.g. Senior, Junior, Lead"
                            value={formData.seniorityLevel}
                            onChange={(e) => handleInputChange('seniorityLevel', e.target.value)}
                        />
                        <Input
                            label="Experience"
                            placeholder="e.g. 5 Years"
                            value={formData.experience}
                            onChange={(e) => handleInputChange('experience', e.target.value)}
                        />
                        <Input
                            label="Employment Type"
                            placeholder="e.g. Full-time, Contract"
                            value={formData.employmentType}
                            onChange={(e) => handleInputChange('employmentType', e.target.value)}
                        />
                    </div>
                    <div className="mt-4">
                        <Input
                            label="Skills (Comma separated)"
                            placeholder="React, TypeScript, Figma"
                            value={formData.skills}
                            onChange={(e) => handleInputChange('skills', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        <Input
                            label="Current Address"
                            multiline
                            rows={2}
                            value={formData.currentAddress}
                            onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                        />
                        <Input
                            label="Permanent Address"
                            multiline
                            rows={2}
                            value={formData.permanentAddress}
                            onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                        />
                    </div>
                </div>
                <div className="pt-6 flex gap-3">
                    <Button 
                        variant="secondary" 
                        fullWidth 
                        onClick={() => setEditModalOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        fullWidth 
                        onClick={handleSaveProfile}
                        isLoading={savingProfile}
                    >
                        {savingProfile ? getLoadingMessage('profile') : 'Save All Changes'}
                    </Button>
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                isOpen={passwordModalOpen}
                onClose={() => {
                    setPasswordModalOpen(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError('');
                }}
                title="Change Password"
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Current Password"
                        type="password"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        leftIcon={<LockClosedIcon className="w-5 h-5 text-secondary-400" />}
                    />
                    <Input
                        label="New Password"
                        type="password"
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        leftIcon={<KeyIcon className="w-5 h-5 text-secondary-400" />}
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        leftIcon={<KeyIcon className="w-5 h-5 text-secondary-400" />}
                    />
                    
                    {passwordError && (
                        <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
                            {passwordError}
                        </div>
                    )}
                    
                    <div className="pt-4 flex gap-3">
                        <Button variant="secondary" fullWidth onClick={() => setPasswordModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={handleChangePassword}
                            isLoading={passwordLoading}
                        >
                            {passwordLoading ? getLoadingMessage('password') : 'Change Password'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;
