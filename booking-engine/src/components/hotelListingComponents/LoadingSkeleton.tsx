import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3 h-48 bg-gray-200 rounded-md"></div>
            <div className="sm:w-2/3 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="flex justify-between mt-4">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;