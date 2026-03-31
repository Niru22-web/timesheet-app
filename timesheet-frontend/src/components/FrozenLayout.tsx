import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';

interface FrozenLayoutProps {
  children: React.ReactNode;
}

const FrozenLayout: React.FC<FrozenLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const { themeMode } = useTheme();
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
      {/* Mobile Header */}
      <div className={`md:hidden flex items-center justify-between p-4 border-b shadow-sm z-30 transition-colors ${
        isDark
          ? 'bg-[#111827] border-slate-700/60'
          : 'bg-primary-50 border-secondary-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">A</div>
          <span className={`font-bold tracking-tight text-sm ${ isDark ? 'text-slate-200' : 'text-secondary-900' }`}>Timesheet System</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-all duration-200 active:scale-95"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
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
      <div className={`
        flex-1 flex flex-col h-full overflow-hidden min-w-0 transition-all duration-300
      `}>
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <DashboardHeader
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        {/* Scrollable Content Area - Full width available */}
        <main className={`flex-1 overflow-auto transition-colors duration-300 ${
          isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'
        }`}>
          <div className="p-4 sm:p-6 lg:p-8 max-w-none mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FrozenLayout;
