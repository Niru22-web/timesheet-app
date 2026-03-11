"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BellIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import Avatar from "../ui/Avatar";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "Dashboard Nexus", subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="hidden md:flex flex-none items-center justify-between px-10 h-20 bg-white border-b border-secondary-100">
      {/* Left Section - Title and Status */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-secondary-900">{title}</h2>
        <div className="h-6 w-px bg-secondary-100 mx-2" />
        <div className="flex items-center gap-2 px-3 py-1 bg-secondary-50 rounded-full border border-secondary-100 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest italic">Stable Node Connected</span>
        </div>
        {subtitle && (
          <span className="text-sm text-secondary-500">{subtitle}</span>
        )}
      </div>

      {/* Right Section - Notifications and User Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-secondary-400 hover:text-secondary-900 hover:bg-secondary-50 rounded-xl transition-all group shadow-sm border border-secondary-100 overflow-hidden">
          <BellIcon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-white" />
        </button>

        {/* User Profile and Logout */}
        <div className="flex items-center gap-4 pl-6 border-l border-secondary-100 h-10">
          <Avatar name={user?.name || 'User'} size="md" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-secondary-900 leading-none">{user?.name || 'Guest User'}</span>
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-1 opacity-60">{user?.role || 'Guest'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 text-sm font-semibold text-danger-600 hover:bg-danger-50 rounded-xl transition-colors group flex items-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 text-danger-400 group-hover:text-danger-600" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}