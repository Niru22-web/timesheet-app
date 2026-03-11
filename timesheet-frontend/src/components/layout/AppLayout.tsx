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
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === 'admin';
  const isManagement = ['manager', 'admin', 'partner', 'owner'].includes(userRole || '');

  const navigation: NavSection[] = [
    {
      title: 'Main',
      items: [
        { 
          name: 'Dashboard', 
          href: userRole === 'admin' ? '/admin' : userRole === 'manager' ? '/manager' : userRole === 'partner' ? '/partner' : '/employee', 
          icon: HomeIcon 
        },
        { 
          name: 'Timesheet', 
          href: '/timesheet', 
          icon: CalendarIcon 
        },
      ]
    },
    {
      title: 'Management',
      items: [
        { 
          name: 'Employees', 
          href: '/employees', 
          icon: UsersIcon,
          badge: isAdmin ? '3' : undefined
        },
        { 
          name: 'Projects', 
          href: '/projects', 
          icon: BriefcaseIcon 
        },
        { 
          name: 'Jobs', 
          href: '/jobs', 
          icon: WrenchScrewdriverIcon 
        },
        { 
          name: 'Clients', 
          href: '/clients', 
          icon: BuildingOfficeIcon 
        },
      ]
    },
    {
      title: 'Finance',
      items: [
        { 
          name: 'Reimbursement', 
          href: '/reimbursement', 
          icon: CurrencyDollarIcon 
        },
      ]
    },
    {
      title: 'HR',
      items: [
        { 
          name: 'Leave Management', 
          href: '/leave-management', 
          icon: ShieldCheckIcon 
        },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { 
          name: 'Reports', 
          href: '/reports', 
          icon: ChartBarIcon 
        },
      ]
    },
  ];

  // Add admin section for admin users
  if (isAdmin) {
    navigation.push({
      title: 'Administration',
      items: [
        { 
          name: 'Admin Panel', 
          href: '/admin-panel', 
          icon: Cog6ToothIcon 
        },
        { 
          name: 'Email Configuration', 
          href: '/email-configuration', 
          icon: BellIcon 
        },
        { 
          name: 'Email Templates', 
          href: '/email-templates', 
          icon: BellIcon 
        },
      ]
    });
  }

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
          <span className="font-bold text-gray-900">Timesheet Pro</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-500 hover:text-gray-900"
        >
          {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 z-50
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm">T</div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Timesheet Pro</h1>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Enterprise</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {navigation.map((section) => (
              <div key={section.title} className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                        ${isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2026 Timesheet Pro Enterprise
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
