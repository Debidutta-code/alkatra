import React from 'react';
import {
  FaHotel,
  FaCalendarCheck,
  FaCalendarTimes,
  FaUser,
  FaTicketAlt,
  FaEdit,
  FaRegTimesCircle
} from 'react-icons/fa';
import { Booking, BookingTabType } from './types';
import {
  getStatusClass,
  getStatusIcon,
  getRoomTypeStyle,
  getRoomTypeIcon
} from './utils';
import { useTranslation } from 'react-i18next';
import { formatDate, calculateNights } from "@/utils/dateUtils";

interface BookingCardProps {
  booking: Booking;
  activeTab?: BookingTabType;
  onViewDetails: (booking: Booking) => void;
  onModify: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  activeTab,
  onViewDetails,
  onModify,
  onCancel
}) => {
  const { t, i18n } = useTranslation();

  // Calculate number of nights
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  // Calculate per-night rate
  const nightlyRate = nights > 0 ? Math.round((booking.totalAmount || 0) / nights) : booking.totalAmount || 0;

  // Get primary guest name (first guest or fallback to booking.email)
  const primaryGuest = booking.guestDetails && booking.guestDetails.length > 0
    ? `${booking.guestDetails[0].firstName} ${booking.guestDetails[0].lastName}`
    : booking.email;

  // Room Type
  const roomType = booking.roomTypeCode || t('BookingTabs.BookingCard.standardRoom');

  // Currency
  const currency = booking.currencyCode?.toUpperCase() || 'INR';
  const isPastCheckIn =
    new Date(booking.checkInDate).setHours(0, 0, 0, 0) <
    new Date().setHours(0, 0, 0, 0);
  return (
    <div className="bg-tripswift-off-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 group font-noto-sans">
      {/* Booking ID Banner */}
      <div className="bg-gray-50 py-2 px-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <span className={`inline-flex items-center text-xs font-tripswift-medium px-2.5 py-1 rounded-full ${getStatusClass(booking.status ?? "")}`}>
            {getStatusIcon(booking.status ?? "", i18n.language)}
            {booking.status}
          </span>
        </div>
      </div>

      {/* Card Header */}
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] p-5 relative">
        <h2 className="text-xl font-tripswift-bold text-tripswift-off-white flex items-start">
          <FaHotel className={` flex-shrink-0 mt-0.5  ${i18n.language === "ar" ? "ml-3" : "mr-3"}`} />
          <span className="leading-tight ">{booking.hotelName}</span>
        </h2>
        {/* Stay Duration */}
        {/* <div className="absolute bottom-0 right-0 transform translate-y-1/2 mr-5">
          <div className="bg-tripswift-off-white px-3 py-1.5 rounded-full shadow-md text-sm font-tripswift-bold text-tripswift-blue flex items-center">
            {nights} {t(nights === 1 ? 'BookingTabs.BookingCard.nightSingular' : 'BookingTabs.BookingCard.nightsPlural')}
          </div>
        </div> */}
      </div>

      {/* Card Body */}
      <div className="p-5 pt-7">
        {/* Dates */}
        <div className="flex flex-col sm:flex-row justify-between mb-5 bg-tripswift-off-white/70 p-3 rounded-lg">
          <div className="mb-3 sm:mb-0">
            <p className="text-xs text-gray-500 mb-1">{t('BookingTabs.BookingCard.checkIn')}</p>
            <p className="flex items-center text-tripswift-black font-tripswift-medium text-sm">
              <FaCalendarCheck className={` text-green-500 flex-shrink-0 mb-1 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
              {formatDate(booking.checkInDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('BookingTabs.BookingCard.checkOut')}</p>
            <p className="flex items-center text-tripswift-black font-tripswift-medium text-sm">
              <FaCalendarTimes className={` text-green-500 flex-shrink-0 mb-1 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
              {formatDate(booking.checkOutDate)}
            </p>
          </div>
        </div>

        {/* Room Type & Payment Method */}
        <div className="flex flex-col sm:flex-row justify-between mb-5 bg-tripswift-off-white/70 p-3 rounded-lg border-t border-gray-100">
          {/* Room Type */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">{t('BookingTabs.BookingCard.roomType')}</p>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-tripswift-medium ${getRoomTypeStyle(roomType)} z-50`}>
              {getRoomTypeIcon(roomType, i18n.language)}
              {roomType}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            {/* <p className="text-xs text-gray-500 mb-1.5">{t('BookingTabs.BookingCard.paymentMethod')}</p> */}
            {/* <div className={`inline-flex items-center text-xs font-tripswift-medium ${(booking.payment === "payAtHotel" || booking.paymentType === "payAtHotel")
                ? "text-purple-700"
                : "text-blue-700"
              }`}>
              {getPaymentMethodIcon(booking)}
              {getPaymentMethodText(booking)}
            </div> */}
            {/* <p className="text-xs font-tripswift-medium text-purple-700">
                Pay at Hotel
              </p> */}
          </div>
        </div>

        {/* Guest & Price */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('BookingTabs.BookingCard.primaryGuest')}</p>
            <p className="flex items-center text-gray-800">
              <FaUser className={`mr-2 text-tripswift-blue/70 flex-shrink-0 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
              <span className="font-tripswift-medium">{primaryGuest}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="flex flex-col">
              <p className="text-xs text-gray-500 mb-1">{t('BookingTabs.BookingCard.rateBreakdown')}</p>
              <div className="flex items-center justify-end text-sm text-tripswift-black/70 mb-1">
              </div>
              {/* <p className="text-lg font-tripswift-bold text-tripswift-blue">{currency} {booking.totalAmount.toLocaleString()}</p> */}
              <p className="text-lg font-tripswift-bold text-tripswift-blue">
                USD {booking.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-tripswift-off-white/70 p-4 border-t border-gray-100">
        <button
          className="w-full bg-tripswift-blue hover:bg-[#054B8F] text-tripswift-off-white py-2.5 px-4 rounded-lg transition-colors duration-300 text-sm font-tripswift-medium shadow-sm hover:shadow-md flex items-center justify-center"
          onClick={() => onViewDetails(booking)}
        >
          <FaTicketAlt className={` ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
          {t('BookingTabs.BookingCard.viewBookingDetails')}
        </button>

        {(booking.status === "Confirmed" || booking.status === "Modified") && !isPastCheckIn && activeTab !== 'completed' && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              className="bg-tripswift-off-white hover:bg-gray-100 text-tripswift-blue border border-tripswift-blue/30 py-2 px-4 rounded-lg transition-colors duration-300 text-xs font-tripswift-medium flex items-center justify-center"
              onClick={() => onModify(booking)}
            >
              <FaEdit className={` ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
              {t('BookingTabs.BookingCard.modify')}
            </button>
            <button
              className="bg-tripswift-off-white hover:bg-gray-100 text-red-600 border border-red-200 py-2 px-4 rounded-lg transition-colors text-xs font-tripswift-medium flex items-center justify-center"
              onClick={() => onCancel(booking)}
            >
              <FaRegTimesCircle className={` ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
              {t('BookingTabs.BookingCard.cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;