import React from 'react';

interface BarChartProps {
  data?: number[];
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data = [0, 0, 0, 0, 0], 
  className = '' 
}) => {
  const maxValue = Math.max(...data);

  return (
    <div className={`bg-white rounded-xl p-4 ${className}`}>
      <div className="h-32 flex items-end justify-center space-x-1">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-blue-500 rounded-t" 
              style={{ height: `${(value / maxValue) * 100}%` }}
            ></div>
            <span className="text-xs text-gray-500 mt-1">{index}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
