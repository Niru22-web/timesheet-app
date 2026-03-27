import React, { useState } from 'react';
import { BriefcaseIcon, ChartPieIcon } from '@heroicons/react/24/outline';

interface ChartData {
  name: string;
  value: number;
  projectId: string;
  clientName?: string;
}

interface InteractivePieChartProps {
  data: ChartData[];
  title: string;
  subtitle: string;
  onSliceClick: (data: any) => void;
  loading?: boolean;
  selectedDrillDown?: { type: string; data: any };
}

const InteractivePieChart: React.FC<InteractivePieChartProps> = ({
  data,
  title,
  subtitle,
  onSliceClick,
  loading = false,
  selectedDrillDown
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ChartData } | null>(null);

  // Chart dimensions
  const width = 400;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 40;

  // Calculate pie slices
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -Math.PI / 2; // Start from top

  const pieSlices = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    // Calculate slice path
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    // Large arc flag
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle += angle;

    return {
      ...item,
      percentage,
      pathData,
      startAngle,
      endAngle,
      x1,
      y1,
      x2,
      y2
    };
  });

  // Color palette
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
  ];

  const handleMouseMove = (e: React.MouseEvent<SVGElement>, chartData: ChartData) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTooltip({
      x: x,
      y: y,
      data: chartData
    });
    setHoveredSlice(chartData.name);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setHoveredSlice(null);
  };

  const handleSliceClick = (chartData: ChartData) => {
    onSliceClick(chartData);
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
          <ChartPieIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-sm text-gray-600">No project distribution data for the selected period</p>
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
        {selectedDrillDown?.type === 'project' && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
            <BriefcaseIcon className="w-4 h-4" />
            Filtered: {selectedDrillDown.data.name}
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Pie slices */}
          <g className="pie-slices">
            {pieSlices.map((slice, index) => {
              const isHovered = hoveredSlice === slice.name;
              const isSelected = selectedDrillDown?.type === 'project' && 
                                selectedDrillDown?.data.name === slice.name;
              const color = colors[index % colors.length];
              
              // Calculate hover offset
              const midAngle = (slice.startAngle + slice.endAngle) / 2;
              const offsetX = isHovered ? Math.cos(midAngle) * 10 : 0;
              const offsetY = isHovered ? Math.sin(midAngle) * 10 : 0;

              return (
                <g key={slice.projectId}>
                  {/* Shadow */}
                  <path
                    d={slice.pathData}
                    fill="#000"
                    fillOpacity={isHovered ? 0.1 : 0.05}
                    transform={`translate(${offsetX + 2}, ${offsetY + 2})`}
                  />
                  
                  {/* Main slice */}
                  <path
                    d={slice.pathData}
                    fill={isSelected ? color : color}
                    fillOpacity={isHovered ? 0.9 : 0.8}
                    stroke={isSelected ? color : '#fff'}
                    strokeWidth={isSelected ? 3 : 2}
                    transform={`translate(${offsetX}, ${offsetY})`}
                    className="cursor-pointer transition-all duration-200"
                    onMouseMove={(e) => handleMouseMove(e, slice)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleSliceClick(slice)}
                    style={{
                      filter: isHovered ? 'brightness(1.1)' : 'none'
                    }}
                  />

                  {/* Percentage label */}
                  {slice.percentage > 0.05 && (
                    <text
                      x={centerX + Math.cos(midAngle) * (radius * 0.7) + offsetX}
                      y={centerY + Math.sin(midAngle) * (radius * 0.7) + offsetY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm font-bold fill-white"
                    >
                      {(slice.percentage * 100).toFixed(1)}%
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Center circle (donut effect) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.3}
            fill="white"
            stroke="#f3f4f6"
            strokeWidth="2"
          />

          {/* Center text */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg font-bold fill-gray-900"
          >
            {total.toFixed(0)}h
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-gray-500"
          >
            Total Hours
          </text>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 40}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-sm font-semibold">{tooltip.data.name}</div>
            <div className="text-xs opacity-90">{tooltip.data.value.toFixed(1)} hours</div>
            <div className="text-xs opacity-75">{(tooltip.data.value / total * 100).toFixed(1)}% of total</div>
            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2">
        {pieSlices.slice(0, 6).map((slice, index) => {
          const color = colors[index % colors.length];
          return (
            <div
              key={slice.projectId}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                hoveredSlice === slice.name ? 'bg-gray-50' : ''
              }`}
              onMouseEnter={() => setHoveredSlice(slice.name)}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => handleSliceClick(slice)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {slice.name.length > 20 ? slice.name.substring(0, 20) + '...' : slice.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {slice.value.toFixed(1)}h
                </div>
                <div className="text-xs text-gray-500">
                  {(slice.percentage * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
        
        {pieSlices.length > 6 && (
          <div className="text-center pt-2">
            <span className="text-xs text-gray-500">
              +{pieSlices.length - 6} more projects
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractivePieChart;
