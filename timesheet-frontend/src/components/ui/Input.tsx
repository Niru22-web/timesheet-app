import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    multiline?: boolean;
    rows?: number;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    className = '',
    multiline = false,
    rows = 3,
    ...props
}) => {
    const inputStyles = `
        w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg outline-none 
        transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
        hover:border-secondary-300 text-sm placeholder:text-secondary-400
        ${leftIcon ? 'pl-11' : ''}
        ${error ? 'border-danger-400 focus:ring-danger-500/10 focus:border-danger-500' : ''}
    `;

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

                {multiline ? (
                    <textarea
                        className={`${inputStyles} resize-none min-h-[100px] ${className}`}
                        rows={rows}
                        {...props as any}
                    />
                ) : (
                    <input
                        className={`${inputStyles} ${className}`}
                        {...props}
                    />
                )}
            </div>

            {error && (
                <p className="text-xs font-semibold text-danger-500 ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
