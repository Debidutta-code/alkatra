"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Booking, GuestDetails } from "./types";
import {
  FaHotel,
  FaRegCalendarAlt,
  FaCalendarCheck,
  FaCalendarTimes,
  FaUser,
  FaCreditCard,
  FaRegCalendarCheck,
  FaEdit,
  FaRegTimesCircle,
  FaBed,
  FaUsers,
  FaEnvelope,
} from "react-icons/fa";
import {
  formatDateString,
  calculateNights,
  getStatusIcon,
  calculateOriginalAmount,
  getDiscountAmount,
  formatDiscountBadge,
} from "./utils";
import { printBookingItinerary } from '../PrintBookingItinerary';
import { Phone } from "lucide-react";

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
  onCancel,
}) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const formatDOB = (dob: string): string => {
    if (!dob) return "";
    const date = new Date(dob);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  const roomType = booking.roomTypeCode;
  const currency = booking.currencyCode?.toUpperCase();
  const isPastOrTodayCheckIn = new Date(booking.checkInDate).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0);
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  return (
    <>
      {/* Enhanced Modal Header */}
      <div className="bg-gradient-to-br from-tripswift-blue via-[#054B8F] to-[#043A73] px-4 py-4 rounded-t-xl relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <FaHotel className="text-2xl text-tripswift-off-white mr-2 ml-2" />
                <h2 className="text-2xl font-tripswift-bold text-tripswift-off-white leading-tight mt-1">
                  {booking.hotelName}
                </h2>
              </div>
            </div>

            {/* Status Badge - Moved to top right */}
            <div className={`flex items-center gap-3 ${i18n.language === "ar" ? "flex-row-reverse" : ""}`}>
              <div
                className={`flex items-center px-3 py-1.5 rounded-full shadow-lg text-sm font-tripswift-bold backdrop-blur-sm ${booking.status === "Confirmed"
                  ? "bg-white/95 text-green-700 border border-green-200/30"
                  : booking.status === "Pending"
                    ? "bg-white/95 text-amber-700 border border-amber-200/30"
                    : "bg-white/95 text-red-700 border border-red-200/30"
                  }`}
              >
                <span className={`${i18n.language === "ar" ? "ml-1.5" : "mr-1.5"}`}>
                  {getStatusIcon(booking.status ?? "", i18n.language)}
                </span>
                <span>{booking.status}</span>
              </div>

              <button
                onClick={onClose}
                className="text-tripswift-off-white hover:text-tripswift-off-white bg-tripswift-off-white/10 hover:bg-tripswift-off-white/20 rounded-full p-2 transition-all duration-200 hover:scale-105"
                aria-label={t("BookingTabs.BookingDetailsModal.closeModal")}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area with Better Spacing */}
      <div className="px-6 py-6 font-noto-sans space-y-4 print-content bg-tripswift-off-white">
        {/* Stay Details Section */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FaRegCalendarAlt className="text-tripswift-blue text-sm" />
            </div>
            <h3 className="text-lg font-tripswift-bold text-gray-800">
              {t("BookingTabs.BookingDetailsModal.stayDetails")}
            </h3>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-tripswift-blue/5 rounded-2xl p-5 border border-gray-200/60 shadow-sm">
            {/* Check-in/Check-out Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-tripswift-off-white rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                    <FaCalendarCheck className="text-green-600 text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-tripswift-medium text-gray-700 uppercase tracking-wide">
                      {t("BookingTabs.BookingDetailsModal.checkIn")}
                    </p>
                    <p className="text-base font-tripswift-bold text-tripswift-black">
                      {formatDateString(booking.checkInDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-tripswift-off-white rounded-xl p-4 border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                    <FaCalendarTimes className="text-red-600 text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-tripswift-medium text-gray-700 uppercase tracking-wide">
                      {t("BookingTabs.BookingDetailsModal.checkOut")}
                    </p>
                    <p className="text-base font-tripswift-bold text-tripswift-black">
                      {formatDateString(booking.checkOutDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Details Card */}
            <div className="bg-tripswift-off-white rounded-xl p-4 border border-tripswift-blue/20 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaBed className="text-tripswift-blue text-base" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-tripswift-medium text-gray-700 uppercase tracking-wide">
                      {t("BookingTabs.BookingDetailsModal.roomType")}
                    </p>
                    <span
                      className="text-base font-tripswift-bold text-tripswift-black"
                    >
                      <span className="truncate">{roomType}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaUsers className="text-purple-600 text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-tripswift-medium text-gray-700 uppercase tracking-wide">
                      {t("BookingTabs.BookingDetailsModal.rooms")}
                    </p>
                    <p className="text-base font-tripswift-bold text-tripswift-black">
                      {t("BookingTabs.BookingDetailsModal.roomsCount", { count: booking.numberOfRooms })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaRegCalendarAlt className="text-amber-600 text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-tripswift-medium text-gray-700 uppercase tracking-wide">
                      {t("BookingTabs.BookingDetailsModal.duration")}
                    </p>
                    <p className="text-base font-tripswift-bold text-tripswift-black">
                      {t("BookingTabs.BookingDetailsModal.nightsStay_one", { count: nights })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guest Details Section */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <FaUser className="text-purple-600 text-sm" />
            </div>
            <h3 className="text-lg font-tripswift-bold text-gray-800">
              {t("BookingTabs.BookingDetailsModal.guestDetails")}
            </h3>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-2xl p-5 border border-gray-200/60 shadow-sm">
            {booking.guestDetails && booking.guestDetails.length > 0 ? (
              <div className="space-y-2">
                {booking.guestDetails.map((guest: GuestDetails, idx: number) => (
                  <div
                    key={guest._id || idx}
                    className="bg-tripswift-off-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-tripswift-blue to-[#054B8F] rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaUser className="text-tripswift-off-white text-sm" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-tripswift-bold text-tripswift-black truncate">
                            {guest.firstName} {guest.lastName}
                          </p>
                          <p className="text-xs text-gray-700 font-tripswift-medium">
                            {t("BookingTabs.BookingDetailsModal.guest")} {idx + 1}
                          </p>
                        </div>
                      </div>

                      {guest.dob && (
                        <div className="px-4 py-2">
                          <p className="text-xs text-gray-700 font-tripswift-medium">
                            {t("BookingTabs.BookingDetailsModal.dob")}
                          </p>
                          <p className="text-sm font-tripswift-bold text-tripswift-black">
                            {formatDOB(guest.dob)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-tripswift-off-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-tripswift-black font-tripswift-medium">
                  {booking.email}
                </p>
              </div>
            )}

            {/* Contact Information */}
            {(booking.email || booking.phone) && (
              <div className="mt-4 bg-tripswift-off-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Email (left-aligned, takes available space) */}
                  {booking.email && (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaEnvelope className="text-tripswift-blue text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-700 font-tripswift-medium">
                          {t("BookingTabs.BookingDetailsModal.email")}
                        </p>
                        <p className="font-tripswift-bold text-tripswift-black truncate">
                          {booking.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Phone (right-aligned, like DOB) */}
                  {booking.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="text-green-600 w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-700 font-tripswift-medium">
                          {t("BookingTabs.BookingDetailsModal.contactNumber")}
                        </p>
                        <p className="font-tripswift-bold text-tripswift-black truncate" dir="ltr">
                          +{booking.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Payment Details Section */}
        {booking.paymentMethod && booking.totalAmount && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <FaCreditCard className="text-green-600 text-sm" />
              </div>
              <h3 className="text-lg font-tripswift-bold text-gray-800">
                {t("BookingTabs.BookingDetailsModal.paymentDetails")}
              </h3>
            </div>

            <div className="bg-gradient-to-br from-tripswift-blue via-[#054B8F] to-[#043A73] rounded-2xl p-5 shadow-xl">
              <div className="space-y-3">
                {/* Payment Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-700 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaRegCalendarCheck className="text-tripswift-off-white text-base" />
                    </div>
                    <div>
                      <p className="text-tripswift-off-white text-xs font-tripswift-bold uppercase tracking-wide mb-1">
                        {t("BookingTabs.BookingDetailsModal.bookingDate")}
                      </p>
                      <p className="text-tripswift-off-white font-tripswift-bold">
                        {booking.createdAt ? formatDateString(booking.createdAt) : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-700 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaCreditCard className="text-tripswift-off-white text-base" />
                    </div>
                    <div>
                      <p className="text-tripswift-off-white text-xs font-tripswift-bold uppercase tracking-wide mb-1">
                        {t("BookingTabs.BookingDetailsModal.paymentMethod")}
                      </p>
                      <p className="text-tripswift-off-white font-tripswift-bold">
                        {booking.paymentMethod
                          ? booking.paymentMethod.charAt(0).toUpperCase() +
                          booking.paymentMethod.slice(1).replace(/([A-Z])/g, " $1").trim()
                          : t("BookingTabs.BookingDetailsModal.unknownPayment")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Amount Card */}
                <div className="bg-tripswift-off-white/10 backdrop-blur-sm rounded-xl p-5 border border-tripswift-off-white/20">
                  <p className="text-tripswift-off-white text-sm font-tripswift-bold uppercase tracking-wide mb-3">
                    {t("BookingTabs.BookingDetailsModal.totalAmount")}
                  </p>

                  {booking.couponDetails && booking.couponDetails.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-tripswift-off-white text-base line-through">
                        {currency} {calculateOriginalAmount(booking).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-tripswift-off-white font-tripswift-bold text-xl">
                          {currency} {booking.totalAmount.toFixed(2)}
                        </p>
                        <span className="bg-green-500 text-tripswift-off-white text-sm px-3 py-1.5 rounded-full font-tripswift-bold shadow-lg">
                          {formatDiscountBadge(booking.couponDetails, currency)}
                        </span>
                      </div>
                      <p className="text-green-200 text-sm font-tripswift-bold">
                        ✓ You saved {currency} {getDiscountAmount(booking).toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-tripswift-off-white font-tripswift-bold text-3xl">
                      {currency} {booking.totalAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 no-print">
          {(booking.status === "Confirmed" || booking.status === "Modified") &&
            !isPastOrTodayCheckIn &&
            booking.paymentMethod !== "crypto" && (
              <>
                <button
                  className="flex-1 py-3 px-5 rounded-xl font-tripswift-bold text-tripswift-off-white bg-gradient-to-r from-tripswift-blue to-[#054B8F] hover:from-[#054B8F] hover:to-[#043A73] shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={onAmend}
                >
                  <FaEdit className="text-base" />
                  {t("BookingTabs.BookingDetailsModal.modifyBooking")}
                </button>

                <button
                  className="flex-1 py-3 px-5 rounded-xl font-tripswift-bold text-red-600 bg-tripswift-off-white border-2 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={onCancel}
                >
                  <FaRegTimesCircle className="text-base" />
                  {t("BookingTabs.BookingDetailsModal.cancelBooking")}
                </button>
              </>
            )}

          <button
            className="flex-1 py-3 px-5 rounded-xl font-tripswift-bold text-tripswift-off-white bg-gray-700 hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => printBookingItinerary(booking, t, formatDOB, i18n.language)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            {t("BookingTabs.BookingDetailsModal.printItinerary")}
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingDetailsModal;