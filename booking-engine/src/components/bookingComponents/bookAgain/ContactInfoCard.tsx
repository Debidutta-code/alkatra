// src/components/bookingComponents/bookAgain/ContactInfoCard.tsx
"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ContactInfoCardProps {
  email: string;
  phone: string;
}

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ email, phone }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
          <Mail className="h-4 w-4 text-white" />
        </div>
        <h4 className="text-lg font-bold text-gray-900">
          {t("Contact Information")}
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {t("Email Address")}
          </Label>
          <div className="px-4 py-3 bg-white border-2 border-amber-200 rounded-xl text-gray-800 font-medium">
            {email || t("Not provided")}
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {t("Phone Number")}
          </Label>
          <div className="px-4 py-3 bg-white border-2 border-amber-200 rounded-xl text-gray-800 font-medium">
            +{phone || t("Not provided")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoCard;