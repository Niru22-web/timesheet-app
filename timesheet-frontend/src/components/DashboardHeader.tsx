import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import {
  UsersIcon,
  BriefcaseIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CheckCircleIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// UI Components
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  user?: any;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title = 'Dashboard', 
  subtitle, 
  user, 
  onLogout,
  onMenuToggle
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Company Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle || (() => setIsSidebarOpen(!isSidebarOpen))}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Bars3Icon className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ashish Shah & Associate</h1>
                <p className="text-sm text-gray-500 font-medium">Timesheet Management System</p>
              </div>
            </div>
          </div>

          {/* Center Section - Title */}
          <div className="hidden lg:flex items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Section - User Info */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <BellIcon className="w-5 h-5 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'User'}</p>
              </div>
              <Avatar name={user?.name || 'User'} size="md" />
            </div>

            {/* Logout */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onLogout}
              leftIcon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </header>
  );
};

export default DashboardHeader;
