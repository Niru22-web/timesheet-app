import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './ui/Avatar';
import Button from './ui/Button';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Debug logging
  console.log('Layout render - User:', user);
  console.log('Layout render - User role:', user?.role);
  console.log('Layout render - Current path:', location.pathname);

  const isManagement = ['Manager', 'Admin', 'Partner', 'Owner', 'manager', 'admin', 'partner', 'owner'].includes(user?.role || '');
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const userRole = user?.role?.toLowerCase();

  const navigation = [
    { name: 'Dashboard', href: userRole === 'admin' ? '/admin' : userRole === 'manager' ? '/manager' : userRole === 'partner' ? '/partner' : userRole === 'user' || userRole === 'employee' ? '/employee' : '/', icon: HomeIcon, show: true },
    { name: 'Timesheet', href: '/timesheet', icon: CalendarIcon, show: true },
    { name: 'Employees', href: '/employees', icon: UsersIcon, show: isAdmin || isManagement },
    { name: 'Projects', href: '/projects', icon: BriefcaseIcon, show: isAdmin || isManagement },
    { name: 'Jobs', href: '/jobs', icon: WrenchScrewdriverIcon, show: isAdmin || isManagement },
    { name: 'Clients', href: '/clients', icon: BuildingOfficeIcon, show: isAdmin || isManagement },
    { name: 'Reimbursement', href: '/reimbursement', icon: CurrencyDollarIcon, show: true },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, show: isAdmin || isManagement },
    { name: 'User Management', href: '/users', icon: UsersIcon, show: isAdmin },
    { name: 'Admin', href: '/admin-panel', icon: Cog6ToothIcon, show: isAdmin },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon, show: true },
  ].filter(item => item.show);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-secondary-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-secondary-900 tracking-tight">ashish shah & associate</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-secondary-500 hover:text-secondary-900 transition-colors"
        >
          {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-secondary-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-secondary-200 transform transition-transform duration-300 z-50
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 md:p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm">A</div>
            <div>
              <h1 className="font-bold text-secondary-900 leading-none">ashish shah</h1>
              <p className="text-[10px] font-bold text-secondary-500 mt-1.5 uppercase tracking-widest">& associate</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 mt-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                      : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-secondary-100 bg-secondary-50/50">
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar name={user?.name || 'User'} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-secondary-900 truncate uppercase tracking-tight">{user?.name || 'Guest User'}</p>
                <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-wide truncate">{user?.role || 'User'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-sm font-semibold text-danger-600 hover:bg-danger-50 transition-colors group"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 text-danger-400 group-hover:text-danger-600" />
              Logout Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="hidden md:flex flex-none items-center justify-between px-10 h-20 bg-white border-b border-secondary-100">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-secondary-900">Dashboard Nexus</h2>
            <div className="h-6 w-px bg-secondary-100 mx-2" />
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary-50 rounded-full border border-secondary-100 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest italic">Stable Node Connected</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-secondary-400 hover:text-secondary-900 hover:bg-secondary-50 rounded-xl transition-all group shadow-sm border border-secondary-100 overflow-hidden">
              <BellIcon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-secondary-100 h-10">
              <Avatar name={user?.name || 'User'} size="md" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-secondary-900 leading-none">{user?.name || 'Guest User'}</span>
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-1 opacity-60">{user?.role || 'Guest'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-secondary-50 shadow-inner custom-scrollbar relative">
          {/* Soft decorative background element */}
          <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary-600/[0.03] rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto h-full">
            <Outlet />
          </div>

          <footer className="mt-20 py-10 border-t border-secondary-200/50 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary-200 rounded-lg flex items-center justify-center text-secondary-500 font-bold">A</div>
              <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-[0.2em] italic">ashish shah & associate <span className="mx-2 opacity-30">/</span> Management Systems v4.9.2</p>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">© 2026 EnterpriseCore Solutions</span>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-secondary-300" />
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Verified Session</span>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Layout;
