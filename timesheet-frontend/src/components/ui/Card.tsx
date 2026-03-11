import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'dark' | 'flat';
    hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default',
    hoverable = false
}) => {
    const baseStyles = 'bg-white rounded-xl border border-secondary-100 overflow-hidden transition-all duration-300';

    const variants = {
        default: 'shadow-sm hover:shadow-md',
        glass: 'bg-white/95 backdrop-blur-md shadow-sm border-white/20',
        dark: 'bg-secondary-900 border-white/5 shadow-lg shadow-black/10',
        flat: 'border-secondary-100 shadow-none',
    };

    return (
        <div className={`
            ${baseStyles} 
            ${variants[variant]} 
            ${hoverable ? 'hover:-translate-y-1 hover:border-primary-200' : ''}
            ${className}
        `}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{ title: string; subtitle?: string; className?: string }> = ({
    title,
    subtitle,
    className = ''
}) => (
    <div className={`px-6 py-4 border-b border-secondary-100 bg-secondary-50/30 ${className}`}>
        <h3 className="text-lg font-bold text-secondary-900 leading-none">{title}</h3>
        {subtitle && <p className="text-xs font-semibold text-secondary-500 mt-1.5 uppercase tracking-wide">{subtitle}</p>}
    </div>
);

export default Card;
