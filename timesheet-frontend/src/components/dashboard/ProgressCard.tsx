import React, { useState, useEffect } from 'react';
import { ClockIcon, FireIcon } from '@heroicons/react/24/outline';

interface ProgressCardProps {}

const ProgressCard: React.FC<ProgressCardProps> = () => {
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', hours: 8.5, current: false },
    { day: 'Tue', hours: 7.2, current: false },
    { day: 'Wed', hours: 9.1, current: false },
    { day: 'Thu', hours: 8.8, current: false },
    { day: 'Fri', hours: 6.5, current: true },
    { day: 'Sat', hours: 0, current: false },
    { day: 'Sun', hours: 0, current: false }
  ]);

  const totalHours = weeklyData.reduce((sum, day) => sum + day.hours, 0);
  const maxHours = Math.max(...weeklyData.map(d => d.hours));
  const targetHours = 40; // Weekly target

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setWeeklyData(prev => 
        prev.map(day => 
          day.current 
            ? { ...day, hours: Math.min(day.hours + 0.1, 12) }
            : day
        )
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-blue-600" />
          Weekly Progress
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
          <FireIcon className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-bold text-orange-700">
            {totalHours.toFixed(1)}h / {targetHours}h
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>Weekly Target</span>
          <span className="font-bold">{((totalHours / targetHours) * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min((totalHours / targetHours) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-3">
        {weeklyData.map((day, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-8 text-xs font-medium ${
              day.current ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}>
              {day.day}
            </div>
            <div className="flex-1 relative">
              <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    day.current 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : day.hours > 0 
                        ? 'bg-gradient-to-r from-slate-400 to-slate-500'
                        : 'bg-slate-200'
                  }`}
                  style={{ width: `${maxHours > 0 ? (day.hours / maxHours) * 100 : 0}%` }}
                ></div>
              </div>
              {day.current && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <div className={`w-10 text-right text-xs font-medium ${
              day.current ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}>
              {day.hours.toFixed(1)}h
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-600">Average per day</p>
            <p className="text-lg font-bold text-slate-800">
              {(totalHours / 5).toFixed(1)}h
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600">Remaining</p>
            <p className="text-lg font-bold text-orange-600">
              {Math.max(targetHours - totalHours, 0).toFixed(1)}h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
