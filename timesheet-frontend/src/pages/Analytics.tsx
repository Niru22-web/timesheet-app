import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import PremiumKPIGrid from '../components/analytics/PremiumKPIGrid';
import PremiumFilters, { FilterState } from '../components/analytics/PremiumFilters';
import InteractiveBarChart from '../components/analytics/InteractiveBarChart';
import TrendLineChart from '../components/analytics/TrendLineChart';
import InteractivePieChart from '../components/analytics/InteractivePieChart';
import DrillDownTable from '../components/analytics/DrillDownTable';
import { 
  ArrowPathIcon, 
  DocumentArrowDownIcon, 
  FunnelIcon,
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface DashboardData {
  totalHours: number;
  totalEmployees: number;
  totalProjects: number;
  pendingTimesheets: number;
  averageHoursPerEmployee: number;
  utilizationRate: number;
  employeeHours: Record<string, number>;
  projectHours: Record<string, number>;
  trends: {
    totalHours: number;
    totalEmployees: number;
    totalProjects: number;
    pendingTimesheets: number;
  };
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

interface DrillDownRecord {
  id: string;
  employee: string;
  project: string;
  date: string;
  hours: number;
  status: string;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
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
  const [drillDownData, setDrillDownData] = useState<DrillDownRecord[]>([]);
  const [employees, setEmployees] = useState<Array<{ value: string; label: string; avatar?: string }>>([]);
  const [projects, setProjects] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedDrillDown, setSelectedDrillDown] = useState<{
    type: 'employee' | 'project' | null;
    data: any;
  }>({ type: null, data: null });

  // Check if user has access to dashboard
  const hasAccess = useMemo(() => {
    if (!user?.role) return false;
    const adminRoles = ['Admin', 'Owner', 'Partner', 'Manager'];
    return adminRoles.some(role => 
      user.role.toLowerCase().includes(role.toLowerCase())
    );
  }, [user?.role]);

  // Get user-specific filter restrictions
  const getUserFilterRestrictions = useCallback(() => {
    if (!user?.role) return { canViewAllEmployees: false, canViewAllProjects: false };
    
    const isAdmin = ['Admin', 'Owner'].some(role => 
      user.role.toLowerCase().includes(role.toLowerCase())
    );
    const isManager = ['Manager', 'Partner'].some(role => 
      user.role.toLowerCase().includes(role.toLowerCase())
    );
    
    return {
      canViewAllEmployees: isAdmin || isManager,
      canViewAllProjects: isAdmin || isManager
    };
  }, [user?.role]);

  // Fetch dashboard data with debouncing
  const fetchDashboardData = useCallback(async () => {
    if (!hasAccess) return;

    try {
      setLoading(true);
      
      // For now, use mock data to show the UI
      const mockData: DashboardData = {
        totalHours: 1247.5,
        totalEmployees: 12,
        totalProjects: 8,
        pendingTimesheets: 3,
        averageHoursPerEmployee: 104.0,
        utilizationRate: 85.2,
        employeeHours: {},
        projectHours: {},
        trends: {
          totalHours: 12.5,
          totalEmployees: 8.3,
          totalProjects: 0,
          pendingTimesheets: -25.0
        }
      };

      const mockEmployeeHours: EmployeeHoursData[] = [
        { employeeId: '1', employeeName: 'John Doe', email: 'john@example.com', totalHours: 156.5, projects: {}, dailyHours: [] },
        { employeeId: '2', employeeName: 'Jane Smith', email: 'jane@example.com', totalHours: 142.3, projects: {}, dailyHours: [] },
        { employeeId: '3', employeeName: 'Mike Johnson', email: 'mike@example.com', totalHours: 138.7, projects: {}, dailyHours: [] },
      ];

      const mockProjectDistribution: ProjectDistributionData[] = [
        { projectId: '1', projectName: 'Website Redesign', clientName: 'Client A', totalHours: 456.8, employeeCount: 5 },
        { projectId: '2', projectName: 'Mobile App', clientName: 'Client B', totalHours: 342.1, employeeCount: 4 },
        { projectId: '3', projectName: 'API Development', clientName: 'Client C', totalHours: 289.4, employeeCount: 3 },
      ];

      const mockTrendData: TrendData[] = [
        { date: '2024-01-01', totalHours: 145.2, employeeCount: 10, projectCount: 6 },
        { date: '2024-01-02', totalHours: 167.8, employeeCount: 11, projectCount: 7 },
        { date: '2024-01-03', totalHours: 189.3, employeeCount: 12, projectCount: 8 },
      ];

      const mockDrillDownData: DrillDownRecord[] = [
        { id: '1', employee: 'John Doe', project: 'Website Redesign', date: '2024-01-15', hours: 8.5, status: 'approved' },
        { id: '2', employee: 'Jane Smith', project: 'Mobile App', date: '2024-01-15', hours: 7.5, status: 'pending' },
        { id: '3', employee: 'Mike Johnson', project: 'API Development', date: '2024-01-15', hours: 6.0, status: 'approved' },
      ];

      // Set mock data
      setDashboardData(mockData);
      setEmployeeHours(mockEmployeeHours);
      setProjectDistribution(mockProjectDistribution);
      setTrendData(mockTrendData);
      setDrillDownData(mockDrillDownData);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [hasAccess]);

  // Fetch employees and projects for filters
  const fetchFilterOptions = useCallback(async () => {
    if (!hasAccess) return;

    try {
      const restrictions = getUserFilterRestrictions();
      const [employeesRes, projectsRes] = await Promise.all([
        API.get('/employees').catch(() => ({ data: { data: [] } })),
        API.get('/projects').catch(() => ({ data: { data: [] } }))
      ]);

      const employeeOptions = employeesRes.data?.data?.length
        ? employeesRes.data.data.map((emp: any) => ({
            value: emp.id,
            label: `${emp.firstName} ${emp.lastName || ''}`.trim(),
            avatar: emp.profileImage || undefined
          }))
        : [];

      const projectOptions = projectsRes.data?.data?.length
        ? projectsRes.data.data.map((project: any) => ({
            value: project.id,
            label: project.name
          }))
        : [];

      // Apply role-based restrictions
      if (!restrictions.canViewAllEmployees && user?.id) {
        const userEmployee = employeeOptions.find(emp => emp.value === user.id);
        setEmployees(userEmployee ? [userEmployee] : []);
      } else {
        setEmployees(employeeOptions);
      }

      setProjects(projectOptions);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      setEmployees([]);
      setProjects([]);
    }
  }, [hasAccess, getUserFilterRestrictions, user?.id]);

  // Initial data fetch
  useEffect(() => {
    if (hasAccess) {
      fetchFilterOptions();
      fetchDashboardData();
    }
  }, [hasAccess]);

  // Handle filter changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hasAccess) {
        fetchDashboardData();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, hasAccess, fetchDashboardData]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setSelectedDrillDown({ type: null, data: null });
  };

  // Handle drill-down clicks
  const handleEmployeeClick = (employeeData: any) => {
    setSelectedDrillDown({
      type: 'employee',
      data: employeeData
    });
    
    // Filter drill-down table for this employee
    const filteredData = drillDownData.filter(record => 
      record.employee.toLowerCase().includes(employeeData.name.toLowerCase())
    );
    setDrillDownData(filteredData);
  };

  const handleProjectClick = (projectData: any) => {
    setSelectedDrillDown({
      type: 'project',
      data: projectData
    });
    
    // Filter drill-down table for this project
    const filteredData = drillDownData.filter(record => 
      record.project.toLowerCase().includes(projectData.name.toLowerCase())
    );
    setDrillDownData(filteredData);
  };

  const clearDrillDown = () => {
    setSelectedDrillDown({ type: null, data: null });
    fetchDashboardData(); // Refresh drill-down data
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
      link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'json' : 'json'}`;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center max-w-md">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-600">
            Analytics Dashboard access is restricted to Administrators, Managers, and Partners.
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const employeeChartData = useMemo(() => 
    employeeHours.map((emp: any) => ({
      name: emp.employeeName,
      hours: emp.totalHours,
      employeeId: emp.employeeId
    })), [employeeHours]
  );

  const projectChartData = useMemo(() => 
    projectDistribution.map(project => ({
      name: project.projectName,
      value: project.totalHours,
      projectId: project.projectId,
      clientName: project.clientName
    })), [projectDistribution]
  );

  const hasData = dashboardData || employeeHours.length > 0 || projectDistribution.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Interactive insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchDashboardData()}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleExport('excel')}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 border-l border-gray-200"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Last updated: {format(lastUpdated, 'MMM d, HH:mm')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="px-6 py-3">
          <PremiumFilters
            onFiltersChange={handleFiltersChange}
            loading={loading}
            employees={employees}
            projects={projects}
            userRole={user?.role}
            initialFilters={filters}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {loading && !hasData ? (
          <div className="space-y-6">
            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse h-80"></div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse h-80"></div>
            </div>
          </div>
        ) : !hasData ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No data available</h3>
            <p className="text-sm text-gray-600">
              No data available for selected filters. Try adjusting your filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Premium KPI Cards */}
            {dashboardData && (
              <PremiumKPIGrid data={dashboardData} loading={loading} />
            )}

            {/* Interactive Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employee Hours Bar Chart */}
              <InteractiveBarChart
                data={employeeChartData}
                title="Hours per Employee"
                subtitle="Click bars to filter details"
                onBarClick={handleEmployeeClick}
                loading={loading}
                selectedDrillDown={selectedDrillDown}
              />

              {/* Project Distribution Pie Chart */}
              <InteractivePieChart
                data={projectChartData}
                title="Project Distribution"
                subtitle="Hours distribution across projects"
                onSliceClick={handleProjectClick}
                loading={loading}
                selectedDrillDown={selectedDrillDown}
              />
            </div>

            {/* Trend Line Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <TrendLineChart
                data={trendData}
                title="Hours Trend"
                subtitle={`${filters.granularity === 'daily' ? 'Daily' : filters.granularity === 'weekly' ? 'Weekly' : 'Monthly'} hours logged over time`}
                granularity={filters.granularity}
                loading={loading}
              />
            </div>

            {/* Interactive Drill-down Table */}
            {(drillDownData.length > 0 || selectedDrillDown.type) && (
              <DrillDownTable
                data={drillDownData}
                selectedDrillDown={selectedDrillDown}
                onClearDrillDown={clearDrillDown}
                loading={loading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
