import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ModernDonutChartProps {}

const ModernDonutChart: React.FC<ModernDonutChartProps> = () => {
  const data = [
    { name: 'Development', value: 45, color: '#3b82f6' },
    { name: 'Meetings', value: 25, color: '#9333ea' },
    { name: 'Planning', value: 15, color: '#10b981' },
    { name: 'Review', value: 10, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#64748b' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-800">{payload[0].name}</p>
          <p className="text-lg font-bold text-slate-900">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.1) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">Time Distribution</h3>
        <p className="text-sm text-slate-600">How you spend your time</p>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              innerRadius={45}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-slate-700">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernDonutChart;
