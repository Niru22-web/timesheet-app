import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option labels
  const selectedLabels = selectedValues.map(value =>
    options.find(option => option.value === value)?.label || value
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle option selection
  const toggleOption = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    onChange(newSelectedValues);
  };

  // Remove selected item
  const removeSelectedItem = (valueToRemove: string) => {
    const newSelectedValues = selectedValues.filter(v => v !== valueToRemove);
    onChange(newSelectedValues);
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Items Display */}
      <div
        className={`
          min-h-[42px] px-3 py-2 bg-white border border-secondary-200 rounded-lg
          flex items-center gap-2 flex-wrap cursor-pointer
          hover:border-secondary-300 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isOpen ? 'ring-2 ring-primary-500/20 border-primary-500' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedValues.length === 0 ? (
          <span className="text-secondary-500 text-sm">{placeholder}</span>
        ) : (
          selectedLabels.map((label, index) => (
            <span
              key={selectedValues[index]}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-md"
            >
              {label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelectedItem(selectedValues[index]);
                }}
                className="hover:text-primary-900 transition-colors"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
        
        {/* Dropdown Arrow */}
        <div className="ml-auto">
          <ChevronDownIcon className={`w-4 h-4 text-secondary-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-secondary-100">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-secondary-500 text-sm">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`
                      px-3 py-2 cursor-pointer hover:bg-secondary-50 transition-colors
                      flex items-center gap-2 text-sm
                      ${isSelected ? 'bg-primary-50 text-primary-700' : 'text-secondary-700'}
                    `}
                    onClick={() => toggleOption(option.value)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="flex-1">{option.label}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {selectedValues.length > 0 && (
            <div className="p-3 border-t border-secondary-100 flex justify-between">
              <span className="text-xs text-secondary-500">
                {selectedValues.length} selected
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="text-xs font-medium text-danger-600 hover:text-danger-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
