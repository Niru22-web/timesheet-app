import React, { useState, useEffect } from 'react';
import { ChartBarIcon, UserIcon } from '@heroicons/react/24/outline';

interface ChartData {
  name: string;
  hours: number;
  employeeId: string;
}

interface InteractiveBarChartProps {
  data: ChartData[];
  title: string;
  subtitle: string;
  onBarClick: (data: any) => void;
  loading?: boolean;
  selectedDrillDown?: { type: string; data: any };
}

const InteractiveBarChart: React.FC<InteractiveBarChartProps> = ({
  data,
  title,
  subtitle,
  onBarClick,
  loading = false,
  selectedDrillDown
}) => {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ChartData } | null>(null);

  // Chart dimensions
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const chartWidth = 600 - margin.left - margin.right;
  const chartHeight = 300 - margin.top - margin.bottom;

  // Calculate scales
  const maxHours = Math.max(...data.map(d => d.hours), 1);
  const barWidth = Math.min(40, chartWidth / data.length - 10);

  const handleMouseMove = (e: React.MouseEvent<SVGElement>, chartData: ChartData, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTooltip({
      x: x,
      y: y,
      data: chartData
    });
    setHoveredBar(chartData.name);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setHoveredBar(null);
  };

  const handleBarClick = (chartData: ChartData) => {
    onBarClick(chartData);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-sm text-gray-600">No employee hours data for the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
        {selectedDrillDown?.type === 'employee' && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
            <UserIcon className="w-4 h-4" />
            Filtered: {selectedDrillDown.data.name}
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative">
        <svg
          width="100%"
          height="300"
          viewBox={`0 0 ${chartWidth + margin.left + margin.right} ${300}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <g className="grid-lines">
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = margin.top + chartHeight - (chartHeight * percent / 100);
              const hours = (maxHours * percent / 100).toFixed(1);
              return (
                <g key={percent}>
                  <line
                    x1={margin.left}
                    y1={y}
                    x2={margin.left + chartWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={margin.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {hours}h
                  </text>
                </g>
              );
            })}
          </g>

          {/* Bars */}
          <g className="bars">
            {data.map((chartData, index) => {
              const barHeight = (chartData.hours / maxHours) * chartHeight;
              const x = margin.left + (index * (chartWidth / data.length)) + ((chartWidth / data.length - barWidth) / 2);
              const y = margin.top + chartHeight - barHeight;
              
              const isHovered = hoveredBar === chartData.name;
              const isSelected = selectedDrillDown?.type === 'employee' && 
                               selectedDrillDown?.data.name === chartData.name;

              // Generate color based on performance
              let fillColor = '#3b82f6'; // blue-500
              if (chartData.hours > maxHours * 0.8) fillColor = '#10b981'; // emerald-500
              else if (chartData.hours > maxHours * 0.6) fillColor = '#3b82f6'; // blue-500
              else if (chartData.hours > maxHours * 0.4) fillColor = '#f59e0b'; // amber-500
              else fillColor = '#ef4444'; // red-500

              return (
                <g key={chartData.employeeId}>
                  {/* Bar shadow */}
                  <rect
                    x={x + 1}
                    y={y + 2}
                    width={barWidth}
                    height={barHeight}
                    fill="#000"
                    fillOpacity={isHovered ? 0.1 : 0.05}
                    rx="4"
                  />
                  
                  {/* Main bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={isSelected ? '#1d4ed8' : fillColor}
                    fillOpacity={isHovered ? 0.9 : 0.8}
                    stroke={isSelected ? '#1d4ed8' : fillColor}
                    strokeWidth={isSelected ? 2 : 0}
                    rx="4"
                    className="cursor-pointer transition-all duration-200"
                    onMouseMove={(e) => handleMouseMove(e, chartData, index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleBarClick(chartData)}
                    style={{
                      filter: isHovered ? 'brightness(1.1)' : 'none',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                  />

                  {/* Employee name label */}
                  <text
                    x={x + barWidth / 2}
                    y={margin.top + chartHeight + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-700 font-medium"
                    style={{
                      transform: `rotate(-45deg)`,
                      transformOrigin: `${x + barWidth / 2}px ${margin.top + chartHeight + 20}px`
                    }}
                  >
                    {chartData.name.length > 10 ? chartData.name.substring(0, 10) + '...' : chartData.name}
                  </text>

                  {/* Hours value on top of bar */}
                  {isHovered && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      className="text-sm font-bold fill-gray-900"
                    >
                      {chartData.hours.toFixed(1)}h
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Axes */}
          <line
            x1={margin.left}
            y1={margin.top + chartHeight}
            x2={margin.left + chartWidth}
            y2={margin.top + chartHeight}
            stroke="#374151"
            strokeWidth="2"
          />
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + chartHeight}
            stroke="#374151"
            strokeWidth="2"
          />
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10"
            style={{
              left: `${tooltip.x + margin.left}px`,
              top: `${tooltip.y - 40}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-sm font-semibold">{tooltip.data.name}</div>
            <div className="text-xs opacity-90">{tooltip.data.hours.toFixed(1)} hours logged</div>
            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded"></div>
          <span className="text-gray-600">High (&gt;80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Good (60-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          <span className="text-gray-600">Average (40-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Low (&lt;40%)</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBarChart;
