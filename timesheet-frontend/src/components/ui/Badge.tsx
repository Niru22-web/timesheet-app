import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'nitro' | 'phantom';
    className?: string;
    pulse?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'secondary',
    className = '',
    pulse = false
}) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all duration-300 select-none';

    const variants = {
        primary: 'bg-primary-50 text-primary-700 border-primary-100',
        success: 'bg-success-50 text-success-700 border-success-100',
        danger: 'bg-danger-50 text-danger-700 border-danger-100',
        warning: 'bg-warning-50 text-warning-700 border-warning-100',
        secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200',
        nitro: 'bg-indigo-600 text-white border-indigo-500 shadow-sm',
        phantom: 'bg-secondary-900 text-white border-white/10 shadow-sm',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className} ${pulse ? 'animate-pulse' : ''}`}>
            {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />}
            {children}
        </span>
    );
};

export default Badge;
