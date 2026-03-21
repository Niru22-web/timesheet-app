import React, { ButtonHTMLAttributes } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'premium' | 'action';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    touchFriendly?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    touchFriendly = false,
    className = '',
    disabled,
    ...props
}) => {
    const { theme } = useTheme();
    
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm select-none';
    
    const touchStyles = touchFriendly ? 'min-h-[44px] min-w-[44px]' : '';

    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md focus:ring-primary-500 active:scale-[0.98] shadow-sm dark:bg-primary-500 dark:hover:bg-primary-600',
        secondary: 'bg-white text-secondary-700 border border-secondary-200 hover:bg-secondary-50 hover:border-secondary-300 focus:ring-secondary-200 shadow-sm active:scale-[0.98] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700',
        danger: 'bg-danger-600 text-white hover:bg-danger-700 hover:shadow-md focus:ring-danger-500 active:scale-[0.98] shadow-sm',
        ghost: 'bg-transparent text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 focus:ring-secondary-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
        premium: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-md focus:ring-primary-500 active:scale-[0.98] shadow-sm',
        action: 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50 hover:border-primary-300 focus:ring-primary-100 active:scale-[0.98] shadow-sm dark:bg-gray-800 dark:text-primary-400 dark:border-primary-800 dark:hover:bg-gray-700',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
        icon: 'p-2',
    };

    return (
        <button
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                ${touchStyles}
                ${isLoading ? 'relative !text-transparent pointer-events-none' : ''}
                ${className}
            `.trim().replace(/\s+/g, ' ')}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-current">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            )}
            <div className="flex items-center gap-2">
                {leftIcon && <span className={`${isLoading ? 'invisible' : ''}`}>{leftIcon}</span>}
                <span className={`${isLoading ? 'invisible' : ''}`}>{children}</span>
                {rightIcon && <span className={`${isLoading ? 'invisible' : ''}`}>{rightIcon}</span>}
            </div>
        </button>
    );
};

export default Button;
