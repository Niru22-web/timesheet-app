import React, { useState } from 'react';
import {
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// UI Components
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';

interface FilterPanelProps {
  onFiltersChange: (filters: any) => void;
  showEmployeeFilter?: boolean;
  loading?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  onFiltersChange, 
  showEmployeeFilter = false,
  loading = false 
}) => {
  const [filters, setFilters] = useState({
    dateRange: 'thisMonth',
    client: '',
    project: '',
    job: '',
    employee: '',
    search: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      dateRange: 'thisMonth',
      client: '',
      project: '',
      job: '',
      employee: '',
      search: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.client || filters.project || filters.job || 
    (showEmployeeFilter && filters.employee) || filters.search || 
    filters.dateRange !== 'thisMonth';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              leftIcon={<XMarkIcon className="w-4 h-4" />}
            >
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            rightIcon={
              <CalendarIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            }
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <Select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisQuarter">This Quarter</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </Select>
            </div>

            {/* Client Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
              <Input
                type="text"
                placeholder="All Clients"
                value={filters.client}
                onChange={(e) => handleFilterChange('client', e.target.value)}
              />
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <Input
                type="text"
                placeholder="All Projects"
                value={filters.project}
                onChange={(e) => handleFilterChange('project', e.target.value)}
              />
            </div>

            {/* Job Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job
              </label>
              <Input
                type="text"
                placeholder="All Jobs"
                value={filters.job}
                onChange={(e) => handleFilterChange('job', e.target.value)}
              />
            </div>

            {/* Employee Filter (conditional) */}
            {showEmployeeFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <Input
                  type="text"
                  placeholder="All Employees"
                  value={filters.employee}
                  onChange={(e) => handleFilterChange('employee', e.target.value)}
                />
              </div>
            )}

            {/* Search Filter */}
            <div className={showEmployeeFilter ? 'md:col-span-2' : 'lg:col-span-4'}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search timelogs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  leftIcon={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
                />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500">
              {hasActiveFilters 
                ? 'Filters are applied to the results below' 
                : 'No filters applied - showing all results'
              }
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Reset Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={loading}
              >
                {loading ? 'Applying...' : 'Apply Filters'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
