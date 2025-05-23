import React from 'react';

const BookingHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] text-tripswift-off-white">
      <div className="container mx-auto px-4 py-4 md:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-tripswift-bold mb-2 text-tripswift-off-white">Your Bookings</h1>
          <p className="text-tripswift-off-white/80 text-lg max-w-2xl mx-auto">
            View, manage, and track all your hotel reservations in one place
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;