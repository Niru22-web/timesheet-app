import React, { useEffect, useRef } from 'react';
import { 
  BriefcaseIcon, 
  CheckCircleIcon, 
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ProfileInsightsProps {
  details: any;
  completeness: number;
  onUpdateClick: () => void;
}

const ProfileInsights: React.FC<ProfileInsightsProps> = ({ details, completeness, onUpdateClick }) => {
  const stats = details.stats || { projectsCount: 0, timelogsCount: 0, teamCount: 0 };
  const activities = details.recentActivities || [];
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${completeness}%`;
    }
  }, [completeness]);

  return (
    <div className="profile-column profile-insights">
      <div className="progress-card mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="completeness-text uppercase">Profile Completeness</span>
          <span className="font-bold">{completeness}%</span>
        </div>
        <div className="progress-bar-bg mb-2">
          <div ref={progressBarRef} className="progress-bar-fill"></div>
        </div>
        <p className="text-[11px] opacity-80">Finish your profile to unlock more features.</p>
      </div>
      
      <div className="stats-grid mb-6">
        <div className="stat-item">
          <span className="stat-label">Projects</span>
          <span className="stat-value">{stats.projectsCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tasks</span>
          <span className="stat-value">{stats.timelogsCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Team</span>
          <span className="stat-value">{stats.teamCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Leaves</span>
          <span className="stat-value">N/A</span>
        </div>
      </div>
      
      <div className="activity-card mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Recent Activity</h3>
        <div className="activity-list">
          {activities.length > 0 ? (
            activities.map((activity: any, index: number) => (
              <div key={index} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <div className="activity-title text-slate-800">{activity.description}</div>
                  <div className="activity-time">{new Date(activity.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No recent activity</p>
          )}
        </div>
      </div>
      
      <button className="save-btn-insights" onClick={onUpdateClick}>
        Update Profile
      </button>
    </div>
  );
};

export default ProfileInsights;
