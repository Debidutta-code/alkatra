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
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  formatDateString,
  calculateNights,
  getStatusClass,
  getStatusIcon,
  getRoomTypeStyle,
  getRoomTypeIcon,
} from "./utils";
import { dir } from "console";

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

  // Format date to dd/mm/yyyy
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

  const formatCamelCase = (text: string): string => text.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  const roomType = booking.roomTypeCode || t("BookingTabs.BookingDetailsModal.standardRoom");
  const currency = booking.currencyCode?.toUpperCase() || "INR";
  const isPastCheckIn = new Date(booking.checkInDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
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
              {/* <p className="text-tripswift-off-white text-sm">
                Booking ID: {booking._id?.slice(-8).toUpperCase()}
              </p> */}
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


      {/* Enhanced Modal Content */}
      <div className="px-4 py-4 font-noto-sans space-y-4">
        {/* Stay Details */}
        <div className="space-y-3">
          <h3 className="text-lg font-tripswift-bold text-gray-800 flex items-center">
            <FaRegCalendarAlt
              className={`text-tripswift-blue text-base ${i18n.language === "ar" ? "ml-2" : "mr-2"
                }`}
            />
            {t("BookingTabs.BookingDetailsModal.stayDetails")}
          </h3>

          <div className="bg-gradient-to-r from-tripswift-off-white to-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
            {/* Date Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                <div className="flex items-center mb-1">
                  <FaCalendarCheck className="text-green-500 mr-2 ml-2" />
                  <p className="text-sm text-gray-500 font-tripswift-medium">
                    {t("BookingTabs.BookingDetailsModal.checkIn")}
                  </p>
                </div>
                <p className="font-tripswift-bold text-gray-800 ml-8">
                  {formatDateString(booking.checkInDate)}
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                <div className="flex items-center mb-1">
                  <FaCalendarTimes className="text-red-500 mr-2 ml-2" />
                  <p className="text-sm text-gray-500 font-tripswift-medium">
                    {t("BookingTabs.BookingDetailsModal.checkOut")}
                  </p>
                </div>
                <p className="font-tripswift-bold text-gray-800 ml-8">
                  {formatDateString(booking.checkOutDate)}
                </p>
              </div>
            </div>

            {/* Room Details */}
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center mb-1">
                    <FaBed className="text-tripswift-blue mr-2 ml-2" />
                    <p className="text-sm text-gray-500 font-tripswift-medium">
                      {t("BookingTabs.BookingDetailsModal.roomType")}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1.5 rounded-lg text-sm font-tripswift-medium ${getRoomTypeStyle(
                      roomType
                    )}`}
                  >
                    <span className="mr-1.5">
                      {getRoomTypeIcon(roomType, i18n.language)}
                    </span>
                    {roomType}
                  </span>
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <FaUsers className="text-tripswift-blue mr-2 ml-2" />
                    <p className="text-sm text-gray-500 font-tripswift-medium">
                      {t("BookingTabs.BookingDetailsModal.rooms")}
                    </p>
                  </div>
                  <p className="font-tripswift-bold text-gray-800 ml-2">
                    {booking.numberOfRooms} {booking.numberOfRooms === 1 ? 'Room' : 'Rooms'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-tripswift-medium mb-1">
                    Duration
                  </p>
                  <p className="font-tripswift-bold text-gray-800">
                    {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="space-y-3">
          <h3 className="text-lg font-tripswift-bold text-gray-800 flex items-center">
            <FaUser
              className={`text-tripswift-blue text-base ${i18n.language === "ar" ? "ml-2" : "mr-2"
                }`}
            />
            {t("BookingTabs.BookingDetailsModal.guestDetails")}
          </h3>

          <div className="bg-gradient-to-r from-tripswift-off-white to-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
            {booking.guestDetails && booking.guestDetails.length > 0 ? (
              <div className="space-y-3">
                {booking.guestDetails.map((guest: GuestDetails, idx: number) => (
                  <div
                    key={guest._id || idx}
                    className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex gap-2 flex-1">
                        <div className="w-6 h-6 bg-tripswift-blue/10 rounded-full flex items-center justify-center">
                          <FaUser className="text-tripswift-blue text-xs" />
                        </div>
                        <div>
                          <p className="font-tripswift-bold text-gray-800">
                            {guest.firstName} {guest.lastName}
                          </p>
                          <p className="text-xs text-gray-500">Guest {idx + 1}</p>
                        </div>
                      </div>

                      {guest.dob && (
                        <div className="bg-gray-50 px-2 py-1.5 rounded-lg">
                          <p className="text-xs text-gray-500 mb-0.5">
                            {t("BookingTabs.BookingDetailsModal.dob")}
                          </p>
                          <p className="text-sm font-tripswift-medium text-gray-800">
                            {formatDOB(guest.dob)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-gray-800 font-tripswift-medium">
                  {booking.email}
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="mt-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <FaPhone className="text-green-600 text-xs" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    {t("BookingTabs.BookingDetailsModal.contactNumber")}
                  </p>
                  <p
                    className="font-tripswift-medium text-gray-800"
                    dir="ltr"
                  >
                    {booking.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-3">
          <h3 className="text-lg font-tripswift-bold text-gray-800 flex items-center">
            <FaCreditCard
              className={`text-tripswift-blue text-base ${i18n.language === "ar" ? "ml-2" : "mr-2"
                }`}
            />
            {t("BookingTabs.BookingDetailsModal.paymentDetails")}
          </h3>

          <div className="bg-gradient-to-r from-tripswift-off-white to-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
            {/* Single row with booking date and total amount */}
            <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] p-4 rounded-xl text-white shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-3">
                  <FaRegCalendarCheck />
                  <div>
                    <p className="text-tripswift-off-white/80 text-sm mb-1">
                      {t("BookingTabs.BookingDetailsModal.bookingDate")}
                    </p>
                    <p className="text-tripswift-off-white font-tripswift-bold">
                      {booking.createdAt ? formatDateString(booking.createdAt) : "-"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-tripswift-off-white/80 text-sm mb-1">
                    {t("BookingTabs.BookingDetailsModal.totalAmount")}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-tripswift-bold text-tripswift-off-white">
                    {currency} {booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex flex-col md:flex-row gap-2 pt-3 border-t border-gray-200">
          {(booking.status === "Confirmed" || booking.status === "Modified") && !isPastCheckIn && (
            <>
              <button
                className="flex-1 bg-gradient-to-r from-tripswift-blue to-[#054B8F] text-tripswift-off-white py-2.5 px-4 rounded-lg hover:shadow-lg transition-all duration-300 font-tripswift-medium flex items-center justify-center"
                onClick={onAmend}
              >
                <FaEdit
                  className={`text-sm ${i18n.language === "ar" ? "ml-2" : "mr-2"
                    }`}
                />
                {t("BookingTabs.BookingDetailsModal.modifyBooking")}
              </button>
              <button
                className="flex-1 bg-white text-red-600 border-2 border-red-200 py-2.5 px-4 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-300 font-tripswift-medium flex items-center justify-center"
                onClick={onCancel}
              >
                <FaRegTimesCircle
                  className={`text-sm ${i18n.language === "ar" ? "ml-2" : "mr-2"
                    }`}
                />
                {t("BookingTabs.BookingDetailsModal.cancelBooking")}
              </button>
            </>
          )}
          <button
            className="flex-1 bg-gray-700 text-tripswift-off-white py-2.5 px-4 rounded-lg hover:bg-gray-800 hover:shadow-lg transition-all duration-300 flex items-center justify-center font-tripswift-medium"
            onClick={() => window.print()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${i18n.language === "ar" ? "ml-2" : "mr-2"
                }`}
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