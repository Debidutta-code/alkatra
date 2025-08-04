"use client";
import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  FaWhatsapp,
  FaFacebookF,
  FaTelegramPlane,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

export default function ReferralShare() {
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const accessToken = Cookies.get("accessToken");

  // Generate share message with URL
  const shareMessage = `Join me on this awesome app! Use my referral link: ${referralLink}`;
  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedUrl = encodeURIComponent(referralLink);

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
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
      bg: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600",
      Icon: FaFacebookF,
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
      bg: "bg-cyan-50 hover:bg-cyan-100",
      iconColor: "text-cyan-600",
      Icon: FaTelegramPlane,
    },
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      bg: "bg-sky-50 hover:bg-sky-100",
      iconColor: "text-sky-500",
      Icon: FaTwitter,
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-700",
      Icon: FaLinkedin,
    },
  ];

  const handleCopyLink = () => {
    if (!referralLink) {
      toast.error("Referral link not available");
      return;
    }
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  async function fetchReferralLink() {
    const endpoint = `${API_BASE_URL}/referrals/generate`;

    try {
      setLoading(true);
      const response = await axios.post(
        endpoint,
        {}, // Empty body for POST request
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;
      console.log("Referral link data:", data);

      if (data?.referral_result?.referral_link) {
        setReferralLink(data.referral_result.referral_link);

        // Set QR code data if available from API
        if (data.referral_result.referral_qr_code) {
          setQrCodeData(data.referral_result.referral_qr_code);
        }

        console.log(
          data.referral_result.message || "Referral link loaded successfully!"
        );
      } else {
        throw new Error("Referral link not found in the response.");
      }
    } catch (error) {
      console.error("Failed to fetch referral link:", error);
      toast.error("Failed to load referral link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) {
      fetchReferralLink();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tripswift-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        {t("Referral.shareYourLink")}
      </h2>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Referral Link Card */}
        <div className="bg-white p-6 rounded-xl w-full lg:w-2/3">
          <p className="text-gray-600 text-center mb-6">
            {t("Referral.shareDescription")}
          </p>

          <div className="flex flex-col gap-6">
            {/* Referral Link Input */}
            <div className="w-full">
              <div className="relative">
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded-xl transition-all duration-300 group hover:ring-2 hover:ring-blue-100">
                  <code className="text-sm text-gray-800 font-mono flex-grow px-4 py-3 truncate bg-white rounded-lg">
                    {referralLink || "Loading..."}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    disabled={!referralLink}
                    className={`flex-shrink-0 ml-3 p-2.5 rounded-lg transition-all duration-200 ${
                      copied
                        ? "text-green-600 bg-green-50"
                        : referralLink
                        ? "bg-tripswift-blue text-white hover:bg-blue-600 hover:scale-105 active:scale-95"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
              <div className="flex flex-wrap items-center justify-center gap-3">
                {sharePlatforms.map(({ name, url, bg, iconColor, Icon }) => (
                  <a
                    key={name}
                    href={referralLink ? url : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => !referralLink && e.preventDefault()}
                    className={`flex items-center justify-center p-3 rounded-xl ${bg} transition-colors duration-200 ${
                      !referralLink
                        ? "cursor-not-allowed opacity-50"
                        : "hover:scale-105"
                    }`}
                    title={`Share on ${name}`}
                  >
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </a>
                ))}
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
              {qrCodeData ? (
                <img
                  src={qrCodeData}
                  alt="Referral QR Code"
                  className="w-45 h-45 object-contain"
                  style={{ width: "180px", height: "180px" }}
                />
              ) : referralLink ? (
                <QRCodeCanvas
                  value={referralLink}
                  bgColor="#FFFFFF"
                  fgColor="#111827"
                  level="H"
                  size={180}
                  includeMargin={true}
                />
              ) : (
                <div
                  className="w-45 h-45 bg-gray-100 rounded-lg flex items-center justify-center"
                  style={{ width: "180px", height: "180px" }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tripswift-blue"></div>
                </div>
              )}
            </div>
            <p className="mt-3 text-gray-500 text-sm">
              {t("Referral.scanDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
