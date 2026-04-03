import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import BottomNavBar from './BottomNavBar';
import Avatar from './ui/Avatar';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface FrozenLayoutProps {
  children: React.ReactNode;
}

const FrozenLayout: React.FC<FrozenLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const { themeMode } = useTheme();
  const { user } = useAuth();
  const isDark = themeMode === 'dark';

  // Persist collapse state
  React.useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row">
      {/* Mobile Header - Only show hamburger + branding on mobile */}
      <div className={`md:hidden flex items-center justify-between px-4 h-[60px] border-b shadow-sm z-30 transition-colors flex-shrink-0 sticky top-0 ${
        isDark
          ? 'bg-[#111827]/95 border-slate-700/60 backdrop-blur-md'
          : 'bg-white/95 border-slate-200/60 backdrop-blur-md'
      }`}>
        {/* Left: Branding */}
        <div className="flex items-center gap-2.5" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm text-sm">A</div>
          <div className="flex flex-col">
            <span className={`font-extrabold tracking-tight text-xs leading-tight ${ isDark ? 'text-slate-200' : 'text-slate-800' }`}>ASA</span>
            <span className={`text-[8px] font-medium leading-none ${ isDark ? 'text-slate-500' : 'text-slate-400' }`}>Timesheet</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Notification Bell (Visual only for now, or trigger sidebar/drawer) */}
          <button 
            className={`p-2 rounded-xl transition-all ${isDark ? 'text-slate-400 hover:bg-slate-700/60' : 'text-slate-500 hover:bg-slate-100'}`}
            aria-label="Notifications"
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
            </div>
          </button>

          {/* Profile Icon */}
          <button 
            onClick={() => window.location.href = '/profile'}
            className={`p-1 rounded-full transition-all ${isDark ? 'hover:bg-slate-700/60' : 'hover:bg-slate-100'}`}
            aria-label="Profile"
          >
            <Avatar 
                name={user?.name || 'User'} 
                size="xs" 
                src={user?.profile?.employeePhotoUrl ? `${import.meta.env.VITE_API_BASE_URL}${user.profile.employeePhotoUrl}` : undefined}
            />
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl transition-all duration-200 active:scale-95 ${
              isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay - Full screen dimmer on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar - Responsive width and collapse */}
      <div className={`
        fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out z-50
        md:relative md:translate-x-0 md:h-full md:flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl w-[280px]' : !isMobile ? 'translate-x-0 w-[128px]' : '-translate-x-full w-[280px]'}
        ${ isDark ? 'bg-[#111827] border-r border-slate-700/60' : 'bg-blue-50/90 border-r border-blue-100' }
      `}>
        <Sidebar 
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area - Gets remaining space */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 transition-all duration-300">
        {/* Fixed Header - Desktop only (mobile gets its own header above) */}
        <div className="flex-shrink-0">
          <DashboardHeader
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        {/* Scrollable Content Area */}
        <main className={`flex-1 overflow-auto transition-colors duration-300 ${
          isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'
        }`}>
          {/* Add bottom padding on mobile for bottom nav bar */}
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-none mx-auto w-full pb-[80px] md:pb-6 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation Bar - Mobile only */}
      <BottomNavBar onMorePress={() => setIsSidebarOpen(!isSidebarOpen)} />
    </div>
  );
};

export default FrozenLayout;
