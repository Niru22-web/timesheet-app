import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyBarChartProps {}

const WeeklyBarChart: React.FC<WeeklyBarChartProps> = () => {
  const data = [
    { day: 'Mon', hours: 8.5, target: 8 },
    { day: 'Tue', hours: 7.2, target: 8 },
    { day: 'Wed', hours: 9.1, target: 8 },
    { day: 'Thu', hours: 8.8, target: 8 },
    { day: 'Fri', hours: 6.5, target: 8 },
    { day: 'Sat', hours: 0, target: 0 },
    { day: 'Sun', hours: 0, target: 0 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-bold text-slate-900">{entry.value}h</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">Weekly Overview</h3>
        <p className="text-sm text-slate-600">Hours worked per day</p>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="day" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="hours" 
              fill="url(#colorGradient)" 
              radius={[8, 8, 0, 0]}
              name="Worked"
            />
            <Bar 
              dataKey="target" 
              fill="#e2e8f0" 
              radius={[8, 8, 0, 0]}
              name="Target"
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-xs text-blue-600 font-medium">Total Hours</div>
          <div className="text-lg font-bold text-blue-700">
            {data.reduce((sum, day) => sum + day.hours, 0).toFixed(1)}h
          </div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="text-xs text-green-600 font-medium">Daily Average</div>
          <div className="text-lg font-bold text-green-700">
            {(data.reduce((sum, day) => sum + day.hours, 0) / 5).toFixed(1)}h
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyBarChart;
