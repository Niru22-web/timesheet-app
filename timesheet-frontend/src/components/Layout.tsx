import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONFIG } from '../config/appConfig';
import Header from './layout/Header';
import MobileHeader from './layout/MobileHeader';
import Avatar from '../components/ui/Avatar';
import NotificationBell from '../components/ui/NotificationBell';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.profile-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false); // Close sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll effect for header shadow
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debug logging
  console.log('Layout render - User:', user);
  console.log('Layout render - User role:', user?.role);
  console.log('Layout render - Current path:', location.pathname);

  const isManagement = ['Manager', 'Admin', 'Partner', 'Owner', 'manager', 'admin', 'partner', 'owner'].includes(user?.role || '');
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const userRole = user?.role?.toLowerCase();

  // Group navigation items into logical sections
  const navigationGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', href: userRole === 'admin' ? '/admin' : userRole === 'manager' ? '/manager' : userRole === 'partner' ? '/partner' : userRole === 'user' || userRole === 'employee' ? '/employee' : '/', icon: HomeIcon, show: true },
        { name: 'Timesheet', href: '/timesheet', icon: CalendarIcon, show: true }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Employees', href: '/employees', icon: UsersIcon, show: isAdmin || isManagement },
        { name: 'Projects', href: '/projects', icon: BriefcaseIcon, show: isAdmin || isManagement },
        { name: 'Jobs', href: '/jobs', icon: WrenchScrewdriverIcon, show: isAdmin || isManagement },
        { name: 'Clients', href: '/clients', icon: BuildingOfficeIcon, show: isAdmin || isManagement }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Reimbursement', href: '/reimbursement', icon: CurrencyDollarIcon, show: true }
      ]
    },
    {
      title: 'HR',
      items: [
        { name: 'Leave Management', href: '/leave-management', icon: ShieldCheckIcon, show: true }
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Reports', href: '/reports', icon: ChartBarIcon, show: isAdmin || isManagement }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { name: 'Admin Panel', href: '/admin-panel', icon: Cog6ToothIcon, show: isAdmin },
        { name: 'User Access Control', href: '/user-access-control', icon: UsersIcon, show: isAdmin },
        { name: 'Email Config', href: '/email-configuration', icon: BellIcon, show: isAdmin },
        { name: 'Email Templates', href: '/email-templates', icon: BellIcon, show: isAdmin }
      ]
    }
  ];

  // Filter items based on user permissions
  const filteredGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.show)
  })).filter(group => group.items.length > 0);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile Header */}
      <MobileHeader 
        isSidebarOpen={isSidebarOpen} 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Position */}
      <aside className={`
        sidebar bg-gradient-to-b from-[#F8FAFC] to-[#EEF2FF] border-r border-[#E2E8F0]/80 transform transition-transform duration-300 ease-in-out z-50
        fixed inset-y-0 left-0 md:relative md:translate-x-0 w-[280px]
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-[#E2E8F0]/80 bg-white/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 flex-shrink-0">
                {APP_CONFIG.COMPANY_NAME.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold text-slate-800 leading-tight truncate">{APP_CONFIG.COMPANY_NAME}</h1>
                <p className="text-[10px] font-semibold text-slate-500 leading-tight uppercase tracking-wider mt-0.5">Timesheet App</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-5 overflow-y-auto custom-scrollbar">
            {filteredGroups.map((group, groupIndex) => (
              <div key={group.title} className={groupIndex > 0 ? 'mt-6' : ''}>
                {/* Section Label */}
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{group.title}</h3>
                </div>
                
                {/* Section Items */}
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group
                          ${isActive
                            ? 'bg-white text-indigo-700 shadow-[0_2px_10px_-3px_rgba(99,102,241,0.15)] ring-1 ring-indigo-100/50'
                            : 'text-slate-500 hover:bg-white/60 hover:text-indigo-600. hover:shadow-sm hover:ring-1 hover:ring-slate-200/50'
                          }
                        `}
                      >
                        <div className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-transparent text-slate-400 group-hover:bg-indigo-50/50 group-hover:text-indigo-500'}`}>
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
                
                {/* Section Divider */}
                {groupIndex < filteredGroups.length - 1 && (
                  <div className="mt-6 border-t border-slate-200"></div>
                )}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#E2E8F0]/80 bg-white/40">
            <div className="flex items-center justify-center p-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{APP_CONFIG.APP_NAME} v1.0</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-0 md:ml-[280px]">
        {/* Header - Fixed Position */}
        <header className={`hidden md:flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl border-b border-indigo-100/60 transition-all duration-300 z-40 fixed top-0 left-[280px] right-0 h-[72px] ${isScrolled ? 'shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]' : ''}`}>
          {/* Left Section - Page Title */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1.5">{APP_CONFIG.COMPANY_NAME}</span>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {(() => {
                  if (location.pathname === '/' || location.pathname.includes('/admin') || location.pathname.includes('/manager') || location.pathname.includes('/partner') || location.pathname.includes('/employee')) return 'Dashboard';
                  if (location.pathname.includes('/timesheet')) return 'Timesheet';
                  if (location.pathname.includes('/employees')) return 'Employees';
                  if (location.pathname.includes('/projects')) return 'Projects';
                  if (location.pathname.includes('/jobs')) return 'Jobs';
                  if (location.pathname.includes('/clients')) return 'Clients';
                  if (location.pathname.includes('/reimbursement')) return 'Reimbursement';
                  if (location.pathname.includes('/leave-management')) return 'Leave Management';
                  if (location.pathname.includes('/reports')) return 'Reports';
                  if (location.pathname.includes('/profile')) return 'Profile';
                  if (location.pathname.includes('/admin-panel')) return 'Admin Panel';
                  if (location.pathname.includes('/email-configuration')) return 'Email Configuration';
                  if (location.pathname.includes('/email-templates')) return 'Email Templates';
                  return 'Dashboard';
                })()}
              </h1>
            </div>
          </div>

          {/* Right Section - Search, Notifications, Profile */}
          <div className="flex items-center gap-5">
            {/* Search Bar - Decorative/SaaS feel */}
            <div className="hidden lg:flex relative group w-[240px]">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-full py-2 pl-10 pr-4 text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 hover:border-slate-300 transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60">
                <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-slate-500 bg-white border border-slate-200 rounded shadow-sm">⌘K</kbd>
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200/80 mx-1 hidden sm:block"></div>

            {/* Notifications */}
            <div className="hover:bg-slate-50 p-1 rounded-full transition-colors cursor-pointer">
              <NotificationBell />
            </div>

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown-container">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full transition-all duration-200 ${isDropdownOpen ? 'bg-indigo-50 ring-1 ring-indigo-200 shadow-sm' : 'bg-white border border-slate-200 shadow-sm hover:shadow hover:border-slate-300'}`}
              >
                <div className="ring-2 ring-white rounded-full"><Avatar name={user?.name || 'User'} size="sm" /></div>
                <div className="hidden md:flex flex-col items-start min-w-[70px]">
                  <span className="text-xs font-bold text-slate-700 leading-none truncate max-w-[90px]">{user?.name || 'Guest'}</span>
                  <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.1em] mt-1 truncate max-w-[90px] leading-none">{user?.role || 'Member'}</span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.officeEmail || user?.email || 'user@example.com'}</p>
                  </div>
                  
                  <button 
                    onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all"
                  >
                    <UserCircleIcon className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-500" />
                    Account Settings
                  </button>
                  
                  <div className="my-1 border-t border-slate-50" />
                  
                  <button 
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                  >
                    <ArrowRightOnRectangleIcon className="w-4.5 h-4.5" />
                    Sign Out Securely
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable Only */}
        <main className="mt-[64px] md:mt-[72px] overflow-y-auto h-[calc(100vh-72px)] bg-[#F8FAFC]">
          <div className="p-6 md:p-8">
            {/* Soft decorative background element */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary-600/[0.03] rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
            <div className="relative z-10 max-w-7xl mx-auto">
              <Outlet />
            </div>

            <footer className="mt-12 md:mt-16 py-6 md:py-8 border-t border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs md:text-sm">A</div>
                <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] italic">{APP_CONFIG.COMPANY_NAME} <span className="mx-1 md:mx-2 opacity-30">/</span> {APP_CONFIG.APP_NAME}</p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8">
                <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 EnterpriseCore Solutions</span>
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-3 h-3 md:w-4 md:h-4 text-slate-300" />
                  <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Session</span>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
