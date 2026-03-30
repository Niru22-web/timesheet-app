import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip 
} from 'recharts';
import { 
  Users, Briefcase, CheckCircle, Clock, 
  Calendar, MessageSquare, Bell, ArrowRight,
  PlusCircle, PlayCircle, Target
} from 'lucide-react';
import { MetricCard } from './ui/MetricCard';
import Button from './ui/Button';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import DashboardLayout from './DashboardLayout';
import NotificationWidget from './ui/NotificationWidget';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const dashboardStyles = `
  .dashboard-welcome-banner {
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  }
  .dashboard-welcome-title {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.3px;
  }
  .dashboard-welcome-desc {
    font-size: 15px;
    color: rgba(255,255,255,0.85);
  }
  .dashboard-btn-secondary {
    background: white !important;
    color: #1e3a8a !important;
    border-radius: 10px !important;
    padding: 10px 16px !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
  }
  .dashboard-btn-ghost {
    background: transparent !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
    color: white !important;
    border-radius: 10px !important;
    padding: 10px 16px !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
  }
  .dashboard-progress-card {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(12px);
  }
  .role-indicator {
    /* Base styles */
  }
  .indicator-color-0 { background-color: #0088FE; }
  .indicator-color-1 { background-color: #00C49F; }
  .indicator-color-2 { background-color: #FFBB28; }
  .indicator-color-3 { background-color: #FF8042; }
  .indicator-color-4 { background-color: #8884d8; }
`;

const TOOLTIP_STYLE = { 
  borderRadius: '12px', 
  border: 'none', 
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
};

