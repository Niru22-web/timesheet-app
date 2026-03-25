"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { BellIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface MobileHeaderProps {
  isSidebarOpen: boolean;
  onMenuToggle: () => void;
}

export default function MobileHeader({ isSidebarOpen, onMenuToggle }: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path.includes('/admin') || path.includes('/manager') || path.includes('/partner') || path.includes('/employee')) {
      return 'Dashboard';
    } else if (path.includes('/timesheet')) {
      return 'Timesheet';
    } else if (path.includes('/employees')) {
      return 'Employees';
    } else if (path.includes('/projects')) {
      return 'Projects';
    } else if (path.includes('/jobs')) {
      return 'Jobs';
    } else if (path.includes('/clients')) {
      return 'Clients';
    } else if (path.includes('/reimbursement')) {
      return 'Reimbursement';
    } else if (path.includes('/leave-management')) {
      return 'Leave Management';
    } else if (path.includes('/reports')) {
      return 'Reports';
    } else if (path.includes('/profile')) {
      return 'Profile';
    } else if (path.includes('/admin-panel')) {
      return 'Admin Panel';
    } else if (path.includes('/email-configuration')) {
      return 'Email Configuration';
    } else if (path.includes('/email-templates')) {
      return 'Email Templates';
    }
    return 'Dashboard';
  };

  const pageTitle = getPageTitle();

  return (
    <header className="md:hidden flex flex-col bg-white border-b border-secondary-200 sticky top-0 z-40">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2.5 text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-all duration-200 active:scale-95"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">A</div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-secondary-400 hover:text-secondary-900 hover:bg-secondary-50 rounded-xl transition-all group shadow-sm border border-secondary-100 overflow-hidden">
            <BellIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>
      
      {/* Page Title Bar */}
      <div className="px-4 pb-3 border-t border-secondary-50">
        <h1 className="text-lg font-bold text-secondary-900">{pageTitle}</h1>
      </div>
    </header>
  );
}
