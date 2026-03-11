import React from 'react';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  ClockIcon, 
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  loading?: boolean;
  className?: string;
}

const iconMap = {
  employees: UserGroupIcon,
  projects: BriefcaseIcon,
  hours: ClockIcon,
  approvals: CheckCircleIcon,
  revenue: CurrencyDollarIcon,
  reports: DocumentTextIcon,
  timesheet: CalendarIcon
};

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  gray: 'bg-gray-50 text-gray-600 border-gray-100'
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
  loading = false,
  className = ''
}) => {
  const IconComponent = icon;
  const trendIcon = trend?.direction === 'up' ? '↗' : trend?.direction === 'down' ? '↘' : '→';
  const trendColor = trend?.direction === 'up' ? 'text-green-600' : trend?.direction === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {IconComponent && (
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <IconComponent className="h-6 w-6" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className="text-right">
            <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              <span>{trendIcon}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last period</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Pre-configured metric cards for common use cases
export const EmployeesMetricCard: React.FC<Omit<MetricCardProps, 'icon' | 'color'>> = (props) => (
  <MetricCard {...props} icon={iconMap.employees} color="blue" />
);

export const ProjectsMetricCard: React.FC<Omit<MetricCardProps, 'icon' | 'color'>> = (props) => (
  <MetricCard {...props} icon={iconMap.projects} color="green" />
);

export const HoursMetricCard: React.FC<Omit<MetricCardProps, 'icon' | 'color'>> = (props) => (
  <MetricCard {...props} icon={iconMap.hours} color="purple" />
);

export const ApprovalsMetricCard: React.FC<Omit<MetricCardProps, 'icon' | 'color'>> = (props) => (
  <MetricCard {...props} icon={iconMap.approvals} color="yellow" />
);

export const RevenueMetricCard: React.FC<Omit<MetricCardProps, 'icon' | 'color'>> = (props) => (
  <MetricCard {...props} icon={iconMap.revenue} color="green" />
);

export const ReportsMetricCard: React.FC<Omit<MetricCardProps, 'icon' | 'color'>> = (props) => (
  <MetricCard {...props} icon={iconMap.reports} color="gray" />
);

export const TimesheetMetricCard: React.FC<Omit<MetricCardProps, 'icon' | 'color'>> = (props) => (
  <MetricCard {...props} icon={iconMap.timesheet} color="blue" />
);
