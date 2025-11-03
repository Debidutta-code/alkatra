// src/components/bookingComponents/bookAgain/GuestManagementCard.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import GuestForm from "./GuestForm";
import { Guest } from "./RebookModal";
import { Dayjs } from "dayjs";

interface GuestManagementCardProps {
  guests: Guest[];
  onAddGuest: () => void;
  onUpdateGuest: (id: string, field: keyof Guest, value: any) => void;
  onRemoveGuest: (id: string) => void;
  errors: { [key: string]: string };
  disabledDateForDOB: (current: Dayjs, type: 'adult' | 'child' | 'infant') => boolean;
}

const GuestManagementCard: React.FC<GuestManagementCardProps> = ({
  guests,
  onAddGuest,
  onUpdateGuest,
  onRemoveGuest,
  errors,
  disabledDateForDOB
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-purple-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">
              {t("guestManagementCard.title")}
            </h4>
          </div>
          <Button
            onClick={onAddGuest}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            {t("guestManagementCard.addGuest")}
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {guests.map((guest, index) => (
          <GuestForm
            key={guest.id}
            guest={guest}
            index={index}
            totalGuests={guests.length}
            onUpdate={onUpdateGuest}
            onRemove={onRemoveGuest}
            errors={errors}
            disabledDateForDOB={disabledDateForDOB}
          />
        ))}
      </div>
    </div>
  );
};

export default GuestManagementCard;