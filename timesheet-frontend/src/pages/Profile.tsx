import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    ShieldCheckIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    IdentificationIcon,
    AcademicCapIcon,
    CalendarDaysIcon,
    HeartIcon,
    PencilSquareIcon,
    CameraIcon,
    ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState('');

    // Form states for editing
    const [formData, setFormData] = useState({
        personalMobile: '',
        pan: '',
        dob: '',
        education: '',
        maritalStatus: '',
        currentAddress: ''
    });

    // Profile photo state
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        if (!user?.email) return;
        try {
            setLoading(true);
            const res = await API.get(`/employees/by-email?email=${user.email}`);
            setProfileData(res.data);
            // Initialize form data with existing profile data
            const profile = res.data.profile || {};
            setFormData({
                personalMobile: profile.personalMobile || '',
                pan: profile.pan || '',
                dob: profile.dob || '',
                education: profile.education || '',
                maritalStatus: profile.maritalStatus || '',
                currentAddress: profile.currentAddress || ''
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
            await API.put(`/api/employees/${profileData.id}`, {
                profile: formData
            });
            await fetchProfile(); // Refresh data
            setEditModalOpen(false);
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile');
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
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                setPhotoError('Only JPEG, JPG, and PNG files are allowed');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setPhotoError('File size must be less than 5MB');
                return;
            }

            setPhotoError('');
            setProfilePhoto(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = async () => {
        if (!profilePhoto) {
            setPhotoError('Please select a photo first');
            return;
        }

        setUploadingPhoto(true);
        setPhotoError('');

        try {
            const formData = new FormData();
            formData.append('profilePhoto', profilePhoto);

            const response = await API.put('/employees/profile-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update profile data with new photo URL
            await fetchProfile();
            
            // Reset photo state
            setProfilePhoto(null);
            setPhotoPreview('');
            
            alert('Profile photo updated successfully!');
        } catch (error: any) {
            console.error('Error uploading photo:', error);
            setPhotoError(error.response?.data?.error || 'Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const details = profileData || user;

    // Get current profile photo URL
    const getCurrentPhotoUrl = () => {
        if (photoPreview) return photoPreview;
        if (profileData?.profile?.employeePhotoUrl) {
            return `http://localhost:3001${profileData.profile.employeePhotoUrl}`;
        }
        return undefined;
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
            {/* Header */}
            <div className="flex-none flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">Personal Identity</h1>
                    <p className="text-sm font-medium text-secondary-500 mt-1">Manage your secure credentials and professional profile.</p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleEditProfile}
                    leftIcon={<PencilSquareIcon className="w-4 h-4" />}
                >
                    Edit Profile
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Main Identity Card */}
                    <Card className="lg:col-span-4 p-8 flex flex-col items-center text-center space-y-4">
                        <div className="relative group">
                            <Avatar 
                                name={details.firstName ? `${details.firstName} ${details.lastName}` : details.name} 
                                size="2xl" 
                                border 
                                src={getCurrentPhotoUrl()}
                            />
                            <button
                                onClick={() => document.getElementById('profile-photo-input')?.click()}
                                className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition-colors opacity-0 group-hover:opacity-100"
                                title="Change Profile Photo"
                            >
                                <CameraIcon className="w-4 h-4" />
                            </button>
                            <input
                                id="profile-photo-input"
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </div>
                        
                        {/* Photo Upload Section */}
                        {(profilePhoto || photoPreview) && (
                            <div className="w-full space-y-3">
                                {photoPreview && (
                                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                                        <p className="text-sm font-medium text-primary-700 mb-2">New Photo Preview:</p>
                                        <img 
                                            src={photoPreview} 
                                            alt="Preview" 
                                            className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-primary-300"
                                        />
                                    </div>
                                )}
                                
                                {photoError && (
                                    <div className="bg-danger-50 text-danger-700 px-3 py-2 rounded-lg text-sm">
                                        {photoError}
                                    </div>
                                )}
                                
                                <div className="flex gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handlePhotoUpload}
                                        isLoading={uploadingPhoto}
                                        leftIcon={<ArrowUpTrayIcon className="w-4 h-4" />}
                                        disabled={!profilePhoto}
                                    >
                                        {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setProfilePhoto(null);
                                            setPhotoPreview('');
                                            setPhotoError('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <h2 className="text-2xl font-black text-secondary-900">{details.firstName ? `${details.firstName} ${details.lastName}` : details.name}</h2>
                            <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mt-1">{details.designation || 'Specialist'}</p>
                        </div>
                        <div className="w-full pt-4 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold px-4 py-2 bg-secondary-50 rounded-lg">
                                <span className="text-secondary-400">Employee ID</span>
                                <span className="text-secondary-900">{details.employeeId || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold px-4 py-2 bg-secondary-50 rounded-lg">
                                <span className="text-secondary-400">Status</span>
                                <StatusBadge status={details.status === 'active' ? 'active' : 'inactive'} />
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold px-4 py-2 bg-secondary-50 rounded-lg">
                                <span className="text-secondary-400">Department</span>
                                <span className="text-secondary-900">{details.department || 'N/A'}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Detailed Info */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="p-6">
                            <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest mb-6 border-b border-secondary-100 pb-2">Core Credentials</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <EnvelopeIcon className="w-5 h-5 text-secondary-400" />
                                    <div>
                                        <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Office Email</label>
                                        <span className="text-sm font-bold text-secondary-800">{details.officeEmail || details.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <PhoneIcon className="w-5 h-5 text-secondary-400" />
                                    <div>
                                        <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Personal Mobile</label>
                                        <span className="text-sm font-bold text-secondary-800">{profileData?.profile?.personalMobile || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ShieldCheckIcon className="w-5 h-5 text-secondary-400" />
                                    <div>
                                        <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">System Role</label>
                                        <span className="text-sm font-bold text-secondary-800">{details.role || 'User'}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <IdentificationIcon className="w-5 h-5 text-secondary-400" />
                                    <div>
                                        <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">PAN Number</label>
                                        <span className="text-sm font-bold text-secondary-800">{profileData?.profile?.pan || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest mb-6 border-b border-secondary-100 pb-2">Personal Records</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <CalendarDaysIcon className="w-5 h-5 text-secondary-400" />
                                    <div>
                                        <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Date of Birth</label>
                                        <span className="text-sm font-bold text-secondary-800">{profileData?.profile?.dob ? new Date(profileData.profile.dob).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <AcademicCapIcon className="w-5 h-5 text-secondary-400" />
                                    <div>
                                        <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Education</label>
                                        <span className="text-sm font-bold text-secondary-800">{profileData?.profile?.education || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <HeartIcon className="w-5 h-5 text-secondary-400" />
                                    <div>
                                        <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Marital Status</label>
                                        <span className="text-sm font-bold text-secondary-800">{profileData?.profile?.maritalStatus || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <BuildingOfficeIcon className="w-5 h-5 text-secondary-400" />
                                    <div>
                                        <label className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">Current Address</label>
                                        <span className="text-sm font-bold text-secondary-800 text-pretty">{profileData?.profile?.currentAddress || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Profile"
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Personal Mobile"
                        placeholder="Enter personal mobile number"
                        value={formData.personalMobile}
                        onChange={(e) => handleInputChange('personalMobile', e.target.value)}
                    />
                    <Input
                        label="PAN Number"
                        placeholder="Enter PAN number"
                        value={formData.pan}
                        onChange={(e) => handleInputChange('pan', e.target.value)}
                    />
                    <Input
                        label="Date of Birth"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                    />
                    <Input
                        label="Education"
                        placeholder="Enter education details"
                        value={formData.education}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                    />
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-secondary-700 block ml-0.5">Marital Status</label>
                        <select
                            className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-secondary-300 text-sm font-medium"
                            value={formData.maritalStatus}
                            onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                        >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                    </div>
                    <Input
                        label="Current Address"
                        placeholder="Enter current address"
                        value={formData.currentAddress}
                        onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                        multiline
                        rows={3}
                    />
                    <div className="pt-4 flex gap-3">
                        <Button variant="secondary" fullWidth onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" fullWidth onClick={handleSaveProfile}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;
