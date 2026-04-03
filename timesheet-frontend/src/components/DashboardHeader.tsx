import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONFIG } from '../config/appConfig';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  BellIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  CheckIcon
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
  const { themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === 'dark';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { state: { notifications, unreadCount }, markAsRead, markAllAsRead } = useNotifications();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hrs ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) markAsRead(notif.id);
    setIsNotificationOpen(false);
    if (notif.actionUrl) {
      if (notif.actionUrl.startsWith('/')) {
         navigate(notif.actionUrl);
      } else {
         window.location.href = notif.actionUrl;
      }
    }
  };

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-xl select-none transition-all duration-300 ${
      isDark
        ? 'bg-[#0F172A]/95 border-b border-slate-700/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.3)]'
        : 'bg-blue-50/80 border-b border-blue-100/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]'
    } hidden md:block`}>
      {/* Header is hidden on mobile since FrozenLayout renders a separate mobile header */}
      <div className="px-4 md:px-6 lg:px-8 h-[72px]">
        <div className="flex items-center justify-between h-full">
          
          {/* Left Section - Branding + Search */}
          <div className="flex items-center gap-4 md:gap-6 flex-1">
            {/* Breadcrumb / Title */}
            <div className="hidden md:flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>{APP_CONFIG.COMPANY_NAME}</span>
                <h2 className={`text-lg font-bold tracking-tight leading-none ${isDark ? 'text-slate-100' : 'bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'}`}>{title}</h2>
            </div>

            {/* Global Search Bar */}
            <div className="hidden md:flex relative group max-w-sm w-full ml-4">
                <MagnifyingGlassIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-blue-500 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input 
                    type="text" 
                    placeholder="Quick search commands..." 
                    className={`w-full border rounded-full py-2 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm ${
                      isDark
                        ? 'bg-slate-800/80 border-slate-700/60 placeholder:text-slate-500 text-slate-200 hover:border-slate-600 focus:bg-slate-800'
                        : 'bg-white/80 border-blue-200/50 placeholder:text-slate-400 text-slate-700 hover:border-blue-300 focus:bg-white'
                    }`}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 opacity-60">
                    <kbd className={`px-1.5 py-0.5 text-[9px] font-bold rounded shadow-sm border ${
                      isDark ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-slate-500 bg-white border-slate-200'
                    }`}>⌘</kbd>
                    <kbd className={`px-1.5 py-0.5 text-[9px] font-bold rounded shadow-sm border ${
                      isDark ? 'text-slate-400 bg-slate-700 border-slate-600' : 'text-slate-500 bg-white border-slate-200'
                    }`}>K</kbd>
                </div>
            </div>
          </div>

          {/* Right Section - User Profile / Notifications */}
          <div className="flex items-center gap-3 md:gap-5">
            
            {/* Notifications Button */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                title="Notifications"
                aria-label="View notifications"
                className={`relative p-2 rounded-full transition-all duration-200 group active:scale-95 ${
                  isNotificationOpen
                    ? isDark ? 'bg-slate-700 text-blue-400' : 'bg-blue-100 text-blue-700'
                    : isDark ? 'hover:bg-slate-700/60 text-slate-400' : 'hover:bg-blue-100/50 text-slate-500'
                }`}
              >
                <BellIcon className={`w-5 h-5 ${
                  isNotificationOpen
                    ? isDark ? 'text-blue-400' : 'text-blue-700'
                    : isDark ? 'group-hover:text-blue-400' : 'group-hover:text-blue-600'
                }`} />
                {unreadCount > 0 && (
                  <span className={`absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 animate-pulse ${
                    isDark ? 'border-slate-800' : 'border-white'
                  }`}></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationOpen && (
                 <div className={`absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50 overflow-hidden flex flex-col max-h-[70vh] border transition-colors max-w-[calc(100vw-1rem)] ${
                   isDark ? 'bg-[#1E293B] border-slate-700/60' : 'bg-white border-slate-100'
                 }`}>
                    <div className={`px-4 py-3 border-b flex items-center justify-between sticky top-0 backdrop-blur-sm z-10 ${
                      isDark ? 'border-slate-700/60 bg-[#1E293B]/90' : 'border-blue-50 bg-white/90'
                    }`}>
                       <h3 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Notifications</h3>
                       {unreadCount > 0 && (
                          <button 
                             onClick={() => markAllAsRead()}
                             className={`text-xs font-bold transition-colors flex items-center gap-1 ${
                               isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                             }`}
                          >
                             <CheckIcon className="w-3 h-3" /> Mark all read
                          </button>
                       )}
                    </div>

                    <div className={`overflow-y-auto custom-scrollbar flex-1 divide-y ${
                      isDark ? 'divide-slate-700/40' : 'divide-blue-50'
                    }`}>
                       {notifications.length > 0 ? (
                          notifications.slice(0, 10).map((notif) => (
                             <div 
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-4 transition-colors cursor-pointer relative group ${
                                  !notif.isRead
                                    ? isDark ? 'bg-blue-900/10' : 'bg-blue-50/30'
                                    : ''
                                } ${isDark ? 'hover:bg-slate-700/40' : 'hover:bg-blue-50/50'}`}
                             >
                                {!notif.isRead && (
                                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                )}
                                <div className="pr-4">
                                   <p className={`text-sm tracking-tight ${
                                     !notif.isRead
                                       ? isDark ? 'font-bold text-slate-100' : 'font-bold text-slate-900'
                                       : isDark ? 'font-medium text-slate-400' : 'font-medium text-slate-600'
                                   }`}>
                                      {notif.message}
                                   </p>
                                   <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest leading-none ${
                                     isDark ? 'text-slate-600' : 'text-slate-400'
                                   }`}>
                                      {formatTimeAgo(notif.createdAt)}
                                   </p>
                                </div>
                             </div>
                          ))
                       ) : (
                          <div className="py-12 px-4 text-center">
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                               isDark ? 'bg-slate-700/60' : 'bg-secondary-50'
                             }`}>
                                <BellIcon className={`w-6 h-6 ${isDark ? 'text-slate-500' : 'text-secondary-300'}`} />
                             </div>
                             <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-secondary-900'}`}>All caught up!</p>
                             <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-secondary-500'}`}>Check back later for new notifications.</p>
                          </div>
                       )}
                    </div>
                    {notifications.length > 0 && (
                      <div className={`p-3 border-t ${
                        isDark ? 'border-slate-700/60 bg-slate-800/30' : 'border-secondary-50 bg-secondary-50/30'
                      }`}>
                        <button className={`w-full py-2 text-xs font-bold transition-colors text-center ${
                          isDark ? 'text-slate-400 hover:text-slate-200' : 'text-secondary-600 hover:text-secondary-900'
                        }`}>
                           View All Notifications
                        </button>
                      </div>
                    )}
                 </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative profile-dropdown-container" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    title="User Profile"
                    aria-label="Open user menu"
                    className={`
                        flex items-center gap-2 pl-1.5 pr-2 md:pr-3 py-1.5 rounded-full transition-all duration-200 active:scale-[0.98]
                        ${isDropdownOpen
                          ? isDark ? 'bg-slate-700 ring-1 ring-slate-500 shadow-sm' : 'bg-blue-100 ring-1 ring-blue-300 shadow-sm'
                          : isDark ? 'bg-slate-800 border border-slate-700/60 shadow-sm hover:shadow hover:border-slate-600' : 'bg-white border border-blue-200/60 shadow-sm hover:shadow hover:border-blue-300'
                        }
                    `}
                >
                    <div className="ring-2 ring-white rounded-full">
                       <Avatar 
                           name={user?.name || 'User'} 
                           size="sm" 
                           src={user?.profile?.employeePhotoUrl ? `${import.meta.env.VITE_API_BASE_URL}${user.profile.employeePhotoUrl}` : undefined}
                       />
                    </div>
                     <div className="hidden sm:flex flex-col items-start min-w-[70px]">
                         <span className={`text-xs font-bold leading-none truncate max-w-[90px] text-left ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{user?.name || 'Guest'}</span>
                         <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider mt-1 leading-none">{user?.role || 'Member'}</span>
                     </div>
                     <ChevronDownIcon className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-200 ml-0.5 hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] p-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-50 overflow-hidden border transition-colors ${
                      isDark ? 'bg-[#1E293B] border-slate-700/60' : 'bg-white border-slate-100'
                    }`}>
                        {/* User Info Header */}
                        <div className={`px-3 py-2.5 border-b mb-1 ${
                          isDark ? 'border-slate-700/60' : 'border-blue-50'
                        }`}>
                            <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5 ${
                              isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}>Signed in as</p>
                            <p className={`text-xs font-bold truncate ${
                              isDark ? 'text-slate-200' : 'text-slate-800'
                            }`}>{user?.officeEmail || user?.email}</p>
                        </div>
                        
                        {/* Account Settings */}
                        <button 
                            onClick={() => {
                                setIsDropdownOpen(false);
                                navigate('/profile');
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border border-transparent ${
                              isDark
                                ? 'text-slate-300 hover:bg-slate-700/60 hover:text-blue-400'
                                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                        >
                            <UserCircleIcon className={`w-[18px] h-[18px] ${
                              isDark ? 'text-slate-500' : 'text-slate-400'
                            }`} />
                            Account Settings
                        </button>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border border-transparent ${
                              isDark
                                ? 'text-slate-300 hover:bg-slate-700/60'
                                : 'text-slate-600 hover:bg-blue-50'
                            }`}
                        >
                            <span className="text-base leading-none" aria-hidden>
                              {isDark ? '☀️' : '🌙'}
                            </span>
                            <span className="flex-1 text-left">
                              {isDark ? 'Light Mode' : 'Dark Mode'}
                            </span>
                            {/* Animated toggle switch */}
                            <span
                              className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-300 flex-shrink-0 ${
                                isDark ? 'bg-blue-600' : 'bg-slate-200'
                              }`}
                              aria-hidden
                            >
                              <span
                                className={`absolute left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                  isDark ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </span>
                        </button>
                        
                        <div className={`my-1 border-t ${
                          isDark ? 'border-slate-700/60' : 'border-blue-50'
                        }`} />
                        
                        {/* Sign Out */}
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all border border-transparent"
                        >
                            <ArrowRightOnRectangleIcon className="w-[18px] h-[18px]" />
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
