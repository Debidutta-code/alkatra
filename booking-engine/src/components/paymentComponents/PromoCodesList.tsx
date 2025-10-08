// components/paymentComponents/PromoCodesList.tsx
"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Tag, Check } from "lucide-react";

export interface PromoCode {
  _id: string;
  code: string;
  codeName: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

interface PromoCodesListProps {
  promoCodes: PromoCode[];
  onSelectPromo: (code: string, codeName: string) => void;
  isLoading: boolean;
  currency: string;
}

export default function PromoCodesList({
  promoCodes,
  onSelectPromo,
  isLoading,
  currency
}: PromoCodesListProps) {
  const { t } = useTranslation();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyAndApply = (code: string, codeName: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    onSelectPromo(code, codeName);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-tripswift-blue" />
      </div>
    );
  }

  if (!promoCodes || promoCodes.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-tripswift-black/60">
        {t('Payment.promoCode.noAvailable')}
      </div>
    );
  }

  return (
    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
      {promoCodes.map((promo) => {
        const isValidNow = new Date() >= new Date(promo.validFrom) && new Date() <= new Date(promo.validTo);

        return (
          <div
            key={promo._id}
            className={`bg-white border rounded-lg p-3 transition-all cursor-pointer ${isValidNow
              ? 'border-gray-200 hover:border-tripswift-blue hover:shadow-sm'
              : 'border-gray-100 opacity-60'
              }`}
            onClick={() => isValidNow && handleCopyAndApply(promo.code, promo.codeName)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Code and Badge */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Tag className="w-3.5 h-3.5 text-tripswift-blue flex-shrink-0" />
                    <span className="font-tripswift-bold text-sm text-tripswift-black truncate">
                      {promo.codeName}
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-tripswift-bold bg-green-100 text-green-700 flex-shrink-0">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% OFF`
                      : `${currency.toUpperCase()} ${promo.discountValue}`
                    }
                  </span>
                </div>

                {/* Description */}
                {promo.description && (
                  <p className="text-xs text-tripswift-black/60 line-clamp-1">
                    {promo.description}
                  </p>
                )}
              </div>

              {/* Apply Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isValidNow && handleCopyAndApply(promo.code, promo.codeName);
                }}
                disabled={!isValidNow}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-tripswift-medium rounded-md transition-all flex-shrink-0 ${copiedCode === promo.code
                  ? 'bg-green-100 text-green-700'
                  : isValidNow
                    ? 'bg-tripswift-blue text-white hover:bg-[#054B8F]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {copiedCode === promo.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {t('Payment.promoCode.applied')}
                  </>
                ) : (
                  t('Payment.promoCode.apply')
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}