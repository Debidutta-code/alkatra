"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ReferralHowItWorks from "./ReferralHowItWorks";
import ReferralShare from "./ReferralShare";
import ReferralTable from "./ReferralTable";
import ReferralWallet from "./ReferralWallet";

export default function Referral() {
  const { t } = useTranslation();
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className="min-h-screen bg-tripswift-off-white flex justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Error Loading Referral
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-tripswift-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tripswift-off-white flex justify-center w-screen">
      <div className="w-screen overflow-hidden">
        {/* Header Section */}
        {/* <div className="flex flex-col justify-center bg-tripswift-blue p-4 text-center h-[30vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-blue-700/30"></div>
          <h1 className="text-4xl font-bold text-white relative z-10">
            {t("Referral.heroTitle")}
          </h1>
          <p className="mt-4 text-blue-100 text-sm relative z-10 max-w-md mx-auto">
            {t("Referral.heroSubtitle")}
          </p>
        </div> */}

        {/* Main Content */}
        <div className="space-y-4 mt-2">
          {/* Two Columns (Share & Wallet) - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
            <div className="w-full">
              <ReferralShare />
            </div>
            <div className="w-full">
              <ReferralWallet />
            </div>
          </div>
          {/* Full Width */}
          <ReferralTable />
          <ReferralHowItWorks />
        </div>

      </div>
    </div>
  );
}