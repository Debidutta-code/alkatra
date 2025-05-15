"use client";
import { useEffect, useState } from "react";
import { getBookings } from "./api";
import React from "react";
import Link from "next/link";
import { Label } from "../../../components/ui/label";
import { Search, Building2, ChevronLeft, ChevronRight, Calendar, MapPin, ChevronDown, Home, ChevronRight as Chevron } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

type Booking = {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: "Confirmed" | "Pending";
  property: {
    id: string;
    name: string;
    city: string;
  };
};

type GetBookingsResponse = {
  bookingDetails: Booking[];
  currentPage: number;
  totalPages: number;
  totalBookings: number;
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    async function fetchData() {
      const data: GetBookingsResponse = await getBookings(currentPage, itemsPerPage, accessToken);
      console.log("**************************\n", data);
      console.log(`@@@@@@@@@@@@@@@@@@\n ${data.bookingDetails}`);
      setBookings(data.bookingDetails);
      setFilteredBookings(data.bookingDetails);
      setTotalPages(data.totalPages);
    }
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    let updatedBookings = bookings;

    if (selectedProperty) {
      updatedBookings = updatedBookings.filter(
        (booking) => booking.property.name === selectedProperty
      );
    }

    if (searchQuery.trim()) {
      updatedBookings = updatedBookings.filter((booking) =>
        booking.guestName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBookings(updatedBookings);
  }, [selectedProperty, searchQuery, bookings]);

  const statusColors: Record<Booking["status"], { bg: string; text: string; icon: string }> = {
    Confirmed: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      icon: "border-emerald-500",
    },
    Pending: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      icon: "border-amber-500",
    },
  };

  const propertyNames = Array.from(
    new Set(bookings.map((booking) => booking.property.name))
  );

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-gray-900 dark:via-gray-950 dark:to-black px-4 py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-2" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/app"
                className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <Chevron className="w-4 h-4 text-gray-500" />
                <span className="ml-1 text-sm font-medium text-blue-600 dark:text-blue-400 md:ml-2">
                  Bookings
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-6 animate-[slideDown_0.5s_ease-out]">
          <h3 className="pb-0 text-3xl font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-1 animate-[gradient_3s_ease-in-out_infinite]">
            Manage Bookings
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Manage and track all your property bookings in one place</p>
        </div>

        {/* Filters Section */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* Filter by Property */}
          <div className="group relative w-full md:w-[30%]">
            <Label htmlFor="propertyFilter" className="text-gray-600 dark:text-gray-400 mb-2 block">
              <Building2 className="w-4 h-4 inline-block mr-2" />
              Filter by Property
            </Label>
            <div className="relative">
              <select
                id="propertyFilter"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 
               focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-transparent transition-all duration-200
               backdrop-blur-xl appearance-none hover:border-gray-400 dark:hover:border-gray-800 pr-10"
                value={selectedProperty}
                onChange={(e) => {
                  setSelectedProperty(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                <option className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white" value="">All Properties</option>
                {propertyNames.map((name) => (
                  <option key={name} className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white" value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 dark:text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Search by Guest Name */}
          <div className="group relative w-full md:w-[30%]">
            <Label htmlFor="searchQuery" className="text-gray-600 dark:text-gray-400 mb-2 block">
              <Search className="w-4 h-4 inline-block mr-2" />
              Search by Guest Name
            </Label>
            <input
              id="searchQuery"
              type="text"
              placeholder="Enter guest name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when search query changes
              }}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200
               focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
               backdrop-blur-xl placeholder-gray-500 hover:border-gray-400 dark:hover:border-gray-600"
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-300 dark:border-gray-800 overflow-hidden
                      transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-700 hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Guest</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Property</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Check-in</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Check-out</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="group border-b border-gray-300 dark:border-gray-800 last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors duration-200"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: "slideDown 0.5s ease-out forwards",
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{booking.guestName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Building2 className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                          {booking.property.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <MapPin className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                          {booking.property.city}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                          {booking.checkIn}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                          {booking.checkOut}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                     ${statusColors[booking.status].bg} ${statusColors[booking.status].text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 border ${statusColors[booking.status].icon}`}></span>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/app/bookings/${booking.id}`}>
                          <button className="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200
                                         hover:bg-blue-500 hover:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                         focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900">
                            View Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <Search className="w-12 h-12 mb-4 text-gray-500" />
                        <p className="text-lg font-medium">No bookings found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => goToPage(i + 1)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}