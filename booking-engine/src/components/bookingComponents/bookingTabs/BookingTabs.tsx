"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { Booking, BookingTabType, PaginationResponse } from "./types";
import CancellationModal from "../../../components/bookingComponents/CancellationModal";
import AmendReservationModal from "../../../components/bookingComponents/AmendReservationModal";
import BookingHeader from "./BookingHeader";
import BookingTabsNavigation from "./BookingTabsNavigation";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import BookingCard from "./BookingCard";
import BookingPagination from "./BookingPagination";
import BookingDetailsModal from "./BookingDetailsModal";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

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
  const { t } = useTranslation();

  const [bookingsCache, setBookingsCache] = useState<{
    [key in BookingTabType]: {
      bookings: Booking[];
      totalBookings: number;
      totalPages: number;
      currentPage: number;
      loaded: boolean;
    }
  }>({
    all: { bookings: [], totalBookings: 0, totalPages: 1, currentPage: 1, loaded: false },
    upcoming: { bookings: [], totalBookings: 0, totalPages: 1, currentPage: 1, loaded: false },
    completed: { bookings: [], totalBookings: 0, totalPages: 1, currentPage: 1, loaded: false },
    cancelled: { bookings: [], totalBookings: 0, totalPages: 1, currentPage: 1, loaded: false },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancellationUI, setShowCancellationUI] = useState(false);
  const [showAmendUI, setShowAmendUI] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingTabType>('all');
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const authUser = useSelector((state: RootState) => state.auth.user);
  const token = Cookies.get("accessToken");
  const router = useRouter();

  const currentTabData = bookingsCache[activeTab];
  const currentBookings = currentTabData.bookings;
  const currentPage = currentTabData.currentPage;
  const totalPages = currentTabData.totalPages;
  const totalBookings = currentTabData.totalBookings;

  useEffect(() => {
    const handlePopState = () => {
      router.replace("/");
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const fetchBookings = useCallback(async (
    tab: BookingTabType,
    page: number = 1,
    isTabChange: boolean = false
  ) => {
    if (!authUser?._id) {
      setError(t("BookingTabs.userNotLoggedIn"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching bookings for tab: ${tab}, page: ${page}, filterData:`, tab === 'all' ? '' : tab);

      const response = await axios.get<PaginationResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/customers/booking/details/${authUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: page,
            limit: itemsPerPage,
            filterData: tab === 'all' ? '' : tab,
          },
        }
      );

      console.log(`API Response for ${tab}:`, {
        bookingsCount: response.data.bookings?.length || 0,
        totalBookings: response.data.totalBookings,
        totalPages: response.data.totalPages
      });

      setBookingsCache(prev => ({
        ...prev,
        [tab]: {
          bookings: response.data.bookings || [],
          totalBookings: response.data.totalBookings || 0,
          totalPages: response.data.totalPages || 1,
          currentPage: page,
          loaded: true,
        }
      }));

      setLoading(false);
    } catch (err) {
      console.error(`Error fetching bookings for ${tab}:`, err);
      setError(t("BookingTabs.noBooking"));
      setLoading(false);

      setBookingsCache(prev => ({
        ...prev,
        [tab]: {
          bookings: [],
          totalBookings: 0,
          totalPages: 1,
          currentPage: page,
          loaded: true,
        }
      }));
    }
  }, [authUser, token, itemsPerPage, t]);

  useEffect(() => {
    if (!currentTabData.loaded) {
      fetchBookings(activeTab, currentPage, currentPage === 1);
    }
  }, [activeTab, currentPage, fetchBookings, currentTabData.loaded]);

  const handleTabChange = (newTab: BookingTabType) => {
    setActiveTab(newTab);
    setError(null);
    setBookingsCache(prev => ({
      ...prev,
      [newTab]: {
        ...prev[newTab],
        currentPage: 1,
        loaded: false,
      }
    }));
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setBookingsCache(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          currentPage: pageNumber,
          loaded: false,
        }
      }));
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);

    setBookingsCache(prev => ({
      all: { ...prev.all, loaded: false, currentPage: 1 },
      upcoming: { ...prev.upcoming, loaded: false, currentPage: 1 },
      completed: { ...prev.completed, loaded: false, currentPage: 1 },
      cancelled: { ...prev.cancelled, loaded: false, currentPage: 1 },
    }));
  };

  const handleCancellationComplete = (bookingId: string) => {
    setBookingsCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(tab => {
        newCache[tab as BookingTabType] = {
          ...newCache[tab as BookingTabType],
          bookings: newCache[tab as BookingTabType].bookings.map(booking =>
            booking._id === bookingId
              ? { ...booking, status: "Cancelled" }
              : booking
          ),
          loaded: false,
        };
      });
      return newCache;
    });

    if (selectedBooking && selectedBooking._id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        status: "Cancelled"
      });
    }

    setShowCancellationUI(false);

    fetchBookings(activeTab, currentPage, true);
  };

  const handleAmendmentComplete = (bookingId: string, amendedData: any) => {
    setBookingsCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(tab => {
        newCache[tab as BookingTabType] = {
          ...newCache[tab as BookingTabType],
          bookings: newCache[tab as BookingTabType].bookings.map(booking =>
            booking._id === bookingId
              ? {
                ...booking,
                checkInDate: amendedData.checkInDate,
                checkOutDate: amendedData.checkOutDate,
                ratePlanCode: amendedData.ratePlanCode,
                roomTypeCode: amendedData.roomTypeCode,
                numberOfRooms: amendedData.numberOfRooms,
                totalAmount: amendedData.roomTotalPrice,
                currencyCode: amendedData.currencyCode,
                guestDetails: amendedData.guests,
                status: 'Modified',
              }
              : booking
          ),
          loaded: false,
        };
      });
      return newCache;
    });

    if (selectedBooking && selectedBooking._id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        checkInDate: amendedData.checkInDate,
        checkOutDate: amendedData.checkOutDate,
        ratePlanCode: amendedData.ratePlanCode,
        roomTypeCode: amendedData.roomTypeCode,
        numberOfRooms: amendedData.numberOfRooms,
        totalAmount: amendedData.roomTotalPrice,
        currencyCode: amendedData.currencyCode,
        guestDetails: amendedData.guests,
        status: 'Modified',
      });
    }

    setShowAmendUI(false);

    fetchBookings(activeTab, currentPage, true);
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

  return (
    <div className="w-full min-h-screen bg-gray-50 font-noto-sans">
      {/* Header Section */}
      <BookingHeader />

      <div className="container w-full mx-auto px-4 py-8 md:py-12 -mt-6">
        {/* Tabs Navigation */}
        <BookingTabsNavigation activeTab={activeTab} setActiveTab={handleTabChange} />

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState errorMessage={error} />
        ) : !currentBookings || currentBookings.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  activeTab={activeTab}
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
          <div className="bg-tripswift-off-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative">
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