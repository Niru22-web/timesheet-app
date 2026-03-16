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
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const userRole = user?.role?.toLowerCase();
  const isManagement = ['manager', 'admin', 'partner', 'owner'].includes(userRole || '');
  const isAdmin = userRole === 'admin';

  // Group navigation items into logical sections
  const navigationGroups = [
    {
      title: 'MAIN',
      items: [
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
        }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
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
        }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        {
          name: 'Reimbursement',
          href: '/reimbursement',
          icon: CurrencyDollarIcon,
          show: true,
          badge: null
        }
      ]
    },
    {
      title: 'HR',
      items: [
        {
          name: 'Leave Management',
          href: '/leave-management',
          icon: CalendarIcon,
          show: true,
          badge: null
        }
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        {
          name: 'Reports',
          href: '/reports',
          icon: ChartBarIcon,
          show: isAdmin || isManagement,
          badge: null
        }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        {
          name: 'Admin Panel',
          href: '/admin-panel',
          icon: Cog6ToothIcon,
          show: isAdmin,
          badge: 'Admin'
        },
        {
          name: 'User Access Control',
          href: '/admin/user-access',
          icon: UsersIcon,
          show: isAdmin,
          badge: null
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
        }
      ]
    }
  ];

  // Filter items based on user permissions
  const filteredGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.show)
  })).filter(group => group.items.length > 0);

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
        h-full w-[250px] bg-slate-50 border-r border-slate-200 flex flex-col
        transform transition-all duration-300 ease-in-out
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
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
                {group.items.map((item: any) => {
                  const isActive = isActiveRoute(item.href);
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.href)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group
                        ${isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }
                      `}
                    >
                      <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="font-medium truncate">{item.name}</span>
                      {item.badge && (
                        <Badge variant="primary" className="ml-auto flex-shrink-0">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
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
        <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <div className="bg-slate-50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name || 'User'} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'Guest User'}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'Guest'}</p>
              </div>
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
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
