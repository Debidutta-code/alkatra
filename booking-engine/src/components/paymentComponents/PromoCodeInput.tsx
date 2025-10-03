// components/paymentComponents/PromoCodeInput.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import PromoCodesList, { PromoCode } from "./PromoCodesList";


interface PromoCodeInputProps {
  onApply: (code: string) => Promise<{
    success: boolean;
    discount?: number;
    finalAmount?: number;
    message?: string;
    error?: string;
  }>;
  disabled?: boolean;
  availablePromos?: PromoCode[];
  isLoadingPromos?: boolean;
  currency?: string;
  appliedPromoCode?: string;
  amount: number;
}

export default function PromoCodeInput({
  onApply,
  disabled = false,
  availablePromos = [],
  isLoadingPromos = false,
  currency = "usd",
  appliedPromoCode,
  amount
}: PromoCodeInputProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showAvailablePromos, setShowAvailablePromos] = useState(false);

  useEffect(() => {
    if (!appliedPromoCode) {
      setResult(null);
      setCode("");
    }
  }, [appliedPromoCode]);

  const handleApply = async (promoCode?: string) => {
    const codeToApply = promoCode || code.trim().toUpperCase();
    if (!codeToApply || isApplying) return;

    setIsApplying(true);
    setResult(null);

    try {
      const res = await onApply(codeToApply);

      if (res.success) {
        let discountToShow: number;

        if (res.discount !== undefined) {
          discountToShow = res.discount;
        } else if (res.finalAmount !== undefined) {
          discountToShow = amount - res.finalAmount;
        } else {
          discountToShow = 0;
        }

        const appliedPromo = availablePromos.find(p => p.code === codeToApply);
        const displayName = appliedPromo?.codeName || codeToApply;

        setResult({
          type: "success",
          message: discountToShow > 0
            ? t("Payment.promoCode.success", {
              discount: `${currency.toUpperCase()} ${discountToShow.toFixed(2)}`
            }) + ` (${displayName})`
            : res.message || t("Payment.promoCode.validNoDiscount")
        });
        setCode(codeToApply);
      } else {
        setResult({
          type: "error",
          message: res.error || t("Payment.promoCode.invalid")
        });
      }
    } catch (err: any) {
      setResult({
        type: "error",
        message: t("Payment.promoCode.genericError")
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-tripswift-medium text-tripswift-black">
          {t("Payment.promoCode.label")}
        </label>
        {availablePromos.length > 0 && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-tripswift-bold">
            {availablePromos.length} {availablePromos.length === 1 ? 'offer' : 'offers'}
          </span>
        )}
      </div>

      {/* Input with Apply Button */}
      <div className="relative">
        <input
          id="promo-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("Payment.promoCode.placeholder")}
          disabled={disabled || isApplying}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && code.trim() && !disabled && !isApplying) {
              handleApply();
            }
          }}
          className={`w-full px-4 py-2.5 pr-20 border rounded-lg text-sm transition-all ${disabled
            ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
            : "border-gray-300 focus:border-tripswift-blue focus:ring-2 focus:ring-tripswift-blue/20"
            } outline-none`}
        />
        <button
          type="button"
          onClick={() => handleApply()}
          disabled={!code.trim() || disabled || isApplying}
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-md text-sm font-tripswift-medium transition-all ${!code.trim() || disabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-tripswift-blue text-white hover:bg-[#054B8F] active:scale-95"
            }`}
        >
          {isApplying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t("Payment.promoCode.apply")
          )}
        </button>
      </div>

      {/* Success/Error Messages */}
      {result?.type === "success" && (
        <div className="flex items-start gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{result.message}</span>
        </div>
      )}
      {result?.type === "error" && (
        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          <span className="font-tripswift-medium">⚠</span>
          <span>{result.message}</span>
        </div>
      )}

      {/* Available Promo Codes */}
      {availablePromos && availablePromos.length > 0 && !disabled && (
        <div className="pt-2">
          <button
            onClick={() => setShowAvailablePromos(!showAvailablePromos)}
            className="flex items-center gap-2 text-sm font-tripswift-medium text-tripswift-blue hover:text-[#054B8F] transition-colors"
          >
            <span>
              {t("Payment.promoCode.viewAvailable")}
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-tripswift-bold bg-green-100 text-green-700">
                {availablePromos.length}
              </span>
            </span>
            {showAvailablePromos ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAvailablePromos && (
            <div className="mt-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <PromoCodesList
                promoCodes={availablePromos}
                onSelectPromo={(selectedCode, selectedCodeName) => {
                  setCode(selectedCodeName); // Display the friendly name
                  handleApply(selectedCode);  // But send the actual code to backend
                  setShowAvailablePromos(false);
                }}
                isLoading={isLoadingPromos}
                currency={currency}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}