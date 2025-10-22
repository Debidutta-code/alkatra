"use client";
import React from "react";
import { DatePicker } from "antd";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock, Users, AlertCircle, Minus, Plus } from "lucide-react";
import { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

interface DateSelectionCardProps {
  checkInDate: Dayjs | null;
  checkOutDate: Dayjs | null;
  rooms: number;
  guestsCount: number;
  onCheckInChange: (date: Dayjs | null) => void;
  onCheckOutChange: (date: Dayjs | null) => void;
  onRoomsChange: (rooms: number) => void;
  disabledDate: (current: Dayjs) => boolean;
  disabledCheckOutDate: (current: Dayjs) => boolean;
  errors?: { [key: string]: string };
}

const DateSelectionCard: React.FC<DateSelectionCardProps> = ({
  checkInDate,
  checkOutDate,
  rooms,
  guestsCount,
  onCheckInChange,
  onCheckOutChange, // Fixed: was onCheckOutDate
  onRoomsChange,
  disabledDate,
  disabledCheckOutDate,
  errors = {}
}) => {
  const { t } = useTranslation();

  const handleRoomsIncrement = () => {
    if (rooms < 4) {
      onRoomsChange(rooms + 1);
    }
  };

  const handleRoomsDecrement = () => {
    if (rooms > 1) {
      onRoomsChange(rooms - 1);
    }
  };

  const validateGuestToRoomRatio = () => {
    const maxGuestsPerRoom = 4;
    const maxAllowedGuests = rooms * maxGuestsPerRoom;
    return guestsCount <= maxAllowedGuests;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 mb-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-tripswift-blue rounded-lg flex items-center justify-center">
          <CalendarIcon className="h-4 w-4 text-white" />
        </div>
        <h4 className="text-lg font-bold text-gray-900">
          {t("When do you want to stay?")}
        </h4>
      </div>

      {/* Show general date error if exists */}
      {errors["dates"] && (
        <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">{errors["dates"]}</span>
        </div>
      )}

      {/* Show guest-to-room ratio error */}
      {!validateGuestToRoomRatio() && (
        <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            {t("Maximum 4 guests allowed per room. You have")} {guestsCount} {t("guests for")} {rooms} {rooms === 1 ? t("room") : t("rooms")}.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {t("Check-in Date")}
          </Label>
          <div className="relative group">
            <div className={`flex items-center bg-white rounded-xl border-2 transition-colors shadow-sm ${errors["checkInDate"]
                ? "border-red-300 group-hover:border-red-400"
                : "border-gray-200 group-hover:border-tripswift-blue"
              }`}>
              <CalendarIcon className="h-5 w-5 text-tripswift-blue absolute left-4 z-[1]" />
              <DatePicker
                value={checkInDate}
                onChange={onCheckInChange}
                disabledDate={disabledDate}
                format="DD MMM YYYY"
                className="w-full pl-12 bg-transparent border-none focus:ring-0"
                placeholder={t("Check-in")}
                suffixIcon={null}
                size="large"
              />
            </div>
            {errors["checkInDate"] && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{errors["checkInDate"]}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {t("Check-out Date")}
          </Label>
          <div className="relative group">
            <div className={`flex items-center bg-white rounded-xl border-2 transition-colors shadow-sm ${errors["checkOutDate"]
                ? "border-red-300 group-hover:border-red-400"
                : "border-gray-200 group-hover:border-tripswift-blue"
              }`}>
              <CalendarIcon className="h-5 w-5 text-tripswift-blue absolute left-4 z-[1]" />
              <DatePicker
                value={checkOutDate}
                onChange={onCheckOutChange}
                disabledDate={disabledCheckOutDate}
                format="DD MMM YYYY"
                className="w-full pl-12 bg-transparent border-none focus:ring-0"
                placeholder={t("Check-out")}
                suffixIcon={null}
                size="large"
              />
            </div>
            {errors["checkOutDate"] && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{errors["checkOutDate"]}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {t("Number of Rooms")}
          </Label>
          <div className="relative group">
            <div className={`flex items-center bg-white rounded-xl border-2 transition-colors shadow-sm ${errors["rooms"]
                ? "border-red-300 group-hover:border-red-400"
                : "border-gray-200 group-hover:border-tripswift-blue"
              }`}>
              <div className="flex items-center justify-between w-full px-4 py-1">
                <span className="text-sm font-medium text-gray-600">{t("Rooms")}</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10 hover:border-tripswift-blue hover:text-tripswift-blue disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                    onClick={handleRoomsDecrement}
                    disabled={rooms <= 1}
                    aria-label={t("Decrease rooms")}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-gray-700 font-semibold text-lg">
                    {rooms}
                  </span>
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10 hover:border-tripswift-blue hover:text-tripswift-blue disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                    onClick={handleRoomsIncrement}
                    disabled={rooms >= 4}
                    aria-label={t("Increase rooms")}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            {errors["rooms"] && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{errors["rooms"]}</span>
              </div>
            )}
            <div className="mt-1 text-xs text-gray-500">
              {t("Min: 1 room, Max: 4 rooms")}
            </div>
          </div>
        </div>
      </div>

      {checkInDate && checkOutDate && (
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <Clock className="h-4 w-4 text-tripswift-blue" />
            <span className="font-semibold text-gray-700">
              {checkInDate && checkOutDate ? Math.max(0, checkOutDate.startOf('day').diff(checkInDate.startOf('day'), 'day')) : 0} {t("nights")}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <Users className="h-4 w-4 text-tripswift-blue" />
            <span className="font-semibold text-gray-700">
              {guestsCount} {t("guests")}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="font-semibold text-gray-700">
              {rooms} {rooms === 1 ? t("room") : t("rooms")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateSelectionCard;