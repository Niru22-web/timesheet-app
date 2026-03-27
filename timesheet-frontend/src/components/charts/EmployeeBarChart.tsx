import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<{
    name: string;
    hours: number;
    [key: string]: any;
  }>;
  title?: string;
  subtitle?: string;
  dataKey?: string;
  color?: string;
  height?: number;
  onBarClick?: (data: any) => void;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-secondary-100">
        <p className="text-sm font-bold text-secondary-900">{label}</p>
        <p className="text-sm font-medium text-primary-600">
          {payload[0].value.toFixed(1)} hours
        </p>
      </div>
    );
  }
  return null;
};

const EmployeeBarChart: React.FC<BarChartProps> = ({
  data,
  title = 'Hours per Employee',
  subtitle = 'Total hours logged by each employee',
  dataKey = 'hours',
  color = '#3B82F6',
  height = 300,
  onBarClick,
  loading = false
}) => {
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
            <p className="text-sm font-medium">No data available</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            onClick={(e: any) => {
              if (e && e.activePayload && onBarClick) {
                onBarClick(e.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
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
            <Bar 
              dataKey={dataKey} 
              fill={color}
              radius={[8, 8, 0, 0]}
              cursor="pointer"
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-secondary-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs font-medium text-secondary-500">Total Hours</p>
            <p className="text-sm font-bold text-secondary-900 tabular-nums">
              {data.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500">Average</p>
            <p className="text-sm font-bold text-secondary-900 tabular-nums">
              {(data.reduce((sum, item) => sum + item.hours, 0) / data.length).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-secondary-500">Max Hours</p>
            <p className="text-sm font-bold text-secondary-900 tabular-nums">
              {Math.max(...data.map(item => item.hours)).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeBarChart;
