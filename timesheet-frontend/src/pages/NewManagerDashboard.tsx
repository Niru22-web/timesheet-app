import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import {
  UsersIcon,
  BriefcaseIcon,
  ClockIcon,
  ChartBarIcon,
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

const ManagerDashboard: React.FC = () => {
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
      
      // Fetch manager-specific data
      const [summaryRes, employeesRes, projectsRes, timelogsRes] = await Promise.allSettled([
        API.get('/api/reports/summary'),
        API.get('/api/employees'),
        API.get('/api/projects'),
        API.get('/api/timelogs')
      ]);

      const summary = summaryRes.status === 'fulfilled' ? summaryRes.value.data : {
        totalEmployees: 0,
        activeProjects: 0,
        totalHours: 0,
        averageUtilization: 0
      };

      const employees = employeesRes.status === 'fulfilled' ? employeesRes.value.data : [];
      const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
      const timelogs = timelogsRes.status === 'fulfilled' ? timelogsRes.value.data : [];

      // Filter employees that report to this manager
      const reportingEmployees = employees.filter((emp: any) => 
        emp.reportingManager === user?.id || emp.reportingPartner === user?.id
      );

      // Filter projects assigned to this manager
      const managerProjects = projects.filter((project: any) => 
        project.createdBy === user?.id || project.projectManager === user?.id
      );

      // Filter timelogs for reporting employees
      const teamTimelogs = timelogs.filter((log: any) => 
        reportingEmployees.some((emp: any) => emp.id === log.employeeId)
      );

      setDashboardData({
        summary,
        employees: reportingEmployees,
        projects: managerProjects,
        timelogs: teamTimelogs,
        pendingTimelogs: teamTimelogs.filter((t: any) => t.status === 'pending').length,
        totalTeamHours: teamTimelogs.reduce((sum: number, log: any) => sum + (log.hours || 0), 0),
        activeProjects: managerProjects.filter((p: any) => p.status === 'active').length
      });

    } catch (err) {
      console.error('Manager dashboard fetch failed:', err);
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
      <DashboardLayout title="Manager Dashboard" subtitle="Team management overview">
        <LoadingState type="dashboard" size="lg" />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Manager Dashboard" subtitle="Team management overview">
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
      title="Manager Dashboard" 
      subtitle="Team management and project oversight"
    >
      <div className="space-y-6">
        {/* Filter Panel */}
        <FilterPanel 
          onFiltersChange={handleFiltersChange}
          showEmployeeFilter={true}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Team Members"
            value={dashboardData?.employees?.length || 0}
            change="Reporting"
            changeType="positive"
            icon={UsersIcon}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <KPICard
            title="Active Projects"
            value={dashboardData?.activeProjects || 0}
            change="Assigned"
            changeType="positive"
            icon={BriefcaseIcon}
            color="text-green-600"
            bg="bg-green-50"
          />
          <KPICard
            title="Team Hours Logged"
            value={dashboardData?.totalTeamHours || 0}
            change="This Month"
            changeType="positive"
            icon={ClockIcon}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <KPICard
            title="Pending Entries"
            value={dashboardData?.pendingTimelogs || 0}
            change="Need Review"
            changeType="warning"
            icon={DocumentTextIcon}
            color="text-orange-600"
            bg="bg-orange-50"
          />
        </div>

        {/* Team Activity and Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Activity</h3>
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
                {dashboardData.timelogs.slice(0, 6).map((log: any) => (
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
                title="No Team Activity"
                message="Your team hasn't logged any timelogs yet."
                action={{
                  label: 'Create Timelog',
                  onClick: () => navigate('/timesheet'),
                  icon: CalendarIcon
                }}
              />
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assigned Projects</h3>
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
                {dashboardData.projects.slice(0, 6).map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <BriefcaseIcon className="w-4 h-4 text-green-600" />
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
                message="No projects have been assigned to your team yet."
                action={{
                  label: 'Create Project',
                  onClick: () => navigate('/projects'),
                  icon: BriefcaseIcon
                }}
              />
            )}
          </Card>
        </div>

        {/* Team Overview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Overview</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/employees')}
            >
              View All
            </Button>
          </div>
          {dashboardData?.employees?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.employees.map((emp: any) => (
                <div key={emp.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar name={`${emp.firstName} ${emp.lastName}`} size="md" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-gray-500">{emp.role}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                    <Badge variant={emp.status === 'active' ? 'success' : 'secondary'} className="mt-2">
                      {emp.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              type="employees" 
              title="No Team Members"
              message="No employees are currently reporting to you."
              action={{
                label: 'View All Employees',
                onClick: () => navigate('/employees'),
                icon: UsersIcon
              }}
            />
          )}
        </Card>

        {/* Missing Timelogs Report */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timelogs Not Entered</h3>
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No missing timelogs detected for this week.</p>
            <p className="text-sm text-gray-500 mt-2">All team members have submitted their timesheets.</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
