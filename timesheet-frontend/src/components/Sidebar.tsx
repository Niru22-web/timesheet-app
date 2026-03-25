import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
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
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// UI Components
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

interface SidebarProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onCollapse?: () => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = false, 
  isCollapsed = false, 
  onCollapse, 
  onClose 
}) => {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
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
          show: hasPermission('employees', 'canView'),
          badge: null
        },
        {
          name: 'Projects',
          href: '/projects',
          icon: BriefcaseIcon,
          show: hasPermission('projects', 'canView'),
          badge: null
        },
        {
          name: 'Jobs',
          href: '/jobs',
          icon: WrenchScrewdriverIcon,
          show: hasPermission('jobs', 'canView'),
          badge: null
        },
        {
          name: 'Clients',
          href: '/clients',
          icon: BuildingOfficeIcon,
          show: hasPermission('clients', 'canView'),
          badge: null
        }
      ]
    },
    {
      title: 'USER',
      items: [
        {
            name: 'Profile',
            href: '/profile',
            icon: UserCircleIcon,
            show: true,
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
          show: hasPermission('reports', 'canView'),
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
    <aside className={`
      h-full bg-white border-r border-secondary-200 flex flex-col relative
      transition-all duration-300 ease-in-out select-none
      ${isCollapsed && !isMobile ? 'w-20' : 'w-full'}
    `}>
      {/* Sidebar Header */}
      <div className={`
        p-6 border-b border-secondary-100 flex-shrink-0 flex items-center
        ${isCollapsed && !isMobile ? 'justify-center px-2' : 'gap-3'}
      `}>
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-primary-500/20 flex-shrink-0 animate-in zoom-in duration-300">
          A
        </div>
        {!isCollapsed || isMobile ? (
          <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
            <h1 className="text-sm font-black text-secondary-900 leading-tight tracking-tight uppercase">Timesheet</h1>
            <p className="text-[10px] font-bold text-secondary-400 leading-tight uppercase tracking-widest">Enterprise v2.0</p>
          </div>
        ) : null}
      </div>

      {/* Collapse Toggle Button (Desktop only) */}
      {!isMobile && (
        <button
          onClick={onCollapse}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-secondary-200 rounded-full flex items-center justify-center shadow-sm text-secondary-400 hover:text-primary-600 hover:border-primary-200 transition-all z-50 active:scale-90"
        >
          {isCollapsed ? <ChevronRightIcon className="w-3.5 h-3.5" /> : <ChevronLeftIcon className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto no-scrollbar space-y-6">
        {filteredGroups.map((group, groupIndex) => (
          <div key={group.title}>
            {/* Section Label */}
            {(!isCollapsed || isMobile) && (
              <div className="px-3 mb-3">
                <h3 className="text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.2em]">{group.title}</h3>
              </div>
            )}
            {isCollapsed && !isMobile && (
                 <div className="mx-auto w-8 h-px bg-secondary-100 mb-4" />
            )}
            
            {/* Section Items */}
            <div className="space-y-1">
              {group.items.map((item: any) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                        navigate(item.href);
                        if (isMobile && onClose) onClose();
                    }}
                    title={isCollapsed && !isMobile ? item.name : ''}
                    className={`
                      w-full flex items-center rounded-xl transition-all duration-200 group relative
                      ${isCollapsed && !isMobile ? 'justify-center p-3' : 'px-3 py-2.5 gap-3'}
                      ${isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                      }
                    `}
                  >
                    <item.icon className={`
                        flex-shrink-0 transition-transform duration-200 group-active:scale-90
                        ${isCollapsed && !isMobile ? 'w-6 h-6' : 'w-5 h-5'}
                        ${isActive ? 'text-white' : 'text-secondary-400 group-hover:text-secondary-600'}
                    `} />
                    
                    {(!isCollapsed || isMobile) && (
                      <>
                        <span className="font-bold text-sm tracking-tight truncate">{item.name}</span>
                        {item.badge && (
                          <Badge variant="primary" className="ml-auto flex-shrink-0 bg-white/20 text-white border-none text-[10px] py-0.5">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}

                    {/* Active State Indicator */}
                    {isActive && isCollapsed && !isMobile && (
                        <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className={`
        p-4 border-t border-secondary-100 bg-secondary-50/50 flex-shrink-0
        ${isCollapsed && !isMobile ? 'items-center' : ''}
      `}>
        {(!isCollapsed || isMobile) ? (
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-secondary-100 mb-3 group hover:border-primary-200 transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
                <div className="flex items-center gap-3">
                    <Avatar 
                        name={user?.name || 'User'} 
                        size="sm" 
                        src={user?.profile?.employeePhotoUrl ? `${import.meta.env.VITE_API_BASE_URL}${user.profile.employeePhotoUrl}` : undefined}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-secondary-900 truncate tracking-tight">{user?.name || 'Guest User'}</p>
                        <p className="text-[10px] font-bold text-primary-600 truncate uppercase tracking-widest">{user?.role || 'Guest'}</p>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex justify-center mb-3 cursor-pointer" onClick={() => navigate('/profile')}>
                 <Avatar 
                    name={user?.name || 'User'} 
                    size="sm" 
                    src={user?.profile?.employeePhotoUrl ? `${import.meta.env.VITE_API_BASE_URL}${user.profile.employeePhotoUrl}` : undefined}
                />
            </div>
        )}
        
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={handleLogout}
          className={`
            font-bold text-danger-600 hover:bg-danger-50 hover:text-danger-700 hover:border-danger-100 border-secondary-200
            ${isCollapsed && !isMobile ? 'px-0 justify-center' : ''}
          `}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m0 0H9a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2H9a2 2 0 00-2-2z" />
            </svg>
          }
        >
          {(!isCollapsed || isMobile) ? 'Sign Out' : ''}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
