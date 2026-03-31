"use client";

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";
import {
  Squares2X2Icon,
  ClockIcon,
  UsersIcon,
  BriefcaseIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface MenuItem {
  name: string;
  path?: string;
  icon: any;
  subItems?: { name: string; path: string }[];
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!user) return null;

  const menuItems: MenuItem[] = [
    { name: "Dashboard", path: "/", icon: Squares2X2Icon },
    { 
      name: "Timesheet", 
      path: "/timesheet",
      icon: ClockIcon
    },
    { 
      name: "Leave Management", 
      path: "/leave-management",
      icon: CalendarDaysIcon
    },
    { 
      name: "Employees", 
      path: "/employees",
      icon: UsersIcon
    },
    { 
      name: "Reports", 
      path: "/reports",
      icon: ChartBarIcon
    },
    { 
      name: "Settings", 
      path: "/admin", 
      icon: Cog6ToothIcon 
    },
  ];

  const handleSectionClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path);
    }
    if (item.subItems) {
      toggleSection(item.name);
    }
  };

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const isItemActive = (path?: string) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside 
      className={`${isExpanded ? 'w-[240px]' : 'w-[70px]'} h-screen flex flex-col shadow-sm transition-all duration-300 relative z-30 ${
        isDark
          ? 'bg-[#111827] border-r border-slate-700/60'
          : 'bg-[#F8F9FB] border-r border-secondary-200'
      }`}
    >
      {/* Sidebar Header with ASA Logo */}
      <div className={`p-6 flex flex-col ${isExpanded ? 'items-center' : 'items-center'} overflow-hidden`}>
        {isExpanded ? (
          <div className="flex flex-col items-center animate-fade-in">
            <div className={`font-extrabold text-3xl tracking-tighter leading-none mb-1 ${
              isDark ? 'text-blue-400' : 'text-primary-600'
            }`}>ASA</div>
            <div className={`text-[9px] font-black uppercase tracking-tighter text-center leading-[1.1] ${
              isDark ? 'text-slate-300' : 'text-secondary-900'
            }`}>
              ASHISH SHAH &amp; ASSOCIATES
            </div>
            <div className={`text-[8px] font-bold uppercase tracking-[0.2em] mt-2 whitespace-nowrap ${
              isDark ? 'text-slate-600' : 'text-secondary-400'
            }`}>
              DELIVERING VALUE
            </div>
          </div>
        ) : (
          <div className={`font-extrabold text-xl tracking-tighter leading-none py-2 ${
            isDark ? 'text-blue-400' : 'text-primary-600'
          }`}>A</div>
        )}
      </div>

      <div className="px-4 mb-4">
        <div className={`h-px ${ isDark ? 'bg-slate-700/60' : 'bg-secondary-100' }`} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-6">
        {menuItems.map((item) => {
          const isActive = isItemActive(item.path);
          const Icon = item.icon;

          return (
            <div key={item.name} className="relative group">
              {isActive && isExpanded && (
                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-600 rounded-r-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              )}
              
              <Link
                to={item.path!}
                title={!isExpanded ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? 'bg-blue-600/20 text-blue-400 font-bold shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                      : 'bg-primary-50 text-primary-600 font-bold'
                    : isDark
                      ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'
                      : 'text-[#2E2E2E] hover:bg-white hover:shadow-soft'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive
                    ? isDark ? 'text-blue-400' : 'text-primary-600'
                    : isDark ? 'text-slate-500 group-hover:text-slate-100' : 'text-secondary-400 group-hover:text-[#2E2E2E]'
                }`} />
                {isExpanded && <span className="text-sm truncate">{item.name}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`absolute -right-3 top-20 rounded-full p-1 shadow-soft transition-all z-40 border ${
          isDark
            ? 'bg-[#1E293B] border-slate-600 text-slate-400 hover:text-blue-400 hover:border-blue-500 hover:scale-110'
            : 'bg-white border-secondary-200 text-secondary-400 hover:text-primary-600 hover:scale-110'
        }`}
      >
        {isExpanded ? <ChevronDownIcon className="w-4 h-4 rotate-90" /> : <ChevronRightIcon className="w-4 h-4" />}
      </button>

      {/* Bottom Profile Section */}
      <div className={`p-3 border-t mt-auto ${ isDark ? 'border-slate-700/60' : 'border-secondary-100' }`}>
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl border transition-all duration-200 ${
              showUserMenu
                ? isDark ? 'bg-slate-700/60 border-slate-600' : 'bg-white border-secondary-100 shadow-soft'
                : isDark ? 'border-transparent hover:bg-slate-700/40' : 'border-transparent hover:bg-white hover:border-secondary-100'
            }`}
          >
            <Avatar 
              name={`${user.firstName} ${user.lastName}`} 
              size="sm" 
              src={user.profile?.employeePhotoUrl ? `${import.meta.env.VITE_API_BASE_URL}${user.profile.employeePhotoUrl}` : undefined}
            />
            {isExpanded && (
              <div className="text-left overflow-hidden">
                <p className={`text-xs font-bold truncate tracking-tight ${ isDark ? 'text-slate-200' : 'text-secondary-900' }`}>{user.firstName} {user.lastName}</p>
                <p className={`text-[10px] font-medium uppercase tracking-tight truncate ${ isDark ? 'text-slate-500' : 'text-secondary-400' }`}>{user.role}</p>
              </div>
            )}
            {isExpanded && (
              <ChevronDownIcon className={`w-3 h-3 ml-auto transition-transform duration-300 ${ isDark ? 'text-slate-500' : 'text-secondary-400' } ${showUserMenu ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className={`absolute bottom-full left-0 mb-2 w-full rounded-xl shadow-elevated border p-1 animate-fade-in z-50 ${
              isDark ? 'bg-[#1E293B] border-slate-700/60' : 'bg-white border-secondary-100'
            }`}>
              <Link 
                to="/profile" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isDark ? 'text-slate-400 hover:bg-blue-600/20 hover:text-blue-400' : 'text-secondary-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
                onClick={() => setShowUserMenu(false)}
              >
                <UserCircleIcon className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-danger-600 hover:bg-danger-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
