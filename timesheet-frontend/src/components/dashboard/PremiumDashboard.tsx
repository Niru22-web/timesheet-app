import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../api';
import { 
  UserCircleIcon,
  ClockIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CalendarIcon,
  BellIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  CircleStackIcon,
  UserPlusIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import ProfileCard from './ProfileCard';
import ProgressCard from './ProgressCard';
import TimeTrackerCard from './TimeTrackerCard';
import OnboardingCard from './OnboardingCard';
import CalendarCard from './CalendarCard';
import NotificationBell from '../ui/NotificationBell';
import ModernDonutChart from './ModernDonutChart';
import WeeklyBarChart from './WeeklyBarChart';

// Helper functions
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'inactive':
      return 'text-red-600 bg-red-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

interface DashboardStats {
  interviews: number;
  hired: number;
  projectHired: number;
  outputPercentage: number;
  employees: number;
  hirings: number;
  projects: number;
}

interface PremiumDashboardProps {}

const PremiumDashboard: React.FC<PremiumDashboardProps> = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    interviews: 0,
    hired: 0,
    projectHired: 0,
    outputPercentage: 0,
    employees: 0,
    hirings: 0,
    projects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Add debug logging
      console.log('🔍 Fetching dashboard stats...');
      
      const response = await API.get('/dashboard/summary');
      console.log('📊 Dashboard response:', response.data);
      
      if (response.data.success) {
        const data = response.data.data;
        setStats({
          interviews: Math.floor(Math.random() * 50) + 10, // Mock data
          hired: data.totalEmployees || 0,
          projectHired: Math.floor(Math.random() * 30) + 5, // Mock data
          outputPercentage: Math.floor(Math.random() * 40) + 60, // Mock data
          employees: data.totalEmployees || 0,
          hirings: Math.floor(Math.random() * 20) + 5, // Mock data
          projects: data.totalProjects || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Set fallback data to prevent UI crashes
      setStats({
        interviews: 25,
        hired: 10,
        projectHired: 15,
        outputPercentage: 85,
        employees: 10,
        hirings: 8,
        projects: 5
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-96 shadow-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Welcome Section */}
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Welcome in, {user?.firstName || user?.officeEmail?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-slate-600 text-lg">Here's what's happening with your team today</p>
          </div>

          {/* Notification Bell */}
          <NotificationBell />
        </div>

        {/* Stat Pills */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="px-6 py-3 bg-white rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center gap-3">
              <UserPlusIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Interviews</span>
              <span className="text-lg font-bold text-slate-900">{stats.interviews}</span>
            </div>
          </div>
          <div className="px-6 py-3 bg-white rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Hired</span>
              <span className="text-lg font-bold text-slate-900">{stats.hired}</span>
            </div>
          </div>
          <div className="px-6 py-3 bg-white rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center gap-3">
              <BriefcaseIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">Project Hired</span>
              <span className="text-lg font-bold text-slate-900">{stats.projectHired}</span>
            </div>
          </div>
          <div className="px-6 py-3 bg-white rounded-2xl shadow-md border border-slate-100">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-slate-700">Output %</span>
              <span className="text-lg font-bold text-slate-900">{stats.outputPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Profile & Progress */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileCard user={user} />
          <ProgressCard />
        </div>

        {/* Middle Column - Time Tracker & Onboarding */}
        <div className="lg:col-span-1 space-y-6">
          <TimeTrackerCard />
          <OnboardingCard />
        </div>

        {/* Right Column - KPI Metrics & Calendar */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Metrics */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <CircleStackIcon className="w-6 h-6 text-blue-600" />
              Key Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-700 mb-2">{stats.employees}</div>
                <div className="text-sm font-medium text-blue-600">Employees</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                <div className="text-3xl font-bold text-green-700 mb-2">{stats.hirings}</div>
                <div className="text-sm font-medium text-green-600">Hirings</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                <div className="text-3xl font-bold text-purple-700 mb-2">{stats.projects}</div>
                <div className="text-sm font-medium text-purple-600">Projects</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModernDonutChart />
            <WeeklyBarChart />
          </div>

          {/* Calendar */}
          <CalendarCard />
        </div>
      </div>
    </div>
  );
};

export default PremiumDashboard;
