"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { Wallet, CreditCard, DollarSign } from "lucide-react";

export default function ReferralWallet() {
  const [walletData, setWalletData] = useState<{
    currentBalance: number;
    currency: string;
    totalEarned: number;
    totalRedeemed: number;
    updatedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const { t } = useTranslation();

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Track if already fetching to avoid double calls
  const [isFetching, setIsFetching] = useState(false);

  const fetchWalletData = async () => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      toast.error(t("Referral.noToken") || "Please login to view wallet data");
      return;
    }

    // Prevent multiple simultaneous calls
    if (isFetching) return;
    setIsFetching(true);
    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/referrals/wallet`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Only show success toast if data changed or first load
      if (!walletData && response.data) {
        // Optional: silent first load, or show only errors
        // toast.success("Wallet loaded successfully");
      }

      setWalletData(response.data);
    } catch (error) {
      // Avoid duplicate error toasts
      console.error("Failed to fetch wallet data:", error);

      // Use a unique ID to prevent duplicate toasts
      // toast.error(
      //   t("Referral.walletError") || "Failed to load wallet data. Please try again.",
      //   { id: "wallet-fetch-error" } // Ensures only one instance of this toast
      // );
    } finally {
      setLoading(false);
      setIsFetching(false); // Unlock
    }
  };

  const handleRedeem = async () => {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      toast.error(t("Referral.noToken") || "Please login to redeem");
      return;
    }
    if (!redeemAmount || parseFloat(redeemAmount) <= 0) {
      toast.error(
        t("Referral.invalidAmount") || "Please enter a valid amount",
        { id: "invalid-amount" }
      );
      return;
    }
    if (
      walletData &&
      parseFloat(redeemAmount) > walletData.currentBalance
    ) {
      toast.error(
        t("Referral.insufficientBalance") || "Insufficient balance",
        { id: "insufficient-balance" }
      );
      return;
    }

    try {
      setRedeeming(true);
      const response = await axios.post(
        `${API_BASE_URL}/referrals/wallet/redeem`,
        { amount: parseFloat(redeemAmount) },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setWalletData(response.data);
      setRedeemAmount("");
      
      // Success toast with unique ID
      toast.success(
        t("Referral.redeemSuccess", {
          amount: redeemAmount,
          currency: walletData?.currency,
        }) ||
          `Successfully redeemed ${walletData?.currency} ${redeemAmount}!`,
        { id: "redeem-success" }
      );
    } catch (error) {
      console.error("Failed to redeem amount:", error);
      toast.error(
        t("Referral.redeemError") || "Failed to redeem. Please try again.",
        { id: "redeem-error" }
      );
    } finally {
      setRedeeming(false);
    }
  };

  const handleMaxAmount = () => {
    if (walletData?.currentBalance) {
      setRedeemAmount(walletData.currentBalance.toString());
    }
  };

  useEffect(() => {
    // Only call once on mount
    fetchWalletData();

    // Cleanup: optional, but helps in some cases
    return () => {
      // Optional: cleanup logic if needed
    };
  }, []); // Empty dependency array = runs once

  // Show loader only initially if no data
  if (loading && !walletData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tripswift-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-tripswift-blue/10 to-blue-50 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-tripswift-blue/20 rounded-xl">
              <Wallet className="h-6 w-6 text-tripswift-blue" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {t("Referral.wallet") || "Referral Wallet"}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-7">
          {walletData ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Current Balance */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-100 transition-transform hover:scale-105">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        {t("Referral.currentBalance") || "Current Balance"}
                      </p>
                      <p className="text-xl font-extrabold text-gray-800 mt-1">
                        {walletData.currency} {walletData.currentBalance.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-7 w-7 text-tripswift-blue opacity-80" />
                  </div>
                </div>

                {/* Total Earned */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-100 transition-transform hover:scale-105">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        {t("Referral.totalEarned") || "Total Earned"}
                      </p>
                      <p className="text-xl font-extrabold text-gray-800 mt-1">
                        {walletData.currency} {walletData.totalEarned.toFixed(2)}
                      </p>
                    </div>
                    <svg
                      className="h-7 w-7 text-green-600 opacity-80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>

                {/* Total Redeemed */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-100 transition-transform hover:scale-105">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-purple-700">
                        {t("Referral.totalRedeemed") || "Total Redeemed"}
                      </p>
                      <p className="text-xl font-extrabold text-gray-800 mt-1">
                        {walletData.currency} {walletData.totalRedeemed.toFixed(2)}
                      </p>
                    </div>
                    <CreditCard className="h-7 w-7 text-purple-600 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Redeem Section */}
              {walletData.currentBalance > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    💸 {t("Referral.redeemEarnings") || "Redeem Your Earnings"}
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("Referral.enterAmount") || "Enter Amount to Redeem"}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={redeemAmount}
                          onChange={(e) => setRedeemAmount(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          max={walletData.currentBalance}
                          step="0.01"
                          className="w-full pl-14 pr-20 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-tripswift-blue/50 focus:border-tripswift-blue transition-all"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                          {walletData.currency}
                        </div>
                        <button
                          type="button"
                          onClick={handleMaxAmount}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-tripswift-blue hover:text-blue-700 text-sm font-semibold bg-white px-2.5 py-1 rounded border border-tripswift-blue/30 hover:shadow-sm transition-all"
                        >
                          MAX
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {t("Referral.availableBalance") || "Available balance"}:{" "}
                        <span className="font-medium text-gray-700">
                          {walletData.currency} {walletData.currentBalance.toFixed(2)}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRedeem}
                      disabled={redeeming || !redeemAmount || parseFloat(redeemAmount) <= 0}
                      className={`w-full py-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        redeeming || !redeemAmount || parseFloat(redeemAmount) <= 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-tripswift-blue text-white hover:bg-blue-600 active:scale-95 focus:ring-tripswift-blue/50"
                      }`}
                    >
                      {redeeming ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                          <span>{t("Referral.processing") || "Processing..."}</span>
                        </span>
                      ) : (
                        `${t("Referral.redeem") || "Redeem"} ${walletData.currency} ${redeemAmount || "0.00"}`
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Last Updated */}
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>
                  {t("Referral.lastUpdated") || "Last updated"}:{" "}
                  {new Date(walletData.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </>
          ) : (
            /* Fallback when no wallet data */
            <div className="text-center py-10 space-y-4">
              <Wallet className="h-14 w-14 text-gray-300 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-700">
                {t("Referral.noWalletData") || "No Wallet Data"}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {t("Referral.startReferring") || "Start referring friends to earn rewards!"}
              </p>
              <button
                onClick={fetchWalletData}
                disabled={loading}
                className="mt-2 inline-flex items-center gap-2 bg-tripswift-blue text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-70"
              >
                🔁 {t("Referral.refreshWallet") || "Refresh Wallet"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}