const CommonDashboard: React.FC<{ userRole?: string, title?: string, subtitle?: string }> = ({ userRole, title, subtitle }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = (userRole || user?.role || 'employee').toLowerCase();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(75);

  // Calculate profile completion dynamically
  const calculateProfileCompletion = useCallback(() => {
    if (!user) return 0;
    
    let completion = 0;
    const fields = [
      user.name,
      user.email,
      user.role,
      user.position,
      user.department,
      user.officeEmail,
      user.profile?.employeePhotoUrl
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    completion = Math.round((filledFields / fields.length) * 100);
    
    return Math.min(completion, 95); // Cap at 95% to encourage more engagement
  }, [user]);

  // Update profile completion when user data changes
  useEffect(() => {
    if (user) {
      setProfileCompletion(calculateProfileCompletion());
    }
  }, [user, calculateProfileCompletion]);

  const [tasks, setTasks] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/jobs?status=Started').catch(() => ({ data: { data: [] } }))
      ]);
      
      // 🔥 Always use fresh data - don't merge with old state
      setData(statsRes.data.data);
      setTasks(tasksRes.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    if (!user?.id) return;
    
    fetchData();
    
    // 🔥 Auto-refresh every 30 seconds for live data
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  // 🔥 Refresh when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        fetchData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id]);

  // 🔥 Listen for global data update events
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      console.log('🔄 Dashboard global data update event received:', event.detail);
      if (event.detail.type?.includes('/dashboard') || event.detail.type?.includes('/employees/')) {
        fetchData();
      }
    };

    window.addEventListener('data-updated', handleDataUpdate as EventListener);
    return () => window.removeEventListener('data-updated', handleDataUpdate as EventListener);
  }, [user?.id]);

  // 🔥 Manual refresh function for external triggers
  const refreshDashboard = useCallback(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  if (loading && !data) {
    return (
      <DashboardLayout title={title || "Dashboard"} subtitle={subtitle || "Loading your workspace..."}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {};
  const roleDistribution = data?.roleDistribution || [];
  const activities = data?.activities || [];

  return (
    <DashboardLayout 
      title={title || "Dashboard"} 
      subtitle={subtitle || `Welcome back, ${user?.name || 'User'}`}
    >
      <style>{dashboardStyles}</style>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Welcome Card */}
          <div className="dashboard-welcome-banner bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-7 text-white shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Subtle glass/blur effect overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>
            
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target size={180} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Left Content */}
              <div className="space-y-4 flex-1">
                <h1 className="dashboard-welcome-title text-2xl font-semibold">
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <p className="dashboard-welcome-desc text-blue-100 max-w-md">
                  You're making great progress. Complete your profile to unlock all features.
                </p>
                <div className="flex flex-wrap gap-3 pt-2 items-center">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => navigate('/profile')}
                    className="dashboard-btn-secondary flex items-center gap-2 font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    <PlusCircle size={18} />
                    Complete Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/employees')}
                    className="dashboard-btn-ghost flex items-center gap-2 font-medium rounded-lg hover:bg-white/10 transition-all duration-200"
                  >
                    <PlayCircle size={18} />
                    View Dashboard
                  </Button>
                </div>
              </div>
              
              {/* Right Card - Progress */}
              <div className="dashboard-progress-card rounded-2xl p-6 flex flex-col items-center justify-center min-w-[140px] border border-white/20">
                 <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* Animated progress ring */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/20" />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="36" 
                        stroke="currentColor" 
                        strokeWidth="10" 
                        fill="transparent" 
                        strokeDasharray={226} 
                        strokeDashoffset={226 * (1 - profileCompletion / 100)} 
                        className="text-white transition-all duration-500 ease-out" 
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-xl font-bold">{profileCompletion}%</span>
                 </div>
                 <p className="mt-2 text-sm font-medium text-blue-100">Profile Completion</p>
              </div>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {role === 'admin' || role === 'owner' ? (
              <>
                <MetricCard title="Total Projects" value={stats.totalProjects || 0} icon={Briefcase} color="blue" />
                <MetricCard title="Total Clients" value={stats.totalClients || 0} icon={Users} color="green" />
                <MetricCard title="Total Tasks" value={stats.totalTasks || 0} icon={CheckCircle} color="purple" />
                <MetricCard title="Total Employees" value={stats.totalEmployees || 0} icon={Users} color="yellow" />
              </>
            ) : role === 'partner' ? (
              <>
                <MetricCard title="My Projects" value={stats.totalProjects || 0} icon={Briefcase} color="blue" />
                <MetricCard title="My Clients" value={stats.totalClients || 0} icon={Users} color="green" />
                <MetricCard title="Team Tasks" value={stats.totalTasks || 0} icon={CheckCircle} color="purple" />
                <MetricCard title="Team Members" value={stats.totalEmployees || 0} icon={Users} color="yellow" />
              </>
            ) : role === 'manager' ? (
              <>
                <MetricCard title="Assigned Projects" value={stats.totalProjects || 0} icon={Briefcase} color="blue" />
                <MetricCard title="My Team" value={stats.totalEmployees || 0} icon={Users} color="green" />
                <MetricCard title="Team Tasks" value={stats.totalTasks || 0} icon={CheckCircle} color="purple" />
                <MetricCard title="Active Jobs" value={stats.activeJobs || 0} icon={Clock} color="yellow" />
              </>
            ) : (
              <>
                <MetricCard title="My Projects" value={stats.totalProjects || 0} icon={Briefcase} color="blue" />
                <MetricCard title="My Tasks" value={stats.totalTasks || 0} icon={CheckCircle} color="green" />
                <MetricCard title="Completed" value={stats.completedTasks || 0} icon={CheckCircle} color="purple" />
                <MetricCard title="Hours Logged" value={stats.hoursLogged || 0} icon={Clock} color="yellow" />
              </>
            )}
          </div>

          {/* Team Executive Section (Chart) */}
          <Card className="p-8 border-none shadow-premium bg-white rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Team Executive Section</h3>
                <p className="text-sm text-gray-500">Distribution of team roles across the organization</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">View Report</Button>
            </div>
            
            <div className="h-[300px] flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistribution.length > 0 ? roleDistribution : [{name: 'No Data', value: 1}]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(roleDistribution.length > 0 ? roleDistribution : [{name: 'Empty', value: 1}]).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={TOOLTIP_STYLE}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full md:w-1/2 space-y-4">
                {roleDistribution.map((item: any, index: number) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full indicator-color-${index % COLORS.length}`}></div>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.value} members</span>
                  </div>
                ))}
                {roleDistribution.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No team data available yet</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

        </div>

        {/* Right Section (1/3) */}
        <div className="space-y-8">
          <div className="h-full min-h-[500px]">
            <NotificationWidget />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default CommonDashboard;
