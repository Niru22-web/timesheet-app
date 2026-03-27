import React from 'react';
import { 
  ClockIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'primary' | 'indigo' | 'emerald' | 'amber';
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  color, 
  loading = false 
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      text: 'text-primary-600',
      border: 'border-primary-400'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-400'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-400'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-400'
    }
  };

  const getIcon = () => {
    switch (color) {
      case 'primary':
        return <ClockIcon className="w-6 h-6" />;
      case 'indigo':
        return <UsersIcon className="w-6 h-6" />;
      case 'emerald':
        return <BriefcaseIcon className="w-6 h-6" />;
      case 'amber':
        return <DocumentTextIcon className="w-6 h-6" />;
      default:
        return <ClockIcon className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary-100 rounded-xl"></div>
          <div className="flex-1">
            <div className="h-4 bg-secondary-100 rounded w-24 mb-2"></div>
            <div className="h-8 bg-secondary-100 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-b-2 ${colorClasses[color].border} p-6 hover:shadow-md transition-all duration-200 cursor-pointer group`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 ${colorClasses[color].bg} ${colorClasses[color].text} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-1">
            {title}
          </p>
          <p className="text-2xl font-black text-secondary-900 tabular-nums">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs font-medium text-secondary-500 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-bold ${
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-secondary-400">vs last period</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface KPIGridProps {
  data: {
    totalHours: number;
    totalEmployees: number;
    totalProjects: number;
    pendingTimesheets: number;
    averageHoursPerEmployee: number;
    utilizationRate: number;
  };
  loading?: boolean;
}

const KPIGrid: React.FC<KPIGridProps> = ({ data, loading }) => {
  const kpiData = [
    {
      title: 'Total Hours Logged',
      value: data.totalHours.toFixed(1),
      subtitle: 'All time entries',
      color: 'primary' as const,
      icon: ClockIcon
    },
    {
      title: 'Total Employees',
      value: data.totalEmployees,
      subtitle: 'Active personnel',
      color: 'indigo' as const,
      icon: UsersIcon
    },
    {
      title: 'Total Projects',
      value: data.totalProjects,
      subtitle: 'Active engagements',
      color: 'emerald' as const,
      icon: BriefcaseIcon
    },
    {
      title: 'Pending Timesheets',
      value: data.pendingTimesheets,
      subtitle: 'Awaiting approval',
      color: 'amber' as const,
      icon: DocumentTextIcon
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <KPICard
          key={index}
          title={kpi.title}
          value={kpi.value}
          subtitle={kpi.subtitle}
          color={kpi.color}
          loading={loading}
        />
      ))}
    </div>
  );
};

export { KPICard, KPIGrid };
export default KPIGrid;
