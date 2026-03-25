import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONFIG } from '../config/appConfig';
import {
  BellIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// UI Components
import Avatar from '../components/ui/Avatar';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title = 'Overview', 
  subtitle, 
  onMenuToggle
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 border-b border-secondary-100 backdrop-blur-xl h-18 select-none">
      <div className="px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Left Section - Mobile Toggle + Branding + Search */}
          <div className="flex items-center gap-6 flex-1">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl hover:bg-secondary-100/50 text-secondary-600 transition-all active:scale-95"
              aria-label="Toggle menu"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="hidden lg:flex flex-col">
                <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] leading-none mb-1">{APP_CONFIG.COMPANY_NAME}</span>
                <h2 className="text-lg font-black text-secondary-900 tracking-tight leading-none">{title}</h2>
            </div>

            {/* Global Search Bar (Optional but included for SaaS look) */}
            <div className="hidden md:flex relative group max-w-sm w-full ml-4">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Quick search commands..." 
                    className="w-full bg-secondary-50/50 border border-secondary-100 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 hover:border-secondary-200 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-secondary-400 bg-white border border-secondary-200 rounded shadow-sm">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-secondary-400 bg-white border border-secondary-200 rounded shadow-sm">K</kbd>
                </div>
            </div>
          </div>

          {/* Right Section - User Profile / Notifications */}
          <div className="flex items-center gap-4">
            
            {/* Notifications Button */}
            <button className="relative p-2.5 rounded-xl hover:bg-secondary-50 text-secondary-500 transition-all duration-200 group active:scale-95">
              <BellIcon className="w-5 h-5 group-hover:text-secondary-900" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-600 rounded-full border-2 border-white ring-2 ring-primary-100 ring-offset-0 animate-pulse"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`
                        flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all duration-200 active:scale-[0.98]
                        ${isDropdownOpen ? 'bg-secondary-100/50 ring-1 ring-secondary-200' : 'hover:bg-secondary-50'}
                    `}
                >
                    <Avatar 
                        name={user?.name || 'User'} 
                        size="sm" 
                        src={user?.profile?.employeePhotoUrl ? `${import.meta.env.VITE_API_BASE_URL}${user.profile.employeePhotoUrl}` : undefined}
                    />
                    <div className="hidden sm:flex flex-col items-start min-w-[100px]">
                        <span className="text-xs font-black text-secondary-900 leading-none truncate w-24 text-left">{user?.name || 'Guest'}</span>
                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-0.5">{user?.role || 'Member'}</span>
                    </div>
                    <ChevronDownIcon className={`w-3.5 h-3.5 text-secondary-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-secondary-100 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50 overflow-hidden">
                        <div className="px-3 py-2 border-b border-secondary-50 mb-1">
                            <p className="text-[10px] font-extrabold text-secondary-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                            <p className="text-xs font-black text-secondary-900 truncate">{user?.officeEmail || user?.email}</p>
                        </div>
                        
                        <button 
                            onClick={() => {
                                setIsDropdownOpen(false);
                                navigate('/profile');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-all border border-transparent hover:border-secondary-100"
                        >
                            <UserCircleIcon className="w-5 h-5 text-secondary-400" />
                            Account Settings
                        </button>
                        
                        <div className="my-1 border-t border-secondary-50" />
                        
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-danger-600 hover:bg-danger-50 transition-all border border-transparent hover:border-danger-100"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            Sign Out Securely
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
