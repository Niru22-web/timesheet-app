import React from 'react';
import { 
  ChartBarIcon, 
  SparklesIcon, 
  PlusIcon,
  AcademicCapIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import ProfileCard from './ProfileCard';
import Button from '../ui/Button';

interface ProfileInsightsProps {
  details: any;
  completeness: number;
  onUpdateClick: () => void;
}

const ProfileInsights: React.FC<ProfileInsightsProps> = ({ details, completeness, onUpdateClick }) => {
  if (!details) return (
    <div className="w-[340px] h-full bg-secondary-50 animate-pulse rounded-2xl" />
  );

  const profile = details.profile || {};
  const skills = profile.skills || [];

  return (
    <div className="w-[340px] flex flex-col gap-6 animate-fade-in custom-scrollbar overflow-y-auto px-1 pb-10">
      {/* Profile Completion */}
      <ProfileCard 
        title="Registry Status" 
        icon={<CheckBadgeIcon className="w-5 h-5" />}
        actions={
          <span className={`text-xs font-bold ${completeness === 100 ? 'text-success-600' : 'text-primary-600'}`}>
            {completeness}%
          </span>
        }
      >
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Completion Index</p>
          <div className="w-full h-2.5 bg-secondary-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary-500 profile-progress-fill" 
              /* eslint-disable-next-line @typescript-eslint/consistent-type-definitions */
              style={{ '--completeness': `${completeness}%` } as React.CSSProperties} 
            />
          </div>
          <p className="text-xs text-secondary-500 leading-relaxed">
            {completeness < 100 
              ? `Your professional profile is ${completeness}% complete. Update missing details to achieve verified status.` 
              : 'Professional profile fully synchronized with central registry. Credentials verified.'
            }
          </p>
          {completeness < 100 && (
            <Button 
              variant="secondary" 
              fullWidth 
              size="sm" 
              onClick={onUpdateClick}
              className="mt-2"
              title="Complete Profile"
            >
              Complete Profile
            </Button>
          )}
        </div>
      </ProfileCard>

      {/* Skills & proficiencies */}
      <ProfileCard title="Core Proficiencies" icon={<SparklesIcon className="w-5 h-5" />}>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill: string, idx: number) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 rounded-xl bg-white border border-secondary-100 shadow-soft text-xs font-bold text-secondary-700 hover:border-primary-200 hover:text-primary-600 transition-all cursor-default"
                >
                  {skill}
                </span>
              ))
            ) : (
              <div className="w-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-secondary-100 rounded-2xl bg-secondary-50/30">
                <SparklesIcon className="w-8 h-8 text-secondary-200 mb-2" />
                <p className="text-xs text-secondary-400 font-medium">No skills mapped yet</p>
              </div>
            )}
            <button 
              onClick={onUpdateClick}
              className="p-1.5 rounded-xl border border-dashed border-secondary-300 text-secondary-400 hover:border-primary-400 hover:text-primary-600 transition-all"
              title="Add Skill"
              aria-label="Add Skill"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </ProfileCard>

      {/* Documents / Achievements */}
      <ProfileCard title="Credential Library" icon={<AcademicCapIcon className="w-5 h-5" />}>
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-secondary-50 border border-secondary-100 flex items-center gap-3 group cursor-pointer hover:bg-white hover:shadow-soft transition-all">
            <div className="p-2 bg-white rounded-lg border border-secondary-100 text-secondary-400 group-hover:text-primary-600 transition-colors">
              <ChartBarIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Experience Certificate</p>
              <p className="text-xs font-bold text-secondary-700 mt-0.5">Verified System Copy</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-secondary-50 border border-secondary-100 flex items-center gap-3 group cursor-pointer hover:bg-white hover:shadow-soft transition-all">
            <div className="p-2 bg-white rounded-lg border border-secondary-100 text-secondary-400 group-hover:text-primary-600 transition-colors">
              <AcademicCapIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Academic Degrees</p>
              <p className="text-xs font-bold text-secondary-700 mt-0.5">Under Verification</p>
            </div>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
};

export default ProfileInsights;
