import React, { useState } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface TrendData {
  date: string;
  totalHours: number;
  employeeCount: number;
  projectCount: number;
}

interface TrendLineChartProps {
  data: TrendData[];
  title: string;
  subtitle: string;
  granularity: 'daily' | 'weekly' | 'monthly';
  loading?: boolean;
}

const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  title,
  subtitle,
  granularity,
  loading = false
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: TrendData } | null>(null);

  // Chart dimensions
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const chartWidth = 800 - margin.left - margin.right;
  const chartHeight = 300 - margin.top - margin.bottom;

  // Calculate scales
  const maxHours = Math.max(...data.map(d => d.totalHours), 1);
  const minHours = Math.min(...data.map(d => d.totalHours), 0);
  const hoursRange = maxHours - minHours || 1;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (granularity) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Generate smooth curve path
  const generateSmoothPath = (data: TrendData[]) => {
    if (data.length < 2) return '';
    
    const points = data.map((d, i) => ({
      x: margin.left + (i / (data.length - 1)) * chartWidth,
      y: margin.top + chartHeight - ((d.totalHours - minHours) / hoursRange) * chartHeight
    }));

    // Create smooth curve using quadratic bezier curves
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      if (i === 1) {
        path += ` L ${curr.x} ${curr.y}`;
      } else {
        const cp1x = prev.x + (curr.x - prev.x) / 2;
        const cp1y = prev.y;
        const cp2x = prev.x + (curr.x - prev.x) / 2;
        const cp2y = curr.y;
        
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      }
    }
    
    return path;
  };

  // Generate gradient fill path
  const generateAreaPath = (data: TrendData[]) => {
    if (data.length < 2) return '';
    
    const linePath = generateSmoothPath(data);
    const lastPoint = data[data.length - 1];
    const lastX = margin.left + ((data.length - 1) / (data.length - 1)) * chartWidth;
    const lastY = margin.top + chartHeight;
    
    return `${linePath} L ${lastX} ${lastY} L ${margin.left} ${margin.top + chartHeight} Z`;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGElement>, chartData: TrendData, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTooltip({
      x: x,
      y: y,
      data: chartData
    });
    setHoveredPoint(index);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setHoveredPoint(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trend Data</h3>
        <p className="text-sm text-gray-600">No trend data available for the selected period</p>
      </div>
    );
  }

  const linePath = generateSmoothPath(data);
  const areaPath = generateAreaPath(data);

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
        
        {/* Trend indicator */}
        {data.length > 1 && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">
            <ArrowTrendingUpIcon className="w-4 h-4" />
            {data[data.length - 1].totalHours > data[0].totalHours ? 'Upward' : 'Downward'} trend
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
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <g className="grid-lines">
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = margin.top + chartHeight - (chartHeight * percent / 100);
              const hours = minHours + (hoursRange * percent / 100);
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
                    {hours.toFixed(0)}h
                  </text>
                </g>
              );
            })}
          </g>

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            className="transition-all duration-300"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Data points */}
          <g className="data-points">
            {data.map((point, index) => {
              const x = margin.left + (index / (data.length - 1)) * chartWidth;
              const y = margin.top + chartHeight - ((point.totalHours - minHours) / hoursRange) * chartHeight;
              const isHovered = hoveredPoint === index;
              
              return (
                <g key={point.date}>
                  {/* Point shadow */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 8 : 6}
                    fill="#000"
                    fillOpacity={isHovered ? 0.1 : 0.05}
                  />
                  
                  {/* Main point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill="#3b82f6"
                    stroke="#fff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200"
                    onMouseMove={(e) => handleMouseMove(e, point, index)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      filter: isHovered ? 'brightness(1.2)' : 'none'
                    }}
                  />

                  {/* X-axis labels */}
                  {index % Math.ceil(data.length / 8) === 0 && (
                    <text
                      x={x}
                      y={margin.top + chartHeight + 20}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {formatDate(point.date)}
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
              top: `${tooltip.y - 60}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-sm font-semibold">{formatDate(tooltip.data.date)}</div>
            <div className="text-xs opacity-90">{tooltip.data.totalHours.toFixed(1)} hours</div>
            <div className="text-xs opacity-75">{tooltip.data.employeeCount} employees</div>
            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average</div>
          <div className="text-lg font-bold text-gray-900">
            {(data.reduce((sum, d) => sum + d.totalHours, 0) / data.length).toFixed(1)}h
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Peak</div>
          <div className="text-lg font-bold text-gray-900">
            {Math.max(...data.map(d => d.totalHours)).toFixed(1)}h
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Period</div>
          <div className="text-lg font-bold text-gray-900">
            {data.reduce((sum, d) => sum + d.totalHours, 0).toFixed(1)}h
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendLineChart;
