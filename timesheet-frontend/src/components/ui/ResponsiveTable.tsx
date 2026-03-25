import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  className?: string;
  actions?: (row: any) => React.ReactNode;
  emptyMessage?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  className = '',
  actions,
  emptyMessage = 'No data available'
}) => {
  const renderCellValue = (column: Column, row: any) => {
    const value = row[column.key];
    if (column.render) {
      return column.render(value, row);
    }
    return value;
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-secondary-500">
        <div className="text-lg font-medium mb-2">{emptyMessage}</div>
        <div className="text-sm">No records to display</div>
      </div>
    );
  }

  return (
    <div className={`responsive-table ${className}`}>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={column.className || ''}
                >
                  {column.label}
                </th>
              ))}
              {actions && <th className="w-20">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-secondary-50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.className || ''}
                  >
                    {renderCellValue(column, row)}
                  </td>
                ))}
                {actions && (
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((row, index) => (
          <div key={index} className="bg-white rounded-lg border border-secondary-200 p-4 shadow-sm">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-secondary-100">
              <div className="font-semibold text-secondary-900">
                {renderCellValue(columns[0], row)}
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  {actions(row)}
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="space-y-2">
              {columns.slice(1).map((column) => (
                <div key={column.key} className="flex justify-between items-center py-1">
                  <div className="text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    {column.label}
                  </div>
                  <div className="text-sm text-secondary-900 text-right">
                    {renderCellValue(column, row)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveTable;
