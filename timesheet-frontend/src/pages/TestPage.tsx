import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestPage: React.FC<{ title: string }> = ({ title }) => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Page Information</h2>
            <p className="text-gray-600">This is the {title} page.</p>
            <p className="text-sm text-gray-500 mt-2">User: {user?.name || 'Not logged in'}</p>
            <p className="text-sm text-gray-500">Role: {user?.role || 'Unknown'}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Navigation Test</h2>
            <p className="text-gray-600">If you can see this page, the navigation is working correctly!</p>
            <p className="text-sm text-gray-500 mt-2">Current path: {window.location.pathname}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
