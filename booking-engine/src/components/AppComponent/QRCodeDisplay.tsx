// components/AppComponent/QRCodeDisplay.tsx
import React from "react";
import { QrCode, Smartphone } from "lucide-react";

interface QRCodeDisplayProps {
  qrCode: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode }) => {
  if (!qrCode) return null;

  return (
    <div className="relative overflow-hidden bg-tripswift-off-white  rounded-lg">
      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6 items-center rounded-xl border border-gray-100 p-2 pl-5">
        {/* QR Code Section */}
        <div className="text-center flex-shrink-0">
          <div className="bg-tripswift-off-white rounded-lg p-2 border-2 border-dashed shadow-[var(--shadow)]">
            <img
              src={qrCode}
              alt="Discount QR Code"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div className="flex items-center justify-center mt-2 text-xs text-tripswift-black/60 font-tripswift-regular">
            <Smartphone className="h-3 w-3 mr-1 text-tripswift-blue" />
            Scan to apply
          </div>
        </div>

        {/* Discount Information Section */}
        <div className="flex-1 w-full">
          <div className="bg-tripswift-blue/5 ">
            {/* <h4 className="text-section-heading text-tripswift-blue mb-3 flex items-center">
              <QrCode className="h-4 w-4 mr-2" />
              Use Your Discount
            </h4> */}
            <ul className="text-description text-tripswift-black/70 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Scan the QR code at checkout
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Apply the discount during checkout to get your special offer
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Valid for this booking session only
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