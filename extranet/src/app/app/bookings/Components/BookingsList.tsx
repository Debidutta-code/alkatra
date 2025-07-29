"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import { Label } from "../../../../components/ui/label";
import { Search, Building2, ChevronLeft, ChevronRight, Calendar, MapPin, ChevronDown, Eye, BookOpen, CreditCard, Clock, CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";
import { getBookings, getAllHotelNames, type Booking, type GetBookingsResponse, getPaymentMethodDisplay } from "../api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

// Helper function to format date to DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export default function BookingsList() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [allHotelNames, setAllHotelNames] = useState<string[]>([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState<boolean>(false);
  const [hotelNamesError, setHotelNamesError] = useState<string>("");
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Navigation handler for viewing booking details
  const handleViewBooking = (bookingId: string) => {
    router.push(`/app/bookings?id=${bookingId}`);
  };

  useEffect(() => {
    async function fetchHotelNames() {
      if (!accessToken) {
        console.log("No access token available for hotel names");
        return;
      }

      try {
        setIsLoadingHotels(true);
        setHotelNamesError("");
        console.log("Fetching hotel names...");
        const hotelNames = await getAllHotelNames(accessToken);
        console.log("Received hotel names:", hotelNames);
        setAllHotelNames(hotelNames);
        if (hotelNames.length === 0) {
          setHotelNamesError("No hotel names found");
        }
      } catch (error: any) {
        console.error("Failed to fetch hotel names:", error);
        setHotelNamesError("Failed to load hotel names");
      } finally {
        setIsLoadingHotels(false);
      }
    }

    fetchHotelNames();
  }, [accessToken]);

  // Fetch bookings data
  useEffect(() => {
    async function fetchData() {
      if (!accessToken) {
        setError("No access token found");
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const data: GetBookingsResponse = await getBookings(currentPage, itemsPerPage, accessToken);
        console.log("API Response:", data);

        if (data.bookingDetails) {
          setBookings(data.bookingDetails);
          setFilteredBookings(data.bookingDetails);
          setTotalPages(data.totalPages);
          setTotalCount(data.count || data.totalBookings);
        } else {
          setError("Failed to fetch bookings");
        }
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        setError(err.response?.data?.message || "Failed to fetch bookings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [currentPage, itemsPerPage, accessToken]);

  // Apply filters
  useEffect(() => {
    let updatedBookings = bookings;

    if (selectedProperty) {
      updatedBookings = updatedBookings.filter(
        (booking) => booking.property.name === selectedProperty
      );
    }

    if (searchQuery.trim()) {
      updatedBookings = updatedBookings.filter((booking) =>
        booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.reservationId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBookings(updatedBookings);
  }, [selectedProperty, searchQuery, bookings]);

  // Status configuration with icons
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    Confirmed: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: <CheckCircle className="w-3 h-3" />,
      variant: "secondary",
    },
    Pending: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-400",
      icon: <Clock className="w-3 h-3" />,
      variant: "outline",
    },
    Modified: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-400",
      icon: <AlertCircle className="w-3 h-3" />,
      variant: "default",
    },
    Cancelled: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-400",
      icon: <XCircle className="w-3 h-3" />,
      variant: "destructive",
    },
  };

  const getPropertyNames = (): string[] => {
    if (allHotelNames.length > 0) {
      console.log("Using hotel names from API:", allHotelNames);
      return allHotelNames;
    }
    const bookingPropertyNames = Array.from(
      new Set(bookings.map((booking) => booking.property.name))
    );
    console.log("Using property names from bookings:", bookingPropertyNames);
    return bookingPropertyNames;
  };

  const propertyNames = getPropertyNames();

  // Pagination handler
  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = Math.min(4, totalPages - 1);
      }
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Calculate showing range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);
  const showingText = `Showing ${startItem}-${endItem} of ${totalCount} bookings`;

  if (error) {
    return (
      <div className="min-h-screen md:mx-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container px-4 py-6 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center py-12">
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2 justify-center">
                  <XCircle className="w-5 h-5" />
                  Error Loading Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-500 dark:text-red-500 text-sm mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:mx-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container px-4 py-6 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/app">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-400 hover:text-tripswift-blue dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 p-2"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header Section */}
        <div className="mb-2 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-tripswift-blue dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Manage Bookings
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="p-2 sm:p-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
              All Bookings
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Manage and view all property bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-tripswift-blue animate-spin" />
                  <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Loading bookings...</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Primary Guest
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Property
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Dates
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Amount
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => (
                          <tr
                            key={booking.id}
                            className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                          >
                            <td className="px-2 sm:px-4 py-3 sm:py-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-tripswift-blue to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                                  {booking.guestName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100">
                                    {booking.guestName}
                                  </div>
                                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    {booking.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                                  {booking.property.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                  <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                                    {formatDateToDDMMYYYY(booking.checkIn)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                                  <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                                    {formatDateToDDMMYYYY(booking.checkOut)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {booking.totalAmount.toFixed(2)} {booking.currency}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                  <CreditCard className="w-3 h-3" />
                                  {getPaymentMethodDisplay(booking.paymentMethod)}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                              <Badge
                                variant={statusConfig[booking.status]?.variant || "outline"}
                                className="flex items-center gap-1 w-fit text-xs sm:text-sm"
                              >
                                {statusConfig[booking.status]?.icon}
                                <span className="capitalize">{booking.status}</span>
                              </Badge>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewBooking(booking.id)}
                                className="h-8 px-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-tripswift-blue dark:hover:text-blue-400 transition-colors duration-150"
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                <span className="text-xs sm:text-sm">View</span>
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-8 sm:py-12">
                            <div className="flex flex-col items-center gap-2 sm:gap-3">
                              <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400 dark:text-slate-600" />
                              <span className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-400">
                                No bookings found
                              </span>
                              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                                Try adjusting your search or filter criteria
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg">
            {/* Left side - Items per page */}
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>Show</span>
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 
                   focus:ring-1 focus:ring-tripswift-blue focus:border-transparent transition-all appearance-none pr-8 min-w-[80px]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Center - Page navigation */}
            <div className="flex items-center gap-1">
              {/* Previous button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 h-8 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Page numbers */}
              {generatePageNumbers().map((page, index) => (
                <div key={index}>
                  {page === '...' ? (
                    <span className="px-2 py-1 text-slate-400 dark:text-slate-500">...</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => goToPage(page as number)}
                      className={`px-3 py-1 h-8 text-sm transition-all ${currentPage === page
                        ? "bg-tripswift-blue text-white hover:bg-tripswift-blue/90"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                    >
                      {page}
                    </Button>
                  )}
                </div>
              ))}

              {/* Next button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 h-8 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Right side - Showing text */}
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {showingText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}