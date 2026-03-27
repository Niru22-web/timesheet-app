import React, { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TimeTrackerCardProps {}

const TimeTrackerCard: React.FC<TimeTrackerCardProps> = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(13500); // 3:45:00 in seconds
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      // Stop tracking
      setIsTracking(false);
      setStartTime(null);
    } else {
      // Start tracking
      setIsTracking(true);
      setStartTime(Date.now());
    }
  };

  const progress = (elapsedTime % 3600) / 36; // Progress for current hour (0-100)

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
          <ClockIcon className="w-5 h-5 text-blue-600" />
          Time Tracker
        </h3>
      </div>

      {/* Circular Progress */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="transform -rotate-90 w-48 h-48">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="#e2e8f0"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-slate-800 tabular-nums">
            {formatTime(elapsedTime).split(':')[0]}:{formatTime(elapsedTime).split(':')[1]}
          </div>
          <div className="text-sm text-slate-600 mt-1">
            {formatTime(elapsedTime).split(':')[2]}s
          </div>
          {isTracking && (
            <div className="flex items-center gap-1 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleToggleTracking}
          className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isTracking 
              ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          }`}
        >
          {isTracking ? (
            <>
              <PauseIcon className="w-5 h-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5" />
              <span>Start</span>
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
          <div className="text-xs text-blue-600 font-medium mb-1">Today</div>
          <div className="text-lg font-bold text-blue-700">
            {Math.floor(elapsedTime / 3600)}h {Math.floor((elapsedTime % 3600) / 60)}m
          </div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
          <div className="text-xs text-purple-600 font-medium mb-1">This Week</div>
          <div className="text-lg font-bold text-purple-700">
            {Math.floor(elapsedTime / 3600 + 18)}h
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
          Break
        </button>
        <button className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
          Switch Task
        </button>
      </div>
    </div>
  );
};

export default TimeTrackerCard;
