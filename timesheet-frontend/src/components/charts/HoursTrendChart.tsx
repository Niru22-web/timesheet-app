import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: Array<{
    date: string;
    totalHours: number;
    employeeCount?: number;
    projectCount?: number;
    [key: string]: any;
  }>;
  title?: string;
  subtitle?: string;
  lines?: Array<{
    dataKey: string;
    color: string;
    name: string;
  }>;
  height?: number;
  loading?: boolean;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-secondary-100">
        <p className="text-sm font-bold text-secondary-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)} {entry.name.includes('Hours') ? 'hours' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const HoursTrendChart: React.FC<LineChartProps> = ({
  data,
  title = 'Hours Trend',
  subtitle = 'Daily/Weekly/Monthly hours logged over time',
  lines = [
    { dataKey: 'totalHours', color: '#3B82F6', name: 'Total Hours' }
  ],
  height = 300,
  loading = false,
  granularity = 'daily'
}) => {
  // Format date based on granularity
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (granularity) {
      case 'weekly':
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

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
            <p className="text-sm font-medium">No trend data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for chart
  const chartData = data.map(item => ({
    ...item,
    formattedDate: formatDate(item.date)
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-black text-secondary-900 uppercase tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-medium text-secondary-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-secondary-500">
            {granularity === 'daily' ? 'Daily' : granularity === 'weekly' ? 'Weekly' : 'Monthly'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name={line.name}
                animationDuration={1000}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-secondary-100">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs font-medium text-secondary-500">Total Hours</p>
            <p className="text-sm font-bold text-secondary-900 tabular-nums">
              {data.reduce((sum, item) => sum + item.totalHours, 0).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500">Average</p>
            <p className="text-sm font-bold text-secondary-900 tabular-nums">
              {(data.reduce((sum, item) => sum + item.totalHours, 0) / data.length).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500">Peak</p>
            <p className="text-sm font-bold text-secondary-900 tabular-nums">
              {Math.max(...data.map(item => item.totalHours)).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500">Data Points</p>
            <p className="text-sm font-bold text-secondary-900 tabular-nums">
              {data.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoursTrendChart;
