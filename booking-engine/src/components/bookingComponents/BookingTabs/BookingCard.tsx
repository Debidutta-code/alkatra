import React from 'react';
import { FaHotel, FaMapMarkerAlt, FaCalendarCheck, FaCalendarTimes, FaUser, FaTicketAlt, FaEdit, FaRegTimesCircle } from 'react-icons/fa';
import { Booking } from './types';
import { formatDateString, calculateNights, getStatusClass, getStatusIcon, getRoomTypeStyle, getPaymentMethodText, getPaymentMethodIcon, getBookingId, getRoomTypeIcon } from './utils';

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onModify: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  onViewDetails, 
  onModify, 
  onCancel 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Booking ID Banner */}
      <div className="bg-gray-50 py-2 px-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xs font-tripswift-medium text-gray-500 mr-2">Booking ID:</span>
          <span className="text-xs font-tripswift-bold tracking-wider">{getBookingId(booking)}</span>
        </div>
        <div className="flex items-center">
          <span className={`inline-flex items-center text-xs font-tripswift-medium px-2.5 py-1 rounded-full ${getStatusClass(booking.status)}`}>
            {getStatusIcon(booking.status)}
            {booking.status}
          </span>
        </div>
      </div>
      
      {/* Card Header */}
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] p-5 relative">
        <h2 className="text-xl font-tripswift-bold text-tripswift-off-white flex items-start">
          <FaHotel className="mr-3 flex-shrink-0 mt-1" />
          <span className="leading-tight">{booking.property.property_name}</span>
        </h2>
        {booking.property.property_address && (
          <p className="text-tripswift-off-white/80 text-sm mt-2 flex items-start">
            <FaMapMarkerAlt className="mr-3 flex-shrink-0 mt-0.5" />
            <span>{booking.property.property_address}</span>
          </p>
        )}
        
        {/* Stay Duration */}
        {/* <div className="absolute bottom-0 right-0 transform translate-y-1/2 mr-5">
          <div className="bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-tripswift-bold text-tripswift-blue">
            {calculateNights(booking.checkInDate, booking.checkOutDate)} {calculateNights(booking.checkInDate, booking.checkOutDate) === 1 ? 'Night' : 'Nights'}
          </div>
        </div> */}
      </div>

      {/* Card Body */}
      <div className="p-5 pt-7">
        {/* Dates */}
        <div className="flex flex-col sm:flex-row justify-between mb-5 bg-gray-50 p-3 rounded-lg">
          <div className="mb-3 sm:mb-0">
            <p className="text-xs text-gray-500 mb-1">Check-in</p>
            <p className="flex items-center text-gray-800 font-tripswift-medium text-sm">
              <FaCalendarCheck className="mr-2 text-green-500 flex-shrink-0" />
              {formatDateString(booking.checkInDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Check-out</p>
            <p className="flex items-center text-gray-800 font-tripswift-medium text-sm">
              <FaCalendarTimes className="mr-2 text-red-500 flex-shrink-0" />
              {formatDateString(booking.checkOutDate)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Room Type */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Room Type</p>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-tripswift-medium ${getRoomTypeStyle(booking.room?.room_type)} z-50`}>
              {getRoomTypeIcon(booking.room?.room_type)}
              {booking.room && booking.room.room_type 
                ? booking.room.room_type 
                : "Standard Room"}
            </div>
          </div>
          
          {/* Payment Method */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Payment Method</p>
            <div className={`inline-flex items-center text-xs font-tripswift-medium ${(booking.payment === "payAtHotel" || booking.paymentType === "payAtHotel")
                ? "text-purple-700"
                : "text-blue-700"
              }`}>
              {getPaymentMethodIcon(booking)}
              {getPaymentMethodText(booking)}
            </div>
          </div>
        </div>
        
        {/* Guest & Price */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Primary Guest</p>
            <p className="flex items-center text-gray-800">
              <FaUser className="mr-2 text-tripswift-blue/70 flex-shrink-0" />
              <span className="font-tripswift-medium">{booking.booking_user_name}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
            <p className="text-lg font-tripswift-bold text-tripswift-blue">₹{booking.amount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-gray-50 p-4 border-t border-gray-100">
        <button
          className="w-full bg-tripswift-blue hover:bg-[#054B8F] text-tripswift-off-white py-2.5 px-4 rounded-lg transition-colors text-sm font-tripswift-medium shadow-sm hover:shadow-md flex items-center justify-center"
          onClick={() => onViewDetails(booking)}
        >
          <FaTicketAlt className="mr-2" />
          View Booking Details
        </button>
        
        {booking.status === "Confirmed" && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              className="bg-tripswift-off-white hover:bg-gray-100 text-tripswift-blue border border-tripswift-blue/30 py-2 px-4 rounded-lg transition-colors text-xs font-tripswift-medium flex items-center justify-center"
              onClick={() => onModify(booking)}
            >
              <FaEdit className="mr-1.5" />
              Modify
            </button>
            <button
              className="bg-tripswift-off-white hover:bg-gray-100 text-red-600 border border-red-200 py-2 px-4 rounded-lg transition-colors text-xs font-tripswift-medium flex items-center justify-center"
              onClick={() => onCancel(booking)}
            >
              <FaRegTimesCircle className="mr-1.5" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;