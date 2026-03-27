import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  CalendarIcon, 
  UserIcon, 
  BriefcaseIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface FilterOption {
  value: string;
  label: string;
  avatar?: string;
}

interface PremiumFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  loading?: boolean;
  employees?: FilterOption[];
  projects?: FilterOption[];
  userRole?: string;
  initialFilters?: FilterState;
}

export interface FilterState {
  dateRange: {
    from: string;
    to: string;
  };
  employeeIds: string[];
  projectIds: string[];
  status: string;
  granularity: 'daily' | 'weekly' | 'monthly';
}

const statusOptions: FilterOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'not_submitted', label: 'Not Submitted' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

const granularityOptions: FilterOption[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const datePresets = [
  { value: 'today', label: 'Today', icon: CalendarIcon },
  { value: 'week', label: 'Last 7 Days', icon: CalendarIcon },
  { value: 'month', label: 'Last 30 Days', icon: CalendarIcon },
  { value: 'quarter', label: 'Last 3 Months', icon: CalendarIcon },
  { value: 'year', label: 'Last Year', icon: CalendarIcon }
];

// Enhanced MultiSelect Component
const PremiumMultiSelect: React.FC<{
  options: FilterOption[];
  selectedValues: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  showAvatars?: boolean;
}> = ({ options, selectedValues, onChange, placeholder = 'Select options...', showAvatars = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  const removeOption = (value: string) => {
    onChange(selectedValues.filter(v => v !== value));
  };

  const selectedOptions = selectedValues.map(value => 
    options.find(opt => opt.value === value)
  ).filter(Boolean) as FilterOption[];

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        className="min-h-[44px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl flex items-center gap-2 flex-wrap cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.length === 0 ? (
          <span className="text-gray-500 text-sm flex items-center gap-2">
            <MagnifyingGlassIcon className="w-4 h-4" />
            {placeholder}
          </span>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedOptions.map((option) => (
              <span 
                key={option.value} 
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200"
              >
                {showAvatars && option.avatar && (
                  <img 
                    src={option.avatar} 
                    alt={option.label}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                {option.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(option.value);
                  }}
                  className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ml-auto ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
          
          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm ${
                      isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    onClick={() => toggleOption(option.value)}
                  >
                    {showAvatars && option.avatar && (
                      <img 
                        src={option.avatar} 
                        alt={option.label}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1">{option.label}</span>
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PremiumFilters: React.FC<PremiumFiltersProps> = ({
  onFiltersChange,
  loading = false,
  employees = [],
  projects = [],
  userRole = '',
  initialFilters
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    },
    employeeIds: [],
    projectIds: [],
    status: 'all',
    granularity: 'daily'
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    let count = 0;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.employeeIds.length > 0) count++;
    if (filters.projectIds.length > 0) count++;
    if (filters.status !== 'all') count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    updateFilters({
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const applyDatePreset = (preset: string) => {
    const today = new Date();
    let from: Date;
    const to: Date = today;

    switch (preset) {
      case 'today':
        from = today;
        break;
      case 'week':
        from = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'month':
        from = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'quarter':
        from = new Date(today.setMonth(today.getMonth() - 3));
        break;
      case 'year':
        from = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      default:
        from = new Date(today.setDate(today.getDate() - 30));
    }

    updateFilters({
      dateRange: {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0]
      }
    });
  };

  const clearFilters = () => {
    updateFilters({
      dateRange: { from: '', to: '' },
      employeeIds: [],
      projectIds: [],
      status: 'all',
      granularity: 'daily'
    });
  };

  const canViewEmployeeFilter = ['Admin', 'Owner', 'Partner', 'Manager'].some(role => 
    userRole?.toLowerCase().includes(role.toLowerCase())
  );

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-semibold text-gray-900">
            Filters
          </span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {activeFiltersCount} Active
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="px-5 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="lg:col-span-1">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
              Date Range
            </label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={(e) => handleDateRangeChange('from', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="From"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={(e) => handleDateRangeChange('to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="To"
                  />
                </div>
              </div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    applyDatePreset(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Quick Presets</option>
                {datePresets.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Employees */}
          {canViewEmployeeFilter && employees.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
                Employees
              </label>
              <PremiumMultiSelect
                options={employees}
                selectedValues={filters.employeeIds}
                onChange={(selectedIds: string[]) => updateFilters({ employeeIds: selectedIds })}
                placeholder="Select employees..."
                showAvatars={true}
              />
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
                Projects
              </label>
              <PremiumMultiSelect
                options={projects}
                selectedValues={filters.projectIds}
                onChange={(selectedIds: string[]) => updateFilters({ projectIds: selectedIds })}
                placeholder="Select projects..."
              />
            </div>
          )}

          {/* Status & Granularity */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
                Granularity
              </label>
              <select
                value={filters.granularity}
                onChange={(e) => updateFilters({ granularity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {granularityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFilters;
