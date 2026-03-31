import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Button from './Button';
import Input from './Input';
import Select from './Select';

interface TableToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  placeholder?: string;
  filters?: React.ReactNode;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  searchTerm,
  onSearchChange,
  showFilters,
  setShowFilters,
  placeholder = "Search...",
  filters,
}) => {
  const [localSearch, setLocalSearch] = React.useState(searchTerm);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col border-b border-primary-100 bg-white shadow-sm">
      <div className="p-4 flex items-center gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative group">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-primary-400 group-focus-within:text-primary-600 transition-colors" />
          <input
            type="text"
            placeholder={placeholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-primary-100 rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
          />
          {localSearch && (
            <button 
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
              title="Clear Search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-11 px-5 flex items-center gap-2 rounded-xl text-sm font-bold transition-all ${
            showFilters 
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
              : 'bg-white border border-primary-100 text-primary-600 hover:bg-primary-50 shadow-sm'
          }`}
        >
          <FunnelIcon className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Advanced Filters Pane */}
      {showFilters && filters && (
        <div className="p-5 bg-primary-50/30 border-t border-primary-100 grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-down">
          {filters}
        </div>
      )}
    </div>
  );
};

export default TableToolbar;
