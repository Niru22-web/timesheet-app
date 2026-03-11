import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex">
      {/* Fixed Sidebar - Reduced width */}
      <div className="h-full w-64 flex-shrink-0">
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
            title={title}
            subtitle={subtitle}
            user={user}
            onLogout={handleLogout}
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

export default DashboardLayout;
