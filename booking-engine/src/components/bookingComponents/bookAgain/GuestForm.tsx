"use client";
import React from "react";
import { Input } from "antd";
import { DatePicker } from "antd";
import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { Guest } from "./types";

interface GuestFormProps {
  guest: Guest;
  index: number;
  totalGuests: number;
  onUpdate: (id: string, field: keyof Guest, value: any) => void;
  onRemove: (id: string) => void;
  errors: { [key: string]: string };
  disabledDateForDOB: (current: Dayjs, guestType: 'adult' | 'child' | 'infant') => boolean;
}

const GuestForm: React.FC<GuestFormProps> = ({
  guest,
  index,
  totalGuests,
  onUpdate,
  onRemove,
  errors,
  disabledDateForDOB
}) => {
  const { t } = useTranslation();

  return (
    <div key={guest.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 relative group hover:shadow-md transition-all duration-200">
      {totalGuests > 1 && (
        <button
          onClick={() => onRemove(guest.id)}
          className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {index + 1}
        </div>
        <span className="font-semibold text-gray-900">
          {t("Guest")} {index + 1}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
            {t("First Name")}
          </Label>
          <Input
            value={guest.firstName}
            onChange={(e) => onUpdate(guest.id, 'firstName', e.target.value)}
            placeholder={t("First name")}
            className={`h-11 border-2 ${errors[`${guest.id}-firstName`] ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-purple-500 transition-colors`}
            size="middle"
          />
          {errors[`${guest.id}-firstName`] && (
            <p className="text-red-500 text-xs mt-1">{errors[`${guest.id}-firstName`]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
            {t("Last Name")}
          </Label>
          <Input
            value={guest.lastName}
            onChange={(e) => onUpdate(guest.id, 'lastName', e.target.value)}
            placeholder={t("Last name")}
            className={`h-11 border-2 ${errors[`${guest.id}-lastName`] ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-purple-500 transition-colors`}
            size="middle"
          />
          {errors[`${guest.id}-lastName`] && (
            <p className="text-red-500 text-xs mt-1">{errors[`${guest.id}-lastName`]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
            {t("Guest Type")}
          </Label>
          <select
            value={guest.type}
            onChange={(e) => onUpdate(guest.id, 'type', e.target.value as 'adult' | 'child' | 'infant')}
            className={`w-full h-11 px-4 border-2 ${errors[`${guest.id}-type`] ? 'border-red-500' : 'border-gray-200'
              } rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-300 transition-colors appearance-none cursor-pointer`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25rem 1.25rem'
            }}
          >
            <option value="adult">{t("Adult")}</option>
            <option value="child">{t("Child")}</option>
            <option value="infant">{t("Infant")}</option>
          </select>
          {errors[`${guest.id}-type`] && (
            <p className="text-red-500 text-xs mt-1">{errors[`${guest.id}-type`]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
            {t("Date of Birth")}
          </Label>
          <div className="relative group">
            <div className="flex items-center bg-white rounded-xl border-2 border-gray-200 group-hover:border-purple-500 transition-colors">
              <DatePicker
                value={guest.dob ? dayjs(guest.dob) : null}
                onChange={(date) => onUpdate(guest.id, 'dob', date ? date.format("YYYY-MM-DD") : null)}
                disabledDate={(current) => disabledDateForDOB(current, guest.type)}
                format="DD/MM/YYYY"
                className="w-full pl-3 bg-transparent border-none focus:ring-0"
                placeholder={t("Select DOB")}
                suffixIcon={null}
                size="large"
              />
            </div>
          </div>
          {errors[`${guest.id}-dob`] && (
            <p className="text-red-500 text-xs mt-1">{errors[`${guest.id}-dob`]}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestForm;