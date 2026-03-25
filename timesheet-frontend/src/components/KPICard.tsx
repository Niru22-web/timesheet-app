import React from 'react';
import {
  UsersIcon,
  BriefcaseIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

// UI Components
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning';
  icon: React.ComponentType<any>;
  color?: string;
  bg?: string;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon,
  color = 'text-blue-600',
  bg = 'bg-blue-50',
  loading = false 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      case 'warning':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  const getChangeBg = () => {
    switch (changeType) {
      case 'positive':
        return 'bg-green-50';
      case 'negative':
        return 'bg-red-50';
      case 'neutral':
        return 'bg-gray-50';
      case 'warning':
        return 'bg-orange-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center shadow-sm`}>
          {loading ? (
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Icon className="w-6 h-6" />
          )}
        </div>

        {/* Badge */}
        {change && (
          <Badge 
            variant={changeType === 'warning' ? 'danger' : changeType === 'negative' ? 'danger' : 'success'}
            className="text-xs"
          >
            {change}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">
          {loading ? (
            <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse"></span>
          ) : (
            value
          )}
        </p>
      </div>

      {/* Trend Indicator */}
      {changeType === 'positive' && (
        <div className="flex items-center gap-1 mt-2">
          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600 font-medium">+12% from last month</span>
        </div>
      )}

      {changeType === 'negative' && (
        <div className="flex items-center gap-1 mt-2">
          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600 font-medium">-5% from last month</span>
        </div>
      )}
    </Card>
  );
};

export default KPICard;
