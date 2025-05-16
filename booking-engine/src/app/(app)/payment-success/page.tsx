"use client";

import { useEffect, useState, useRef } from "react";
import { makeBookingRequest } from "@/api/booking";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const amountParam = searchParams.get("amount");
  const reference = searchParams.get("reference");
  const paymentMethod = searchParams.get("method") || "CREDIT_CARD";
  
  // URL params for property/room details
  const propertyNameParam = searchParams.get("propertyName") || "";
  const roomTypeParam = searchParams.get("roomType") || "";
  const roomNameParam = searchParams.get("roomName") || "";

  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to complete booking. Please try again.");
  const [isLoading, setIsLoading] = useState(true);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  const [roomDetails, setRoomDetails] = useState<any>(null);
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
    propertyName: reduxPropertyName, 
    roomType: reduxRoomType,
    roomName: reduxRoomName 
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
            
            // Fetch property and room details if IDs are available
            if (bookingData.property) {
              fetchPropertyDetails(bookingData.property);
            }
            
            if (bookingData.room) {
              fetchRoomDetails(bookingData.room);
            }
            
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
        // Existing payload
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
          },
        },
      };

      try {
        isRequestSent.current = true;
        setIsLoading(true);
        const response = await makeBookingRequest(payload, token as string);
        setBooking(response);
        
        // Fetch property and room details
        if (property_id) fetchPropertyDetails(property_id);
        if (room_id) fetchRoomDetails(room_id);
        
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
  }, [amount, firstName, lastName, email, property_id, room_id, checkInDate, checkOutDate, authUser, guestDetails, phone, paymentMethod, reference, router]);

  // New functions to fetch property and room details
  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/property/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Property data:", data);
        setPropertyDetails(data.property || data);
      }
    } catch (error) {
      console.error("Error fetching property details:", error);
    }
  };

  const fetchRoomDetails = async (roomId: string) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Room data:", data);
        setRoomDetails(data.room || data);
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
    }
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPaymentMethodText = () => {
    if (!booking) return "";
    
    const method = booking.payment || 
                  booking.paymentType || 
                  (booking.data?.payment?.method) || 
                  paymentMethod;
    
    switch(method) {
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

  // Determine property and room display values with fallback hierarchy
  const getPropertyName = () => {
    // Priority: API data > URL param > Redux store > Default
    if (propertyDetails?.property_name) return propertyDetails.property_name;
    if (booking?.property?.property_name) return booking.property.property_name;
    if (propertyNameParam) return propertyNameParam;
    if (reduxPropertyName) return reduxPropertyName;
    return "Your Selected Property";
  };

  const getRoomType = () => {
    // Priority: API data > URL param > Redux store > Default
    if (roomDetails?.room_type) return roomDetails.room_type;
    if (booking?.room?.room_type) return booking.room.room_type;
    if (roomTypeParam) return roomTypeParam;
    if (reduxRoomType) return reduxRoomType;
    return "Standard Room";
  };

  const getRoomName = () => {
    // Priority: API data > URL param > Redux store > Default
    if (roomDetails?.room_name) return roomDetails.room_name;
    if (booking?.room?.room_name) return booking.room.room_name;
    if (roomNameParam) return roomNameParam;
    if (reduxRoomName) return reduxRoomName;
    return "Your Selected Room";
  };

  // Rest of your render code...
  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute w-80 h-80 bg-white opacity-10 rounded-full blur-3xl top-20 left-10 animate-blob"></div>
      <div className="absolute w-96 h-96 bg-white opacity-10 rounded-full blur-3xl bottom-10 right-10 animate-blob animation-delay-2000"></div>
      
      {!isLoading && (booking || error) ? (
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
          {!error ? (
            <div className="bg-white/20 backdrop-blur-lg rounded-lg shadow-lg w-full md:w-2/3 p-8 text-white">
              {/* Success header */}
              <div className="flex flex-col items-center mb-8">
                <div className="bg-green-500/20 p-4 rounded-full">
                  <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mt-4 text-center">Thank you for your booking!</h1>
                <p className="text-lg text-center mt-2">
                  {getPaymentMethodText() === "Pay at Hotel" ? (
                    <>Your card details have been securely stored.<br />Payment of <span className="font-semibold">${amount}</span> will be processed at the hotel.</>
                  ) : (
                    <>We've received your payment of <span className="font-semibold">${amount}</span></>
                  )}
                </p>
              </div>
              
              {/* Booking details */}
              <div className="border-t border-white/20 pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Guest Name */}
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Guest Name</p>
                    <p className="font-medium text-lg">{getGuestName()}</p>
                  </div>
                  
                  {/* Payment Method */}
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Payment Method</p>
                    <p className="font-medium text-lg">{getPaymentMethodText()}</p>
                  </div>
                  
                  {/* Check-in Date */}
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Check-in Date</p>
                    <p className="font-medium text-lg">{formatDate(booking?.checkInDate || checkInDate)}</p>
                  </div>
                  
                  {/* Check-out Date */}
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Check-out Date</p>
                    <p className="font-medium text-lg">{formatDate(booking?.checkOutDate || checkOutDate)}</p>
                  </div>
                  
                  {/* Property Name */}
                  {/* <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Property</p>
                    <p className="font-medium text-lg">{getPropertyName()}</p>
                  </div> */}
                  
                  {/* Room Type */}
                  {/* <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Room Type</p>
                    <p className="font-medium text-lg">{getRoomType()}</p>
                  </div> */}
                  
                  {/* Room Name */}
                  {/* <div className="bg-white/10 p-4 rounded-lg col-span-2">
                    <p className="text-gray-300 text-sm">Room Name</p>
                    <p className="font-medium text-lg">{getRoomName()}</p>
                  </div> */}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Link href="/my-trip" className="bg-white text-purple-900 py-3 px-6 rounded-md font-semibold text-center hover:bg-gray-100 transition-colors duration-300">
                  View My Bookings
                </Link>
                <Link href="/" className="bg-transparent border border-white text-white py-3 px-6 rounded-md font-semibold text-center hover:bg-white/10 transition-colors duration-300">
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-lg p-8 rounded-lg shadow-lg w-11/12 sm:w-2/3 md:w-1/3 mx-auto text-center">
              <div className="bg-red-500/20 p-4 rounded-full mx-auto w-fit">
                <svg className="w-14 h-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
                </svg>
              </div>
              <p className="text-xl text-white mt-6 font-medium">{errorMessage}</p>
              <p className="text-sm text-gray-300 mt-3">Redirecting to home page...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/20 backdrop-blur-lg p-8 rounded-lg shadow-lg w-11/12 sm:w-2/3 md:w-1/3 mx-auto text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-white font-medium">Processing your booking...</p>
          <p className="text-sm text-gray-300 mt-3">This may take a few moments.</p>
        </div>
      )}
      
      {/* Animation styles */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </main>
  );
}