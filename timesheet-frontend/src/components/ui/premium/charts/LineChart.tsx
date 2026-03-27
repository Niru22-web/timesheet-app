import React from 'react';

interface LineChartProps {
  data?: number[];
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data = [0, 0, 0, 0, 0], 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl p-4 ${className}`}>
      <div className="h-32 flex items-end justify-between">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-2 bg-blue-500 rounded-t" 
              style={{ height: `${(value / Math.max(...data)) * 100}%` }}
            ></div>
            <span className="text-xs text-gray-500 mt-1">{index}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;
