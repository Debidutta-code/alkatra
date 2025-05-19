"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { format, parseISO } from "date-fns";
import { FaCalendarCheck, FaCalendarTimes, FaUser, FaPhone, FaHotel, FaChevronLeft, FaChevronRight, FaEdit } from "react-icons/fa";
import CancellationModal from "@/components/bookingComponents/CancellationModal";
import AmendReservationModal from "@/components/bookingComponents/AmendReservationModal";

interface RootState {
  auth: {
    user: UserType | null;
  };
}

interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

// Add payment and paymentType to your Booking interface
interface Booking {
  _id: string;
  property: {
    _id: string;
    property_name: string;
  };
  room: {
    _id: string;
    room_name: string;
    room_type: string;
    room_type_code?: string;
  };
  booking_user_name: string;
  booking_user_phone: string;
  amount: number;
  booking_dates: string;
  status: string;
  payment?: string;        // Add this field
  paymentType?: string;    // Add this field
  checkInDate: string;
  checkOutDate: string;
  adultCount?: number;
  childCount?: number;
  specialRequests?: string;
  ratePlanCode?: string;
  ratePlanName?: string;
}

interface PaginationResponse {
  bookingDetails: Booking[];
  totalBookings: number;
  totalPages: number;
  currentPage: number;
}

export default function BookingTabs() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancellationUI, setShowCancellationUI] = useState(false);
  const [showAmendUI, setShowAmendUI] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  const authUser = useSelector((state: RootState) => state.auth.user);
  const token = Cookies.get("accessToken");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!authUser?._id) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<PaginationResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/customers/booking/details/${authUser?._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page: currentPage,
              limit: itemsPerPage
            }
          }
        );

        setBookings(response.data.bookingDetails);
        setTotalBookings(response.data.totalBookings);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError("There is no booking");
        setLoading(false);
      }
    };

    fetchBookings();
  }, [authUser, token, currentPage, itemsPerPage]);

  const formatDateString = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Function to handle cancellation completion
  const handleCancellationComplete = (bookingId: string) => {
    // Update the booking status in the list
    setBookings(prevBookings => prevBookings.map(booking =>
      booking._id === bookingId
        ? { ...booking, status: "Cancelled" }
        : booking
    ));

    // Update selected booking if it's the one that was cancelled
    if (selectedBooking && selectedBooking._id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        status: "Cancelled"
      });
    }

    // Close cancellation UI
    setShowCancellationUI(false);
  };

  // Function to handle amendment completion
  const handleAmendmentComplete = (bookingId: string, amendedData: any) => {
    // Update booking in the list with the amended data
    setBookings(prevBookings => prevBookings.map(booking =>
      booking._id === bookingId
        ? {
          ...booking,
          checkInDate: amendedData.timeSpan.start,
          checkOutDate: amendedData.timeSpan.end,
          adultCount: amendedData.guestCounts.adultCount,
          childCount: amendedData.guestCounts.childCount,
          room: {
            ...booking.room,
            room_type: amendedData.roomType.roomTypeName,
            room_type_code: amendedData.roomType.roomTypeCode
          },
          specialRequests: amendedData.comments,
          ratePlanCode: amendedData.ratePlan.ratePlanCode,
          ratePlanName: amendedData.ratePlan.ratePlanName,
          amount: amendedData.rateInfo.totalBeforeTax
        }
        : booking
    ));

    // Update selected booking if it's the one that was amended
    if (selectedBooking && selectedBooking._id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        checkInDate: amendedData.timeSpan.start,
        checkOutDate: amendedData.timeSpan.end,
        room: {
          ...selectedBooking.room,
          room_type: amendedData.roomType.roomTypeName,
          room_type_code: amendedData.roomType.roomTypeCode
        }
      });
    }

    // Close amendment UI
    setShowAmendUI(false);
  };

  // Function to determine status color class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Function to handle view details button click
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
    setShowCancellationUI(false);
    setShowAmendUI(false);
  };

  // Function to handle initiating the cancellation process
  const handleStartCancellation = () => {
    if (selectedBooking && selectedBooking.status === "Confirmed") {
      setShowCancellationUI(true);
      setShowAmendUI(false);
    }
  };

  // Function to handle initiating the amendment process
  const handleStartAmendment = () => {
    if (selectedBooking && selectedBooking.status === "Confirmed") {
      setShowAmendUI(true);
      setShowCancellationUI(false);
    }
  };

  // Pagination functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  const maxPageButtons = 5; // Maximum number of page buttons to show

  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Calculate indexes for display text
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalBookings);

  const getPaymentMethodText = (booking: Booking) => {
    // First, check for specific payment methods with nice formatting
    if (booking.payment === "payAtHotel" || booking.paymentType === "payAtHotel") {
      return "Pay at Hotel";
    }
    
    if (booking.payment === "CREDIT_CARD" || booking.payment === "card") {
      return "Credit Card (Prepaid)";
    }
    
    if (booking.payment === "cash") {
      return "Cash";
    }
    
    if (booking.payment === "payNow") {
      return "Paid Online";
    }
    
    if (booking.payment === "other") {
      return "Other Payment Method";
    }
    
    // If we reach this point, try to display the raw value with better formatting
    if (booking.payment) {
      // Convert camelCase or snake_case to Title Case with spaces
      const formatted = booking.payment
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/_/g, ' ')         // Replace underscores with spaces
        .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
        
      return formatted;
    }
    
    if (booking.paymentType) {
      // Same formatting for paymentType
      const formatted = booking.paymentType
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^\w/, c => c.toUpperCase());
        
      return formatted;
    }
    
    return "Payment Method Not Specified";
  };

  return (
    <div className="w-full px-4 py-8 bg-gradient-to-r from-gray-50 to-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-center font-bold mb-6 md:mb-10 text-gray-900">
          Your Hotel Bookings
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin h-8 w-8 md:h-12 md:w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
            <p className="text-center text-red-500 text-lg font-medium">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
            <p className="text-center text-gray-500 text-lg">No bookings found</p>
            <div className="mt-4 flex justify-center">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Book a Hotel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                      <FaHotel className="mr-2 flex-shrink-0" />
                      <span className="truncate">{booking.property.property_name}</span>
                    </h2>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Status Badge */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col space-y-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusClass(booking.status)}`}
                        >
                          {booking.status}
                        </span>

                        {/* Payment Type Badge */}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${(booking.payment === "payAtHotel" || booking.paymentType === "payAtHotel")
                            ? "bg-purple-100 text-purple-800 border-purple-300"
                            : "bg-blue-100 text-blue-800 border-blue-300"
                          }`}>
                          {getPaymentMethodText(booking)}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-green-600">${booking.amount}</span>
                    </div>

                    {/* Guest Info */}
                    <div className="border-b border-gray-100 pb-3 mb-3">
                      <p className="flex items-center text-gray-700 font-medium">
                        <FaUser className="mr-2 text-gray-600 flex-shrink-0" />
                        <span className="truncate">{booking.booking_user_name}</span>
                      </p>
                      <p className="flex items-center text-gray-600 text-sm mt-1">
                        <FaPhone className="mr-2 text-gray-500 flex-shrink-0" />
                        {booking.booking_user_phone}
                      </p>
                    </div>

                   {/* Room Details */}
