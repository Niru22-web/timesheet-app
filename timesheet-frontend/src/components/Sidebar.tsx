import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { useTheme } from '../contexts/ThemeContext';
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
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';
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
      h-full bg-transparent flex flex-col relative
      transition-all duration-300 ease-in-out select-none
      w-full
    `}>
      {/* Sidebar Header */}
      <div className={`
        h-[72px] flex-shrink-0 w-full relative overflow-hidden border-b
        ${!isMobile ? '' : 'flex items-center px-6 gap-3'}
        ${ isDark ? 'border-slate-700/60' : 'border-blue-100/60' }
      `}>
          {!isMobile ? (
              <div 
              className="absolute inset-0 flex items-center justify-start cursor-pointer group transition-opacity hover:opacity-80 px-4" 
              onClick={() => navigate('/')}
          >
              {/* We render at full size then shrink to bypass browser min-font caps (which normally break layouts >10px) */}
              <div className="flex flex-col items-start w-[240px] origin-left scale-[0.40]">
                  <span className={`text-[64px] font-black leading-[0.8] tracking-wide mb-2 ${ isDark ? 'text-blue-400' : 'text-[#1D54A6]' }`}>ASA</span>
                  <span className={`text-[14px] font-bold uppercase tracking-[0.15em] whitespace-nowrap leading-none ${ isDark ? 'text-slate-500' : 'text-[#A3A3A3]' }`}>Ashish Shah &amp; Associates</span>
                  <div className="flex items-center gap-2.5 w-full mt-2">
                      <div className={`h-[3px] w-[50px] opacity-90 ${ isDark ? 'bg-slate-600' : 'bg-[#A3A3A3]' }`}></div>
                      <span className={`text-[12px] font-bold uppercase tracking-[0.16em] leading-none whitespace-nowrap ${ isDark ? 'text-blue-400' : 'text-[#1D54A6]' }`}>Delivering Value</span>
                  </div>
              </div>
          </div>
          ) : (
            <>
              <div className="flex flex-col items-start justify-center cursor-pointer group transition-all" onClick={() => navigate('/')}>
                  <span className="text-2xl font-black text-[#607D9B] leading-[0.8] tracking-tighter mix-blend-multiply">ASA</span>
                  <span className="text-[6px] font-bold text-gray-500 mt-1 uppercase tracking-[0.1em] whitespace-nowrap leading-none">Ashish Shah & Associates</span>
              </div>
              <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300 ml-2">
                <h1 className="text-sm font-bold text-slate-800 leading-tight tracking-tight uppercase">Timesheet</h1>
                <p className="text-[10px] font-semibold text-slate-500 leading-tight uppercase tracking-widest mt-0.5">Enterprise v2.0</p>
              </div>
            </>
          )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto custom-scrollbar ${!isMobile ? 'px-2 py-4 space-y-4' : 'px-3 py-6 space-y-6'}`}>
        {filteredGroups.map((group, groupIndex) => (
          <div key={group.title}>
            {/* Section Label */}
            {!isMobile ? (
              groupIndex !== 0 && <div className={`mx-auto w-6 h-[1.5px] my-3 ${ isDark ? 'bg-slate-700' : 'bg-[#1D54A6]/10' }`} />
          ) : (
              <div className="px-3 mb-3">
                <h3 className={`text-[10px] font-bold uppercase tracking-widest ${ isDark ? 'text-slate-600' : 'text-slate-400' }`}>{group.title}</h3>
              </div>
          )}
            
            {/* Section Items */}
            <div className={`${!isMobile ? 'space-y-1.5' : 'space-y-1.5'}`}>
              {group.items.map((item: any) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                        navigate(item.href);
                        if (isMobile && onClose) onClose();
                    }}
                    title={!isMobile ? item.name : ''}
                    aria-label={item.name}
                    className={`
                      w-full transition-all duration-300 group relative flex 
                      ${!isMobile ? 'flex-col items-center justify-center px-1.5 py-2.5 rounded-[12px] gap-1.5' : 'flex-row items-center px-3 py-2.5 rounded-xl gap-3'}
                      ${isActive
                        ? isDark
                          ? 'bg-slate-700/80 text-blue-400 shadow-[0_2px_10px_-2px_rgba(59,130,246,0.2)] ring-1 ring-blue-500/20'
                          : 'bg-white text-[#1D54A6] shadow-[0_2px_10px_-2px_rgba(29,84,166,0.15)] ring-1 ring-[#1D54A6]/10'
                        : isDark
                          ? 'text-slate-500 hover:bg-slate-700/40 hover:text-slate-100'
                          : 'text-slate-500 hover:bg-[#1D54A6]/5 hover:text-[#1D54A6]'
                      }
                    `}
                  >
                    <div className={`
                        flex-shrink-0 flex items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 group-active:scale-95
                        ${!isMobile ? '' : 'p-1.5'}
                        ${isActive
                          ? isDark
                            ? (isMobile ? 'bg-blue-900/40 text-blue-400' : 'text-blue-400')
                            : (isMobile ? 'bg-blue-50 text-[#1D54A6]' : 'text-[#1D54A6]')
                          : isDark
                            ? 'text-slate-500 group-hover:text-slate-100 bg-transparent'
                            : 'text-slate-400 group-hover:text-[#1D54A6] bg-transparent'
                        }
                    `}>
                        <item.icon className={`${!isMobile ? 'w-[22px] h-[22px] stroke-[1.5]' : 'w-5 h-5'}`} />
                    </div>
                    
                    {/* Label */}
                    <span className={`
                         tracking-tight flex-1
                         ${!isMobile ? 'font-semibold text-center leading-[1.15] mx-auto px-0.5 whitespace-normal w-full text-[11px]' : 'font-semibold text-sm text-left truncate'}
                    `}>
                      {item.name}
                    </span>
                    
                    {item.badge && (
                      <span className={`
                        flex-shrink-0 font-bold py-[2px] px-[6px] rounded-md absolute -top-1.5 -right-1 z-10
                        ${!isMobile
                          ? isDark
                            ? 'bg-blue-600 text-white text-[8px] shadow-sm ring-2 ring-[#111827]'
                            : 'bg-[#1D54A6] text-white text-[8px] shadow-sm ring-2 ring-[#f0f4f8]'
                          : 'ml-auto bg-blue-50 text-blue-700 border border-blue-100 text-[9px]'
                        }
                      `}>
                        {item.badge}
                      </span>
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
        flex-shrink-0 border-t
        ${!isMobile ? 'p-3 flex flex-col items-center justify-center space-y-3 bg-transparent' : 'p-4'}
        ${ isDark ? 'border-slate-700/60' : 'border-blue-100/60' }
      `}>
        {isMobile ? (
                      <div className={`rounded-2xl p-2.5 shadow-sm border mb-3 group hover:shadow transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/60 hover:border-slate-600'
                : 'bg-white/80 border-blue-50 hover:border-blue-100'
            }`} onClick={() => navigate('/profile')}>
              <div className="flex items-center gap-3">
                  <Avatar 
                      name={user?.name || 'User'} 
                      size="sm" 
                      src={user?.profile?.employeePhotoUrl ? `${import.meta.env.VITE_API_BASE_URL}${user.profile.employeePhotoUrl}` : undefined}
                  />
                  <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate tracking-tight ${ isDark ? 'text-slate-200' : 'text-slate-700' }`}>{user?.name || 'Guest User'}</p>
                      <p className="text-[10px] font-bold text-blue-500 truncate uppercase tracking-widest">{user?.role || 'Guest'}</p>
                  </div>
              </div>
          </div>
        ) : (
            <div className="flex flex-col items-center justify-center cursor-pointer group w-full pt-1" onClick={() => navigate('/profile')}>
                 <div className="ring-2 ring-transparent group-hover:ring-blue-200 rounded-full transition-all group-hover:scale-105 mb-1.5">
                   <Avatar 
                      name={user?.name || 'User'} 
                      size="sm" 
                      src={user?.profile?.employeePhotoUrl ? `${import.meta.env.VITE_API_BASE_URL}${user.profile.employeePhotoUrl}` : undefined}
                  />
                 </div>
                 <span className={`text-[11px] font-semibold truncate max-w-[85px] leading-tight text-center ${ isDark ? 'text-slate-400' : 'text-slate-600' }`}>{user?.name || 'User'}</span>
            </div>
        )}
        
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={handleLogout}
          title="Sign Out"
          aria-label="Sign Out"
          className={`
            font-semibold text-slate-500 hover:bg-white hover:text-red-600 hover:border-transparent hover:shadow-sm border-transparent shadow-none group transition-all duration-200
            ${!isMobile ? 'p-2 rounded-[12px] flex flex-col justify-center items-center h-auto gap-1' : ''}
          `}
        >
          {isMobile ? (
             <div className="flex items-center justify-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m0 0H9a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2H9a2 2 0 00-2-2z" /></svg>
                 Sign Out
             </div>
          ) : (
             <>
                 <svg className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m0 0H9a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2H9a2 2 0 00-2-2z" /></svg>
                 <span className="text-[10px] hidden group-hover:block transition-all mt-0.5 text-red-500">Sign Out</span>
             </>
          )}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
