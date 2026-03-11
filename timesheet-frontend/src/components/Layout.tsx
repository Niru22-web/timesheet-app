import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  Cog6ToothIcon,
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
import Header from './layout/Header';

const Layout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
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
    { name: 'Leave Management', href: '/leave-management', icon: ShieldCheckIcon, show: true },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, show: isAdmin || isManagement },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon, show: true },
  ].filter(item => item.show);

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

          {/* Navigation Footer - Additional Options */}
          <div className="p-4 border-t border-secondary-100">
            <nav className="space-y-1">
              <Link
                to="/admin-panel"
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group
                  ${location.pathname === '/admin-panel'
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                    : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900'
                  }
                `}
              >
                <Cog6ToothIcon className="w-5 h-5 text-secondary-400 group-hover:text-secondary-600" />
                Admin Panel
              </Link>
              <Link
                to="/email-configuration"
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group
                  ${location.pathname === '/email-configuration'
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                    : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900'
                  }
                `}
              >
                <BellIcon className="w-5 h-5 text-secondary-400 group-hover:text-secondary-600" />
                Email Configuration
              </Link>
              <Link
                to="/email-templates"
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group
                  ${location.pathname === '/email-templates'
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                    : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900'
                  }
                `}
              >
                <BellIcon className="w-5 h-5 text-secondary-400 group-hover:text-secondary-600" />
                Email Templates
              </Link>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Component */}
        <Header />

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
