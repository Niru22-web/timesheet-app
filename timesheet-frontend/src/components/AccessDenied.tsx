import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    const userRole = localStorage.getItem('userRole')?.toLowerCase();
    let homeRoute = '/dashboard';
    
    if (userRole === 'admin') homeRoute = '/admin';
    else if (userRole === 'manager') homeRoute = '/manager';
    else if (userRole === 'partner') homeRoute = '/partner';
    else if (userRole === 'user' || userRole === 'employee') homeRoute = '/employee';
    
    navigate(homeRoute);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Denied
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You don't have permission to access this module.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Permission Required
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Your current role doesn't have the necessary permissions to view this page.
                      Please contact your administrator if you believe this is an error.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
              <p className="font-medium mb-2">What can you do?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Contact your system administrator</li>
                <li>Request additional permissions</li>
                <li>Navigate back to your dashboard</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleGoBack}
                variant="secondary"
                fullWidth
              >
                Go Back
              </Button>
              <Button
                onClick={handleGoHome}
                variant="primary"
                fullWidth
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
