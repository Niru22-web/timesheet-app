import React, { useState, useMemo } from 'react';
import { 
  UserIcon, 
  BriefcaseIcon, 
  CalendarIcon, 
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface DrillDownRecord {
  id: string;
  employee: string;
  project: string;
  date: string;
  hours: number;
  status: string;
}

interface DrillDownTableProps {
  data: DrillDownRecord[];
  selectedDrillDown: { type: string; data: any };
  onClearDrillDown: () => void;
  loading?: boolean;
}

const DrillDownTable: React.FC<DrillDownTableProps> = ({
  data,
  selectedDrillDown,
  onClearDrillDown,
  loading = false
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DrillDownRecord;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filterTerm, setFilterTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
      case 'pending_approval':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'not_submitted':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply text filter
    if (filterTerm) {
      filtered = filtered.filter(record =>
        record.employee.toLowerCase().includes(filterTerm.toLowerCase()) ||
        record.project.toLowerCase().includes(filterTerm.toLowerCase()) ||
        record.date.includes(filterTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => 
        record.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, filterTerm, statusFilter, sortConfig]);

  const handleSort = (key: keyof DrillDownRecord) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Employee', 'Project', 'Date', 'Hours', 'Status'],
      ...filteredAndSortedData.map(record => [
        record.employee,
        record.project,
        record.date,
        record.hours.toString(),
        record.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drill-down-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'not_submitted', label: 'Not Submitted' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <FunnelIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Detailed Data</h3>
          <p className="text-sm text-gray-600">
            {selectedDrillDown.type 
              ? `No detailed records found for ${selectedDrillDown.type}: ${selectedDrillDown.data.name}`
              : 'Click on charts to view detailed records'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Detailed Records</h3>
          {selectedDrillDown.type && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">
                Filtered by {selectedDrillDown.type}:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                {selectedDrillDown.type === 'employee' && <UserIcon className="w-3 h-3" />}
                {selectedDrillDown.type === 'project' && <BriefcaseIcon className="w-3 h-3" />}
                {selectedDrillDown.data.name}
                <button
                  onClick={onClearDrillDown}
                  className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee, project, or date..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="lg:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredAndSortedData.length} of {data.length} records
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('employee')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                >
                  <UserIcon className="w-4 h-4" />
                  Employee
                  {sortConfig?.key === 'employee' && (
                    <span className="text-blue-600">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('project')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                >
                  <BriefcaseIcon className="w-4 h-4" />
                  Project
                  {sortConfig?.key === 'project' && (
                    <span className="text-blue-600">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Date
                  {sortConfig?.key === 'date' && (
                    <span className="text-blue-600">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('hours')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                >
                  <ClockIcon className="w-4 h-4" />
                  Hours
                  {sortConfig?.key === 'hours' && (
                    <span className="text-blue-600">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Status
                  {sortConfig?.key === 'status' && (
                    <span className="text-blue-600">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSortedData.map((record, index) => (
              <tr 
                key={record.id} 
                className="hover:bg-gray-50 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {record.employee}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{record.project}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{record.date}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {record.hours.toFixed(1)}h
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)}`}>
                    {record.status.replace('_', ' ').charAt(0).toUpperCase() + record.status.replace('_', ' ').slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredAndSortedData.reduce((sum, r) => sum + r.hours, 0).toFixed(1)}h
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {new Set(filteredAndSortedData.map(r => r.employee)).size}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Employees</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {new Set(filteredAndSortedData.map(r => r.project)).size}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {(filteredAndSortedData.reduce((sum, r) => sum + r.hours, 0) / filteredAndSortedData.length).toFixed(1)}h
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Avg Hours</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDownTable;
