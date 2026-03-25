import React from 'react';

const TestComponent: React.FC<{ role: string }> = ({ role }) => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          {role} Dashboard Test
        </h1>
        <p className="text-gray-600">
          This is a test component to verify routing is working for {role} role.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Current time: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
