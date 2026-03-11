import React, { useState, useEffect } from 'react';
import { 
  EmployeesMetricCard,
  ProjectsMetricCard,
  HoursMetricCard,
  ApprovalsMetricCard,
  RevenueMetricCard,
  ReportsMetricCard
} from '../components/ui/MetricCard';
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

interface DashboardMetrics {
  totalEmployees: number;
  activeProjects: number;
  totalHours: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  reportsGenerated: number;
}

const NewDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeProjects: 0,
    totalHours: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0,
    reportsGenerated: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary data
      const summaryResponse = await API.get('/reports/summary');
      const summaryData = summaryResponse.data;

      // Fetch pending approvals for managers/admins
      let pendingApprovals = 0;
      const userRole = user?.role?.toLowerCase();
      if (['admin', 'manager', 'partner', 'owner'].includes(userRole || '')) {
        try {
          const approvalsResponse = await API.get('/employees/pending-approvals');
          pendingApprovals = approvalsResponse.data?.length || 0;
        } catch (error) {
          console.error('Failed to fetch pending approvals:', error);
        }
      }

      setMetrics({
        totalEmployees: summaryData.totalEmployees || 0,
        activeProjects: summaryData.activeProjects || 0,
        totalHours: Math.round(summaryData.totalHours || 0),
        pendingApprovals,
        monthlyRevenue: summaryData.totalDisbursed || 0,
        reportsGenerated: 15 // Mock data
      });

      // Mock recent activities
      setRecentActivities([
        {
          id: 1,
          type: 'timesheet',
          user: 'John Doe',
          action: 'Submitted timesheet for Week 12',
          time: '2 hours ago',
          status: 'pending'
        },
        {
          id: 2,
          type: 'approval',
          user: 'Jane Smith',
          action: 'Approved employee registration',
          time: '4 hours ago',
          status: 'completed'
        },
        {
          id: 3,
          type: 'leave',
          user: 'Mike Johnson',
          action: 'Requested leave for Dec 15-20',
          time: '6 hours ago',
          status: 'pending'
        },
        {
          id: 4,
          type: 'project',
          user: 'Sarah Williams',
          action: 'Created new project: Website Redesign',
          time: '1 day ago',
          status: 'completed'
        }
      ]);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'timesheet':
        return <CalendarIcon className="h-5 w-5 text-blue-600" />;
      case 'approval':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'leave':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'project':
        return <DocumentTextIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}. Here's what's happening with your team today.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <EmployeesMetricCard
          title="Total Employees"
          value={metrics.totalEmployees}
          subtitle="Active workforce"
          trend={{ value: 12, direction: 'up' }}
          loading={loading}
        />
        <ProjectsMetricCard
          title="Active Projects"
          value={metrics.activeProjects}
          subtitle="Currently running"
          trend={{ value: 8, direction: 'up' }}
          loading={loading}
        />
        <HoursMetricCard
          title="Total Hours Logged"
          value={metrics.totalHours.toLocaleString()}
          subtitle="This month"
          trend={{ value: 5, direction: 'up' }}
          loading={loading}
        />
        <ApprovalsMetricCard
          title="Pending Approvals"
          value={metrics.pendingApprovals}
          subtitle="Awaiting review"
          loading={loading}
        />
        <RevenueMetricCard
          title="Monthly Revenue"
          value={`$${metrics.monthlyRevenue.toLocaleString()}`}
          subtitle="Total disbursed"
          trend={{ value: 15, direction: 'up' }}
          loading={loading}
        />
        <ReportsMetricCard
          title="Reports Generated"
          value={metrics.reportsGenerated}
          subtitle="This month"
          trend={{ value: 3, direction: 'neutral' }}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timesheet Summary Chart */}
        <Card>
          <CardHeader title="Timesheet Summary" />
          <CardBody>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chart visualization coming soon</p>
                <p className="text-sm text-gray-500 mt-2">Weekly hours breakdown by project</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader title="Recent Activities" />
          <CardBody>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.user} • {activity.time}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Pending Approvals Table (for managers/admins) */}
      {metrics.pendingApprovals > 0 && (
        <Card>
          <CardHeader title="Pending Approvals" subtitle="Quick actions required" />
          <CardBody>
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {metrics.pendingApprovals} items need your attention
              </p>
              <button
                onClick={() => window.location.href = '/employees'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Review Pending Approvals
              </button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default NewDashboard;
