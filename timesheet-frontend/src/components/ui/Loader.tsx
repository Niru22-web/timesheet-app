import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  className?: string;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
}) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-gray-500 dark:text-gray-400',
    white: 'text-white',
    current: 'text-current',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <svg
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && (
          <span className={`text-sm ${
            color === 'white' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

// Full screen loader component
export interface FullScreenLoaderProps {
  text?: string;
  showBackground?: boolean;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  text = 'Loading...',
  showBackground = true,
}) => {
  const { theme } = useTheme();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      showBackground 
        ? 'bg-white/80 backdrop-blur-sm dark:bg-gray-900/80' 
        : ''
    }`}>
      <div className="flex flex-col items-center gap-4">
        <Loader size="lg" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {text}
        </p>
      </div>
    </div>
  );
};

// Page loader component for content areas
export interface PageLoaderProps {
  text?: string;
  height?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  text = 'Loading content...',
  height = 'h-64',
}) => {
  return (
    <div className={`flex items-center justify-center ${height}`}>
      <div className="flex flex-col items-center gap-3">
        <Loader size="md" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {text}
        </p>
      </div>
    </div>
  );
};

// Skeleton loader for cards and content
export interface SkeletonProps {
  lines?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
          `}
        />
      ))}
    </div>
  );
};

// Card skeleton component
export const CardSkeleton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse dark:bg-gray-700 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-gray-700" />
        </div>
      </div>
      <Skeleton lines={2} />
    </div>
  );
};

export default Loader;
