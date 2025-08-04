"use client";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Signup from "@/components/assets/referral/add-user.png";
import Reward from "@/components/assets/referral/gift.png";
import Share from "@/components/assets/referral/share.png";
import { FaWhatsapp, FaFacebookF, FaTelegramPlane } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import arrow from "@/components/assets/referral/right-arrow.gif";

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const { t } = useTranslation();

  const referralLink = "https://yourapp.com/?ref=user123";
  const encodedMessage = encodeURIComponent(
    `Join me on this awesome app . Here's my referral link: ${referralLink}`
  );

  const sharePlatforms = [
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodedMessage}`,
      bg: "bg-green-50 hover:bg-green-100",
      iconColor: "text-green-600",
      Icon: FaWhatsapp,
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        referralLink
      )}`,
      bg: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600",
      Icon: FaFacebookF,
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodeURIComponent(
        referralLink
      )}&text=${encodedMessage}`,
      bg: "bg-cyan-50 hover:bg-cyan-100",
      iconColor: "text-cyan-600",
      Icon: FaTelegramPlane,
    },
  ];
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-tripswift-off-white flex justify-center w-screen">
      <div className="w-screen overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col justify-center bg-tripswift-blue p-6 text-center h-[30vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-blue-700/30"></div>
          <h1 className="text-4xl font-bold text-white relative z-10">
            {t("Referral.heroTitle")}
          </h1>
          <p className="mt-5 text-blue-100 text-sm relative z-10 max-w-md mx-auto">
            {t("Referral.heroSubtitle")}
          </p>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-10 space-y-[10vh] -mt-8 relative z-20 w-full ">
          {/* How It Works Section */}
          <div className="space-y-6  bg-white rounded-xl p-6 w-full items-center flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-center text-gray-800 md:text-xl">
              {t("Referral.howItWorks")}
            </h2>
            <h2 className="text-sm font-light text-center text-gray-600 md:text-base">
              {t("Referral.howItWorksSubTitle")}
            </h2>

            <div className="flex flex-col sm:flex-row items-stretch justify-between gap-0 px-4 p-5 w-full">
              {[
                {
                  img: Share,
                  title: t("Referral.step1Title"),
                  description: t("Referral.step1Desc"),
                },
                {
                  img: Signup,
                  title: t("Referral.step2Title"),
                  description: t("Referral.step2Desc"),
                },
                {
                  img: Reward,
                  title: t("Referral.step3Title"),
                  description: t("Referral.step3Desc"),
                },
              ].map((step, index, array) => (
                <div
                  key={step.title}
                  className="flex-1 flex items-center justify-center min-w-0"
                >
                  <div className="flex items-center justify-center w-full">
                    <div className="flex flex-col items-center text-center p-4 w-full">
                      <div className="relative mb-4 group">
                        <div className="absolute inset-0 bg-blue-100 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity"></div>
                        <div className="relative bg-blue-100 text-blue-500 rounded-full h-20 w-20 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                          <img
                            src={step.img.src}
                            alt={step.title}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-tripswift-blue text-white text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                          {t("Referral.stepLabel", { number: index + 1 })}
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-800 text-base">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1 leading-tight">
                        {step.description}
                      </p>
                    </div>
                    {index < array.length - 1 && (
                      <div className="hidden sm:flex items-center justify-center w-12 h-12 shrink-0">
                        <img
                          src={arrow.src}
                          alt="arrow"
                          className="w-full h-full object-contain text-tripswift-blue"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Section */}
          <div className="space-y-6 w-full max-w-6xl mx-auto ">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {t("Referral.shareYourLink")}
            </h2>

            <div className="flex flex-col lg:flex-row gap-6 w-full ">
              {/* Referral Link Card */}
              <div className="bg-white p-6 rounded-xl  w-full lg:w-2/3">
                <p className="text-gray-600 text-center mb-6">
                  {t("Referral.shareDescription")}
                </p>

                <div className="flex flex-col gap-6 ">
                  {/* Referral Link Input */}
                  <div className="w-full">
                    <div className="relative">
                      <div className="flex items-center justify-between bg-blue-50 p-2 rounded-xl transition-all duration-300 group hover:ring-2 hover:ring-blue-100">
                        <code className="text-sm text-gray-800 font-mono flex-grow px-4 py-3 truncate bg-white rounded-lg">
                          {referralLink}
                        </code>
                        <button
                          onClick={handleCopyLink}
                          className={`flex-shrink-0 ml-3 p-2.5 rounded-lg transition-all duration-200 ${
                            copied
                              ? "text-green-600 bg-green-50"
                              : "bg-tripswift-blue text-white hover:bg-blue-600 hover:scale-105 active:scale-95"
                          }`}
                          aria-label={
                            copied ? t("Referral.copied") : t("Referral.copy")
                          }
                        >
                          {copied ? (
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-xs font-medium">
                                {t("Referral.copied")}
                              </span>
                            </div>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Social Sharing */}
                  <div className="flex flex-col items-center">
                    <p className="text-gray-500 text-sm mb-3">
                      {t("Referral.shareVia")}
                    </p>
                    <div className="flex items-center gap-4">
                      {sharePlatforms.map(
                        ({ name, url, bg, iconColor, Icon }) =>
                          url ? (
                            <a
                              key={name}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-center p-3 rounded-xl ${bg} transition-colors duration-200 tooltip`}
                              data-tip={`Share on ${name}`}
                            >
                              <Icon className={`w-5 h-5 ${iconColor}`} />
                            </a>
                          ) : (
                            <button
                              key={name}
                              className={`flex items-center justify-center p-3 rounded-xl ${bg} transition-colors duration-200 tooltip`}
                              data-tip={name}
                            >
                              <Icon className={`w-5 h-5 ${iconColor}`} />
                            </button>
                          )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6 items-center justify-center">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {t("Referral.scanToShare")}
                  </h3>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <QRCodeCanvas
                      value={referralLink}
                      bgColor="#FFFFFF"
                      fgColor="#111827"
                      level="H"
                      size={180}
                      includeMargin={true}
                    />
                  </div>
                  <p className="mt-3 text-gray-500 text-sm">
                    {t("Referral.scanDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
