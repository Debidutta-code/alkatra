"use client";

import { useEffect, useState, useRef } from "react";
// import { makeBookingRequest } from "@/api/booking";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import {
  Calendar,
  CreditCard,
  User,
  CheckCircle,
  Home,
  Users,
  ArrowRight,
  Download,
  Mail,
} from "lucide-react";
import { formatDate, calculateNights } from "@/utils/dateUtils";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function PaymentSuccess() {
  const { t } = useTranslation(); // Initialize useTranslation hook
  const searchParams = useSearchParams();
  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const amountParam = searchParams.get("amount");
  const reference = searchParams.get("reference");
  const paymentMethod = searchParams.get("method") || "CREDIT_CARD";
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const propertyId = searchParams.get("PropertyId");

  // Parse guest counts from URL params
  const rooms = parseInt(searchParams.get("rooms") || "1", 10);
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);

  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    t("Payment.PaymentSuccess.errorMessageDefault")
  ); // Default error message
  const [isLoading, setIsLoading] = useState(true);
  const isRequestSent = useRef(false);
  const router = useRouter();

  // Get data from Redux
  const authUser = useSelector((state: any) => state.auth.user);
  const {
    property_id,
    room_id,
    checkInDate,
    checkOutDate,
    guestDetails,
    amount: reduxAmount,
  } = useSelector((state: any) => state.pmsHotelCard);

  // Combine data sources with priority order: Booking API > URL params > Redux > Default
  const amount = amountParam ? parseFloat(amountParam) : reduxAmount;

  useEffect(() => {
    // Prevent background scrolling
    document.body.style.overflow = 'auto';

    // If we have a reference, fetch the booking details

    if (reference) {
      const fetchBookingByReference = async () => {
        try {
          setIsLoading(true);
          const token = Cookies.get("accessToken");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/getreservation/${reference}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();
          console.log("Booking data received:", data);

          // Extract booking data depending on the structure
          const bookingData = data.booking || data.data || data;

          if (bookingData && bookingData._id) {
            setBooking(bookingData);
            toast.success(t("Payment.PaymentSuccess.bookingConfirmedToast"));
          } else {
            throw new Error(
              t("Payment.PaymentSuccess.invalidBookingDataStructure")
            );
          }
        } catch (error: any) {
          console.error("Error fetching booking:", error);
          setError(true);
          setErrorMessage(t("Payment.PaymentSuccess.fetchBookingError"));
          toast.error(t("Payment.PaymentSuccess.fetchBookingErrorToast"));
        } finally {
          setIsLoading(false);
        }
      };

      fetchBookingByReference();
      return;
    }

    // Rest of your existing code...
    if (
      !authUser ||
      !property_id ||
      !room_id ||
      !checkInDate ||
      !checkOutDate
    ) {
      setError(true);
      setErrorMessage(t("Payment.PaymentSuccess.missingBookingDetails"));
      toast.error(t("Payment.PaymentSuccess.missingBookingDetailsToast"));

      setTimeout(() => {
        router.push("/");
      }, 3000);
      return;
    }

    // Skip if a request was already sent
    if (!amount || !firstName || !lastName || !email || isRequestSent.current) {
      setIsLoading(false);
      return;
    }

    const handleBooking = async () => {
      // Your existing booking code...
      const token = Cookies.get("accessToken");
      const payload = {
        // Existing payload structure
        data: {
          type: "hotel-order",
          guests: [
            {
              tid: 1,
              title: "MR",
              firstName,
              lastName,
              phone: phone || guestDetails?.phone || "+33679278416",
              email,
            },
          ],
          travelAgent: {
            contact: {
              email: "support@ota.com",
            },
          },
          roomAssociations: [
            {
              guestReferences: [{ guestReference: "1" }],
              roomId: room_id,
            },
          ],
          payment: {
            method: paymentMethod,
            amount,
            ...(paymentMethod === "CREDIT_CARD" && {
              paymentCard: {
                paymentCardInfo: {
                  vendorCode: "VI",
                  cardNumber: "4151289722471370",
                  expiryDate: "2026-08",
                  holderName: `${firstName} ${lastName}`,
                },
              },
            }),
          },
          bookingDetails: {
            propertyId: property_id,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            userId: authUser?._id,
            // Add guest counts
            rooms: rooms,
            adults: adults,
            children: children,
          },
        },
      };

      try {
        isRequestSent.current = true;
        setIsLoading(true);
        // const response = await makeBookingRequest(payload, token as string);
        // setBooking(response);
        // toast.success(t("Payment.PaymentSuccess.bookingConfirmedToast"));
      } catch (error: any) {
        console.error("Booking Error:", error);
        setError(true);
        setErrorMessage(
          error?.message ||
          t("Payment.PaymentSuccess.bookingFailedDefaultMessage")
        );
        toast.error(t("Payment.PaymentSuccess.bookingFailedDefaultToast"));

        setTimeout(() => {
          router.push("/");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleBooking();
  }, [
    amount,
    firstName,
    lastName,
    email,
    property_id,
    room_id,
    checkInDate,
    checkOutDate,
    authUser,
    guestDetails,
    phone,
    paymentMethod,
    reference,
    router,
    rooms,
    adults,
    children,
    t,
  ]); // Added t to dependency array
  useEffect(() => {
    if (!booking || !booking._id) return;

    const propertyIdFinal = booking?.property?._id || property_id;
    const checkInFinal = booking?.checkInDate || checkInDate;
    const checkOutFinal = booking?.checkOutDate || checkOutDate;
    const roomsFinal = booking?.bookingDetails?.rooms || rooms || 1;
    const adultsFinal = booking?.bookingDetails?.adults || adults || 2;
    const childrenFinal = booking?.bookingDetails?.children || children || 0;

    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return "";
      return new Date(dateStr).toISOString().split("T")[0];
    };

    const checkIn = formatDate(checkInFinal);
    const checkOut = formatDate(checkOutFinal);

    const hotelUrl = `/hotel?id=${propertyIdFinal}&checkin=${checkIn}&checkout=${checkOut}&rooms=${roomsFinal}&adults=${adultsFinal}&children=${childrenFinal}`;
    const paymentSuccessUrl = `/payment-success?reference=${reference}&firstName=${firstName}&lastName=${lastName}&email=${email}&checkIn=${checkInDate}&checkOut=${checkOutDate}&propertyId=${property_id}&phone=${phone}&method=${paymentMethod}`;

    // Step 1: Push /hotel first (as previous page)
    window.history.pushState({}, "", hotelUrl);

    // Step 2: Replace visible URL to /payment-success
    window.history.replaceState({}, "", paymentSuccessUrl);

    // Step 3: Handle back button
    const handlePopState = (event: PopStateEvent) => {
      // When back is pressed, we go to hotel explicitly
      router.push(hotelUrl); // Push forces a stateful reload
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    booking,
    property_id,
    checkInDate,
    checkOutDate,
    rooms,
    adults,
    children,
    reference,
    amount,
    firstName,
    lastName,
    email,
    phone,
    paymentMethod,
    router,
  ]);
  const handleViewBookings = () => {
    router.replace("/my-trip"); // replaces current history entry
  };
  const handleViewHome = () => {
    router.replace("/")
  }
  const getPaymentMethodText = () => {
    if (!booking) return "";

    const method =
      booking.payment ||
      booking.paymentType ||
      booking.data?.payment?.method ||
      paymentMethod;

    switch (method) {
      case "CREDIT_CARD":
      case "card":
        return t("Payment.PaymentSuccess.paymentMethodCreditCard");
      case "payAtHotel":
        return t("Payment.PaymentSuccess.paymentMethodPayAtHotel");
      default:
        return method || t("Payment.PaymentSuccess.paymentMethodUnknown");
    }
  };

  const getGuestName = () => {
    if (booking?.booking_user_name) return booking.booking_user_name;

    if (booking?.guests && booking.guests[0]) {
      const guest = booking.guests[0];
      return `${guest.firstName || ""} ${guest.lastName || ""}`.trim();
    }

    return (
      `${firstName || ""} ${lastName || ""}`.trim() ||
      t("Payment.PaymentSuccess.guestDefaultName")
    );
  };

  const getBookingId = () => {
    return (
      booking?._id || reference || "TRS" + Math.floor(Math.random() * 10000000)
    );
  };

  const getBookingNights = () => {
    if (booking?.checkInDate && booking?.checkOutDate) {
      return calculateNights(booking.checkInDate, booking.checkOutDate);
    } else if (checkInDate && checkOutDate) {
      // Fallback to Redux/URL params if booking is not fully loaded yet
      return calculateNights(checkInDate, checkOutDate);
    }
    return 0; // Default if no dates are available
  };

  // Get guest count display
  const getGuestCountDisplay = () => {
    // First try from booking data if available
    if (booking?.bookingDetails) {
      const bookingRooms = booking.bookingDetails.rooms || 1;
      const bookingAdults = booking.bookingDetails.adults || 1;
      const bookingChildren = booking.bookingDetails.children || 0;

      return `${bookingRooms} ${bookingRooms === 1
        ? t("Payment.PaymentPageContent.bookingSummary.room")
        : t("Payment.PaymentPageContent.bookingSummary.rooms")
        } · ${bookingAdults} ${bookingAdults === 1
          ? t("Payment.PaymentPageContent.bookingSummary.adult")
          : t("Payment.PaymentPageContent.bookingSummary.adults")
        }${bookingChildren > 0
          ? ` · ${bookingChildren} ${bookingChildren === 1
            ? t("Payment.PaymentPageContent.bookingSummary.child")
            : t("Payment.PaymentPageContent.bookingSummary.children")
          }`
          : ""
        }`;
    }

    // Otherwise use URL params or defaults
    return `${rooms} ${rooms === 1
      ? t("Payment.PaymentPageContent.bookingSummary.room")
      : t("Payment.PaymentPageContent.bookingSummary.rooms")
      } · ${adults} ${adults === 1
        ? t("Payment.PaymentPageContent.bookingSummary.adult")
        : t("Payment.PaymentPageContent.bookingSummary.adults")
      }${children > 0
        ? ` · ${children} ${children === 1
          ? t("Payment.PaymentPageContent.bookingSummary.child")
          : t("Payment.PaymentPageContent.bookingSummary.children")
        }`
        : ""
      }`;
  };

  // Rest of your render code - significantly improved UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8] font-noto-sans">
      <div className="container mx-auto px-3 sm:px-4 pt-5 sm:pt-10 pb-12 sm:pb-20 relative z-10">
        {isLoading ? (
          <div className="bg-tripswift-off-white rounded-xl shadow-xl p-6 sm:p-12 text-center animate-pulse max-w-lg mx-auto mt-8 sm:mt-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-t-4 border-b-4 border-tripswift-blue rounded-full animate-spin mx-auto mb-6 sm:mb-8"></div>
            <h2 className="text-lg sm:text-xl font-tripswift-medium text-tripswift-black mb-3">
              {t("Payment.PaymentSuccess.processingBooking")}
            </h2>
            <p className="text-sm sm:text-base text-tripswift-black/60">
              {t("Payment.PaymentSuccess.confirmingReservation")}
            </p>
          </div>
        ) : error ? (
          <div className="bg-tripswift-off-white rounded-xl shadow-xl p-6 sm:p-12 text-center max-w-lg mx-auto mt-8 sm:mt-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-tripswift-bold text-tripswift-black mb-4">
              {t("Payment.PaymentSuccess.bookingFailedTitle")}
            </h2>
            <p className="text-sm sm:text-base text-tripswift-black/70 mb-6">{errorMessage}</p>
            <Link
              href="/"
              className="btn-tripswift-primary py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg inline-block transition-all duration-300 hover:shadow-lg text-sm sm:text-base"
            >
              {t("Payment.PaymentSuccess.returnToHomepage")}
            </Link>
          </div>
        ) : (
          <>
            {/* Success Card */}
            <div className="max-w-4xl mx-auto bg-tripswift-off-white rounded-xl shadow-xl overflow-hidden">
              {/* Top success banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-4 sm:py-8 px-4 sm:px-8 text-tripswift-off-white">
                <div className="flex items-center">
                  <div className="bg-tripswift-off-white/20 p-2 sm:p-3 rounded-full">
                    <CheckCircle size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-tripswift-bold text-tripswift-off-white">
                      {t("Payment.PaymentSuccess.bookingConfirmedTitle")}
                    </h1>
                    <p className="opacity-90 mt-1 text-sm sm:text-base">
                      {t("Payment.PaymentSuccess.reservationSuccessMessage")}
                    </p>
                  </div>
                </div>
                {/* <div className="mt-4 bg-white/10 py-2 px-4 rounded-md">
                  <div className="flex items-center">
                    <span className="text-sm">{t('Payment.PaymentSuccess.bookingId')}</span>
                    <span className="ml-2 font-tripswift-medium">{getBookingId()}</span>
                  </div>
                </div> */}
              </div>

              {/* Booking Details */}
              <div className="p-4 sm:p-6 md:p-8">
                {/* Summary Section */}
                <div className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-6 sm:pb-8">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-tripswift-bold text-tripswift-black mb-3 sm:mb-4">
                      {t("Payment.PaymentSuccess.bookingSummaryTitle")}
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start">
                        <Calendar
                          className="text-tripswift-blue mr-2 sm:mr-3 flex-shrink-0 mt"
                          size={18}
                        />
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t("Payment.PaymentSuccess.checkInLabel")}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {formatDate(booking?.checkInDate || checkInDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar
                          className="text-tripswift-blue mr-2 sm:mr-3 flex-shrink-0"
                          size={18}
                        />
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t("Payment.PaymentSuccess.checkOutLabel")}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {formatDate(booking?.checkOutDate || checkOutDate)}
                          </p>
                          <p className="text-xs text-tripswift-black/60 mt-1">
                            {getBookingNights()}{" "}
                            {getBookingNights() !== 1
                              ? t("Payment.PaymentSuccess.nights")
                              : t("Payment.PaymentSuccess.night")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Users
                          className="text-tripswift-blue mr-2 sm:mr-3 flex-shrink-0"
                          size={18}
                        />
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t("Payment.PaymentSuccess.guestsLabel")}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {getGuestCountDisplay()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 mt-4 md:mt-0">
                    <h2 className="text-lg sm:text-xl font-tripswift-bold text-tripswift-black mb-3 sm:mb-4">
                      {t("Payment.PaymentSuccess.guestInfoTitle")}
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start">
                        <User
                          className="text-tripswift-blue mr-2 sm:mr-3 flex-shrink-0"
                          size={18}
                        />
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t("Payment.PaymentSuccess.guestNameLabel")}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {getGuestName()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Mail
                          className="text-tripswift-blue mr-2 sm:mr-3 flex-shrink-0 mb-1"
                          size={18}
                        />
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t("Payment.PaymentSuccess.emailLabel")}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">{email}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CreditCard
                          className="text-tripswift-blue mr-2 sm:mr-3 flex-shrink-0 mb-1"
                          size={18}
                        />
                        <div>
                          <p className="text-xs sm:text-sm text-tripswift-black/60">
                            {t("Payment.PaymentSuccess.paymentMethodLabel")}
                          </p>
                          <p className="text-sm sm:text-base font-tripswift-medium">
                            {getPaymentMethodText()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Details Section */}
                <div className="py-4 sm:py-6 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-tripswift-bold text-tripswift-black mb-3 sm:mb-4">
                    {t("Payment.PaymentSuccess.paymentDetailsTitle")}
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    {/* Add per-night rate */}
                    {/* <div className="flex justify-between mb-2">
                      <span className="text-sm sm:text-base text-tripswift-black/70">
                        {t("Payment.PaymentSuccess.roomRate")}
                      </span>
                      <span className="text-sm sm:text-base font-tripswift-medium">
                        ₹
                        {Math.round(
                          amount / getBookingNights()
                        ).toLocaleString()}{" "}
                        {t("Payment.PaymentSuccess.perNight")}
                      </span>
                    </div> */}

                    {/* Show calculation */}
                    {/* <div className="flex justify-between mb-2">
                      <span className="text-sm sm:text-base text-tripswift-black/70">
                        {getBookingNights()}{" "}
                        {getBookingNights() === 1
                          ? t("Payment.PaymentSuccess.night")
                          : t("Payment.PaymentSuccess.nights")}
                      </span>
                      <span className="text-sm sm:text-base font-tripswift-medium">
                        ₹
                        {Math.round(
                          amount / getBookingNights()
                        ).toLocaleString()}{" "}
                        × {getBookingNights()}
                      </span>
                    </div> */}

                    <div className="border-t border-gray-200 my-2 pt-2"></div>
                    <div className="flex justify-between">

                    <span className="font-tripswift-bold text-base sm:text-lg text-tripswift-black">
                    {t("Payment.PaymentSuccess.total")}
                      </span>
                      <span className="font-tripswift-bold text-base sm:text-lg text-tripswift-blue">
                        ₹{amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-tripswift-black/50 text-right mt-1">
                      {getPaymentMethodText() ===
                        t("Payment.PaymentSuccess.paymentMethodPayAtHotel")
                        ? t("Payment.PaymentSuccess.paymentAtHotelMessage")
                        : t("Payment.PaymentSuccess.paymentProcessedMessage")}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleViewBookings}
                    className="btn-tripswift-primary py-3 px-6 rounded-lg flex-1 flex items-center justify-center gap-2 text-center font-tripswift-medium transition-all duration-300 hover:shadow-md"
                  >
                    <CheckCircle size={18} />
                    <span>{t("Payment.PaymentSuccess.viewMyBookings")}</span>
                    </button>
                  <button
                    onClick={handleViewHome}

                    className="bg-gray-100 text-tripswift-black py-3 px-6 rounded-lg flex-1 flex items-center justify-center gap-2 text-center font-tripswift-medium transition-colors duration-300 hover:bg-gray-200"
                  >
                    <Home size={18} />
                    <span>{t("Payment.PaymentSuccess.returnHome")}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="max-w-4xl mx-auto mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-tripswift-off-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-tripswift-bold text-tripswift-black mb-2 sm:mb-3">
                  {t("Payment.PaymentSuccess.whatsNextTitle")}
                </h3>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-tripswift-black/70">
                  <li className="flex items-start">
                    <span className="inline-block bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                      <CheckCircle size={12} className="sm:w-[14px] sm:h-[14px] text-green-600" />
                    </span>
                    {t("Payment.PaymentSuccess.confirmationEmailSent")}
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                      <CheckCircle size={12} className="sm:w-[14px] sm:h-[14px] text-green-600" />
                    </span>
                    {t("Payment.PaymentSuccess.viewBookingDetails")}
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                      <CheckCircle size={12} className="sm:w-[14px] sm:h-[14px] text-green-600" />
                    </span>
                    {t("Payment.PaymentSuccess.contactSupportForChanges")}
                  </li>
                </ul>

                {/* Download Booking button */}
                <button className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-2 border border-tripswift-blue/30 text-tripswift-blue bg-tripswift-blue/5 hover:bg-tripswift-blue/10 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-tripswift-medium transition-colors duration-300">
                  <Download size={14} className="sm:w-4 sm:h-4" />
                  {t("Payment.PaymentSuccess.downloadBookingConfirmation")}
                </button>
              </div>

              <div className="bg-tripswift-off-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-tripswift-bold text-tripswift-black mb-2 sm:mb-3">
                  {t("Payment.PaymentSuccess.needHelpTitle")}
                </h3>
                <p className="text-sm sm:text-base text-tripswift-black/70 mb-3 sm:mb-4">
                  {t("Payment.PaymentSuccess.customerServiceMessage")}
                </p>
                <button className="btn-tripswift-primary py-2 px-3 sm:px-4 rounded-lg w-full flex items-center justify-center gap-2 text-center font-tripswift-medium transition-all duration-300 text-xs sm:text-sm">
                  {t("Payment.PaymentSuccess.contactSupportButton")}
                </button>

                {/* Explore more hotels link */}
                <div className="mt-3 sm:mt-4 text-center">
                  <Link href="/" className="inline-flex items-center text-tripswift-blue hover:underline text-xs sm:text-sm transition-all duration-300">
                    {t("Payment.PaymentSuccess.exploreMoreHotels")}{" "}
                    <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}