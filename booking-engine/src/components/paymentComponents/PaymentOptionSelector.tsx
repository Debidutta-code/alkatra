// components/paymentComponents/PaymentOptionSelector.tsx
"use client";

import { QrCode, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";


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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${selectedOption === 'payAtHotel' || !selectedOption
          ? 'border-tripswift-blue bg-tripswift-blue/10 text-tripswift-black'
          : 'border-gray-200 hover:bg-gray-50 text-tripswift-black/70'
          }`}>
          <input
            type="radio"
            name="paymentOption"
            value="payAtHotel"
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

        {/* Pay with Crypto Option */}
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
              {t('Payment.PaymentComponents.PaymentOptionSelector.payWithCrypto')}
            </span>
            <span className="text-[10px] font-tripswift-medium text-tripswift-black/70 uppercase">
              {t('Payment.PaymentComponents.PaymentOptionSelector.payWithCryptoDescription')}
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
              disabled={true}
              className={`p-2.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed border-gray-200 bg-gray-100`}
            >
              <Wallet className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-tripswift-medium text-gray-400">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="sm">
        <ModalContent>
          <ModalHeader className="text-tripswift-black">
            {t("Payment.PaymentComponents.PaymentOptionSelector.unavailableTitle")}
          </ModalHeader>
          <ModalBody>
            <p className="text-tripswift-black/80">
              {t("Payment.PaymentComponents.PaymentOptionSelector.unavailableMessage") ||
                "This provision is not available in your country."}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setIsModalOpen(false)}>
              {t("Common.close") || "Close"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PaymentOptionSelector;