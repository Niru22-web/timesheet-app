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
        alt="ASA Ashish Shah & Associates - Delivering Value"
        className={`${imageSizes[size]} ${className}`}
      />
    );
  }

  if (variant === 'icon-only') {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <div className="bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold" 
             style={{ width: '100%', height: '100%' }}>
          <span className={textSizes[size]}>ASA</span>
        </div>
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex items-baseline gap-2">
          <span className={`font-bold text-primary-600 ${textSizes[size]}`}>
            ASA
          </span>
          <span className={`text-gray-600 font-medium ${subTextSizes[size]}`}>
            ASHISH SHAH & ASSOCIATES
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-px bg-gray-400"></div>
          <span className={`text-primary-600 font-medium ${taglineSizes[size]}`}>
            DELIVERING VALUE
          </span>
          <div className="flex-1 h-px bg-gray-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0`}
           style={{ aspectRatio: '1' }}>
        <span className={textSizes[size]}>ASA</span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className={`font-bold text-primary-600 ${textSizes[size]}`}>
            ASA
          </span>
          <span className={`text-gray-600 font-medium ${subTextSizes[size]}`}>
            ASHISH SHAH & ASSOCIATES
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-px bg-gray-400"></div>
          <span className={`text-primary-600 font-medium ${taglineSizes[size]}`}>
            DELIVERING VALUE
          </span>
          <div className="flex-1 h-px bg-gray-400"></div>
        </div>
      </div>
    </div>
  );
};

export default Logo;
