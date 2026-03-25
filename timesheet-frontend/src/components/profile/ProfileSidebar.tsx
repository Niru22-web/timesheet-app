import React from 'react';
import Avatar from '../ui/Avatar';
import { CameraIcon, PencilSquareIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface ProfileSidebarProps {
  details: any;
  onPhotoClick: () => void;
  onEditClick: () => void;
  onPasswordClick: () => void;
  onStatusToggle: () => void;
  photoUrl?: string;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  details, 
  onPhotoClick, 
  onEditClick, 
  onPasswordClick,
  onStatusToggle,
  photoUrl 
}) => {
  const profile = details.profile || {};
  
  return (
    <div className="profile-column">
      <div className="profile-card">
        <div className="avatar-wrapper" onClick={onPhotoClick}>
          <Avatar 
            name={`${details.firstName} ${details.lastName}`} 
            size="2xl" 
            src={photoUrl}
            border
          />
          <div className="avatar-edit-overlay">
            <CameraIcon className="w-4 h-4" />
          </div>
        </div>
        
        <h2 className="profile-name">{`${details.firstName} ${details.lastName}`}</h2>
        <p className="profile-role">{details.designation}</p>
        
        <div className={`status-badge ${details.status === 'active' ? 'status-available' : 'bg-red-50 text-red-600'}`}>
          {details.status === 'active' ? 'Available for work' : 'Not Available'}
        </div>
        
        <div className="quick-info-grid">
          <div className="info-item">
            <label>Salary</label>
            <span>{profile.salary ? `₹${profile.salary.toLocaleString()}` : 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Seniority</label>
            <span>{profile.seniorityLevel || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Experience</label>
            <span>{profile.experience || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Type</label>
            <span>{profile.employmentType || 'Full-time'}</span>
          </div>
        </div>
        
        <div className="skills-section mt-4">
          <h3 className="skills-title">Skills</h3>
          <div className="skills-tags">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill: string, index: number) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No skills added</span>
            )}
          </div>
        </div>
        
        <div className="w-full space-y-2 mt-6">
          <button className="edit-btn-sidebar flex items-center justify-center gap-2" onClick={onEditClick}>
            <PencilSquareIcon className="w-4 h-4" />
            Edit Profile
          </button>
          <button className="edit-btn-sidebar flex items-center justify-center gap-2" onClick={onPasswordClick}>
            <LockClosedIcon className="w-4 h-4" />
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