<div className="mb-3">
  <p className="text-gray-700">
    <span className="font-medium">Room:</span>{" "}
    {booking.room && booking.room.room_name 
      ? booking.room.room_name 
      : "Room Name Not Available"}
  </p>
  <p className="text-gray-700">
    <span className="font-medium">Type:</span>{" "}
    {booking.room && booking.room.room_type 
      ? booking.room.room_type 
      : "Standard Room"}
  </p>
</div>

                    {/* Dates */}
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center">
                        <FaCalendarCheck className="mr-2 text-green-500 flex-shrink-0" />
                        <span className="font-medium mr-1">Check-in:</span> {formatDateString(booking.checkInDate)}
                      </p>
                      <p className="flex items-center">
                        <FaCalendarTimes className="mr-2 text-red-500 flex-shrink-0" />
                        <span className="font-medium mr-1">Check-out:</span> {formatDateString(booking.checkOutDate)}
                      </p>
                      <p className="flex items-center text-gray-500">
                        <FaCalendarCheck className="mr-2 flex-shrink-0" />
                        <span className="font-medium mr-1">Booked:</span> {formatDateString(booking.booking_dates)}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="bg-gray-50 p-3 border-t border-gray-100">
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                      onClick={() => handleViewDetails(booking)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value={6}>6 per page</option>
                  <option value={9}>9 per page</option>
                  {/* <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option> */}
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  <FaChevronLeft size={14} />
                </button>

                {totalPages > maxPageButtons && currentPage > 2 && (
                  <>
                    <button
                      onClick={() => goToPage(1)}
                      className="w-10 h-10 rounded-md bg-white text-gray-700 hover:bg-gray-100"
                    >
                      1
                    </button>
                    {currentPage > 3 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </>
                )}

                {pageNumbers.map(number => (
                  <button
                    key={number}
                    onClick={() => goToPage(number)}
                    className={`w-10 h-10 rounded-md ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    {number}
                  </button>
                ))}

                {totalPages > maxPageButtons && currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="w-10 h-10 rounded-md bg-white text-gray-700 hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  <FaChevronRight size={14} />
                </button>
              </div>

              <div className="mt-4 sm:mt-0 text-sm text-gray-600">
                {totalBookings > 0
                  ? `Showing ${indexOfFirstItem}-${indexOfLastItem} of ${totalBookings} bookings`
                  : 'No bookings to show'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details/Amendment/Cancellation Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {showCancellationUI
                    ? "Cancel Booking"
                    : showAmendUI
                      ? "Amend Booking"
                      : "Booking Details"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowCancellationUI(false);
                    setShowAmendUI(false);
                  }}
                  className="text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content - Show appropriate UI based on state */}
            {!showCancellationUI && !showAmendUI ? (
              // Regular booking details view
              <div className="p-6">
                {/* Property & Status */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedBooking.property.property_name}</h3>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusClass(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Guest Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Guest Information</h4>
                    <p className="flex items-center">
                      <FaUser className="mr-3 text-blue-600" />
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{selectedBooking.booking_user_name}</span>
                    </p>
                    <p className="flex items-center">
                      <FaPhone className="mr-3 text-green-600" />
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{selectedBooking.booking_user_phone}</span>
                    </p>
                  </div>

                  {/* Room Details */}
                  {/* Add to the Room Details section in the modal */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">Room Details</h4>
                    <p>
                      <span className="font-medium">Room Name:</span>
                      <span className="ml-2">{selectedBooking.room.room_name}</span>
                    </p>
                    <p>
                      <span className="font-medium">Room Type:</span>
                      <span className="ml-2">{selectedBooking.room.room_type}</span>
                    </p>

                    {/* Payment Method */}
                    <p>
                      <span className="font-medium">Payment Method:</span>
                      <span className="ml-2">
                        {getPaymentMethodText(selectedBooking)}
                      </span>
                    </p>

                    <p className="text-lg font-semibold text-green-600">
                      <span className="font-medium">Total Amount:</span>
                      <span className="ml-2">${selectedBooking.amount}</span>
                    </p>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Stay Details</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-gray-500">Check-in Date</p>
                        <p className="flex items-center text-gray-800 font-semibold">
                          <FaCalendarCheck className="mr-2 text-green-500" />
                          {formatDateString(selectedBooking.checkInDate)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-gray-500">Check-out Date</p>
                        <p className="flex items-center text-gray-800 font-semibold">
                          <FaCalendarTimes className="mr-2 text-red-500" />
                          {formatDateString(selectedBooking.checkOutDate)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-sm text-gray-500">Booking Date</p>
                        <p className="flex items-center text-gray-800 font-semibold">
                          <FaCalendarCheck className="mr-2 text-gray-500" />
                          {formatDateString(selectedBooking.booking_dates)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Now with Amend option */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  {selectedBooking.status === "Confirmed" && (
                    <>
                      <button
                        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        onClick={handleStartAmendment}
                      >
                        <FaEdit className="mr-2" />
                        Amend Booking
                      </button>
                      <button
                        className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        onClick={handleStartCancellation}
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}
                  <button
                    className="w-full sm:w-auto bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => window.print()}
                  >
                    Print Details
                  </button>
                  {/* <button 
                    className="w-full sm:w-auto bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button> */}
                </div>
              </div>
            ) : showCancellationUI ? (
              // Cancellation UI
              <CancellationModal
                booking={selectedBooking}
                onClose={() => setShowCancellationUI(false)}
                onCancellationComplete={handleCancellationComplete}
              />
            ) : (
              // Amendment UI
              <AmendReservationModal
                booking={selectedBooking}
                onClose={() => setShowAmendUI(false)}
                onAmendComplete={handleAmendmentComplete}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}