import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import {
  UsersIcon,
  BriefcaseIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// UI Components
import CommonLayout from '../components/CommonLayout';
import FilterPanel from '../components/FilterPanel';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const AdminDashboard: React.FC = () => {
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
      
      // Fetch comprehensive admin statistics
      const [summaryRes, employeesRes, projectsRes, clientsRes, timelogsRes] = await Promise.allSettled([
        API.get('/reports/summary'),
        API.get('/employees'),
        API.get('/projects'),
        API.get('/clients'),
        API.get('/timelogs')
      ]);

      const summary = summaryRes.status === 'fulfilled' ? summaryRes.value.data : {
        totalEmployees: 0,
        activeProjects: 0,
        totalHours: 0,
        averageUtilization: 0
      };

      const employees = employeesRes.status === 'fulfilled' ? employeesRes.value.data : [];
      const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
      const clients = clientsRes.status === 'fulfilled' ? clientsRes.value.data : [];
      const timelogs = timelogsRes.status === 'fulfilled' ? timelogsRes.value.data : [];

      setDashboardData({
        summary,
        employees,
        projects,
        clients,
        timelogs,
        pendingTimelogs: timelogs.filter((t: any) => t.status === 'pending').length
      });

    } catch (err) {
      console.error('Admin dashboard fetch failed:', err);
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
      name: 'Total Employees',
      value: dashboardData?.employees?.length || 0,
      change: 'Active',
      changeType: 'positive' as const,
      icon: UsersIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      name: 'Total Clients',
      value: dashboardData?.clients?.length || 0,
      change: 'Registered',
      changeType: 'positive' as const,
      icon: BuildingOfficeIcon,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      name: 'Active Projects',
      value: dashboardData?.projects?.length || 0,
      change: 'Ongoing',
      changeType: 'positive' as const,
      icon: BriefcaseIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      name: 'Total Hours',
      value: dashboardData?.summary?.totalHours || 0,
      change: 'All Time',
      changeType: 'positive' as const,
      icon: ClockIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      name: 'Pending Timelogs',
      value: dashboardData?.pendingTimelogs || 0,
      change: 'Need Review',
      changeType: 'warning' as const,
      icon: DocumentTextIcon,
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ];

  if (loading) {
    return (
      <CommonLayout title="Admin Dashboard" subtitle="System Overview">
        <LoadingState type="dashboard" size="lg" />
      </CommonLayout>
    );
  }

  if (error) {
    return (
      <CommonLayout title="Admin Dashboard" subtitle="System Overview">
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
      title="Admin Dashboard" 
      subtitle="Complete system overview and administrative controls"
    >
      <div className="space-y-6">
        {/* Filter Panel */}
        <FilterPanel 
          onFiltersChange={handleFiltersChange}
          showEmployeeFilter={true}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((stat, index) => (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <Badge 
                  variant={stat.changeType === 'warning' ? 'danger' : 'success'}
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Employees</h3>
            {dashboardData?.employees?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.employees.slice(0, 5).map((emp: any) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-500">{emp.role}</p>
                      </div>
                    </div>
                    <Badge variant={emp.status === 'active' ? 'success' : 'secondary'}>
                      {emp.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                type="employees" 
                title="No Employees Found"
                message="No employees have been registered in the system yet."
                action={{
                  label: 'Add Employee',
                  onClick: () => navigate('/employees'),
                  icon: UsersIcon
                }}
              />
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
            {dashboardData?.projects?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.projects.slice(0, 5).map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BriefcaseIcon className="w-4 h-4 text-purple-600" />
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
                title="No Projects Found"
                message="No projects have been created in the system yet."
                action={{
                  label: 'Create Project',
                  onClick: () => navigate('/projects'),
                  icon: BriefcaseIcon
                }}
              />
            )}
          </Card>
        </div>

        {/* System Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <UsersIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.employees?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BuildingOfficeIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.clients?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Clients</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <ChartBarIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary?.totalHours || 0}</p>
              <p className="text-sm text-gray-600">Total Hours</p>
            </div>
          </div>
        </Card>
      </div>
    </CommonLayout>
  );
};

export default AdminDashboard;
