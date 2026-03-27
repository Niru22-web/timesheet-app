import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  CalendarIcon, 
  UserIcon, 
  BriefcaseIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface FilterOption {
  value: string;
  label: string;
}

interface DashboardFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  loading?: boolean;
  employees?: FilterOption[];
  projects?: FilterOption[];
  userRole?: string;
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

// Simple MultiSelect Component (inline for now)
const SimpleMultiSelect: React.FC<{
  options: FilterOption[];
  selectedValues: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
}> = ({ options, selectedValues, onChange, placeholder = 'Select options...' }) => {
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

  return (
    <div className="relative">
      <div
        className="min-h-[42px] px-3 py-2 bg-white border border-secondary-200 rounded-lg flex items-center gap-2 flex-wrap cursor-pointer hover:border-secondary-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.length === 0 ? (
          <span className="text-secondary-500 text-sm">{placeholder}</span>
        ) : (
          selectedValues.map(value => {
            const option = options.find(opt => opt.value === value);
            return (
              <span key={value} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-md">
                {option?.label || value}
              </span>
            );
          })
        )}
        <ChevronDownIcon className={`w-4 h-4 text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-secondary-100">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-200 rounded-md text-sm"
            />
          </div>
          {filteredOptions.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer hover:bg-secondary-50 transition-colors flex items-center gap-2 text-sm ${
                  isSelected ? 'bg-primary-50 text-primary-700' : 'text-secondary-700'
                }`}
                onClick={() => toggleOption(option.value)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="rounded border-secondary-300 text-primary-600"
                />
                <span className="flex-1">{option.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onFiltersChange,
  loading = false,
  employees = [],
  projects = [],
  userRole = ''
}) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    },
    employeeIds: [],
    projectIds: [],
    status: 'all',
    granularity: 'daily'
  });

  const [isExpanded, setIsExpanded] = useState(false);
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

  const applyDatePreset = (preset: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date();
    let from: Date;
    let to: Date = today;

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
    userRole.toLowerCase().includes(role.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-secondary-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FunnelIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-sm font-black text-secondary-900 uppercase tracking-tight">
            Dashboard Filters
          </h3>
          {activeFiltersCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
              {activeFiltersCount} Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-secondary-500 hover:text-danger-600 transition-colors flex items-center gap-1"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-4 h-4 text-secondary-400" />
              <label className="text-sm font-bold text-secondary-700">Date Range</label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-secondary-500 block mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => handleDateRangeChange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-secondary-500 block mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => handleDateRangeChange('to', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-secondary-500 block mb-1">Quick Presets</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      applyDatePreset(e.target.value as any);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Preset</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 3 Months</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>

          {canViewEmployeeFilter && employees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-4 h-4 text-secondary-400" />
                <label className="text-sm font-bold text-secondary-700">Employees</label>
              </div>
              <SimpleMultiSelect
                options={employees}
                selectedValues={filters.employeeIds}
                onChange={(selectedIds: string[]) => updateFilters({ employeeIds: selectedIds })}
                placeholder="Select employees..."
              />
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BriefcaseIcon className="w-4 h-4 text-secondary-400" />
                <label className="text-sm font-bold text-secondary-700">Projects</label>
              </div>
              <SimpleMultiSelect
                options={projects}
                selectedValues={filters.projectIds}
                onChange={(selectedIds: string[]) => updateFilters({ projectIds: selectedIds })}
                placeholder="Select projects..."
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircleIcon className="w-4 h-4 text-secondary-400" />
                <label className="text-sm font-bold text-secondary-700">Status</label>
              </div>
              <select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-secondary-700 block mb-3">Trend Granularity</label>
              <select
                value={filters.granularity}
                onChange={(e) => updateFilters({ granularity: e.target.value as any })}
                className="w-full px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
      )}
    </div>
  );
};

export default DashboardFilters;
