import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-md">
      <div className="w-16 h-16 border-4 border-tripswift-blue/30 border-t-tripswift-blue rounded-full animate-spin mb-6"></div>
      <h3 className="text-xl font-tripswift-medium text-gray-700 mb-2">Retrieving your bookings</h3>
      <p className="text-gray-500">Just a moment while we fetch your reservation details...</p>
    </div>
  );
};

export default LoadingState;