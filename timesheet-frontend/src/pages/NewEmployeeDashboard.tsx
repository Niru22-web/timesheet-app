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
import DashboardLayout from '../components/DashboardLayout';
import FilterPanel from '../components/FilterPanel';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import KPICard from '../components/KPICard';
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
        API.get('/reports/summary'),
        API.get(`/timelogs?employeeId=${user?.id}`),
        API.get('/projects')
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

      // Calculate weekly and monthly hours
      const now = new Date();
      const thisWeekHours = myTimelogs
        .filter((log: any) => {
          const logDate = new Date(log.date);
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          return logDate >= weekStart;
        })
        .reduce((sum: number, log: any) => sum + (log.hours || 0), 0);

      const thisMonthHours = myTimelogs
        .filter((log: any) => new Date(log.date).getMonth() === new Date().getMonth())
        .reduce((sum: number, log: any) => sum + (log.hours || 0), 0);

      // Calculate missing days
      const today = new Date();
      const currentWeek = Math.floor((today.getDate() - 1) / 7) + 1;
      const daysInWeek = 7;
      const loggedDays = new Set(myTimelogs.map((log: any) => new Date(log.date).toDateString())).size;
      const missingDays = Math.max(0, daysInWeek - loggedDays);

      setDashboardData({
        summary,
        timelogs: myTimelogs,
        projects: myProjects,
        totalHours,
        approvedHours,
        pendingEntries,
        thisWeekHours,
        thisMonthHours,
        missingDays
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

  if (loading) {
    return (
      <DashboardLayout title="Employee Dashboard" subtitle="Personal work overview">
        <LoadingState type="dashboard" size="lg" />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Employee Dashboard" subtitle="Personal work overview">
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
      title="Employee Dashboard" 
      subtitle="Personal work tracking and timesheet management"
    >
      <div className="space-y-6">
        {/* Filter Panel */}
        <FilterPanel 
          onFiltersChange={handleFiltersChange}
          showEmployeeFilter={false}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Hours This Week"
            value={dashboardData?.thisWeekHours || 0}
            change="Current Week"
            changeType="positive"
            icon={ClockIcon}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <KPICard
            title="Hours This Month"
            value={dashboardData?.thisMonthHours || 0}
            change="Current Month"
            changeType="positive"
            icon={CalendarIcon}
            color="text-green-600"
            bg="bg-green-50"
          />
          <KPICard
            title="Assigned Projects"
            value={dashboardData?.projects?.length || 0}
            change="Active"
            changeType="positive"
            icon={DocumentTextIcon}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <KPICard
            title="Pending Days"
            value={dashboardData?.missingDays || 0}
            change="Need Action"
            changeType="warning"
            icon={ExclamationTriangleIcon}
            color="text-orange-600"
            bg="bg-orange-50"
          />
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

        {/* Personal Timelogs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Timelogs</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/timesheet')}
            >
              View All
            </Button>
          </div>
          {dashboardData?.timelogs?.length > 0 ? (
            <div className="space-y-4">
              {/* Group by Client -> Project -> Job */}
              {(() => {
                const groupedByClient = dashboardData.timelogs.reduce((acc: any, log: any) => {
                  const clientName = log.job?.project?.client?.name || 'No Client';
                  if (!acc[clientName]) {
                    acc[clientName] = [];
                  }
                  acc[clientName].push(log);
                  return acc;
                }, {});

                return Object.entries(groupedByClient).map(([clientName, clientLogs]) => (
                  <div key={clientName} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{clientName}</h4>
                    <div className="space-y-3">
                      {(clientLogs as any[]).map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-xl font-bold text-blue-600">{log.hours}</p>
                              <p className="text-xs text-gray-500">hours</p>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{log.job?.project?.name || 'No Project'}</p>
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
                  </div>
                ));
              })()}
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

        {/* Missing Timelogs */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timelogs Not Entered</h3>
          {dashboardData?.missingDays > 0 ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">You have {dashboardData.missingDays} missing timelog entries</p>
              <p className="text-sm text-gray-500 mt-2">Please complete your timesheet for this week.</p>
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={() => navigate('/timesheet')}
              >
                Complete Timesheet
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">All timelogs are up to date!</p>
              <p className="text-sm text-gray-500 mt-2">You've logged your time for all days this week.</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
