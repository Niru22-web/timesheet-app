import React from 'react';
import { CheckCircleIcon, ClockIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  type?: 'completed' | 'pending' | 'info';
  className?: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ 
  title, 
  description, 
  time, 
  type = 'info',
  className = '' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <UserPlusIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 ${className}`}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
};

export default ActivityItem;
