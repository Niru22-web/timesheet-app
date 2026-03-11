import React from 'react';
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
  EnvelopeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// UI Components
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role?.toLowerCase();
  const isManagement = ['manager', 'admin', 'partner', 'owner'].includes(userRole || '');
  const isAdmin = userRole === 'admin';

  const navigation = [
    {
      name: 'Dashboard',
      href: userRole === 'admin' ? '/admin' : userRole === 'manager' ? '/manager' : userRole === 'partner' ? '/partner' : userRole === 'user' || userRole === 'employee' ? '/employee' : '/',
      icon: HomeIcon,
      show: true,
      badge: null
    },
    {
      name: 'Timesheet',
      href: '/timesheet',
      icon: CalendarIcon,
      show: true,
      badge: null
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: UsersIcon,
      show: isAdmin || isManagement,
      badge: null
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: BriefcaseIcon,
      show: isAdmin || isManagement,
      badge: null
    },
    {
      name: 'Jobs',
      href: '/jobs',
      icon: WrenchScrewdriverIcon,
      show: isAdmin || isManagement,
      badge: null
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: BuildingOfficeIcon,
      show: isAdmin || isManagement,
      badge: null
    },
    {
      name: 'Reimbursement',
      href: '/reimbursement',
      icon: CurrencyDollarIcon,
      show: true,
      badge: null
    },
    {
      name: 'Leave Management',
      href: '/leave-management',
      icon: CalendarIcon,
      show: true,
      badge: null
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      show: isAdmin || isManagement,
      badge: null
    },
    {
      name: 'Admin Panel',
      href: '/admin-panel',
      icon: Cog6ToothIcon,
      show: isAdmin,
      badge: 'Admin'
    },
    {
      name: 'Email Configuration',
      href: '/email-configuration',
      icon: EnvelopeIcon,
      show: isAdmin,
      badge: null
    },
    {
      name: 'Email Templates',
      href: '/email-templates',
      icon: DocumentTextIcon,
      show: isAdmin,
      badge: null
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserCircleIcon,
      show: true,
      badge: null
    }
  ].filter(item => item.show);

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        h-full w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:relative lg:translate-x-0 fixed lg:static z-50
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Timesheet System</h1>
              <p className="text-xs text-gray-500">Enterprise Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {navigation.map((item) => {
            const active = isActiveRoute(item.href);
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                  ${active 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
                {active && (
                  <Badge variant="primary" className="ml-auto">
                    Active
                  </Badge>
                )}
                {item.badge && (
                  <Badge variant="danger" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
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
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m0 0H9a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2H9a2 2 0 00-2-2z" />
              </svg>
            }
          >
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
