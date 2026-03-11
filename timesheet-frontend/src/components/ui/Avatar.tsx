import React from 'react';

interface AvatarProps {
    src?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
    border?: boolean;
    status?: 'online' | 'offline' | 'busy' | 'away';
}

const Avatar: React.FC<AvatarProps> = ({
    src,
    name = '',
    size = 'md',
    className = '',
    border = false,
    status
}) => {
    const getInitials = (n: string) => {
        return n.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
    };

    const sizes = {
        xs: 'w-7 h-7 text-[8px]',
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-14 h-14 text-sm',
        xl: 'w-20 h-20 text-xl',
        '2xl': 'w-32 h-32 text-3xl',
    };

    const statusColors = {
        online: 'bg-success-500',
        offline: 'bg-secondary-400',
        busy: 'bg-danger-500',
        away: 'bg-warning-500',
    };

    return (
        <div className={`relative shrink-0 ${className}`}>
            <div className={`
        ${sizes[size]} 
        rounded-full flex items-center justify-center 
        overflow-hidden transition-all duration-300
        ${src ? '' : 'bg-primary-50 text-primary-700 font-bold'}
        ${border ? 'border-2 border-white shadow-sm' : ''}
      `}>
                {src ? (
                    <img src={src} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span>{getInitials(name)}</span>
                )}
            </div>

            {status && (
                <span className={`
          absolute bottom-0 right-0 
          ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} 
          rounded-full border-2 border-white 
          ${statusColors[status]}
        `} />
            )}
        </div>
    );
};

export default Avatar;
