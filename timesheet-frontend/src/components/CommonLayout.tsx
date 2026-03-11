import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// UI Components
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface CommonLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const CommonLayout: React.FC<CommonLayoutProps> = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userRole = user?.role?.toLowerCase();
  const isManagement = ['manager', 'admin', 'partner', 'owner'].includes(userRole || '');
  const isAdmin = userRole === 'admin';

  const navigation = [
    {
      name: 'Dashboard',
      href: userRole === 'admin' ? '/admin' : userRole === 'manager' ? '/manager' : userRole === 'partner' ? '/partner' : userRole === 'user' || userRole === 'employee' ? '/employee' : '/',
      icon: HomeIcon,
      show: true
    },
    {
      name: 'Timesheet',
      href: '/timesheet',
      icon: CalendarIcon,
      show: true
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: UsersIcon,
      show: isAdmin || isManagement
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: BriefcaseIcon,
      show: isAdmin || isManagement
    },
    {
      name: 'Jobs',
      href: '/jobs',
      icon: WrenchScrewdriverIcon,
      show: isAdmin || isManagement
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: BuildingOfficeIcon,
      show: isAdmin || isManagement
    },
    {
      name: 'Reimbursement',
      href: '/reimbursement',
      icon: CurrencyDollarIcon,
      show: true
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      show: isAdmin || isManagement
    },
    {
      name: 'Admin Panel',
      href: '/admin-panel',
      icon: Cog6ToothIcon,
      show: isAdmin
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserCircleIcon,
      show: true
    }
  ].filter(item => item.show);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Timesheet System</h1>
              <p className="text-xs text-gray-500">Enterprise Management</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const active = isActiveRoute(item.href);
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${active 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
                {active && (
                  <Badge variant="primary" className="ml-auto">
                    Active
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={handleLogout}
            leftIcon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Bars3Icon className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title || 'Dashboard'}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              </div>
              <Avatar name={user?.name || 'User'} size="md" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommonLayout;
