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

  const fetchWalletData = async () => {
    const accessToken = Cookies.get("accessToken");
    
    if (!accessToken) {
      toast.error(t("Referral.noToken") || "Please login to view wallet data");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/referrals/wallet`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setWalletData(response.data);
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      toast.error(t("Referral.walletError") || "Failed to load wallet data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    const accessToken = Cookies.get("accessToken");
    
    if (!accessToken) {
      toast.error(t("Referral.noToken") || "Please login to redeem");
      return;
    }

    if (!redeemAmount || parseFloat(redeemAmount) <= 0) {
      toast.error(t("Referral.invalidAmount") || "Please enter a valid amount");
      return;
    }

    if (walletData && parseFloat(redeemAmount) > walletData.currentBalance) {
      toast.error(t("Referral.insufficientBalance") || "Insufficient balance");
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
      toast.success(t("Referral.redeemSuccess", {
        amount: redeemAmount,
        currency: walletData?.currency
      }) || `Successfully redeemed ${walletData?.currency} ${redeemAmount}!`);
    } catch (error) {
      console.error("Failed to redeem amount:", error);
      toast.error(t("Referral.redeemError") || "Failed to redeem. Please try again.");
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
    fetchWalletData();
  }, []);

  if (loading && !walletData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tripswift-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white rounded-xl p-6 w-full items-center flex flex-col justify-center">
      <div className="w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wallet className="h-6 w-6 text-tripswift-blue" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 md:text-xl">
            {t("Referral.wallet") || "Referral Wallet"}
          </h2>
        </div>

        {walletData ? (
          <div className="space-y-6 w-full">
            {/* Wallet Stats */}
            <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 w-full">
              {/* Current Balance */}
              <div className="flex-1 bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t("Referral.currentBalance") || "Current Balance"}
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {walletData.currency} {walletData.currentBalance.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-tripswift-blue" />
                </div>
              </div>

              {/* Total Earned */}
              <div className="flex-1 bg-green-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t("Referral.totalEarned") || "Total Earned"}
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {walletData.currency} {walletData.totalEarned.toFixed(2)}
                    </p>
                  </div>
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>

              {/* Total Redeemed */}
              <div className="flex-1 bg-purple-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {t("Referral.totalRedeemed") || "Total Redeemed"}
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {walletData.currency} {walletData.totalRedeemed.toFixed(2)}
                    </p>
                  </div>
                  <CreditCard className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Redeem Section */}
            {walletData.currentBalance > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 w-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("Referral.redeemEarnings") || "Redeem Your Earnings"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      {t("Referral.enterAmount") || "Enter Amount to Redeem"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        max={walletData?.currentBalance || 0}
                        step="0.01"
                        className="w-full pl-12 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tripswift-blue focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center">
                        <span className="text-gray-500 text-sm">{walletData.currency}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleMaxAmount}
                        className="absolute inset-y-0 right-3 flex items-center text-tripswift-blue hover:text-blue-600 text-sm font-medium"
                      >
                        MAX
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("Referral.availableBalance") || "Available balance"}: {walletData.currency} {walletData.currentBalance.toFixed(2)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRedeem}
                    disabled={redeeming || !redeemAmount || parseFloat(redeemAmount) <= 0}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${redeeming || !redeemAmount || parseFloat(redeemAmount) <= 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-tripswift-blue text-white hover:bg-blue-600"
                      }`}
                  >
                    {redeeming ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{t("Referral.processing") || "Processing..."}</span>
                      </div>
                    ) : (
                      `${t("Referral.redeem") || "Redeem"} ${walletData.currency} ${redeemAmount || "0.00"}`
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500">
              <p>
                {t("Referral.lastUpdated") || "Last updated"}: {new Date(walletData.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t("Referral.noWalletData") || "No wallet data available"}
            </h3>
            <p className="text-gray-500 mb-4">
              {t("Referral.startReferring") || "Start referring friends to earn rewards!"}
            </p>
            <button
              type="button"
              onClick={fetchWalletData}
              className="bg-tripswift-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t("Referral.refreshWallet") || "Refresh Wallet"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}