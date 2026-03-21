import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: 'default' | 'filled' | 'outlined';
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    multiline?: boolean;
    rows?: number;
    touchFriendly?: boolean;
    containerClassName?: string;
    fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
    label,
    error,
    helperText,
    variant = 'default',
    size = 'md',
    leftIcon,
    rightIcon,
    className = '',
    multiline = false,
    rows = 3,
    touchFriendly = false,
    containerClassName = '',
    fullWidth = true,
    type,
    ...props
}, ref) => {
    const { theme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const baseClasses = `
        block w-full rounded-lg border transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-0
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantClasses = {
        default: `
            border-gray-300 bg-white
            focus:border-primary-500 focus:ring-primary-500
            dark:border-gray-600 dark:bg-gray-800 dark:text-white
            dark:focus:border-primary-400 dark:focus:ring-primary-400
        `,
        filled: `
            border-transparent bg-gray-100
            focus:border-primary-500 focus:ring-primary-500 focus:bg-white
            dark:bg-gray-700 dark:text-white dark:focus:bg-gray-800
        `,
        outlined: `
            border-2 border-gray-300 bg-transparent
            focus:border-primary-500 focus:ring-primary-500
            dark:border-gray-600 dark:text-white
        `,
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
    };

    const iconClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    const stateClasses = error
        ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-400'
        : '';

    const inputStyles = `
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${stateClasses}
        ${touchFriendly ? 'min-h-[44px] text-base' : ''}
        ${leftIcon ? 'pl-10' : ''}
        ${(rightIcon || isPassword) ? 'pr-10' : ''}
        ${className}
    `.trim().replace(/\s+/g, ' ');

    const containerClasses = fullWidth ? 'space-y-1.5 w-full' : `space-y-1.5 ${containerClassName}`;

    return (
        <div className={containerClasses}>
            {label && (
                <label className={`text-sm font-medium block ml-0.5 ${
                    error 
                        ? 'text-danger-600 dark:text-danger-400'
                        : 'text-gray-700 dark:text-gray-300'
                }`}>
                    {label}
                </label>
            )}

            <div className="relative group">
                {leftIcon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors pointer-events-none`}>
                        <div className={iconClasses[size]}>
                            {React.cloneElement(leftIcon as React.ReactElement<any>, { className: iconClasses[size] })}
                        </div>
                    </div>
                )}

                {multiline ? (
                    <textarea
                        ref={ref as any}
                        className={`${inputStyles} resize-none min-h-[100px]`}
                        rows={rows}
                        {...(props as any)}
                    />
                ) : (
                    <input
                        ref={ref as any}
                        type={inputType}
                        className={inputStyles}
                        {...props}
                    />
                )}

                {(rightIcon || isPassword) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {isPassword ? (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className={iconClasses[size]} />
                                ) : (
                                    <EyeIcon className={iconClasses[size]} />
                                )}
                            </button>
                        ) : (
                            <div className={`${iconClasses[size]} text-gray-400`}>
                                {React.cloneElement(rightIcon as React.ReactElement<any>, { className: iconClasses[size] })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs font-semibold text-danger-500 ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
