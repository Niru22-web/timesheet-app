import React from 'react';

interface ProfileCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ title, icon, children, className = '', actions }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-soft border border-secondary-100 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-secondary-50 flex items-center justify-between bg-secondary-50/30">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary-600">{icon}</div>}
          <h2 className="text-sm font-bold text-secondary-900 uppercase tracking-wider">{title}</h2>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default ProfileCard;
