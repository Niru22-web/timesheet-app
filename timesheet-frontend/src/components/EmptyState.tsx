import React from 'react';
import {
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon,
  FolderOpenIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// UI Components
import Button from './ui/Button';

interface EmptyStateProps {
  type?: 'default' | 'data' | 'dashboard' | 'table' | 'projects' | 'employees' | 'timelogs' | 'search';
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<any>;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type = 'default', 
  title, 
  message, 
  action 
}) => {
  const renderIcon = () => {
    const iconClass = 'w-16 h-16 text-gray-400';
    
    switch (type) {
      case 'dashboard':
        return <ChartBarIcon className={iconClass} />;
      case 'table':
      case 'timelogs':
        return <DocumentTextIcon className={iconClass} />;
      case 'projects':
        return <BriefcaseIcon className={iconClass} />;
      case 'employees':
        return <UsersIcon className={iconClass} />;
      case 'search':
        return <ExclamationTriangleIcon className={iconClass} />;
      default:
        return <FolderOpenIcon className={iconClass} />;
    }
  };

  const getDefaultContent = () => {
    switch (type) {
      case 'dashboard':
        return {
          title: title || 'No Dashboard Data',
          message: message || 'No statistics or metrics are available at the moment. Data will appear once timelogs are recorded.'
        };
      
      case 'table':
      case 'timelogs':
        return {
          title: title || 'No Timelogs Available',
          message: message || 'No timelog entries found for the selected criteria. Try adjusting filters or create new entries.'
        };
      
      case 'projects':
        return {
          title: title || 'No Projects Assigned',
          message: message || 'No projects have been assigned to you yet. Projects will appear here once assigned by your manager.'
        };
      
      case 'employees':
        return {
          title: title || 'No Employees Found',
          message: message || 'No employees match the current search criteria. Try adjusting your filters.'
        };
      
      case 'search':
        return {
          title: title || 'No Results Found',
          message: message || 'No results match your search criteria. Try different keywords or filters.'
        };
      
      default:
        return {
          title: title || 'No Data Available',
          message: message || 'No data is available at the moment. Please check back later.'
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className="text-center py-12 px-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          {renderIcon()}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {content.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {content.message}
          </p>
        </div>

        {/* Action Button */}
        {action && (
          <div className="pt-4">
            <Button
              variant="primary"
              onClick={action.onClick}
              leftIcon={action.icon && <action.icon className="w-4 h-4 mr-2" />}
            >
              {action.label}
            </Button>
          </div>
        )}

        {/* Default Actions for Specific Types */}
        {!action && type === 'timelogs' && (
          <div className="pt-4">
            <Button
              variant="primary"
              onClick={() => window.location.href = '/timesheet'}
              leftIcon={<CalendarIcon className="w-4 h-4 mr-2" />}
            >
              Create New Timelog
            </Button>
          </div>
        )}

        {!action && type === 'dashboard' && (
          <div className="pt-4">
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              leftIcon={<ChartBarIcon className="w-4 h-4 mr-2" />}
            >
              Refresh Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
