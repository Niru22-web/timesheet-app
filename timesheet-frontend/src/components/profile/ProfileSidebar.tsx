import React from 'react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { 
  CameraIcon, 
  PencilSquareIcon, 
  KeyIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import TreeView from './TreeView';

interface ProfileSidebarProps {
  details: any;
  photoUrl: string;
  onPhotoClick: () => void;
  onEditClick: () => void;
  onPasswordClick: () => void;
  onStatusToggle: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ 
  details, 
  photoUrl, 
  onPhotoClick, 
  onEditClick, 
  onPasswordClick
}) => {
  if (!details) return (
    <div className="w-[340px] h-full bg-secondary-50 animate-pulse rounded-2xl" />
  );

  // Mock tree data for demonstration - in real app, fetch from backend
  const treeData = [
    {
      id: 'dep-1',
      name: details.department || 'General',
      type: 'department' as const,
      children: [
        {
          id: 'team-1',
          name: 'Core Strategy Team',
          type: 'team' as const,
          children: [
            { id: 'emp-curr', name: `${details.firstName} ${details.lastName}`, type: 'employee' as const, role: details.role, isCurrentUser: true },
            { id: 'emp-2', name: 'Alok Sharma', type: 'employee' as const, role: 'Lead Developer' },
            { id: 'emp-3', name: 'John Doe', type: 'employee' as const, role: 'UI Designer' },
          ]
        }
      ]
    }
  ];

  return (
    <div className="w-[340px] flex flex-col gap-6 animate-fade-in custom-scrollbar overflow-y-auto px-1 pb-10">
      {/* Profile summary card */}
      <div className="bg-white rounded-2xl shadow-soft border border-secondary-100 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary-600 to-primary-400" />
        <div className="px-6 pb-8 -mt-12 text-center">
          <div className="relative inline-block group">
            <Avatar 
              name={`${details.firstName} ${details.lastName}`} 
              size="2xl" 
              src={photoUrl}
              border
              className="ring-4 ring-white"
            />
            <button
              onClick={onPhotoClick}
              title="Update profile photo"
              className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-elevated text-primary-600 hover:bg-primary-50 transition-all active:scale-90"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-4">
            <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight">{details.firstName} {details.lastName}</h1>
            <p className="text-sm font-medium text-secondary-500 mt-1">{details.designation}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="px-2 py-0.5 rounded-full bg-success-50 text-success-700 text-[10px] font-black uppercase tracking-widest border border-success-100">
                {details.status}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest border border-primary-100">
                {details.role}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button 
              variant="primary" 
              fullWidth 
              onClick={onEditClick}
              leftIcon={<PencilSquareIcon className="w-4 h-4" />}
            >
              Edit Profile
            </Button>
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={onPasswordClick}
              leftIcon={<KeyIcon className="w-4 h-4" />}
            >
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* Corporate Hierarchy Tree View */}
      <div className="bg-white rounded-2xl shadow-soft border border-secondary-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-secondary-50 rounded-lg text-secondary-600">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-secondary-900 uppercase tracking-wider">Organizational Matrix</h2>
        </div>
        <TreeView data={treeData} />
      </div>

      {/* Quick stats / highlights */}
      <div className="bg-white rounded-2xl shadow-soft border border-secondary-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-secondary-50 rounded-lg text-secondary-600">
            <ChartBarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-secondary-900 uppercase tracking-wider">Activity Index</h2>
        </div>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary-500">Utilization Rate</span>
            <span className="text-xs font-bold text-success-600">92%</span>
          </div>
          <div className="w-full h-1.5 bg-secondary-100 rounded-full overflow-hidden">
            <div className="w-[92%] h-full bg-success-500 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-secondary-500">Attendance Rank</span>
            <span className="text-xs font-bold text-primary-600">Top 5%</span>
          </div>
          <div className="w-full h-1.5 bg-secondary-100 rounded-full overflow-hidden">
            <div className="w-[95%] h-full bg-primary-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
