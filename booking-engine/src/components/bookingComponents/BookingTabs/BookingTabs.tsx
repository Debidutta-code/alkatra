"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { Booking, BookingTabType, PaginationResponse } from "./types";
import { parseISO } from "date-fns";
import CancellationModal from "@/components/bookingComponents/CancellationModal";
import AmendReservationModal from "@/components/bookingComponents/AmendReservationModal";
import BookingHeader from "./BookingHeader";
import BookingTabsNavigation from "./BookingTabsNavigation";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import BookingCard from "./BookingCard";
import BookingPagination from "./BookingPagination";
import BookingDetailsModal from "./BookingDetailsModal";

interface RootState {
  auth: {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    } | null;
  };
}

export default function BookingTabs() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancellationUI, setShowCancellationUI] = useState(false);
  const [showAmendUI, setShowAmendUI] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingTabType>('all');

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

  // Filter bookings based on active tab
  useEffect(() => {
    const today = new Date();
    
    if (activeTab === 'all') {
      setFilteredBookings(bookings);
    } else if (activeTab === 'upcoming') {
      setFilteredBookings(bookings.filter(booking => {
        const checkoutDate = parseISO(booking.checkOutDate);
        return checkoutDate >= today && booking.status !== 'Cancelled';
      }));
    } else if (activeTab === 'completed') {
      setFilteredBookings(bookings.filter(booking => {
        const checkoutDate = parseISO(booking.checkOutDate);
        return checkoutDate < today && booking.status !== 'Cancelled';
      }));
    } else if (activeTab === 'cancelled') {
      setFilteredBookings(bookings.filter(booking => booking.status === 'Cancelled'));
    }
  }, [activeTab, bookings]);

  // Function to handle cancellation completion
  const handleCancellationComplete = (bookingId: string) => {
    setBookings(prevBookings => prevBookings.map(booking =>
      booking._id === bookingId
        ? { ...booking, status: "Cancelled" }
        : booking
    ));

    if (selectedBooking && selectedBooking._id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        status: "Cancelled"
      });
    }

    setShowCancellationUI(false);
  };

  // Function to handle amendment completion
  const handleAmendmentComplete = (bookingId: string, amendedData: any) => {
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

    setShowAmendUI(false);
  };

  // Function to handle view details button click
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
    setShowCancellationUI(false);
    setShowAmendUI(false);
  };

  // Function to handle modify booking
  const handleModifyBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
    setShowAmendUI(true);
    setShowCancellationUI(false);
  };

  // Function to handle cancel booking
  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
    setShowCancellationUI(true);
    setShowAmendUI(false);
  };

  // Pagination page change handler
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Items per page change handler
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <BookingHeader />

      <div className="container mx-auto px-4 py-8 md:py-12 -mt-6">
        {/* Tabs Navigation */}
        <BookingTabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState errorMessage={error} />
        ) : filteredBookings.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onModify={handleModifyBooking}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <BookingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalBookings={totalBookings}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            {showCancellationUI ? (
              <CancellationModal
                booking={selectedBooking}
                onClose={() => setShowCancellationUI(false)}
                onCancellationComplete={handleCancellationComplete}
              />
            ) : showAmendUI ? (
              <AmendReservationModal
                booking={selectedBooking}
                onClose={() => setShowAmendUI(false)}
                onAmendComplete={handleAmendmentComplete}
              />
            ) : (
              <BookingDetailsModal
                booking={selectedBooking}
                onClose={() => setShowModal(false)}
                onAmend={() => setShowAmendUI(true)}
                onCancel={() => setShowCancellationUI(true)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}