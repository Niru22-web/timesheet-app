import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import {
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// UI Components
import CommonLayout from '../components/CommonLayout';
import FilterPanel from '../components/FilterPanel';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch employee-specific data
      const [summaryRes, timelogsRes, projectsRes] = await Promise.allSettled([
        API.get('/api/reports/summary'),
        API.get(`/api/timelogs?employeeId=${user?.id}`),
        API.get('/api/projects')
      ]);

      const summary = summaryRes.status === 'fulfilled' ? summaryRes.value.data : {
        totalHours: 0,
        averageUtilization: 0
      };

      const timelogs = timelogsRes.status === 'fulfilled' ? timelogsRes.value.data : [];
      const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];

      // Filter employee's own timelogs
      const myTimelogs = timelogs.filter((log: any) => log.employeeId === user?.id);
      
      // Calculate personal statistics
      const totalHours = myTimelogs.reduce((sum: number, log: any) => sum + (log.hours || 0), 0);
      const approvedHours = myTimelogs.filter((log: any) => log.status === 'approved')
        .reduce((sum: number, log: any) => sum + (log.hours || 0), 0);
      const pendingEntries = myTimelogs.filter((log: any) => log.status === 'pending').length;
      
      // Get employee's assigned projects
      const myProjects = projects.filter((project: any) => 
        project.assignedEmployees?.some((emp: any) => emp.id === user?.id)
      );

      setDashboardData({
        summary,
        timelogs: myTimelogs,
        projects: myProjects,
        totalHours,
        approvedHours,
        pendingEntries,
        thisMonthHours: myTimelogs
          .filter((log: any) => new Date(log.date).getMonth() === new Date().getMonth())
          .reduce((sum: number, log: any) => sum + (log.hours || 0), 0)
      });

    } catch (err) {
      console.error('Employee dashboard fetch failed:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const stats = [
    {
      name: 'Total Hours',
      value: dashboardData?.totalHours || 0,
      change: 'All Time',
      changeType: 'positive' as const,
      icon: ClockIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      name: 'This Month',
      value: dashboardData?.thisMonthHours || 0,
      change: 'Current',
      changeType: 'positive' as const,
      icon: CalendarIcon,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      name: 'Approved Hours',
      value: dashboardData?.approvedHours || 0,
      change: 'Confirmed',
      changeType: 'success' as const,
      icon: CheckCircleIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      name: 'Pending Entries',
      value: dashboardData?.pendingEntries || 0,
      change: 'Need Action',
      changeType: 'warning' as const,
      icon: DocumentTextIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  if (loading) {
    return (
      <CommonLayout title="Employee Dashboard" subtitle="Personal Work Overview">
        <LoadingState type="dashboard" size="lg" />
      </CommonLayout>
    );
  }

  if (error) {
    return (
      <CommonLayout title="Employee Dashboard" subtitle="Personal Work Overview">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout 
      title="Employee Dashboard" 
      subtitle="Personal work tracking and timesheet management"
    >
      <div className="space-y-6">
        {/* Filter Panel */}
        <FilterPanel 
          onFiltersChange={handleFiltersChange}
          showEmployeeFilter={false}
        />

        {/* Personal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <Badge 
                  variant={stat.changeType === 'warning' ? 'danger' : stat.changeType === 'success' ? 'success' : 'primary'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="primary"
              onClick={() => navigate('/timesheet')}
              leftIcon={<CalendarIcon className="w-4 h-4" />}
            >
              Log Time
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/reimbursement')}
              leftIcon={<CurrencyDollarIcon className="w-4 h-4" />}
            >
              Submit Claim
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/profile')}
              leftIcon={<ChartBarIcon className="w-4 h-4" />}
            >
              View Profile
            </Button>
          </div>
        </Card>

        {/* Recent Timelogs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Recent Timelogs</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/timesheet')}
            >
              View All
            </Button>
          </div>
          {dashboardData?.timelogs?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.timelogs.slice(0, 8).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{log.hours}</p>
                      <p className="text-xs text-gray-500">hours</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{log.job?.project?.name || 'No Project'}</p>
                      <p className="text-xs text-gray-500">{log.job?.client?.name || 'No Client'}</p>
                      <p className="text-xs text-gray-500">{log.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.status === 'approved' ? 'success' : log.status === 'pending' ? 'warning' : 'secondary'}>
                      {log.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(log.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              type="timelogs" 
              title="No Timelogs Found"
              message="You haven't logged any timelogs yet. Start tracking your work hours."
              action={{
                label: 'Create Your First Timelog',
                onClick: () => navigate('/timesheet'),
                icon: CalendarIcon
              }}
            />
          )}
        </Card>

        {/* Assigned Projects */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Projects</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/projects')}
            >
              View All
            </Button>
          </div>
          {dashboardData?.projects?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.projects.slice(0, 4).map((project: any) => (
                <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.client?.name || 'No Client'}</p>
                    </div>
                  </div>
                  <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              type="projects" 
              title="No Projects Assigned"
              message="No projects have been assigned to you yet."
            />
          )}
        </Card>
      </div>
    </CommonLayout>
  );
};

export default EmployeeDashboard;
