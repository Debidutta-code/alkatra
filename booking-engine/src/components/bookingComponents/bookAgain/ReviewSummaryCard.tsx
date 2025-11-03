// src/components/bookingComponents/bookAgain/ReviewSummaryCard.tsx
"use client";
import React from "react";
import {
  Calendar,
  BedDouble,
  Clock,
  Users,
  Mail
} from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { Guest } from "./types";

interface ReviewSummaryCardProps {
  hotelName: string;
  roomTypeCode: string;
  checkInDate: Dayjs | null;
  checkOutDate: Dayjs | null;
  guests: Guest[];
  rooms: number;
  contactEmail: string;
  contactPhone?: string;
}

const ReviewSummaryCard: React.FC<ReviewSummaryCardProps> = ({
  hotelName,
  roomTypeCode,
  checkInDate,
  checkOutDate,
  guests,
  rooms,
  contactEmail,
  contactPhone
}) => {
  const { t } = useTranslation();

  const nights = checkInDate && checkOutDate ? checkOutDate.diff(checkInDate, 'day') : 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-tripswift-blue to-blue-600 p-4 text-white">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t("reviewSummaryCard.title")}
        </h3>
      </div>
      <div className="p-6 space-y-4">
        {/* Hotel & Room Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {t("reviewSummaryCard.hotel")}
              </div>
              <div className="font-bold text-lg text-gray-900">{hotelName}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                {t("reviewSummaryCard.roomType")}
              </div>
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-tripswift-blue" />
                {roomTypeCode}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {t("reviewSummaryCard.checkIn")}
                </div>
                <div className="font-semibold text-gray-800">
                  {checkInDate?.format("DD MMM YYYY")}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {t("reviewSummaryCard.checkOut")}
                </div>
                <div className="font-semibold text-gray-800">
                  {checkOutDate?.format("DD MMM YYYY")}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {t("reviewSummaryCard.nights")}
                </div>
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-tripswift-blue" />
                  {nights}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {t("reviewSummaryCard.guests")}
                </div>
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  <Users className="h-4 w-4 text-tripswift-blue" />
                  {guests.length}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  {t("reviewSummaryCard.rooms")}
                </div>
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  <BedDouble className="h-4 w-4 text-tripswift-blue" />
                  {rooms}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-200 pt-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            {t("reviewSummaryCard.contactInformation")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <Mail className="h-4 w-4 text-tripswift-blue" />
              <span className="font-medium text-gray-800">{contactEmail}</span>
            </div>
            {contactPhone && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <span className="font-medium text-gray-800">+{contactPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Guest List */}
        <div className="border-t border-gray-200 pt-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            {t("reviewSummaryCard.guestDetails")}
          </div>
          <div className="space-y-2">
            {guests.map((guest, index) => (
              <div key={guest.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-6 h-6 bg-tripswift-blue rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-800">
                  {guest.firstName} {guest.lastName}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  guest.type === 'adult' 
                    ? 'bg-blue-100 text-blue-700' 
                    : guest.type === 'child' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-purple-100 text-purple-700'
                }`}>
                  {t(`reviewSummaryCard.guestTypes.${guest.type}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSummaryCard;