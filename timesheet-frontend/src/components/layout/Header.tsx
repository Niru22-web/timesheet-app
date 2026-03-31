"use client";

import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBell from "../ui/NotificationBell";
import Avatar from "../ui/Avatar";
import { 
  BellIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog8ToothIcon
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path.includes('/admin') || path.includes('/manager') || path.includes('/partner') || path.includes('/employee')) {
      return 'Dashboard Overview';
    } 
    
    // Convert path to title (/leave-management -> Leave Management)
    const segment = path.split('/')[1];
    if (!segment) return title || 'Dashboard';
    
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const pageTitle = getPageTitle();

  if (!user) return null;

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-secondary-100 sticky top-0 z-30 transition-shadow duration-300">
      {/* Left Section - Page Title */}
      <div className="flex flex-col">
        <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight">{pageTitle}</h1>
        {/* Subtitle is removed globally as per requirement, or kept only if explicitly passed and not the branding string */}
        {subtitle && !subtitle.includes("Ashish Shah") && (
          <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-0.5">{subtitle}</span>
        )}
      </div>

      {/* Right Section - Search, Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Global Search shortcut - Visual only for now */}
        <div className="hidden lg:flex items-center gap-2 bg-secondary-100 border border-secondary-200 rounded-full px-4 py-1.5 text-secondary-400 hover:bg-secondary-200 transition-colors cursor-pointer group">
          <MagnifyingGlassIcon className="w-4 h-4 group-hover:text-secondary-600" />
          <span className="text-xs font-medium">Search anything...</span>
          <kbd className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-secondary-300 ml-2">⌘ K</kbd>
        </div>

        {/* Notifications */}
        <div className="relative">
          <NotificationBell />
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-secondary-200 mx-2"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary-100 transition-colors"
            title="Profile menu"
            aria-label="Profile menu"
          >
            <Avatar 
              name={`${user.firstName} ${user.lastName}`} 
              size="sm" 
              border
              src={user.profile?.employeePhotoUrl ? `${import.meta.env.VITE_API_BASE_URL}${user.profile.employeePhotoUrl}` : undefined}
            />
            <ChevronDownIcon className={`w-3 h-3 text-secondary-400 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-elevated border border-secondary-100 p-2 animate-fade-in z-50">
              <div className="px-3 py-3 border-b border-secondary-50 mb-1">
                <p className="text-sm font-bold text-secondary-900">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-secondary-500 font-medium truncate">{user.email || user.officeEmail}</p>
              </div>
              
              <Link 
                to="/profile" 
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-secondary-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                onClick={() => setShowProfileDropdown(false)}
              >
                <UserCircleIcon className="w-5 h-5" />
                <span>My Profile</span>
              </Link>
              
              <Link 
                to="/admin" 
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-secondary-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                onClick={() => setShowProfileDropdown(false)}
              >
                <Cog8ToothIcon className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              
              <div className="my-1 border-t border-secondary-50"></div>
              
              <button 
                onClick={() => {
                  setShowProfileDropdown(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-danger-600 hover:bg-danger-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}