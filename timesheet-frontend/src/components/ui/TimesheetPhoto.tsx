import React from 'react';

interface TimesheetPhotoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCaption?: boolean;
  useActualImage?: boolean;
}

const TimesheetPhoto: React.FC<TimesheetPhotoProps> = ({ 
  className = '',
  size = 'md',
  showCaption = true,
  useActualImage = false
}) => {
  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const imageSizes = {
    sm: 'w-32 h-24',
    md: 'w-48 h-32',
    lg: 'w-64 h-40',
    xl: 'w-80 h-48'
  };

  if (useActualImage) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          <img
            src="/images/ui/timesheet-photo.jpg"
            alt="Timesheet Management System - Professional time tracking and employee management"
            className={`${imageSizes[size]} object-cover`}
          />
          {/* Overlay with decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        
        {showCaption && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Professional time tracking solution for modern businesses
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 p-8">
        {/* Placeholder for timesheet photo */}
        <div className="aspect-video bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Timesheet Management
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                Professional time tracking and employee management system
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-primary-600/10 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-success-600/10 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      {showCaption && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Efficient time tracking solution for modern businesses
          </p>
        </div>
      )}
    </div>
  );
};

export default TimesheetPhoto;
