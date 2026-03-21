import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  BellIcon
} from '@heroicons/react/24/outline';

// UI Components
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Logo from '../ui/Logo';

interface MainAppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBreadcrumb?: boolean;
  actions?: React.ReactNode;
}

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  roles?: string[];
  children?: NavigationItem[];
}

const MainAppLayout: React.FC<MainAppLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  showBreadcrumb = true,
  actions
}) => {
  const { user, logout } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Navigation items based on user role
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      href: '/',
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      id: 'timesheet',
      name: 'Timesheet',
      href: '/timesheet',
      icon: <ClockIcon className="h-5 w-5" />,
    },
    {
      id: 'projects',
      name: 'Projects',
      href: '/projects',
      icon: <BriefcaseIcon className="h-5 w-5" />,
      roles: ['admin', 'manager', 'partner'],
    },
    {
      id: 'employees',
      name: 'Employees',
      href: '/employees',
      icon: <UsersIcon className="h-5 w-5" />,
      roles: ['admin', 'manager', 'partner'],
    },
    {
      id: 'clients',
      name: 'Clients',
      href: '/clients',
      icon: <BuildingOfficeIcon className="h-5 w-5" />,
      roles: ['admin', 'partner'],
    },
    {
      id: 'reports',
      name: 'Reports',
      href: '/reports',
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
    {
      id: 'reimbursements',
      name: 'Reimbursements',
      href: '/reimbursements',
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
    },
  ];

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role?.toLowerCase() || '');
  });

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`
        ${isSidebarCollapsed ? 'w-16' : 'w-64'}
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform' : 'relative'}
        ${isMobile && !isMobileSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-all duration-300 ease-in-out
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {!isSidebarCollapsed && (
            <Logo size="sm" variant="text-only" />
          )}
          
          <button
            onClick={() => isMobile ? setIsMobileSidebarOpen(false) : setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`
                w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${isActiveRoute(item.href)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }
                ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}
              `}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </div>
              {!isSidebarCollapsed && item.badge && (
                <Badge variant="primary">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {!isSidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={user?.name ? undefined : undefined}
                  name={user?.name || 'User'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex-1"
                >
                  {themeMode === 'light' ? (
                    <MoonIcon className="h-4 w-4" />
                  ) : (
                    <SunIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Avatar
                src={user?.name ? undefined : undefined}
                name={user?.name || 'User'}
                size="sm"
                className="mx-auto"
              />
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex-1"
                >
                  {themeMode === 'light' ? (
                    <MoonIcon className="h-4 w-4" />
                  ) : (
                    <SunIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Bars3Icon className="h-5 w-5" />
              </Button>
            )}
            
            {(title || subtitle) && (
              <div>
                {title && (
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {actions}
            
            <Button
              variant="ghost"
              size="sm"
              className="relative"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            <div className="hidden md:flex items-center space-x-3">
              <Avatar
                src={user?.name ? undefined : undefined}
                name={user?.name || 'User'}
                size="sm"
              />
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'Employee'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainAppLayout;
