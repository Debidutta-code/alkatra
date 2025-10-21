import React, { useState } from 'react';
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
  getRoomTypeIcon,
  calculateOriginalAmount,
  formatDiscountBadge,
} from './utils';
import { useTranslation } from 'react-i18next';
import { formatDate } from "../../../utils/dateUtils";
import RebookModal from '../bookAgain/RebookModal';

interface BookingCardProps {
  booking: Booking;
  activeTab?: BookingTabType;
  onViewDetails: (booking: Booking) => void;
  onModify: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onBookAgain?: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  activeTab,
  onViewDetails,
  onModify,
  onCancel,
  onBookAgain = () => { },
}) => {
  const { t, i18n } = useTranslation();

  // Get primary guest name (first guest or fallback to booking.email)
  const primaryGuest = booking.guestDetails && booking.guestDetails.length > 0
    ? `${booking.guestDetails[0].firstName} ${booking.guestDetails[0].lastName}`
    : booking.email;

  // Room Type
  const roomType = booking.roomTypeCode || t('BookingTabs.BookingCard.standardRoom');

  // Currency
  const currency = booking.currencyCode?.toUpperCase() || 'INR';

  // Payment Method (Capitalize first letter for display)
  const paymentMethod = booking.paymentMethod
    ? booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1).replace(/([A-Z])/g, ' $1').trim()
    : 'Unknown';

  const isPastOrTodayCheckIn = new Date(booking.checkInDate).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0);
  const [isRebookModalOpen, setIsRebookModalOpen] = useState(false);

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
      </div>

      {/* Card Body */}
      <div className="px-3 py-2 sm:px-5">
        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 lg:gap-40 py-3 sm:py-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('BookingTabs.BookingCard.checkIn')}</p>
            <p className="flex items-center text-tripswift-black font-tripswift-medium text-sm">
              <FaCalendarCheck className={`text-green-500 flex-shrink-0 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
              {formatDate(booking.checkInDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('BookingTabs.BookingCard.checkOut')}</p>
            <p className="flex items-center text-tripswift-black font-tripswift-medium text-sm">
              <FaCalendarTimes className={`text-green-500 flex-shrink-0 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
              {formatDate(booking.checkOutDate)}
            </p>
          </div>
        </div>

        {/* Room Type & Payment Method */}
        <div className={`grid gap-4 sm:gap-8 lg:gap-40 border-t border-gray-100 py-3 sm:py-4 ${booking.paymentMethod ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Room Type */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">{t('BookingTabs.BookingCard.roomType')}</p>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-tripswift-medium ${getRoomTypeStyle(roomType)} z-50`}>
              {getRoomTypeIcon(roomType, i18n.language)}
              {roomType}
            </div>
          </div>
          {booking.paymentMethod && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5">{t('BookingTabs.BookingCard.paymentMethod')}</p>
              <div className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-tripswift-medium bg-gray-100 text-gray-800">
                💳 {paymentMethod}
              </div>
            </div>
          )}
        </div>

        {/* Guest & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 lg:gap-40 border-t border-gray-100 py-3 sm:py-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('BookingTabs.BookingCard.primaryGuest')}</p>
            <p className="flex items-center text-tripswift-black font-tripswift-medium text-sm">
              <FaUser className={`text-tripswift-blue/70 flex-shrink-0 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
              {primaryGuest}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('BookingTabs.BookingCard.rateBreakdown')}</p>
            {booking.couponDetails && booking.couponDetails.length > 0 ? (
              <div className="flex flex-col gap-1">
                <p className="text-gray-400 text-xs line-through">
                  {currency} {calculateOriginalAmount(booking).toFixed(2)}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-tripswift-bold text-green-600">
                    {currency} {booking.totalAmount.toFixed(2)}
                  </span>
                  <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-tripswift-bold border border-green-300">
                  {formatDiscountBadge(booking.couponDetails, currency)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="flex items-center text-tripswift-black font-tripswift-medium text-sm">
                <span className="text-base sm:text-lg font-tripswift-bold text-tripswift-blue">
                  {currency} {booking.totalAmount.toFixed(2)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-tripswift-off-white/70 py-4 px-4 border-t border-gray-100">
        <button
          className="w-full bg-tripswift-blue hover:bg-[#054B8F] text-tripswift-off-white py-2.5 px-4 rounded-lg transition-colors duration-300 text-sm font-tripswift-medium shadow-sm hover:shadow-md flex items-center justify-center"
          onClick={() => onViewDetails(booking)}
        >
          <FaTicketAlt className={` ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
          {t('BookingTabs.BookingCard.viewBookingDetails')}
        </button>

        {(booking.status === "Confirmed" || booking.status === "Modified") &&
          !isPastOrTodayCheckIn &&
          activeTab !== 'completed' &&
          booking.paymentMethod !== 'crypto' && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                className="py-2 px-4 rounded-lg transition-colors duration-300 text-xs font-tripswift-medium flex items-center justify-center
         bg-tripswift-off-white hover:bg-gray-100 text-tripswift-blue border border-tripswift-blue/30"
                onClick={() => onModify(booking)}
              >
                <FaEdit className={`${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                {t('BookingTabs.BookingCard.modify')}
              </button>

              <button
                className="py-2 px-4 rounded-lg transition-colors duration-300 text-xs font-tripswift-medium flex items-center justify-center
         bg-tripswift-off-white hover:bg-gray-100 text-red-600 border border-red-200"
                onClick={() => onCancel(booking)}
              >
                <FaRegTimesCircle className={`${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                {t('BookingTabs.BookingCard.cancel')}
              </button>
            </div>
          )}

        {isPastOrTodayCheckIn && (
          <>
            <button
              className="w-full mt-3 py-2.5 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-tripswift-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center text-sm"
              onClick={() => setIsRebookModalOpen(true)}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('BookingTabs.BookingCard.bookAgain')}
            </button>

            <RebookModal
              isOpen={isRebookModalOpen}
              onClose={() => setIsRebookModalOpen(false)}
              booking={booking}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BookingCard;