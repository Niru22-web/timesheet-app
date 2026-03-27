import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage?: number;
    [key: string]: any;
  }>;
  title?: string;
  subtitle?: string;
  colors?: string[];
  height?: number;
  loading?: boolean;
  onSliceClick?: (data: any) => void;
  showPercentage?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-secondary-100">
        <p className="text-sm font-bold text-secondary-900">{data.name}</p>
        <p className="text-sm font-medium text-primary-600">
          {data.value.toFixed(1)} hours
        </p>
        {data.payload.percentage && (
          <p className="text-xs font-medium text-secondary-500">
            {data.payload.percentage.toFixed(1)}% of total
          </p>
        )}
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  if (percentage < 5) return null; // Don't show label for small slices

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${percentage.toFixed(0)}%`}
    </text>
  );
};

const ProjectPieChart: React.FC<PieChartProps> = ({
  data,
  title = 'Project Distribution',
  subtitle = 'Hours distribution across projects',
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'],
  height = 300,
  loading = false,
  onSliceClick,
  showPercentage = true
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-secondary-100 rounded w-48 mb-4"></div>
          <div className="h-64 bg-secondary-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6">
        <h3 className="text-sm font-black text-secondary-900 uppercase tracking-tight mb-4">
          {title}
        </h3>
        <div className="h-64 flex items-center justify-center text-secondary-400">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full mx-auto mb-3"></div>
            <p className="text-sm font-medium">No project data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const enrichedData = data.map(item => ({
    ...item,
    percentage: showPercentage ? (item.value / total) * 100 : undefined
  }));

  const handlePieClick = (data: any, index: number) => {
    setActiveIndex(index);
    if (onSliceClick) {
      onSliceClick(data);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-black text-secondary-900 uppercase tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs font-medium text-secondary-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="h-64 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={enrichedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showPercentage ? CustomLabel : false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                onClick={handlePieClick}
              >
                {enrichedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]}
                    stroke={activeIndex === index ? '#1F2937' : 'none'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                    style={{ 
                      filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 max-w-xs">
          <div className="space-y-2">
            {enrichedData.map((item, index) => (
              <div 
                key={item.name}
                className={`
                  flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all
                  ${activeIndex === index ? 'bg-secondary-50' : 'hover:bg-secondary-25'}
                `}
                onClick={() => handlePieClick(item, index)}
              >
                <div 
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {item.value.toFixed(1)} hours
                    {showPercentage && item.percentage && (
                      <span className="ml-2">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-secondary-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs font-medium text-secondary-500">Total Projects</p>
            <p className="text-sm font-bold text-secondary-900 tabular-nums">
              {data.length}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500">Total Hours</p>
            <p className="text-sm font-bold text-secondary-900 tabular-nums">
              {total.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500">Avg per Project</p>
            <p className="text-sm font-bold text-secondary-900 tabular-nums">
              {(total / data.length).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPieChart;
