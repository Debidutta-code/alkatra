"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import BookingPagination from "../bookingComponents/bookingTabs/BookingPagination";

export default function ReferralTable() {
  const [referralsData, setReferralsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const accessToken = Cookies.get("accessToken");

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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Referrals</h2>
        <button
          onClick={toggleShowReferrals}
          className="bg-tripswift-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showReferrals ? "Hide Referrals" : "View Referrals"}
        </button>
      </div>

      {showReferrals && (
        <>
          <div className="text-sm text-gray-500 mb-4">
            Total: {totalReferrals} referrals
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tripswift-blue"></div>
            </div>
          ) : referralsData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Referral Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referralsData.map((referral: any) => (
                      <tr key={referral.referralRecordId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {referral.firstName.charAt(0)}
                                {referral.lastName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {referral.firstName} {referral.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {referral.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(referral.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalReferrals > itemsPerPage && (
                <div className="mt-6">
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
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No referrals yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Share your referral link to invite friends and earn rewards.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
