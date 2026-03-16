"use client";

import { useLocation } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
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
    return title || 'Dashboard';
  };

  const pageTitle = getPageTitle();

  return (
    <header className="hidden md:flex flex-none items-center justify-between px-10 h-20 bg-white border-b border-secondary-100">
      {/* Left Section - Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-secondary-900">{pageTitle}</h1>
        {subtitle && (
          <span className="text-sm text-secondary-500">{subtitle}</span>
        )}
      </div>

      {/* Right Section - Notifications Only */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-secondary-400 hover:text-secondary-900 hover:bg-secondary-50 rounded-xl transition-all group shadow-sm border border-secondary-100 overflow-hidden">
          <BellIcon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
}