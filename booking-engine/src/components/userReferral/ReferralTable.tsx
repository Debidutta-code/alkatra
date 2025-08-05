"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import BookingPagination from "../bookingComponents/bookingTabs/BookingPagination";
import { CalendarIcon, ShareIcon, UserIcon, MailIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ReferralTable() {
  const [referralsData, setReferralsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const accessToken = Cookies.get("accessToken");
  const { t } = useTranslation();

  async function fetchMyReferrals() {
    const endpoint = `${API_BASE_URL}/referrals?page=${currentPage}&limit=${itemsPerPage}`;

    try {
      setLoading(true);
      const response = await axios.get(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      setReferralsData(data.data);
      setTotalReferrals(data.total);
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
      toast.error("Failed to load referrals. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const items = parseInt(e.target.value, 10);
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const toggleShowReferrals = () => {
    if (!showReferrals) {
      fetchMyReferrals();
    }
    setShowReferrals(!showReferrals);
  };

  useEffect(() => {
    if (showReferrals) {
      fetchMyReferrals();
    }
  }, [accessToken, currentPage, itemsPerPage, showReferrals]);

  //redeem amount
  const redeemAmount = async (referralId: string) => {
    console.log("Redeeming amount for referral ID:", referralId);
    const endpoint = `${API_BASE_URL}/referrals/wallet/redeem`;

    try {
      setLoading(true);

      const response = await axios.post(
        endpoint,
        { referralId }, // request body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;
      console.log("Redeem response:", data);
      toast.success("Redeem successful!");
    } catch (error) {
      console.error("Failed to redeem amount:", error);
      toast.error("Failed to redeem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm p-6 w-full border border-border">
      <div className="flex flex-col items-center mb-6">
        <button
          onClick={toggleShowReferrals}
          className="text-primary  px-6 py-3 rounded-lg  mb-2 text-lg font-medium items-center flex flex-col"
        >
          {showReferrals
            ? t("Referral.hideReferrals")
            : t("Referral.viewYourReferrals")}

          <div className="w-8 h-8 text-primary ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transform transition-transform ${
                showReferrals ? "rotate-180" : ""
              }`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </button>
      </div>

      {showReferrals && (
        <>
          <div className="text-sm text-foreground mb-4">
            {t("Referral.total")}{" "}
            <span className="font-semibold">{totalReferrals}</span>{" "}
            {t("Referral.referrals")}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/10 border-t-primary"></div>
            </div>
          ) : referralsData.length > 0 ? (
            <>
              <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="overflow-x-auto ">
                  <table className="min-w-full divide-y divide-border ">
                    <thead className=" bg-primary text-white">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span>Name</span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
                            <MailIcon className="h-4 w-4" />
                            <span>Email</span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Referral Date</span>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="relative px-6 py-4 text-left text-xs font-semibold  uppercase tracking-wider"
                        >
                          <span className="h-4 w-4">Status</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {referralsData.map((referral: any) => (
                        <tr
                          key={referral.referralRecordId}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center border border-primary/20">
                                <span className="text-primary font-medium text-sm">
                                  {referral.firstName.charAt(0)}
                                  {referral.lastName.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-foreground">
                                  {referral.firstName} {referral.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {referral.status || "Pending"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm font-medium text-foreground">
                              {referral.email}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-foreground">
                                {new Date(
                                  referral.createdAt
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(
                                  referral.createdAt
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-primary-foreground bg-primary p-1.5 rounded-md transition-colors"
                              onClick={() => {
                                redeemAmount(referral.referralRecordId);
                              }}
                            >
                              Redeem
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalReferrals > itemsPerPage && (
                <div className="mt-6 px-4">
                  <BookingPagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalReferrals / itemsPerPage)}
                    itemsPerPage={itemsPerPage}
                    totalBookings={totalReferrals}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="mx-auto h-40 w-40 flex items-center justify-center bg-primary/10 rounded-full mb-6">
                <svg
                  className="h-20 w-20 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No referrals yet
              </h3>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Share your unique referral link with friends and earn rewards
                when they sign up.
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share Referral Link
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
