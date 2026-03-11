import React from 'react';

interface TableProps {
    headers: string[];
    children: React.ReactNode;
    className?: string;
    isLoading?: boolean;
}

const Table: React.FC<TableProps> = ({ headers, children, className = '', isLoading = false }) => {
    return (
        <div className={`overflow-x-auto custom-scrollbar border border-secondary-100 rounded-xl bg-white ${className}`}>
            <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-50/50 border-b border-secondary-100">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest whitespace-nowrap"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                {headers.map((_, j) => (
                                    <td key={j} className="px-6 py-5">
                                        <div className="h-4 bg-secondary-100/50 rounded-full w-2/3" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        children
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
