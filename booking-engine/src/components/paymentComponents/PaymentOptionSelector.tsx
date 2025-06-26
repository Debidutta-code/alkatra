// components/paymentComponents/PaymentOptionSelector.tsx
"use client";

import { QrCode, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


interface PaymentOptionSelectorProps {
  selectedOption: string | null;
  onChange: (option: string) => void;
}

const PaymentOptionSelector: React.FC<PaymentOptionSelectorProps> = ({
  selectedOption,
  onChange
}) => {
  const { t, i18n } = useTranslation();
  const [cryptoSubOption, setCryptoSubOption] = useState<string | null>(null);

  // Set default selection to 'payAtHotel' when component mounts
  useEffect(() => {
    if (!selectedOption) {
      onChange("payAtHotel");
      setCryptoSubOption(null);
    } else if (selectedOption.startsWith("payWithCrypto-")) {
      setCryptoSubOption(selectedOption.split("-")[1]); // Sync sub-option if provided
    } else if (selectedOption === "payWithCrypto") {
      setCryptoSubOption(null); // No default sub-option for crypto
    }
  }, [selectedOption, onChange]);

  const handleCryptoSubOptionChange = (subOption: string) => {
    setCryptoSubOption(subOption);
    onChange(`payWithCrypto-${subOption}`);
  };

  return (
    <div className="payment-options">
      <h3 className="text-lg font-tripswift-medium mb-3 text-tripswift-black">
        {t('Payment.PaymentComponents.PaymentOptionSelector.title')}
      </h3>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
          selectedOption === 'payNow' 
            ? 'border-tripswift-blue bg-tripswift-blue/10 text-tripswift-black' 
            : 'border-gray-200 hover:bg-gray-50 text-tripswift-black/70'
        }`}>
          <input
            type="radio"
            name="paymentOption"
            value="payNow"
            checked={selectedOption === 'payNow'}
            onChange={() => onChange('payNow')}
            className="mr-3 text-tripswift-blue"
          />
          <div className="flex flex-col">
            <span className="font-tripswift-medium text-tripswift-black">
              {t('Payment.PaymentComponents.PaymentOptionSelector.payNow')}
            </span>
            <span className="text-sm text-tripswift-black/70">
              {t('Payment.PaymentComponents.PaymentOptionSelector.payNowDescription')}
            </span>
          </div>
        </label> */}

        <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${selectedOption === 'payAtHotel' || !selectedOption
          ? 'border-tripswift-blue bg-tripswift-blue/10 text-tripswift-black'
          : 'border-gray-200 hover:bg-gray-50 text-tripswift-black/70'
          }`}>
          <input
            type="radio"
            name="paymentOption"
            value="payAtHotel"
            // checked={selectedOption === 'payAtHotel' || !selectedOption}
            onChange={() => {
              onChange("payAtHotel");
              setCryptoSubOption(null); // Reset crypto sub-option
            }}
            className={`mr-3 mt-1 text-tripswift-blue flex-shrink-0  ${i18n.language === "ar" ? "ml-3" : "mr-3"}`}
            defaultChecked
          />
          <div className="flex flex-col">
            <span className="text-sm font-tripswift-semibold text-tripswift-black uppercase">{t('Payment.PaymentComponents.PaymentOptionSelector.payAtHotel')}
            </span>
            <span className="text-[10px] font-tripswift-medium text-tripswift-black/70 uppercase">{t('Payment.PaymentComponents.PaymentOptionSelector.payAtHotelDescription')}
            </span>
          </div>
        </label>
        {/* New: Pay with Crypto Option */}
        <label
          className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${selectedOption?.startsWith("payWithCrypto") || selectedOption === "payWithCrypto"
            ? "border-tripswift-blue bg-tripswift-blue/10 text-tripswift-black"
            : "border-gray-200 hover:bg-gray-50 text-tripswift-black/70"
            }`}
        >
          <input
            type="radio"
            name="paymentOption"
            value="payWithCrypto"
            checked={selectedOption?.startsWith("payWithCrypto") || selectedOption === "payWithCrypto"}
            onChange={() => {
              onChange("payWithCrypto");
              setCryptoSubOption(null); // Reset sub-option
            }}
            className="mt-1 text-tripswift-blue flex-shrink-0 mr-3"
          />
          <div className="flex flex-col">
            <span className="text-sm font-tripswift-semibold text-tripswift-black uppercase">
              Pay with Crypto
            </span>
            <span className="text-[10px] font-tripswift-medium text-tripswift-black/70 uppercase">
              Use cryptocurrency to complete your payment
            </span>
          </div>
        </label>
      </div>
      {selectedOption === "payWithCrypto" && (
        <div className="mt-4 p-3 bg-tripswift-off-white rounded-lg shadow-sm">
          <h4 className="text-sm font-tripswift-medium mb-2 text-tripswift-black/80 uppercase tracking-wider">
            {t("Payment.PaymentComponents.PaymentOptionSelector.chooseCryptoMethod")}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCryptoSubOptionChange("payWithWallet")}
              className={`p-2.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${cryptoSubOption === "payWithWallet"
                  ? "border-tripswift-blue bg-tripswift-blue/10"
                  : "border-gray-200 hover:bg-gray-50"
                }`}
            >
              <Wallet className="w-4 h-4 text-tripswift-black" />
              <span className="text-xs font-tripswift-medium text-tripswift-black">
                {t("Payment.PaymentComponents.PaymentOptionSelector.payWithWallet")}
              </span>
            </button>

            <button
              onClick={() => handleCryptoSubOptionChange("payWithQR")}
              className={`p-2.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${cryptoSubOption === "payWithQR"
                  ? "border-tripswift-blue bg-tripswift-blue/10"
                  : "border-gray-200 hover:bg-gray-50"
                }`}
            >
              <QrCode className="w-4 h-4 text-tripswift-black" />
              <span className="text-xs font-tripswift-medium text-tripswift-black">
                {t("Payment.PaymentComponents.PaymentOptionSelector.payWithQR")}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentOptionSelector;