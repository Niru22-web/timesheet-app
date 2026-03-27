import React from 'react';

interface DateRangePickerProps {
  value: { from: string; to: string };
  onChange: (range: { from: string; to: string }) => void;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const handleFromChange = (from: string) => {
    onChange({ ...value, from });
  };

  const handleToChange = (to: string) => {
    onChange({ ...value, to });
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="flex-1">
        <label className="text-xs font-medium text-secondary-500 block mb-1">From</label>
        <input
          type="date"
          value={value.from}
          onChange={(e) => handleFromChange(e.target.value)}
          className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div className="flex-1">
        <label className="text-xs font-medium text-secondary-500 block mb-1">To</label>
        <input
          type="date"
          value={value.to}
          onChange={(e) => handleToChange(e.target.value)}
          className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
