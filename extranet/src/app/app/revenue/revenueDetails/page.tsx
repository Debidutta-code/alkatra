"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { fetchPropertyRevenue } from "../api";
import { Eye } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";
import toast from "react-hot-toast";

interface LatestBooking {
  _id: string;
  amount: number;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  booking_dates: string;
  booking_user_name: string;
  room: { _id: string; room_name: string; room_type: string };
}

const PropertyRevenuePage: React.FC = () => {
  const searchParams = useSearchParams();
  const revenueId = searchParams.get("revenueId");
  const propertyNameFromURL = searchParams.get("propertyName") || "";
  const [propertyName, setPropertyName] = useState(propertyNameFromURL);
  const [bookings, setBookings] = useState<LatestBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    startDate: formatDate(sevenDaysAgo),
    endDate: formatDate(today),
  });

  const [selectedBooking, setSelectedBooking] = useState<LatestBooking | null>(null);

  useEffect(() => {
    if (revenueId && accessToken) {
      const fetchData = async () => {
        console.log(`Fetching revenue data for revenue ID: ${revenueId}`);
        try {
          const data = await fetchPropertyRevenue(revenueId, filters, accessToken);
          console.log("Fetched data:", data);
          if (data) {
            setBookings(data.bookingDetails as LatestBooking[]);
          }
        } catch (error) {
          console.error("Error fetching revenue data:", error);
          toast.error("Failed to fetch revenue data");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      setIsLoading(false);
      toast.error("Missing revenue ID or authentication");
    }
  }, [revenueId, filters, accessToken]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      return (!startDate || checkInDate >= startDate) && (!endDate || checkOutDate <= endDate);
    });
  }, [filters, bookings]);

  return (
    <div className="min-h-screen bg-white dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-gray-900 dark:via-gray-950 dark:to-black px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 animate-[slideDown_0.5s_ease-out]">
          <h3 className="text-3xl font-medium bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            Revenue Details for {propertyName || "Property"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Track and analyze revenue performance for this property
          </p>
        </div>

        <div className="mb-6 flex flex-wrap md:flex-nowrap items-center gap-4">
          <div className="flex flex-col w-full md:w-[30%]">
            <label htmlFor="startDate" className="text-gray-600 dark:text-gray-400 text-xs mb-1">
              Check-In Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
              hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            />
          </div>
          <div className="flex flex-col w-full md:w-[30%]">
            <label htmlFor="endDate" className="text-gray-600 dark:text-gray-400 text-xs mb-1">
              Check-Out Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
              hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden 
                        transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                <p className="text-lg font-medium">Loading bookings...</p>
              </div>
            ) : filteredBookings.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Booked On
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Check-In
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Check-Out
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="group border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800/20 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{booking.booking_user_name}</td>
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                        {new Date(booking.booking_dates).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200">${booking.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                            ${booking.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                        {new Date(booking.checkInDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                        {new Date(booking.checkOutDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className="text-blue-500 dark:text-blue-400 hover:underline flex items-center"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="w-4 h-4" /> View More
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                <p className="text-lg font-medium">No bookings found</p>
              </div>
            )}
          </div>
        </div>

        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl text-gray-800 dark:text-gray-200 w-[90%] max-w-md animate-slideUp">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium text-gray-900 dark:text-gray-100">🏨 Room:</span>{" "}
                  {selectedBooking.room.room_name}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-gray-100">📌 Type:</span>{" "}
                  {selectedBooking.room.room_type}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-gray-100">🔖 Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-sm font-medium 
                    ${selectedBooking.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
                  >
                    {selectedBooking.status}
                  </span>
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyRevenuePage;