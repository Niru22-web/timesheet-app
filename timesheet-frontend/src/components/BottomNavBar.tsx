import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import {
  HomeIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
} from '@heroicons/react/24/solid';

interface BottomNavBarProps {
  onMorePress?: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onMorePress }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const { state: { unreadCount } } = useNotifications();

  const userRole = user?.role?.toLowerCase();

  const dashboardPath = userRole === 'admin' ? '/admin'
    : userRole === 'manager' ? '/manager'
    : userRole === 'partner' ? '/partner'
    : '/employee';

  const tabs = [
    {
      name: 'Home',
      path: dashboardPath,
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      matchPaths: ['/admin', '/manager', '/partner', '/employee'],
    },
    {
      name: 'Timesheet',
      path: '/timesheet',
      icon: CalendarIcon,
      activeIcon: CalendarIconSolid,
      matchPaths: ['/timesheet'],
    },
    {
      name: 'Leaves',
      path: '/leave-management',
      icon: ClipboardDocumentListIcon,
      activeIcon: ClipboardDocumentListIconSolid,
      matchPaths: ['/leave-management'],
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserCircleIcon,
      activeIcon: UserCircleIconSolid,
      matchPaths: ['/profile'],
    },
    {
      name: 'More',
      path: '#more',
      icon: Squares2X2Icon,
      activeIcon: Squares2X2IconSolid,
      matchPaths: [],
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const isActive = (matchPaths: string[]) => {
    return matchPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
  };

  const handleTabPress = (tab: typeof tabs[0]) => {
    if (tab.path === '#more') {
      onMorePress?.();
      return;
    }
    navigate(tab.path);
  };

  return (
    <nav
      className={`
        md:hidden fixed bottom-0 left-0 right-0 z-50
        border-t backdrop-blur-xl
        transition-colors duration-300
        ${isDark
          ? 'bg-[#0F172A]/95 border-slate-700/60'
          : 'bg-white/95 border-slate-200/80'
        }
      `}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-1 h-[60px]">
        {tabs.map((tab) => {
          const active = isActive(tab.matchPaths);
          const Icon = active ? tab.activeIcon : tab.icon;

          return (
            <button
              key={tab.name}
              role="tab"
              aria-selected={active}
              aria-label={tab.name}
              onClick={() => handleTabPress(tab)}
              className={`
                relative flex flex-col items-center justify-center gap-0.5
                w-full h-full
                transition-all duration-200 active:scale-90
                ${active
                  ? isDark ? 'text-blue-400' : 'text-blue-600'
                  : isDark ? 'text-slate-500' : 'text-slate-400'
                }
              `}
            >
              {/* Active indicator pill */}
              {active && (
                <div
                  className={`absolute -top-[1px] w-8 h-[3px] rounded-full
                    ${isDark ? 'bg-blue-400' : 'bg-blue-600'}
                  `}
                />
              )}

              <div className="relative">
                <Icon className={`w-[22px] h-[22px] transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                {/* Notification badge */}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-black text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold leading-none tracking-tight ${active ? 'font-extrabold' : ''}`}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
