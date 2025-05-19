import React from 'react';
import { Booking } from './types';
import { 
  FaHotel, FaMapMarkerAlt, FaTicketAlt, FaRegCalendarAlt, FaCalendarCheck, 
  FaCalendarTimes, FaUser, FaPhone, FaCreditCard, FaRegCalendarCheck, 
  FaEdit, FaRegTimesCircle
} from 'react-icons/fa';
import { 
  formatDateString, calculateNights, getStatusClass, getStatusIcon, 
  getRoomTypeStyle, getRoomTypeIcon, getPaymentMethodIcon, 
  getPaymentMethodText, getBookingId
} from './utils';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
  onAmend: () => void;
  onCancel: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  onAmend,
  onCancel
}) => {
  return (
    <>
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] p-6 rounded-t-xl relative">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-md bg-white/15 text-tripswift-off-white text-sm mb-3">
              <FaTicketAlt className="mr-2" />
              Booking #{getBookingId(booking)}
            </div>
            <h2 className="text-2xl font-tripswift-bold text-tripswift-off-white leading-tight mb-1">
              {booking.property.property_name}
            </h2>
            {booking.property.property_address && (
              <p className="text-tripswift-off-white/80 text-sm flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                {booking.property.property_address}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-tripswift-off-white/80 hover:text-tripswift-off-white bg-tripswift-off-white/10 hover:bg-tripswift-off-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        
        {/* Status Badge */}
        <div className="absolute bottom-0 right-6 transform translate-y-1/2">
          <div className={`flex items-center px-4 py-2 rounded-full shadow-md ${
            booking.status === "Confirmed" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : booking.status === "Pending"
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {getStatusIcon(booking.status)}
            <span className="font-tripswift-bold">{booking.status}</span>
          </div>
        </div>
      </div>

      {/* Modal Content */}
      <div className="p-6 pt-10">
        {/* Stay Details */}
        <div className="mb-8">
          <h3 className="text-xl font-tripswift-bold text-gray-800 mb-4 flex items-center">
            <FaRegCalendarAlt className="mr-2 text-tripswift-blue" />
            Stay Details
          </h3>
          
          <div className="bg-gray-50 p-5 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Check-in</p>
                <p className="flex items-center text-gray-800 font-tripswift-bold">
                  <FaCalendarCheck className="mr-2 text-green-500" />
                  {formatDateString(booking.checkInDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Check-out</p>
                <p className="flex items-center text-gray-800 font-tripswift-bold">
                  <FaCalendarTimes className="mr-2 text-red-500" />
                  {formatDateString(booking.checkOutDate)}
                </p>
              </div>
              {/* <div>
                <p className="text-sm text-gray-500 mb-1">Duration</p>
                <p className="flex items-center text-gray-800 font-tripswift-bold">
                  <FaRegCalendarAlt className="mr-2 text-tripswift-blue" />
                  {calculateNights(booking.checkInDate, booking.checkOutDate)} {calculateNights(booking.checkInDate, booking.checkOutDate) === 1 ? 'Night' : 'Nights'}
                </p>
              </div> */}
            </div>
            
            <div className="border-t border-gray-200 mt-5 pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Room Type</p>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-tripswift-medium ${getRoomTypeStyle(booking.room.room_type)}`}>
                      {getRoomTypeIcon(booking.room.room_type)}
                      {booking.room.room_type}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Room Name</p>
                  <p className="text-gray-800 font-tripswift-medium">{booking.room.room_name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="mb-8">
          <h3 className="text-xl font-tripswift-bold text-gray-800 mb-4 flex items-center">
            <FaUser className="mr-2 text-tripswift-blue" />
            Guest Details
          </h3>
          
          <div className="bg-gray-50 p-5 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Guest Name</p>
                <p className="text-gray-800 font-tripswift-medium">{booking.booking_user_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                <p className="text-gray-800 font-tripswift-medium">{booking.booking_user_phone}</p>
              </div>
            </div>
            
            {(booking.adultCount || booking.childCount) && (
              <div className="border-t border-gray-200 mt-5 pt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {booking.adultCount && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Adults</p>
                      <p className="text-gray-800 font-tripswift-medium">{booking.adultCount}</p>
                    </div>
                  )}
                  {booking.childCount && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Children</p>
                      <p className="text-gray-800 font-tripswift-medium">{booking.childCount}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {booking.specialRequests && (
              <div className="border-t border-gray-200 mt-5 pt-5">
                <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                <p className="text-gray-800 italic">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-8">
          <h3 className="text-xl font-tripswift-bold text-gray-800 mb-4 flex items-center">
            <FaCreditCard className="mr-2 text-tripswift-blue" />
            Payment Details
          </h3>
          
          <div className="bg-gray-50 p-5 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="flex items-center font-tripswift-medium">
                  {getPaymentMethodIcon(booking)}
                  {getPaymentMethodText(booking)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Booking Date</p>
                <p className="flex items-center text-gray-800 font-tripswift-medium">
                  <FaRegCalendarCheck className="mr-2 text-gray-500" />
                  {formatDateString(booking.booking_dates)}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-5 pt-5 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-2xl font-tripswift-bold text-tripswift-blue">₹{booking.amount.toLocaleString()}</p>
              </div>
              
              {booking.ratePlanName && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Rate Plan</p>
                  <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-tripswift-medium">
                    {booking.ratePlanName}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-200 pt-6">
          {booking.status === "Confirmed" && (
            <>
              <button
                className="flex-1 bg-tripswift-blue text-tripswift-off-white py-3 px-6 rounded-lg hover:bg-[#054B8F] transition-colors shadow-sm hover:shadow-md font-tripswift-medium flex items-center justify-center"
                onClick={onAmend}
              >
                <FaEdit className="mr-2" />
                Modify Booking
              </button>
              <button
                className="flex-1 bg-white text-red-600 border border-red-200 py-3 px-6 rounded-lg hover:bg-red-50 transition-colors font-tripswift-medium flex items-center justify-center"
                onClick={onCancel}
              >
                <FaRegTimesCircle className="mr-2" />
                Cancel Booking
              </button>
            </>
          )}
          <button
            className="flex-1 bg-gray-700 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center font-tripswift-medium"
            onClick={() => window.print()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Itinerary
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingDetailsModal;