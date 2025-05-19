import React from 'react';
import { FaRegTimesCircle, FaTicketAlt } from 'react-icons/fa';
import { BookingTabType } from './types';

interface EmptyStateProps {
  activeTab: BookingTabType;
}

const EmptyState: React.FC<EmptyStateProps> = ({ activeTab }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-10 max-w-lg mx-auto text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
        {activeTab === 'cancelled' ? (
          <FaRegTimesCircle className="h-10 w-10 text-tripswift-blue/70" />
        ) : (
          <FaTicketAlt className="h-10 w-10 text-tripswift-blue/70" />
        )}
      </div>
      <h3 className="text-xl font-tripswift-bold text-gray-800 mb-3">
        {activeTab === 'upcoming' ? 'No upcoming bookings' :
         activeTab === 'completed' ? 'No completed stays' :
         activeTab === 'cancelled' ? 'No cancelled bookings' : 'No bookings found'}
      </h3>
      <p className="text-gray-500 mb-6">
        {activeTab === 'upcoming' ? "You don't have any upcoming hotel reservations." :
         activeTab === 'completed' ? "You haven't completed any stays yet." :
         activeTab === 'cancelled' ? "You don't have any cancelled reservations." : "Start planning your next trip!"}
      </p>
      <button className="bg-tripswift-blue text-tripswift-off-white px-6 py-3 rounded-lg hover:bg-[#054B8F] transition-colors shadow-md hover:shadow-lg font-tripswift-medium">
        Book a Hotel
      </button>
    </div>
  );
};

export default EmptyState;