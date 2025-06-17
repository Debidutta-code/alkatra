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
} from "react-icons/fa";
import {
  formatDateString,
  calculateNights,
  getStatusClass,
  getStatusIcon,
  getRoomTypeStyle,
  getRoomTypeIcon,
} from "./utils";

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
  const { t , i18n } = useTranslation();
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

  const formatCamelCase = (text: string): string =>
    text.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  const roomType =
    booking.roomTypeCode || t("BookingTabs.BookingDetailsModal.standardRoom");
  const currency = booking.currencyCode?.toUpperCase() || "INR";
  return (
    <>
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] p-4 sm:p-5 md:p-6 rounded-t-xl relative">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-tripswift-bold text-tripswift-off-white leading-tight mb-1">
              {booking.hotelName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-tripswift-off-white hover:text-tripswift-off-white bg-tripswift-off-white/10 hover:bg-tripswift-off-white/20 rounded-full p-1.5 sm:p-2 transition-colors"
            aria-label={t("BookingTabs.BookingDetailsModal.closeModal")}
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
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
        {/* Status Badge */}
        <div className="absolute bottom-0 right-4 sm:right-6 transform translate-y-1/2">
          <div
            className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md text-xs sm:text-sm ${
              booking.status === "Confirmed"
                ? "bg-green-50 text-green-700 border border-green-200"
                : booking.status === "Pending"
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <span
              className={`${
                i18n.language === "ar" ? "ml-1 sm:ml-1.5" : "mr-1 sm:mr-1.5"
              }`}
            >
              {getStatusIcon(booking.status ?? "", i18n.language)}
            </span>
            <span className="font-tripswift-bold">{booking.status}</span>
          </div>
        </div>
      </div>

      {/* Modal Content */}
      <div className="p-4 sm:p-5 md:p-6 pt-8 sm:pt-10 font-noto-sans">
        {/* Stay Details */}
        <div className="mb-2 md:mb-3">
          <h3 className="text-lg sm:text-xl font-tripswift-bold text-gray-800  flex items-center">
            <FaRegCalendarAlt
              className={` text-tripswift-blue text-base sm:text-lg ${
                i18n.language === "ar" ? "ml-1.5 sm:ml-2" : "mr-1.5 sm:mr-2"
              }`}
            />
            {t("BookingTabs.BookingDetailsModal.stayDetails")}
          </h3>

          <div className="bg-tripswift-off-white p-3 sm:p-4 md:p-5 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
              <div>
                <p className="text-xs sm:text-sm text-tripswift-black/60 mb-0.5 sm:mb-1">
                  {t("BookingTabs.BookingDetailsModal.checkIn")}
                </p>
                <p className="flex items-center text-tripswift-black font-tripswift-bold text-sm sm:text-base">
                  <FaCalendarCheck
                    className={` text-green-500 text-sm sm:text-base ${
                      i18n.language === "ar"
                        ? "ml-1.5 sm:ml-2"
                        : "mr-1.5 sm:mr-2"
                    }`}
                  />
                  {formatDateString(booking.checkInDate)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  {t("BookingTabs.BookingDetailsModal.checkOut")}
                </p>
                <p className="flex  items-center text-gray-800 font-tripswift-bold text-sm sm:text-base">
                  <FaCalendarTimes
                    className={` text-red-500 text-sm sm:text-base ${
                      i18n.language === "ar"
                        ? "ml-1.5 sm:ml-2"
                        : "mr-1.5 sm:mr-2"
                    }`}
                  />
                  {formatDateString(booking.checkOutDate)}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-2 md:mt-4 pt-2 sm:pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                    {t("BookingTabs.BookingDetailsModal.roomType")}
                  </p>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-tripswift-medium ${getRoomTypeStyle(
                        roomType
                      )}`}
                    >
                      <span className="mr-1 sm:mr-1.5">
                        {getRoomTypeIcon(roomType, i18n.language)}
                      </span>
                      {roomType}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                    {" "}
                    {t("BookingTabs.BookingDetailsModal.rooms", {
                      defaultValue: "Rooms",
                    })}
                  </p>
                  <p className="text-gray-800 font-tripswift-medium text-sm sm:text-base">
                    {booking.numberOfRooms}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  (all guests) */}
        <div className="border-t border-gray-200 mb-2 md:mb-3">
          <h3 className="text-lg sm:text-xl mt-2 font-tripswift-bold text-gray-800 flex items-center">
            <FaUser
              className={`text-tripswift-blue text-base sm:text-lg ${
                i18n.language === "ar" ? "ml-1.5 sm:ml-2" : "mr-1.5 sm:mr-2"
              }`}
            />
            {t("BookingTabs.BookingDetailsModal.guestDetails")}
          </h3>
          <div className="bg-tripswift-off-white p-3 sm:p-4 md:p-5 rounded-xl">
            <div className="space-y-4">
              {booking.guestDetails && booking.guestDetails.length > 0 ? (
                booking.guestDetails.map((guest: GuestDetails, idx: number) => (
                  <div
                    key={guest._id || idx}
                    className="flex flex-col md:flex-row md:items-center md:gap-24 gap-2 border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="flex md:w-1/3  sm:items-center gap-2 font-tripswift-medium">
                      <FaUser className="text-tripswift-blue" />
                      <span className="w-full">
                        {guest.firstName} {guest.lastName}
                      </span>
                    </div>
                    {guest.dob && (
                      <div className="text-xs md:ml-[32px] text-gray-500 ">
                        {t("BookingTabs.BookingDetailsModal.dob", {
                          defaultValue: "DOB",
                        })}
                        : {formatDOB(guest.dob)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-800 font-tripswift-medium text-sm sm:text-base">
                  {booking.email}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  {t("BookingTabs.BookingDetailsModal.contactNumber")}
                </p>
                <p
                  className={`text-gray-800 font-tripswift-medium text-sm sm:text-base ${
                    i18n.language === "ar" ? "text-right" : "text-left"
                  }`}
                  dir="ltr"
                >
                  {booking.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border-t border-gray-200 mb-2 md:mb-3">
          <h3 className="text-lg sm:text-xl mt-2 font-tripswift-bold text-gray-800 mb-1 md:mb-2 flex items-center">
            <FaCreditCard
              className={` text-tripswift-blue text-base sm:text-lg ${
                i18n.language === "ar" ? "ml-1.5 sm:ml-2" : "mr-1.5 sm:mr-2"
              }`}
            />
            {t("BookingTabs.BookingDetailsModal.paymentDetails")}
          </h3>
          <div className="bg-tripswift-off-white p-3 sm:p-4 md:p-5 rounded-xl">
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">{t('BookingTabs.BookingDetailsModal.paymentMethod')}</p>
                <p className="flex items-center font-tripswift-medium text-sm sm:text-base">
                  {getPaymentMethodIcon(booking)} {formatCamelCase(booking.paymentType || "")}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">{t('BookingTabs.BookingDetailsModal.bookingDate')}</p>
                <p className="flex items-center text-gray-800 font-tripswift-medium text-sm sm:text-base">
                  <FaRegCalendarCheck className="mr-1.5 sm:mr-2 text-gray-500 text-sm sm:text-base" />
                  {booking.createdAt ? formatDateString(booking.createdAt) : "-"}
                </p>
              </div>
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  {t("BookingTabs.BookingDetailsModal.paymentMethod")}
                </p>
                <p className="text-gray-800 font-tripswift-medium text-sm sm:text-base">
                  Pay at Hotel
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  {t("BookingTabs.BookingDetailsModal.bookingDate")}
                </p>
                <p className="flex items-center text-gray-800 font-tripswift-medium text-sm sm:text-base">
                  <FaRegCalendarCheck
                    className={` text-gray-500 text-sm sm:text-base ${
                      i18n.language === "ar"
                        ? "ml-1.5 sm:ml-2"
                        : "mr-1.5 sm:mr-2"
                    }`}
                  />
                  {booking.createdAt
                    ? formatDateString(booking.createdAt)
                    : "-"}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-3 md:mt-4 pt-4 sm:pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex flex-col space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
                  {t("BookingTabs.BookingDetailsModal.totalAmount")}
                </p>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-xl sm:text-2xl font-tripswift-bold text-tripswift-blue">
                    {currency} {booking.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
              {/* {booking.ratePlanCode && (
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-500">{t('BookingTabs.BookingDetailsModal.ratePlan')}</p>
                  <div className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-md text-xs sm:text-sm font-tripswift-medium">
                    {booking.ratePlanCode}
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 border-t border-gray-200 pt-2 md:pt-4">
          {booking.status === "Confirmed" && (
            <>
              <button
                className="flex-1 bg-tripswift-blue text-tripswift-off-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-[#054B8F] transition-colors duration-300 shadow-sm hover:shadow-md font-tripswift-medium flex items-center justify-center text-sm sm:text-base"
                onClick={onAmend}
              >
                <FaEdit
                  className={` text-sm sm:text-base ${
                    i18n.language === "ar" ? "ml-1.5 sm:ml-2" : "mr-1.5 sm:mr-2"
                  }`}
                />
                {t("BookingTabs.BookingDetailsModal.modifyBooking")}
              </button>
              <button
                className="flex-1 bg-tripswift-off-white text-red-600 border border-red-200 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-red-50 transition-colors duration-300 font-tripswift-medium flex items-center justify-center text-sm sm:text-base"
                onClick={onCancel}
              >
                <FaRegTimesCircle
                  className={` text-sm sm:text-base ${
                    i18n.language === "ar" ? "ml-1.5 sm:ml-2" : "mr-1.5 sm:mr-2"
                  }`}
                />
                {t("BookingTabs.BookingDetailsModal.cancelBooking")}
              </button>
            </>
          )}
          <button
            className="flex-1 bg-gray-700 text-tripswift-off-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center font-tripswift-medium text-sm sm:text-base"
            onClick={() => window.print()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={` h-4 w-4 sm:h-5 sm:w-5 ${
                i18n.language === "ar" ? "ml-1.5 sm:ml-2" : "mr-1.5 sm:mr-2"
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
