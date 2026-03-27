import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useToast } from '../../contexts/ToastContext';
import API from '../../api';
import { 
  Briefcase, Users, CheckCircle, Clock, Calendar, 
  MessageSquare, Bell, ArrowRight, PlusCircle, PlayCircle,
  Target, TrendingUp, UserPlus, FileText, Activity, X
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import NotificationWidget from '../ui/NotificationWidget';

interface DashboardStats {
  totalProjects?: number;
  totalClients?: number;
  totalTasks?: number;
  totalEmployees?: number;
  myProjects?: number;
  myClients?: number;
  teamTasks?: number;
  teamMembers?: number;
  completedTasks?: number;
  hoursLogged?: number;
  activeJobs?: number;
  pendingApprovals?: number;
  recentActivities?: any[];
}

interface ModernRoleDashboardProps {
  userRole: string;
}

const ModernRoleDashboard: React.FC<ModernRoleDashboardProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { removeNotification, state } = useNotifications();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({});
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Calculate profile completion
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
      user.profile?.employeePhotoUrl,
      user.profile?.phone,
      user.profile?.address
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    completion = Math.round((filledFields / fields.length) * 100);
    
    return Math.min(completion, 95);
  }, [user]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch role-specific data
      const endpoints = {
        admin: ['/dashboard/admin-stats', '/dashboard/recent-activities'],
        manager: ['/dashboard/manager-stats', '/dashboard/recent-activities'],
        partner: ['/dashboard/partner-stats', '/dashboard/recent-activities'],
        employee: ['/dashboard/employee-stats', '/dashboard/my-recent-activities']
      };

      const roleEndpoints = endpoints[userRole as keyof typeof endpoints] || endpoints.employee;
      
      const [statsRes, activitiesRes] = await Promise.allSettled([
        API.get(roleEndpoints[0]),
        API.get(roleEndpoints[1])
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.data || {});
      }

      if (activitiesRes.status === 'fulfilled') {
        setRecentActivities(activitiesRes.value.data.data || []);
      }

      // Set profile completion
      setProfileCompletion(calculateProfileCompletion());
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle activity removal (for real-time updates)
  const handleActivityAction = useCallback((activityId: string) => {
    // Remove activity from recent activities list
    setRecentActivities(prev => prev.filter(activity => activity.id !== activityId));
    
    // Also remove from notifications if it exists there
    removeNotification(activityId);
  }, [removeNotification]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, userRole]);

  // Role-specific metric configurations
  const getRoleMetrics = () => {
    const role = userRole.toLowerCase();
    
    switch (role) {
      case 'admin':
      case 'owner':
        return [
          { title: 'Total Projects', value: stats.totalProjects || 0, icon: Briefcase, color: 'blue', trend: '+12%' },
          { title: 'Total Clients', value: stats.totalClients || 0, icon: Users, color: 'green', trend: '+8%' },
          { title: 'Total Tasks', value: stats.totalTasks || 0, icon: CheckCircle, color: 'purple', trend: '+23%' },
          { title: 'Total Employees', value: stats.totalEmployees || 0, icon: Users, color: 'yellow', trend: '+5%' }
        ];
      
      case 'partner':
        return [
          { title: 'My Projects', value: stats.myProjects || 0, icon: Briefcase, color: 'blue', trend: '+15%' },
          { title: 'My Clients', value: stats.myClients || 0, icon: Users, color: 'green', trend: '+10%' },
          { title: 'Team Tasks', value: stats.teamTasks || 0, icon: CheckCircle, color: 'purple', trend: '+18%' },
          { title: 'Team Members', value: stats.teamMembers || 0, icon: Users, color: 'yellow', trend: '+3%' }
        ];
      
      case 'manager':
        return [
          { title: 'Assigned Projects', value: stats.totalProjects || 0, icon: Briefcase, color: 'blue', trend: '+7%' },
          { title: 'My Team', value: stats.totalEmployees || 0, icon: Users, color: 'green', trend: '+2%' },
          { title: 'Team Tasks', value: stats.teamTasks || 0, icon: CheckCircle, color: 'purple', trend: '+25%' },
          { title: 'Active Jobs', value: stats.activeJobs || 0, icon: Clock, color: 'yellow', trend: '+12%' }
        ];
      
      default: // employee
        return [
          { title: 'My Projects', value: stats.myProjects || 0, icon: Briefcase, color: 'blue', trend: '+5%' },
          { title: 'My Tasks', value: stats.totalTasks || 0, icon: CheckCircle, color: 'green', trend: '+15%' },
          { title: 'Completed', value: stats.completedTasks || 0, icon: CheckCircle, color: 'purple', trend: '+20%' },
          { title: 'Hours Logged', value: stats.hoursLogged || 0, icon: Clock, color: 'yellow', trend: '+8%' }
        ];
    }
  };

  const roleMetrics = getRoleMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Profile Completion */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Target size={200} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-blue-100 max-w-md">
              You're making great progress. Complete your profile to unlock all features.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => navigate('/profile')}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <PlusCircle size={18} />
                Complete Profile
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/timesheet')}
                className="border-white text-white hover:bg-white/10"
              >
                <PlayCircle size={18} />
                View Dashboard
              </Button>
            </div>
          </div>
          
          {/* Profile Completion Circle */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center min-w-[140px]">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  className="text-white/30" 
                />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={226} 
                  strokeDashoffset={226 * (1 - profileCompletion / 100)} 
                  className="text-white transition-all duration-500" 
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                {profileCompletion}%
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-blue-100">Profile Completion</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleMetrics.map((metric, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-${metric.color}-50 text-${metric.color}-600`}>
                  <metric.icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp size={14} />
                <span>{metric.trend}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Action buttons for employee approval activities */}
                    {activity.type === 'user_registration' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            // Approve action
                            API.post(`/employees/approve-employee/${activity.relatedId}`)
                              .then(() => {
                                // Immediately remove from UI
                                handleActivityAction(activity.id);
                                toast.success('Employee approved successfully');
                              })
                              .catch(() => {
                                toast.error('Failed to approve employee');
                              });
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // Dismiss action
                            handleActivityAction(activity.id);
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X size={14} />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Notifications - Only show if there are unread notifications */}
        {state.unreadCount > 0 && (
          <div className="space-y-6">
            <NotificationWidget />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernRoleDashboard;
