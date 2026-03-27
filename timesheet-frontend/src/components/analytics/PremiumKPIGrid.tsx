import React from 'react';
import { 
  ClockIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'indigo' | 'emerald' | 'amber' | 'purple';
  loading?: boolean;
  sparklineData?: number[];
  icon?: React.ComponentType<any>;
}

const PremiumKPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  color, 
  loading = false,
  sparklineData = [],
  icon: CustomIcon
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600',
      light: 'bg-blue-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      gradient: 'from-indigo-500 to-indigo-600',
      light: 'bg-indigo-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      gradient: 'from-emerald-500 to-emerald-600',
      light: 'bg-emerald-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      gradient: 'from-amber-500 to-amber-600',
      light: 'bg-amber-100'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      gradient: 'from-purple-500 to-purple-600',
      light: 'bg-purple-100'
    }
  };

  const getIcon = () => {
    if (CustomIcon) return <CustomIcon className="w-6 h-6" />;
    
    switch (color) {
      case 'blue':
        return <ClockIcon className="w-6 h-6" />;
      case 'indigo':
        return <UsersIcon className="w-6 h-6" />;
      case 'emerald':
        return <BriefcaseIcon className="w-6 h-6" />;
      case 'amber':
        return <DocumentTextIcon className="w-6 h-6" />;
      case 'purple':
        return <ChartBarIcon className="w-6 h-6" />;
      default:
        return <ClockIcon className="w-6 h-6" />;
    }
  };

  // Generate sparkline SVG
  const generateSparkline = (data: number[]) => {
    if (!data || data.length < 2) return null;
    
    const width = 60;
    const height = 20;
    const padding = 2;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');
    
    const isPositive = data[data.length - 1] > data[0];
    const gradientColor = isPositive ? '#10b981' : '#ef4444';
    
    return (
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradientColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={gradientColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill={`url(#gradient-${color})`}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={gradientColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* End point dot */}
        <circle
          cx={width - padding}
          cy={height - padding - ((data[data.length - 1] - min) / range) * (height - 2 * padding)}
          r="2"
          fill={gradientColor}
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-28 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-200 p-6 
        hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer
        group relative overflow-hidden
      `}
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          {/* Icon with enhanced styling */}
          <div className={`
            p-3.5 ${colorClasses[color].bg} ${colorClasses[color].text} 
            rounded-2xl group-hover:scale-110 transition-all duration-300 
            group-hover:shadow-lg
          `}>
            {getIcon()}
          </div>
          
          {/* Sparkline */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              {generateSparkline(sparklineData)}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 tabular-nums mb-1">
            {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
          </p>
          {subtitle && (
            <p className="text-sm font-medium text-gray-600 mb-3">
              {subtitle}
            </p>
          )}
          
          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center gap-2">
              <div className={`
                flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold
                ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}
              `}>
                {trend.isPositive ? (
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                ) : (
                  <ArrowTrendingDownIcon className="w-3 h-3" />
                )}
                {Math.abs(trend.value)}%
              </div>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PremiumKPIGridProps {
  data: {
    totalHours: number;
    totalEmployees: number;
    totalProjects: number;
    pendingTimesheets: number;
    averageHoursPerEmployee: number;
    utilizationRate: number;
    trends?: {
      totalHours: number;
      totalEmployees: number;
      totalProjects: number;
      pendingTimesheets: number;
    };
  };
  loading?: boolean;
}

const PremiumKPIGrid: React.FC<PremiumKPIGridProps> = ({ data, loading }) => {
  // Generate sample sparkline data (in real app, this would come from API)
  const generateSparklineData = (baseValue: number, variance: number = 0.3) => {
    const points = 12;
    return Array.from({ length: points }, (_, i) => {
      const randomVariance = (Math.random() - 0.5) * variance * baseValue;
      const trend = (i / points) * 0.1 * baseValue; // Slight upward trend
      return Math.max(0, baseValue + randomVariance + trend);
    });
  };

  const kpiData = [
    {
      title: 'Total Hours',
      value: data.totalHours.toFixed(1),
      subtitle: 'All time entries',
      color: 'blue' as const,
      icon: ClockIcon,
      trend: data.trends ? {
        value: data.trends.totalHours,
        isPositive: data.trends.totalHours >= 0
      } : undefined,
      sparklineData: generateSparklineData(data.totalHours)
    },
    {
      title: 'Active Employees',
      value: data.totalEmployees,
      subtitle: 'Team members',
      color: 'indigo' as const,
      icon: UsersIcon,
      trend: data.trends ? {
        value: data.trends.totalEmployees,
        isPositive: data.trends.totalEmployees >= 0
      } : undefined,
      sparklineData: generateSparklineData(data.totalEmployees, 0.1)
    },
    {
      title: 'Active Projects',
      value: data.totalProjects,
      subtitle: 'Ongoing work',
      color: 'emerald' as const,
      icon: BriefcaseIcon,
      trend: data.trends ? {
        value: data.trends.totalProjects,
        isPositive: data.trends.totalProjects >= 0
      } : undefined,
      sparklineData: generateSparklineData(data.totalProjects, 0.2)
    },
    {
      title: 'Pending Timesheets',
      value: data.pendingTimesheets,
      subtitle: 'Awaiting approval',
      color: 'amber' as const,
      icon: DocumentTextIcon,
      trend: data.trends ? {
        value: data.trends.pendingTimesheets,
        isPositive: data.trends.pendingTimesheets <= 0 // Negative is good for pending
      } : undefined,
      sparklineData: generateSparklineData(data.pendingTimesheets, 0.4)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <PremiumKPICard
          key={index}
          title={kpi.title}
          value={kpi.value}
          subtitle={kpi.subtitle}
          color={kpi.color}
          icon={kpi.icon}
          trend={kpi.trend}
          sparklineData={kpi.sparklineData}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default PremiumKPIGrid;
