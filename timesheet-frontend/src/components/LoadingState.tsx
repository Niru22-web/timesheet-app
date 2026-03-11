import React from 'react';
import {
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface LoadingStateProps {
  type?: 'default' | 'table' | 'dashboard' | 'form';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  type = 'default', 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderIcon = () => {
    const iconClass = `${sizeClasses[size]} animate-spin text-blue-600`;
    
    switch (type) {
      case 'dashboard':
        return <ChartBarIcon className={iconClass} />;
      case 'table':
        return <DocumentTextIcon className={iconClass} />;
      case 'form':
        return <ClockIcon className={iconClass} />;
      default:
        return <div className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`} />;
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'dashboard':
        return (
          <div className="text-center space-y-4">
            {renderIcon()}
            <div>
              <p className={`font-medium text-gray-900 ${textSizes[size]}`}>Loading Dashboard</p>
              <p className="text-sm text-gray-500 mt-1">Fetching your statistics and metrics...</p>
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className="text-center space-y-4">
            {renderIcon()}
            <div>
              <p className={`font-medium text-gray-900 ${textSizes[size]}`}>Loading Data</p>
              <p className="text-sm text-gray-500 mt-1">Retrieving timelog records...</p>
            </div>
          </div>
        );
      
      case 'form':
        return (
          <div className="text-center space-y-4">
            {renderIcon()}
            <div>
              <p className={`font-medium text-gray-900 ${textSizes[size]}`}>Processing</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we process your request...</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center space-y-4">
            {renderIcon()}
            <p className={`font-medium text-gray-900 ${textSizes[size]}`}>{message}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[200px] p-8">
      {renderContent()}
    </div>
  );
};

export default LoadingState;
