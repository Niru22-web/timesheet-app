import React from 'react';
import { UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';

interface WelcomeBannerProps {
  userName?: string;
  userRole?: string;
  className?: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ 
  userName = 'User', 
  userRole = 'Employee',
  className = '' 
}) => {
  return (
    <div className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-full">
            <UserCircleIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {userName}!
            </h1>
            <p className="text-blue-100">
              {userRole === 'admin' ? 'Administrator' : 
               userRole === 'manager' ? 'Manager' : 
               userRole === 'partner' ? 'Partner' : 'Employee'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <BellIcon className="w-5 h-5 text-white/80" />
          <span className="text-sm text-white/80">2 new notifications</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
