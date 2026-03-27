import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../api';
import KPIGrid, { KPICard } from './KPIGrid';
import DashboardFilters, { FilterState } from './DashboardFilters';
import EmployeeBarChart from '../charts/EmployeeBarChart';
import HoursTrendChart from '../charts/HoursTrendChart';
import ProjectPieChart from '../charts/ProjectPieChart';
import { 
  ArrowPathIcon, 
  DocumentArrowDownIcon, 
  FunnelIcon,
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardData {
  totalHours: number;
  totalEmployees: number;
  totalProjects: number;
  pendingTimesheets: number;
  averageHoursPerEmployee: number;
  utilizationRate: number;
  employeeHours: Record<string, number>;
  projectHours: Record<string, number>;
}

interface EmployeeHoursData {
  employeeId: string;
  employeeName: string;
  email: string;
  totalHours: number;
  projects: Record<string, number>;
  dailyHours: Array<{
    date: string;
    hours: number;
    project: string;
    status: string;
  }>;
}

interface ProjectDistributionData {
  projectId: string;
  projectName: string;
  clientName: string;
  totalHours: number;
  employeeCount: number;
}

interface TrendData {
  date: string;
  totalHours: number;
  employeeCount: number;
  projectCount: number;
}

const ReportsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    },
    employeeIds: [],
    projectIds: [],
    status: 'all',
    granularity: 'daily'
  });

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [employeeHours, setEmployeeHours] = useState<EmployeeHoursData[]>([]);
  const [projectDistribution, setProjectDistribution] = useState<ProjectDistributionData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [employees, setEmployees] = useState<Array<{ value: string; label: string }>>([]);
  const [projects, setProjects] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedDrillDown, setSelectedDrillDown] = useState<any>(null);

  // Check if user has access to dashboard
  const hasAccess = ['Admin', 'Owner', 'Partner', 'Manager'].some(role => 
    user?.role && user.role.toLowerCase().includes(role.toLowerCase())
  );

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!hasAccess) return;

    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.dateRange.from) params.append('fromDate', filters.dateRange.from);
      if (filters.dateRange.to) params.append('toDate', filters.dateRange.to);
      if (filters.employeeIds.length > 0) {
        filters.employeeIds.forEach(id => params.append('employeeIds', id));
      }
      if (filters.projectIds.length > 0) {
        filters.projectIds.forEach(id => params.append('projectIds', id));
      }
      if (filters.status !== 'all') params.append('status', filters.status);

      // Fetch all dashboard data in parallel with error handling
      const [summaryRes, employeeRes, projectRes, trendRes] = await Promise.allSettled([
        API.get(`/dashboard/summary?${params.toString()}`).catch(() => ({ data: { data: null } })),
        API.get(`/dashboard/employee-hours?${params.toString()}`).catch(() => ({ data: { data: [] } })),
        API.get(`/dashboard/project-distribution?${params.toString()}`).catch(() => ({ data: { data: [] } })),
        API.get(`/dashboard/trends?${params.toString()}&granularity=${filters.granularity}`).catch(() => ({ data: { data: [] } }))
      ]);

      // Handle each result safely
      if (summaryRes.status === 'fulfilled' && summaryRes.value.data?.success) {
        setDashboardData(summaryRes.value.data.data);
      }
      if (employeeRes.status === 'fulfilled' && employeeRes.value.data?.success) {
        setEmployeeHours(employeeRes.value.data.data);
      }
      if (projectRes.status === 'fulfilled' && projectRes.value.data?.success) {
        setProjectDistribution(projectRes.value.data.data);
      }
      if (trendRes.status === 'fulfilled' && trendRes.value.data?.success) {
        setTrendData(trendRes.value.data.data);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, hasAccess]);

  // Fetch employees and projects for filters (with error handling)
  const fetchFilterOptions = useCallback(async () => {
    if (!hasAccess) return;

    try {
      const [employeesRes, projectsRes] = await Promise.all([
        API.get('/employees').catch(() => ({ data: { data: [] } })),
        API.get('/projects').catch(() => ({ data: { data: [] } }))
      ]);

      const employeeOptions = employeesRes.data?.data?.length
        ? employeesRes.data.data.map((emp: any) => ({
            value: emp.id,
            label: `${emp.firstName} ${emp.lastName || ''}`.trim()
          }))
        : [];

      const projectOptions = projectsRes.data?.data?.length
        ? projectsRes.data.data.map((project: any) => ({
            value: project.id,
            label: project.name
          }))
        : [];

      setEmployees(employeeOptions);
      setProjects(projectOptions);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      // Set empty arrays as fallback
      setEmployees([]);
      setProjects([]);
    }
  }, [hasAccess]);

  // Initial data fetch
  useEffect(() => {
    if (hasAccess) {
      fetchFilterOptions();
      fetchDashboardData();
    }
  }, [hasAccess, fetchDashboardData, fetchFilterOptions]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Handle drill-down clicks
  const handleEmployeeClick = (employeeData: any) => {
    setSelectedDrillDown({
      type: 'employee',
      data: employeeData
    });
  };

  const handleProjectClick = (projectData: any) => {
    setSelectedDrillDown({
      type: 'project',
      data: projectData
    });
  };

  // Export functionality
  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters.dateRange.from) params.append('fromDate', filters.dateRange.from);
      if (filters.dateRange.to) params.append('toDate', filters.dateRange.to);

      const response = await API.get(`/dashboard/export?${params.toString()}`);
      
      // Create download link
      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'json' : 'json'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!hasAccess) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-danger-200 p-8 text-center max-w-md">
          <ChartBarIcon className="w-16 h-16 text-danger-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-secondary-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-secondary-600">
            Dashboard access is restricted to Administrators, Managers, and Partners.
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const employeeChartData = employeeHours.map(emp => ({
    name: emp.employeeName,
    hours: emp.totalHours,
    employeeId: emp.employeeId
  }));

  const projectChartData = projectDistribution.map(project => ({
    name: project.projectName,
    value: project.totalHours,
    projectId: project.projectId,
    clientName: project.clientName
  }));

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 flex-none">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-sm font-medium text-secondary-500 mt-1">
            Interactive Power BI-style analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center border border-secondary-200 rounded-lg">
            <button
              onClick={() => handleExport('excel')}
              className="px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters
        onFiltersChange={handleFiltersChange}
        loading={loading}
        employees={employees}
        projects={projects}
        userRole={user?.role}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 animate-pulse">
                <div className="h-4 bg-secondary-100 rounded w-24 mb-4"></div>
                <div className="h-8 bg-secondary-100 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          dashboardData && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <KPIGrid data={dashboardData} loading={loading} />

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employee Hours Bar Chart */}
                <EmployeeBarChart
                  data={employeeChartData}
                  title="Hours per Employee"
                  subtitle="Total hours logged by each employee"
                  onBarClick={handleEmployeeClick}
                  loading={loading}
                />

                {/* Project Distribution Pie Chart */}
                <ProjectPieChart
                  data={projectChartData}
                  title="Project Distribution"
                  subtitle="Hours distribution across projects"
                  onSliceClick={handleProjectClick}
                  loading={loading}
                />
              </div>

              {/* Trend Chart */}
              <div className="grid grid-cols-1 gap-6">
                <HoursTrendChart
                  data={trendData}
                  title="Hours Trend"
                  subtitle={`${filters.granularity === 'daily' ? 'Daily' : filters.granularity === 'weekly' ? 'Weekly' : 'Monthly'} hours logged over time`}
                  granularity={filters.granularity}
                  loading={loading}
                />
              </div>

              {/* Drill-down Details */}
              {selectedDrillDown && (
                <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-secondary-900 uppercase tracking-tight">
                      {selectedDrillDown.type === 'employee' ? 'Employee Details' : 'Project Details'}
                    </h3>
                    <button
                      onClick={() => setSelectedDrillDown(null)}
                      className="text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  
                  {selectedDrillDown.type === 'employee' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-secondary-500">Employee</p>
                          <p className="text-sm font-bold text-secondary-900">{selectedDrillDown.data.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-secondary-500">Total Hours</p>
                          <p className="text-sm font-bold text-primary-600">{selectedDrillDown.data.hours.toFixed(1)}</p>
                        </div>
                      </div>
                      {/* Add more employee details as needed */}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-secondary-500">Project</p>
                          <p className="text-sm font-bold text-secondary-900">{selectedDrillDown.data.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-secondary-500">Total Hours</p>
                          <p className="text-sm font-bold text-primary-600">{selectedDrillDown.data.value.toFixed(1)}</p>
                        </div>
                      </div>
                      {/* Add more project details as needed */}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;
