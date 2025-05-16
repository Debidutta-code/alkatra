// components/paymentComponents/PaymentOptionSelector.tsx
"use client";

import React from 'react';

interface PaymentOptionSelectorProps {
  selectedOption: string;
  onChange: (option: string) => void;
}

const PaymentOptionSelector: React.FC<PaymentOptionSelectorProps> = ({ 
  selectedOption, 
  onChange 
}) => {
  return (
    <div className="payment-options">
      <h3 className="text-lg font-semibold mb-3 text-white">Payment Options</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
          selectedOption === 'payNow' 
            ? 'border-blue-400 bg-blue-500/30 text-white' 
            : 'border-white/30 hover:bg-white/5 text-white/80'
        }`}>
          <input
            type="radio"
            name="paymentOption"
            value="payNow"
            checked={selectedOption === 'payNow'}
            onChange={() => onChange('payNow')}
            className="mr-3"
          />
          <div className="flex flex-col">
            <span className="font-medium">Pay Now</span>
            <span className="text-sm opacity-80">Complete payment immediately</span>
          </div>
        </label>

        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
          selectedOption === 'payAtHotel' 
            ? 'border-blue-400 bg-blue-500/30 text-white' 
            : 'border-white/30 hover:bg-white/5 text-white/80'
        }`}>
          <input
            type="radio"
            name="paymentOption"
            value="payAtHotel"
            checked={selectedOption === 'payAtHotel'}
            onChange={() => onChange('payAtHotel')}
            className="mr-3"
          />
          <div className="flex flex-col">
            <span className="font-medium">Pay at Hotel</span>
            <span className="text-sm opacity-80">Securely save card for hotel payment</span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentOptionSelector;