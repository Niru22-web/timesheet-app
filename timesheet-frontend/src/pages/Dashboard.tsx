import React, { useState, useEffect } from 'react';
import { 
  EmployeesMetricCard,
  ProjectsMetricCard,
  HoursMetricCard,
  ApprovalsMetricCard,
  RevenueMetricCard,
  ReportsMetricCard
} from '../components/ui/MetricCard';
import { APP_CONFIG } from '../config/appConfig';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import { 
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch summary data
      let summaryData = null;
      try {
        const summaryRes = await API.get('/reports/summary');
        summaryData = summaryRes.data;
      } catch (summaryError) {
        console.warn('Summary API failed, using fallback:', summaryError);
        // Provide fallback data
        summaryData = {
          totalEmployees: 0,
          activeProjects: 0,
          totalHours: 0,
          averageUtilization: 0
        };
      }

      // Try to fetch timelogs
      let activities: any[] = [];
      try {
        const timelogsRes = await API.get('/timelogs');
        activities = timelogsRes.data.slice(0, 5).map((log: any) => ({
          id: log.id,
          employee: `${log.employee?.firstName} ${log.employee?.lastName || ''}`.trim() || 'System User',
          action: `logged ${log.hours} hours`,
          project: log.job?.project?.name || 'Project Engagement',
          time: new Date(log.date).toLocaleDateString(),
          status: log.status
        }));
      } catch (timelogError) {
        console.warn('Timelogs API failed, using fallback:', timelogError);
        activities = [];
      }

      setSummary(summaryData);
      setRecentActivities(activities);
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Total Employees',
      value: summary?.totalEmployees || '0',
      change: 'Synced',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      name: 'Active Projects',
      value: summary?.activeProjects || '0',
      change: 'Synced',
      changeType: 'positive',
      icon: BriefcaseIcon,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      name: 'Logged Hours',
      value: summary?.totalHours || '0',
      change: 'Total',
      changeType: 'positive',
      icon: ClockIcon,
      color: 'text-success-600',
      bg: 'bg-success-50',
    },
    {
      name: 'Avg Utilization',
      value: `${Math.round(summary?.averageUtilization || 0)}%`,
      change: 'Calculated',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  // Role-based quick links
  const getQuickLinks = () => {
    const baseLinks = [
      { name: 'Timesheet', color: 'text-primary-600', bg: 'bg-primary-50', link: '/timesheet', icon: CalendarIcon },
      { name: 'Profile', color: 'text-secondary-600', bg: 'bg-secondary-100', link: '/profile', icon: CommandLineIcon }
    ];

    if (user?.role === 'admin' || user?.role === 'Admin') {
      return [
        ...baseLinks,
        { name: 'Employees', color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/employees', icon: UsersIcon },
        { name: 'Clients', color: 'text-purple-600', bg: 'bg-purple-50', link: '/clients', icon: BriefcaseIcon },
        { name: 'Projects', color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/projects', icon: ChartBarIcon },
        { name: 'Admin', color: 'text-red-600', bg: 'bg-red-50', link: '/admin', icon: CommandLineIcon }
      ];
    } else if (user?.role === 'manager' || user?.role === 'Manager') {
      return [
        ...baseLinks,
        { name: 'Employees', color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/employees', icon: UsersIcon },
        { name: 'Projects', color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/projects', icon: BriefcaseIcon },
        { name: 'Clients', color: 'text-purple-600', bg: 'bg-purple-50', link: '/clients', icon: ChartBarIcon }
      ];
    } else {
      return [
        ...baseLinks,
        { name: 'Claims', color: 'text-amber-600', bg: 'bg-amber-50', link: '/reimbursement', icon: CurrencyDollarIcon }
      ];
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">
            {user?.role === 'admin' ? 'Admin Dashboard' : 
             user?.role === 'manager' ? 'Manager Dashboard' : 
             user?.role === 'partner' ? 'Partner Dashboard' : 
             'Employee Dashboard'}
          </h1>
          <p className="text-sm font-medium text-secondary-500 mt-1">
            Welcome back, {user?.name || 'User'}! Here's what's happening today at {APP_CONFIG.COMPANY_NAME}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="h-10 border-secondary-200"
            onClick={fetchDashboardData}
            leftIcon={<ChartBarIcon className="w-4 h-4" />}
          >
            Refresh data
          </Button>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Button
              variant="primary"
              size="sm"
              className="h-10 px-6 font-bold"
              onClick={() => navigate('/timesheet')}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Log Session
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-secondary-500">Loading dashboard data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="w-8 h-8 text-danger-500" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-2">Unable to Load Dashboard</h3>
            <p className="text-sm text-secondary-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="primary" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-none">
            {stats.map((stat, idx) => (
              <Card key={stat.name} className="p-6 transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${stat.changeType === 'positive' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'} border ${stat.changeType === 'positive' ? 'border-success-100' : 'border-danger-100'}`}>
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary-500 uppercase tracking-widest">{stat.name}</p>
                  <h3 className="text-3xl font-extrabold text-secondary-900 mt-1 leading-none">{stat.value}</h3>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
            {/* Main Feed: Recent Activity */}
            <div className="lg:col-span-8 flex flex-col min-h-0">
              <Card className="flex flex-col h-full overflow-hidden">
                <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between bg-white whitespace-nowrap">
                  <h3 className="text-lg font-bold text-secondary-900 tracking-tight">Recent Activity Feed</h3>
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest" onClick={() => navigate('/timesheet')}>See All</Button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="p-6 border-b border-secondary-50 hover:bg-primary-50/20 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <Avatar name={activity.employee} size="md" />
                          <div>
                            <p className="text-sm font-bold text-secondary-900 uppercase tracking-tight">{activity.employee}</p>
                            <p className="text-xs font-medium text-secondary-500 mt-1">
                              {activity.action} <span className="text-secondary-300 mx-1">/</span> <span className="text-primary-600 font-bold uppercase tracking-tight">{activity.project}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">{activity.time}</span>
                          <StatusBadge status={activity.status} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-secondary-400 font-bold text-sm">
                      No recent activity found.
                    </div>
                  )}
                </div>
                <div className="p-4 bg-secondary-50/50 border-t border-secondary-100 text-center flex-none">
                  <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest italic tracking-widest">Real-time sync active <span className="text-success-500 mx-2">●</span> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </Card>
            </div>

            {/* Info Grid: Quick Links and Health */}
            <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10">
              <Card className="p-6 space-y-6">
                <h3 className="text-lg font-bold text-secondary-900 tracking-tight mb-2">Quick Shortcuts</h3>
                <div className="grid grid-cols-2 gap-3">
                  {getQuickLinks().map(item => (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.link)}
                      className="p-4 rounded-xl border border-secondary-100 bg-secondary-50/50 hover:bg-white hover:border-primary-200 hover:shadow-md transition-all text-left flex flex-col gap-3 group"
                    >
                      <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-secondary-900">{item.name}</span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-secondary-900 border-none shadow-elevated group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/30 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-primary-400 border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                    <RocketLaunchIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white tracking-tight">Need Support?</h3>
                    <p className="text-sm font-medium text-secondary-400 leading-relaxed italic opacity-80 pt-1">
                      If you encounter any issues with the portal or have questions about your account, we are here to help.
                    </p>
                  </div>
                  <Button variant="primary" fullWidth className="bg-primary-500 border-none h-12 text-sm font-bold font-extrabold shadow-none">
                    Contact Admin Team
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
