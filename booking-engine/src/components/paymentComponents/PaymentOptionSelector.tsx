// components/paymentComponents/PaymentOptionSelector.tsx
"use client";

import React, { useEffect } from 'react';
import { useTranslation } from "react-i18next";


interface PaymentOptionSelectorProps {
  selectedOption: string | null;
  onChange: (option: string) => void;
}

const PaymentOptionSelector: React.FC<PaymentOptionSelectorProps> = ({
  selectedOption,
  onChange
}) => {
  const { t } = useTranslation();

  // Set default selection to 'payAtHotel' when component mounts
  useEffect(() => {
    if (!selectedOption) {
      onChange('payAtHotel');
    }
  }, [selectedOption, onChange]);
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
            onChange={() => onChange('payAtHotel')}
            className="mr-3 mt-1 text-tripswift-blue flex-shrink-0"
            defaultChecked
          />
          <div className="flex flex-col">
            <span className="text-sm font-tripswift-semibold text-tripswift-black uppercase">{t('Payment.PaymentComponents.PaymentOptionSelector.payAtHotel')}
            </span>
            <span className="text-[10px] font-tripswift-medium text-tripswift-black/70 uppercase">{t('Payment.PaymentComponents.PaymentOptionSelector.payAtHotelDescription')}
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentOptionSelector;