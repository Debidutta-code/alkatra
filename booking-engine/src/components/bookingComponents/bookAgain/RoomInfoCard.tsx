// src/components/bookingComponents/bookAgain/RoomInfoCard.tsx
"use client";
import React from "react";
import { BedDouble, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RoomInfoCardProps {
  roomTypeCode: string;
}

const RoomInfoCard: React.FC<RoomInfoCardProps> = ({ roomTypeCode }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <BedDouble className="h-4 w-4 text-white" />
        </div>
        <h5 className="text-lg font-bold text-gray-900">{t("roomInfoCard.title")}</h5>
      </div>
      <div className="bg-white rounded-xl p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {t("roomInfoCard.roomType")}: {roomTypeCode}
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {t("roomInfoCard.sameRoomType")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomInfoCard;