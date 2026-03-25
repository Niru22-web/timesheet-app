import React from 'react';

const TestTailwind: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-600 mb-8">
          Tailwind CSS Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-soft border border-secondary-100">
            <h2 className="text-xl font-semibold text-secondary-800 mb-2">
              Primary Colors
            </h2>
            <div className="space-y-2">
              <div className="h-8 bg-primary-500 rounded"></div>
              <div className="h-8 bg-primary-600 rounded"></div>
              <div className="h-8 bg-primary-700 rounded"></div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-soft border border-secondary-100">
            <h2 className="text-xl font-semibold text-secondary-800 mb-2">
              Secondary Colors
            </h2>
            <div className="space-y-2">
              <div className="h-8 bg-secondary-300 rounded"></div>
              <div className="h-8 bg-secondary-500 rounded"></div>
              <div className="h-8 bg-secondary-700 rounded"></div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-soft border border-secondary-100">
            <h2 className="text-xl font-semibold text-secondary-800 mb-2">
              Status Colors
            </h2>
            <div className="space-y-2">
              <div className="h-8 bg-success-500 rounded"></div>
              <div className="h-8 bg-danger-500 rounded"></div>
              <div className="h-8 bg-warning-500 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-soft border border-secondary-100">
          <h2 className="text-xl font-semibold text-secondary-800 mb-4">
            Component Tests
          </h2>
          <div className="flex gap-4">
            <button className="btn btn-primary">
              Primary Button
            </button>
            <button className="btn btn-secondary">
              Secondary Button
            </button>
            <button className="btn btn-danger">
              Danger Button
            </button>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-success-50 border border-success-200 rounded-lg">
          <p className="text-success-700 font-medium">
            ✅ If you can see this message with proper styling, Tailwind CSS is working correctly!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestTailwind;
