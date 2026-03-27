import React from 'react';
import { UserCircleIcon, CurrencyDollarIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface ProfileCardProps {
  user: any;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.officeEmail?.split('@')[0] || 'User';
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {getInitials(user?.firstName, user?.lastName, user?.officeEmail)}
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      </div>

      {/* User Info */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-1">{getDisplayName()}</h3>
        <p className="text-sm text-slate-600 mb-3">{user?.designation || 'Team Member'}</p>
        
        {/* Role Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
          <BriefcaseIcon className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-purple-700 capitalize">
            {user?.role || 'Employee'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-slate-700">Salary</span>
          </div>
          <span className="text-sm font-bold text-green-700">
            {user?.profile?.salary ? `$${user.profile.salary.toLocaleString()}` : 'Confidential'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Status</span>
          </div>
          <span className="text-sm font-bold text-blue-700 capitalize">
            {user?.status || 'Active'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-700">Department</span>
          </div>
          <span className="text-sm font-bold text-purple-700 capitalize">
            {user?.department || 'General'}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
