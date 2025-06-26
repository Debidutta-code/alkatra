"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface BookingDetails {
  roomId: string;
  propertyId: string;
  amount: string;
  currency: string;
  checkIn: string;
  checkOut: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userId: string;
  hotelName: string;
  ratePlanCode: string;
  roomType: string;
  rooms: number;
  adults: number;
  children: number;
  infants: number;
  guests: Array<{
    firstName: string;
    lastName: string;
    dob?: string;
    type?: "adult" | "child" | "infant";
  }>;
}

interface PayWithCryptoWalletProps {
  bookingDetails: BookingDetails;
}

const PayWithCryptoWallet: React.FC<PayWithCryptoWalletProps> = ({ bookingDetails }) => {
  const { t } = useTranslation();

  const handleConnectWallet = () => {
    // Placeholder for wallet connection logic (e.g., MetaMask)
    alert("Connect wallet functionality to be implemented.");
  };

  return (
    <div className="bg-tripswift-off-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-tripswift-medium text-tripswift-black mb-4">
        {t("Payment.PaymentComponents.PayWithCryptoWallet.title") || "Pay with Crypto Wallet"}
      </h3>
      <p className="text-sm text-tripswift-black/70 mb-4">
        {t("Payment.PaymentComponents.PayWithCryptoWallet.description") ||
          "Connect your cryptocurrency wallet to complete the payment."}
      </p>
      <div className="mb-4">
        <p className="text-sm font-tripswift-medium">
          Amount: {bookingDetails.currency.toUpperCase()} {bookingDetails.amount}
        </p>
      </div>
      <Button
        className="btn-tripswift-primary py-2 px-4 rounded-lg"
        onClick={handleConnectWallet}
      >
        {t("Payment.PaymentComponents.PayWithCryptoWallet.connectWallet") || "Connect Wallet"}
      </Button>
    </div>
  );
};

export default PayWithCryptoWallet;