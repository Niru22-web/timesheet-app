import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'text-only' | 'image';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  const imageSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const subTextSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const taglineSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
    xl: 'text-base'
  };

  if (variant === 'image') {
    return (
      <img
        src="/images/branding/asa-logo.png"
        alt="Timesheet Pro - Delivering Value"
        className={`${imageSizes[size]} ${className}`}
      />
    );
  }

  if (variant === 'icon-only') {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <div className="bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold w-full h-full">
          <span className={textSizes[size]}>TP</span>
        </div>
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="text-primary-600 font-extrabold text-3xl tracking-tighter leading-none mb-1">ASA</div>
        <div className="text-[9px] font-black text-secondary-900 uppercase tracking-tighter text-center leading-[1.1]">
          ASHISH SHAH & ASSOCIATES
        </div>
        <div className="text-[8px] font-bold text-secondary-400 uppercase tracking-[0.2em] mt-2 whitespace-nowrap">
          DELIVERING VALUE
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
        <div className="text-primary-600 font-extrabold text-4xl tracking-tighter leading-none mb-1">ASA</div>
        <div className="text-[10px] font-black text-secondary-900 uppercase tracking-tighter text-center leading-[1.1]">
          ASHISH SHAH & ASSOCIATES
        </div>
        <div className="h-px w-8 bg-secondary-200 my-2" />
        <div className="text-[8px] font-bold text-secondary-400 uppercase tracking-[0.3em] whitespace-nowrap">
          DELIVERING VALUE
        </div>
    </div>
  );
};

export default Logo;
