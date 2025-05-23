"use client";

import { useEffect, useState, useRef } from "react";
import { makeBookingRequest } from "@/api/booking";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Calendar, CreditCard, User, CheckCircle, Home, Users, ArrowRight, Download, Mail } from "lucide-react";
import { formatDate, calculateNights } from "@/utils/dateUtils";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const amountParam = searchParams.get("amount");
  const reference = searchParams.get("reference");
  const paymentMethod = searchParams.get("method") || "CREDIT_CARD";

  // Parse guest counts from URL params
  const rooms = parseInt(searchParams.get('rooms') || '1', 10);
  const adults = parseInt(searchParams.get('adults') || '1', 10);
  const children = parseInt(searchParams.get('children') || '0', 10);

  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to complete booking. Please try again.");
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
    // If we have a reference, fetch the booking details
    if (reference) {
      const fetchBookingByReference = async () => {
        try {
          setIsLoading(true);
          const token = Cookies.get("accessToken");
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/getreservation/${reference}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          console.log("Booking data received:", data);

          // Extract booking data depending on the structure
          const bookingData = data.booking || data.data || data;

          if (bookingData && bookingData._id) {
            setBooking(bookingData);
            toast.success("Booking confirmed!");
          } else {
            throw new Error("Invalid booking data structure");
          }
        } catch (error: any) {
          console.error("Error fetching booking:", error);
          setError(true);
          setErrorMessage("Could not retrieve booking details. Please check My Bookings.");
          toast.error("Could not retrieve booking details");
        } finally {
          setIsLoading(false);
        }
      };

      fetchBookingByReference();
      return;
    }

    // Rest of your existing code...
    if (!authUser || !property_id || !room_id || !checkInDate || !checkOutDate) {
      setError(true);
      setErrorMessage("Missing required booking details. Please try again.");
      toast.error("Missing required booking details. Please try again.");

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
            children: children
          },
        },
      };

      try {
        isRequestSent.current = true;
        setIsLoading(true);
        const response = await makeBookingRequest(payload, token as string);
        setBooking(response);
        toast.success("Booking confirmed!");
      } catch (error: any) {
        console.error("Booking Error:", error);
        setError(true);
        setErrorMessage(error?.message || "Failed to complete booking. Please try again.");
        toast.error("Failed to complete booking. Please try again.");

        setTimeout(() => {
          router.push("/");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleBooking();
  }, [amount, firstName, lastName, email, property_id, room_id, checkInDate, checkOutDate, authUser, guestDetails, phone, paymentMethod, reference, router, rooms, adults, children]);

  const getPaymentMethodText = () => {
    if (!booking) return "";

    const method = booking.payment ||
      booking.paymentType ||
      (booking.data?.payment?.method) ||
      paymentMethod;

    switch (method) {
      case "CREDIT_CARD":
      case "card":
        return "Credit Card";
      case "payAtHotel":
        return "Pay at Hotel";
      default:
        return method || "Unknown";
    }
  };

  const getGuestName = () => {
    if (booking?.booking_user_name) return booking.booking_user_name;

    if (booking?.guests && booking.guests[0]) {
      const guest = booking.guests[0];
      return `${guest.firstName || ''} ${guest.lastName || ''}`.trim();
    }

    return `${firstName || ''} ${lastName || ''}`.trim() || "Guest";
  };

  const getBookingId = () => {
    return booking?._id || reference || "TRS" + Math.floor(Math.random() * 10000000);
  };

  const getBookingNights = () => {
    if (booking?.checkInDate && booking?.checkOutDate) {
      return calculateNights(booking.checkInDate, booking.checkOutDate);
    } else {
      return calculateNights(checkInDate, checkOutDate);
    }
  };

  // Get guest count display
  const getGuestCountDisplay = () => {
    // First try from booking data if available
    if (booking?.bookingDetails) {
      const bookingRooms = booking.bookingDetails.rooms || 1;
      const bookingAdults = booking.bookingDetails.adults || 1;
      const bookingChildren = booking.bookingDetails.children || 0;

      return `${bookingRooms} ${bookingRooms === 1 ? 'Room' : 'Rooms'} · ${bookingAdults} ${bookingAdults === 1 ? 'Adult' : 'Adults'}${bookingChildren > 0 ? ` · ${bookingChildren} ${bookingChildren === 1 ? 'Child' : 'Children'}` : ''
        }`;
    }

    // Otherwise use URL params or defaults
    return `${rooms} ${rooms === 1 ? 'Room' : 'Rooms'} · ${adults} ${adults === 1 ? 'Adult' : 'Adults'}${children > 0 ? ` · ${children} ${children === 1 ? 'Child' : 'Children'}` : ''
      }`;
  };

  // Rest of your render code - significantly improved UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8]">
      <div className="container mx-auto px-4 pt-10 pb-20 relative z-10">
        {isLoading ? (
          <div className="bg-tripswift-off-white rounded-xl shadow-xl p-12 text-center animate-pulse max-w-lg mx-auto mt-16">
            <div className="w-20 h-20 border-t-4 border-b-4 border-tripswift-blue rounded-full animate-spin mx-auto mb-8"></div>
            <h2 className="text-xl font-tripswift-medium text-tripswift-black mb-3">Processing your booking...</h2>
            <p className="text-tripswift-black/60">We're confirming your reservation. This should only take a moment.</p>
          </div>
        ) : error ? (
          <div className="bg-tripswift-off-white rounded-xl shadow-xl p-12 text-center max-w-lg mx-auto mt-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-tripswift-bold text-tripswift-black mb-4">Booking Failed</h2>
            <p className="text-tripswift-black/70 mb-6">{errorMessage}</p>
            <Link href="/" className="btn-tripswift-primary py-3 px-8 rounded-lg inline-block transition-all duration-300 hover:shadow-lg">
              Return to Homepage
            </Link>
          </div>
        ) : (
          <>
            {/* Success Card */}
            <div className="max-w-4xl mx-auto bg-tripswift-off-white rounded-xl shadow-xl overflow-hidden">
              {/* Top success banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-8 px-8 text-white">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full">
                    <CheckCircle size={32} />
                  </div>
                  <div className="ml-4">
                    <h1 className="text-3xl font-tripswift-bold">Booking Confirmed!</h1>
                    <p className="opacity-90 mt-1">Your reservation has been successfully completed</p>
                  </div>
                </div>
                {/* <div className="mt-4 bg-white/10 py-2 px-4 rounded-md">
                  <div className="flex items-center">
                    <span className="text-sm">Booking ID:</span>
                    <span className="ml-2 font-tripswift-medium">{getBookingId()}</span>
                  </div>
                </div> */}
              </div>

              {/* Booking Details */}
              <div className="p-8">
                {/* Summary Section */}
                <div className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-8">
                  <div className="flex-1">
                    <h2 className="text-xl font-tripswift-bold text-tripswift-black mb-4">Booking Summary</h2>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Calendar className="text-tripswift-blue mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-tripswift-black/60">Check-in</p>
                          <p className="font-tripswift-medium">{formatDate(booking?.checkInDate || checkInDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="text-tripswift-blue mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-tripswift-black/60">Check-out</p>
                          <p className="font-tripswift-medium">{formatDate(booking?.checkOutDate || checkOutDate)}</p>
                          <p className="text-xs text-tripswift-black/60">{getBookingNights()} night{getBookingNights() !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Users className="text-tripswift-blue mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-tripswift-black/60">Guests</p>
                          <p className="font-tripswift-medium">
                            {getGuestCountDisplay()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-tripswift-bold text-tripswift-black mb-4">Guest Information</h2>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <User className="text-tripswift-blue mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-tripswift-black/60">Guest Name</p>
                          <p className="font-tripswift-medium">{getGuestName()}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Mail className="text-tripswift-blue mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-tripswift-black/60">Email</p>
                          <p className="font-tripswift-medium">{email}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CreditCard className="text-tripswift-blue mr-3 flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-tripswift-black/60">Payment Method</p>
                          <p className="font-tripswift-medium">{getPaymentMethodText()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Details Section */}
                {/* Replace the current Price Details section in payment-success/page.tsx */}
                <div className="py-6 border-b border-gray-200">
                  <h2 className="text-xl font-tripswift-bold text-tripswift-black mb-4">Payment Details</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {/* Add per-night rate */}
                    <div className="flex justify-between mb-2">
                      <span className="text-tripswift-black/70">Room Rate</span>
                      <span className="font-tripswift-medium">₹{Math.round(amount / getBookingNights()).toLocaleString()} / night</span>
                    </div>

                    {/* Show calculation */}
                    <div className="flex justify-between mb-2">
                      <span className="text-tripswift-black/70">{getBookingNights()} {getBookingNights() === 1 ? 'night' : 'nights'}</span>
                      <span className="font-tripswift-medium">₹{Math.round(amount / getBookingNights()).toLocaleString()} × {getBookingNights()}</span>
                    </div>

                    <div className="border-t border-gray-200 my-2 pt-2"></div>
                    <div className="flex justify-between">
                      <span className="font-tripswift-bold text-lg text-tripswift-black">Total</span>
                      <span className="font-tripswift-bold text-lg text-tripswift-blue">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-tripswift-black/50 text-right mt-1">
                      {getPaymentMethodText() === "Pay at Hotel" ?
                        "Payment will be collected at the hotel" :
                        "Payment has been processed"
                      }
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <Link href="/my-trip" className="btn-tripswift-primary py-3 px-6 rounded-lg flex-1 flex items-center justify-center gap-2 text-center font-tripswift-medium transition-all duration-300 hover:shadow-md">
                    <CheckCircle size={18} />
                    <span>View My Bookings</span>
                  </Link>
                  <Link href="/" className="bg-gray-100 text-tripswift-black py-3 px-6 rounded-lg flex-1 flex items-center justify-center gap-2 text-center font-tripswift-medium transition-colors duration-300 hover:bg-gray-200">
                    <Home size={18} />
                    <span>Return Home</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="max-w-4xl mx-auto mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-tripswift-off-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-3">What's Next?</h3>
                <ul className="space-y-3 text-tripswift-black/70">
                  <li className="flex items-start">
                    <span className="inline-block bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                      <CheckCircle size={14} className="text-green-600" />
                    </span>
                    A confirmation email has been sent to your inbox
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                      <CheckCircle size={14} className="text-green-600" />
                    </span>
                    You can view booking details in your account anytime
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                      <CheckCircle size={14} className="text-green-600" />
                    </span>
                    Need to make changes? Contact us 24/7 for support
                  </li>
                </ul>

                {/* Download Booking button */}
                <button className="mt-4 w-full flex items-center justify-center gap-2 border border-tripswift-blue/30 text-tripswift-blue bg-tripswift-blue/5 hover:bg-tripswift-blue/10 py-2 px-4 rounded-lg text-sm font-tripswift-medium transition-colors">
                  <Download size={16} />
                  Download Booking Confirmation
                </button>
              </div>

              <div className="bg-tripswift-off-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-3">Need Help?</h3>
                <p className="text-tripswift-black/70 mb-4">Our customer service team is available 24/7 to assist you with any questions.</p>
                <button className="btn-tripswift-primary py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 text-center font-tripswift-medium transition-all duration-300">
                  Contact Support
                </button>

                {/* Explore more hotels link */}
                <div className="mt-4 text-center">
                  <Link href="/hotel-listing" className="inline-flex items-center text-tripswift-blue hover:underline text-sm">
                    Explore more hotel options <ArrowRight size={14} className="ml-1" />
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