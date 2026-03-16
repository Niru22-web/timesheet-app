import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONFIG } from '../config/appConfig';
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
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// UI Components
import Badge from '../components/ui/Badge';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title = 'Dashboard', 
  subtitle, 
  onMenuToggle
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200/80 backdrop-blur-sm shadow-sm">
      <div className="px-6 lg:px-8 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Left Section - Sidebar Toggle + Branding */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}
            <button
              onClick={onMenuToggle || (() => setIsSidebarOpen(!isSidebarOpen))}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
              aria-label="Toggle menu"
            >
              <Bars3Icon className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Company Branding */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                A
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold text-gray-900 leading-tight">Ashish Shah and Associates</h1>
              </div>
            </div>
          </div>

          {/* Center Section - Page Title */}
          <div className="hidden lg:flex items-center justify-center flex-1 absolute left-1/2 transform -translate-x-1/2">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Section - Notifications */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 group">
              <BellIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Title Display */}
      <div className="lg:hidden px-6 py-3 border-t border-gray-100 bg-gray-50/50">
        <div className="text-center">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </header>
  );
};

export default DashboardHeader;
