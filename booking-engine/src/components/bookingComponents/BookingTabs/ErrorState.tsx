import React from 'react';
import { FaRegTimesCircle } from 'react-icons/fa';

interface ErrorStateProps {
  errorMessage: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ errorMessage }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-10 max-w-md mx-auto text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
        <FaRegTimesCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-tripswift-bold text-gray-800 mb-3">{errorMessage}</h3>
      <p className="text-gray-500 mb-6">We couldn't find any bookings associated with your account.</p>
      <button className="bg-tripswift-blue text-tripswift-off-white px-6 py-3 rounded-lg hover:bg-[#054B8F] transition-colors shadow-md hover:shadow-lg font-tripswift-medium">
        Start Booking Now
      </button>
    </div>
  );
};

export default ErrorState;