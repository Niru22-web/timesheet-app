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

const PartnerDashboard: React.FC = () => {
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
      
      // Fetch partner-specific data
      const [summaryRes, employeesRes, projectsRes, clientsRes, timelogsRes] = await Promise.allSettled([
        API.get('/api/reports/summary'),
        API.get('/api/employees'),
        API.get('/api/projects'),
        API.get('/api/clients'),
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
      const clients = clientsRes.status === 'fulfilled' ? clientsRes.value.data : [];
      const timelogs = timelogsRes.status === 'fulfilled' ? timelogsRes.value.data : [];

      // Filter employees that report to this partner
      const reportingEmployees = employees.filter((emp: any) => 
        emp.reportingPartner === user?.id
      );

      // Filter managers that report to this partner
      const reportingManagers = employees.filter((emp: any) => 
        emp.reportingPartner === user?.id && ['manager', 'admin'].includes(emp.role?.toLowerCase())
      );

      // Filter projects for this partner's hierarchy
      const partnerProjects = projects.filter((project: any) => 
        project.createdBy === user?.id || 
        reportingEmployees.some((emp: any) => emp.id === project.projectManager)
      );

      // Filter timelogs for reporting hierarchy
      const hierarchyTimelogs = timelogs.filter((log: any) => 
        reportingEmployees.some((emp: any) => emp.id === log.employeeId)
      );

      // Calculate business metrics
      const totalRevenue = hierarchyTimelogs.reduce((sum: number, log: any) => {
        return sum + (log.hours * (log.rate || 0));
      }, 0);

      const clientProjects = clients.map((client: any) => ({
        client,
        projects: partnerProjects.filter((p: any) => p.clientId === client.id)
      }));

      setDashboardData({
        summary,
        employees: reportingEmployees,
        managers: reportingManagers,
        projects: partnerProjects,
        clients: clientProjects,
        timelogs: hierarchyTimelogs,
        totalRevenue,
        pendingTimelogs: hierarchyTimelogs.filter((t: any) => t.status === 'pending').length,
        totalHours: hierarchyTimelogs.reduce((sum: number, log: any) => sum + (log.hours || 0), 0),
        activeProjects: partnerProjects.filter((p: any) => p.status === 'active').length
      });

    } catch (err) {
      console.error('Partner dashboard fetch failed:', err);
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
      <DashboardLayout title="Partner Dashboard" subtitle="Business overview">
        <LoadingState type="dashboard" size="lg" />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Partner Dashboard" subtitle="Business overview">
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
      title="Partner Dashboard" 
      subtitle="Strategic business overview and client management"
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
            title="Total Reporting Managers"
            value={dashboardData?.managers?.length || 0}
            change="Active"
            changeType="positive"
            icon={UsersIcon}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <KPICard
            title="Total Employees"
            value={dashboardData?.employees?.length || 0}
            change="Under Partner"
            changeType="positive"
            icon={UsersIcon}
            color="text-green-600"
            bg="bg-green-50"
          />
          <KPICard
            title="Active Clients"
            value={dashboardData?.clients?.length || 0}
            change="Engaged"
            changeType="positive"
            icon={BuildingOfficeIcon}
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <KPICard
            title="Team Hours Logged"
            value={dashboardData?.totalHours || 0}
            change="This Month"
            changeType="positive"
            icon={ClockIcon}
            color="text-orange-600"
            bg="bg-orange-50"
          />
        </div>

        {/* Business Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/reports')}
              >
                View Reports
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Monthly Revenue</p>
                    <p className="text-xs text-gray-500">Current month performance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    ${dashboardData?.totalRevenue?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500">+12% from last month</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Billable Hours</p>
                    <p className="text-xs text-gray-500">Total tracked hours</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {dashboardData?.totalHours || 0}
                  </p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Client Portfolio</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/clients')}
              >
                Manage Clients
              </Button>
            </div>
            {dashboardData?.clients?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.clients.slice(0, 4).map((clientData: any, index: number) => (
                  <div key={clientData.client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{clientData.client.name}</p>
                        <p className="text-xs text-gray-500">{clientData.projects.length} projects</p>
                      </div>
                    </div>
                    <Badge variant="success">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                type="default" 
                title="No Clients Found"
                message="No clients are currently assigned to your portfolio."
                action={{
                  label: 'Add Client',
                  onClick: () => navigate('/clients'),
                  icon: BuildingOfficeIcon
                }}
              />
            )}
          </Card>
        </div>

        {/* Team Timelog Reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Timelog Reports</h3>
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
                            <Avatar name={`${log.employee?.firstName} ${log.employee?.lastName}`} size="sm" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {log.employee?.firstName} {log.employee?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {log.hours}h • {log.job?.project?.name || 'No Project'} • ${log.rate || 0}/h
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={log.status === 'approved' ? 'success' : log.status === 'pending' ? 'warning' : 'secondary'}>
                              {log.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              ${log.hours * (log.rate || 0)} • {new Date(log.date).toLocaleDateString()}
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
              title="No Team Activity"
              message="No timelogs found for your reporting structure."
              action={{
                label: 'Create Timelog',
                onClick: () => navigate('/timesheet'),
                icon: CalendarIcon
              }}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard;
