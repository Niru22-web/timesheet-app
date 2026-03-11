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
  ExclamationTriangleIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// UI Components
import DashboardLayout from '../components/DashboardLayout';
import FilterPanel from '../components/FilterPanel';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import KPICard from '../components/KPICard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';

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
        pendingTimelogs: timelogs.filter((t: any) => t.status === 'pending').length,
        activeProjects: projects.filter((p: any) => p.status === 'active').length,
        totalHours: timelogs.reduce((sum: number, log: any) => sum + (log.hours || 0), 0)
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

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard" subtitle="Complete system overview">
        <LoadingState type="dashboard" size="lg" />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Admin Dashboard" subtitle="Complete system overview">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      subtitle="Complete system overview and administrative controls"
    >
      <div className="space-y-6">
        {/* Filter Panel */}
        <FilterPanel 
          onFiltersChange={handleFiltersChange}
          showEmployeeFilter={true}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <KPICard
            title="Total Employees"
            value={dashboardData?.employees?.length || 0}
            change="Active"
            changeType="positive"
            icon={UsersIcon}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <KPICard
            title="Total Clients"
            value={dashboardData?.clients?.length || 0}
            change="Registered"
            changeType="positive"
            icon={BuildingOfficeIcon}
            color="text-green-600"
            bg="bg-green-50"
          />
          <KPICard
            title="Active Projects"
            value={dashboardData?.activeProjects || 0}
            change="Ongoing"
            changeType="positive"
            icon={BriefcaseIcon}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <KPICard
            title="Total Hours"
            value={dashboardData?.totalHours || 0}
            change="All Time"
            changeType="positive"
            icon={ClockIcon}
            color="text-orange-600"
            bg="bg-orange-50"
          />
          <KPICard
            title="Pending Timelogs"
            value={dashboardData?.pendingTimelogs || 0}
            change="Need Review"
            changeType="warning"
            icon={DocumentTextIcon}
            color="text-red-600"
            bg="bg-red-50"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Employees</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/employees')}
              >
                View All
              </Button>
            </div>
            {dashboardData?.employees?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.employees.slice(0, 5).map((emp: any) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${emp.firstName} ${emp.lastName}`} size="sm" />
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/projects')}
              >
                Manage
              </Button>
            </div>
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

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Timelogs</h3>
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
                {dashboardData.timelogs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${log.employee?.firstName} ${log.employee?.lastName}`} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.employee?.firstName} {log.employee?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.hours}h • {log.job?.project?.name || 'No Project'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === 'approved' ? 'success' : log.status === 'pending' ? 'warning' : 'secondary'}>
                        {log.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
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
                message="No timelog entries have been recorded yet."
                action={{
                  label: 'Create Timelog',
                  onClick: () => navigate('/timesheet'),
                  icon: CalendarIcon
                }}
              />
            )}
          </Card>
        </div>

        {/* System Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <BriefcaseIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.activeProjects || 0}</p>
              <p className="text-sm text-gray-600">Active Projects</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <ClockIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalHours || 0}</p>
              <p className="text-sm text-gray-600">Total Hours</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
