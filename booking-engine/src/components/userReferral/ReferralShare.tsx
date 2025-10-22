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
  const [referralCode, setReferralCode] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false); // Separate state for generation
  const [isGenerated, setIsGenerated] = useState(false);
  const { t } = useTranslation();
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const accessToken = Cookies.get("accessToken");

  // Fetch existing referral data (GET)
  const fetchReferralData = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/customers/referrals`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data?.data;
      if (data?.referralLink) {
        setReferralLink(data.referralLink);
        setReferralCode(data.referralCode);
        setQrCodeData(data.referralQRCode);
        setIsGenerated(true);
        return true; // Return success
      }
      return false; // No data found
    } catch (error) {
      console.error("Failed to fetch referral data:", error);
      return false; // Return failure
    }
  };

  const handleGenerate = async () => {
    if (!accessToken) {
      toast.error(t("Referral.noToken") || "Please log in first.");
      return;
    }

    if (isGenerated) {
      toast(t("Referral.alreadyGenerated") || "You have already generated your referral.");
      return;
    }

    try {
      setGenerating(true); // Set generating state

      // Step 1: Generate referral
      const response = await axios.post(
        `${API_BASE_URL}/referrals/generate`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.message || response.status === 200 || response.status === 201) {
        toast.success(t("Referral.generated") || "Referral generated successfully!");

        // Step 2: Immediately fetch the generated referral data
        const fetchSuccess = await fetchReferralData();

        if (fetchSuccess) {
          console.log("Referral data fetched successfully after generation");
        } else {
          // If fetch fails, try one more time after a short delay
          setTimeout(async () => {
            const retrySuccess = await fetchReferralData();
            if (!retrySuccess) {
              toast.error("Generated successfully, but failed to load data. Please refresh the page.");
            }
          }, 1000);
        }
      }
    } catch (error) {
      let errorMessage = "Failed to generate referral. You may have already generated one.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Failed to generate referral:", errorMessage);
      toast.error(t("Referral.generateError") || errorMessage);
    } finally {
      setGenerating(false); // Reset generating state
    }
  };

  // Generate share message with URL
  const shareMessage = `Join Al-Hajz — your new booking platform!\n\nUse my referral link:\n${referralLink}`;
  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedUrl = encodeURIComponent(referralLink);

  const sharePlatforms = [
    {
      name: t("Referral.platforms.whatsapp"),
      url: `https://wa.me/?text=${encodedMessage}`,
      bg: "bg-green-50 hover:bg-green-100",
      iconColor: "text-green-600",
      Icon: FaWhatsapp,
    },
    {
      name: t("Referral.platforms.facebook"),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
      bg: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600",
      Icon: FaFacebookF,
    },
    {
      name: t("Referral.platforms.telegram"),
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
      bg: "bg-cyan-50 hover:bg-cyan-100",
      iconColor: "text-cyan-600",
      Icon: FaTelegramPlane,
    },
    {
      name: t("Referral.platforms.twitter"),
      url: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      bg: "bg-sky-50 hover:bg-sky-100",
      iconColor: "text-sky-500",
      Icon: FaTwitter,
    },
    {
      name: t("Referral.platforms.linkedin"),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-700",
      Icon: FaLinkedin,
    },
  ];

  const handleCopyLink = () => {
    if (!referralLink) {
      toast.error(t("Referral.linkNotAvailable") || "Referral link not available");
      return;
    }
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(t("Referral.copiedToClipboard") || "Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const initializeReferralData = async () => {
      if (accessToken) {
        setLoading(true);
        await fetchReferralData();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    initializeReferralData();
  }, [accessToken]);

  // Show loading spinner only during initial load
  if (loading && !referralLink) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tripswift-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        {t("Referral.shareYourLink")}
      </h2>
      <p className="text-gray-600 text-center max-w-md mx-auto">
        {t("Referral.shareDescription")}
      </p>

      {/* Main Card */}
      <div className="bg-tripswift-off-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-6">
        {/* Generate Button (Only if not generated) */}
        {!isGenerated && !referralLink && (
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-tripswift-blue text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  {t("Referral.generating") || "Generating..."}
                </span>
              ) : (
                t("Referral.generateReferral") || "Generate Referral"
              )}
            </button>
            <p className="text-gray-500 text-sm mt-3">
              {t("Referral.generateOnce") || "You can generate your referral link only once."}
            </p>
          </div>
        )}

        {/* Show content only if generated */}
        {(isGenerated || referralLink) && (
          <>
            {/* 1. Referral URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("Referral.yourReferralLink")}
              </label>
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl group hover:ring-2 hover:ring-blue-200 transition-all">
                <code className="flex-grow text-sm font-mono text-gray-800 truncate bg-white px-4 py-2.5 rounded-lg">
                  {referralLink || "Loading..."}
                </code>
                <button
                  onClick={handleCopyLink}
                  disabled={!referralLink}
                  className={`p-2.5 rounded-lg transition-all flex-shrink-0 ${copied
                    ? "bg-green-100 text-green-600"
                    : referralLink
                      ? "bg-tripswift-blue text-white hover:bg-blue-600 active:scale-95 hover:scale-105"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  aria-label={copied ? t("Referral.copied") : t("Referral.copy")}
                >
                  {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {copied && (
                <p className="text-green-600 text-xs mt-1.5 ml-1">
                  {t("Referral.copied")}
                </p>
              )}
            </div>

            {/* 2. QR Code */}
            <div className="flex flex-col items-center py-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t("Referral.scanToShare")}
              </h3>
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                {qrCodeData ? (
                  <img
                    src={qrCodeData}
                    alt="Referral QR Code"
                    className="rounded-md object-contain"
                    style={{ width: "160px", height: "160px" }}
                  />
                ) : referralLink ? (
                  <QRCodeCanvas
                    value={referralLink}
                    size={160}
                    level="H"
                    bgColor="#FFFFFF"
                    fgColor="#111827"
                    includeMargin={true}
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tripswift-blue"></div>
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-3 text-center">
                {t("Referral.scanDescription")}
              </p>
            </div>

            {/* 3. Social Sharing */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-gray-700 font-medium text-center mb-4">
                {t("Referral.shareVia")}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {sharePlatforms.map(({ name, url, bg, iconColor, Icon }) => (
                  <a
                    key={name}
                    href={referralLink ? url : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => !referralLink && e.preventDefault()}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[72px] transition-all ${!referralLink
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-110 active:scale-105"
                      } ${bg}`}
                    title={`Share on ${name}`}
                  >
                    <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
                    <span className="text-xs font-medium text-gray-700 mt-1.5">
                      {name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}