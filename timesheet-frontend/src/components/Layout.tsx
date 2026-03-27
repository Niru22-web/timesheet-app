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
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { APP_CONFIG } from '../config/appConfig';
import Header from './layout/Header';
import MobileHeader from './layout/MobileHeader';
import Avatar from '../components/ui/Avatar';
import NotificationBell from '../components/ui/NotificationBell';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
          className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Position */}
      <aside className={`
        sidebar bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out z-50
        fixed inset-y-0 left-0 md:relative md:translate-x-0 w-64
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-semibold text-slate-900 leading-tight">Timesheet System</h1>
                <p className="text-xs text-slate-500 leading-tight">Enterprise Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            {filteredGroups.map((group, groupIndex) => (
              <div key={group.title} className={groupIndex > 0 ? 'mt-6' : ''}>
                {/* Section Label */}
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{group.title}</h3>
                </div>
                
                {/* Section Items */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                          ${isActive
                            ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }
                        `}
                      >
                        <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="truncate font-medium">{item.name}</span>
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

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="bg-slate-50 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-3">
                <Avatar name={user?.name || 'User'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'Guest User'}</p>
                  <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'Guest'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
              >
                <UserCircleIcon className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64">
        {/* Header - Fixed Position */}
        <header className={`hidden md:flex items-center justify-between px-6 bg-white border-b border-slate-200 transition-shadow z-50 fixed top-0 left-64 right-0 h-16 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
          {/* Left Section - Page Title */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">
              {location.pathname === '/' || location.pathname.includes('/admin') || location.pathname.includes('/manager') || location.pathname.includes('/partner') || location.pathname.includes('/employee') 
                ? 'Dashboard' 
                : location.pathname.includes('/timesheet') 
                  ? 'Timesheet' 
                  : location.pathname.includes('/employees') 
                    ? 'Employees' 
                    : location.pathname.includes('/projects') 
                      ? 'Projects' 
                      : location.pathname.includes('/jobs') 
                        ? 'Jobs' 
                        : location.pathname.includes('/clients') 
                          ? 'Clients' 
                          : location.pathname.includes('/reimbursement') 
                            ? 'Reimbursement' 
                            : location.pathname.includes('/leave-management') 
                              ? 'Leave Management' 
                              : location.pathname.includes('/reports') 
                                ? 'Reports' 
                                : location.pathname.includes('/profile') 
                                  ? 'Profile' 
                                  : location.pathname.includes('/admin-panel') 
                                    ? 'Admin Panel' 
                                    : location.pathname.includes('/email-configuration') 
                                      ? 'Email Configuration' 
                                      : location.pathname.includes('/email-templates') 
                                        ? 'Email Templates' 
                                        : 'Dashboard'
              }
            </h1>
          </div>

          {/* Right Section - Notifications Only */}
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <NotificationBell />
          </div>
        </header>

        {/* Page Content - Scrollable Only */}
        <main className="mt-16 md:mt-16 overflow-y-auto h-[calc(100vh-64px)] bg-slate-50">
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
