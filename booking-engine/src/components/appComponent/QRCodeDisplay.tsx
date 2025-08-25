"use client";

import React from "react";
import { QrCode, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QRCodeDisplayProps {
  qrCode: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode }) => {
  const { t } = useTranslation();
  if (!qrCode) return null;

  // Log qrCode for debugging
  console.log("QRCodeDisplay qrCode:", qrCode.slice(0, 100), "Length:", qrCode.length);
  const { i18n } = useTranslation();
  return (
    <div className="relative overflow-hidden bg-tripswift-off-white rounded-lg">
      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6 items-center rounded-xl border border-gray-100 p-2 pl-5">
        {/* QR Code Section */}
        <div className="text-center flex-shrink-0">
          <div
            className="rounded-lg p-2 border-2 border-dashed shadow-[var(--shadow)]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(131,58,180,1) 20%, rgba(253,29,29,1) 57%, rgba(227,131,57,1) 100%)",
            }}
          >
            <div className="bg-white p-1 rounded-md">
              <img
                src={qrCode}
                alt="Discount QR Code"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain pointer-events-none"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>
          <div className="flex items-center justify-center mt-2 text-xs text-tripswift-black/60 font-tripswift-regular">
            <Smartphone className={`h-3 w-3  text-tripswift-blue ${i18n.language === "ar" ? "ml-1" : "mr-1"}`} />
            {t("RoomsPage.qrCode.scanToApply")}
          </div>
        </div>

        {/* Discount Information Section */}
        <div className="flex-1 w-full">
          <div className="bg-tripswift-blue/5">
            {/* <h4 className="text-section-heading text-tripswift-blue mb-3 flex items-center">
              <QrCode className="h-4 w-4 mr-2" />
              Use Your Discount
            </h4> */}
            <ul className="text-description text-tripswift-black/70 space-y-2">
              <li className="flex items-start">
                <span className={`${i18n.language === "ar" ? "ml-2" : "mr-2"}`}>•</span>
                {t("RoomsPage.qrCode.instructions.applyDiscount")}
              </li>
              <li className="flex items-start">
                <span className={`${i18n.language === "ar" ? "ml-2" : "mr-2"}`}>•</span>
                {t("RoomsPage.qrCode.instructions.scanAtCheckout")}
              </li>
              <li className="flex items-start">
                <span className={`${i18n.language === "ar" ? "ml-2" : "mr-2"}`}>•</span>
                {t("RoomsPage.qrCode.instructions.validityNote")}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Decorative gradient blobs */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-tripswift-blue/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-tripswift-blue/20 rounded-full blur-xl"></div>
    </div>
  );
};

export default QRCodeDisplay;