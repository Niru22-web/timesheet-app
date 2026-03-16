import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';

interface FrozenLayoutProps {
  children: React.ReactNode;
}

const FrozenLayout: React.FC<FrozenLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

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

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-secondary-200 shadow-sm z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">A</div>
          <span className="font-bold text-secondary-900 tracking-tight text-sm">Timesheet System</span>
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

      {/* Fixed Sidebar - Responsive width */}
      <div className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-secondary-200 transform transition-all duration-300 ease-in-out z-50
        md:relative md:translate-x-0 md:w-64 md:h-full md:flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        ${isMobile ? 'w-80' : 'md:w-64'}
      `}>
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area - Gets remaining space */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <DashboardHeader
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        {/* Scrollable Content Area - Full width available */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8 max-w-none mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FrozenLayout;
