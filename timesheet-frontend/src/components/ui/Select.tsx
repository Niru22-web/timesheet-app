import React, { SelectHTMLAttributes } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
    label,
    error,
    leftIcon,
    children,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-sm font-medium text-secondary-700 block ml-0.5">
                    {label}
                </label>
            )}

            <div className="relative group">
                {leftIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                        {React.cloneElement(leftIcon as React.ReactElement, { className: 'w-5 h-5' })}
                    </div>
                )}

                <select
                    className={`
                        w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg 
                        ${leftIcon ? 'pl-11' : ''} pr-10
                        text-sm font-medium focus:ring-2 focus:ring-primary-500/20 
                        focus:border-primary-500 outline-none transition-all appearance-none 
                        cursor-pointer hover:border-secondary-300
                        ${error ? 'border-danger-400 focus:ring-danger-500/10 focus:border-danger-500' : ''}
                        ${className}
                    `}
                    {...props}
                >
                    {children}
                </select>

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400">
                    <ChevronDownIcon className="w-4 h-4" />
                </div>
            </div>

            {error && (
                <p className="text-xs font-semibold text-danger-500 ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Select;
