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

  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to complete booking. Please try again.");
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
    propertyName, // Assuming you have this in your Redux store
    roomType // Assuming you have this in your Redux store
  } = useSelector((state: any) => state.pmsHotelCard);

  // Use amount from URL or fallback to Redux
  const amount = amountParam ? parseFloat(amountParam) : reduxAmount;

  useEffect(() => {
    if (!authUser || !property_id || !room_id || !checkInDate || !checkOutDate || !guestDetails) {
      setError(true);
      setErrorMessage("Missing required booking details. Please try again.");
      toast.error("Missing required booking details. Please try again.");
      
      // Redirect to home after 3 seconds if there's an error
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [authUser, property_id, room_id, checkInDate, checkOutDate, guestDetails, router]);

  useEffect(() => {
    if (!amount || !firstName || !lastName || !email || isRequestSent.current) return;

    const handleBooking = async () => {
      const token = Cookies.get("accessToken");
      const guestInfo = { firstName, lastName, email };
      const payload = {
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
            method: "CREDIT_CARD",
            amount,
            // Note: In a production environment, you should NOT include 
            // credit card details here. This should be handled securely by your payment processor.
            paymentCard: {
              paymentCardInfo: {
                vendorCode: "VI",
                cardNumber: "4151289722471370",
                expiryDate: "2026-08",
                holderName: `${firstName} ${lastName}`, 
              },
            },
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
        const response = await makeBookingRequest(payload, token as string);
        setBooking(response);
        toast.success("Booking confirmed!");
      } catch (error: any) {
        console.error("Booking Error:", error);
        setError(true);
        setErrorMessage(error?.message || "Failed to complete booking. Please try again.");
        toast.error("Failed to complete booking. Please try again.");
        
        // Redirect to home after 3 seconds if there's an error
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    handleBooking();
  }, [amount, firstName, lastName, email, property_id, room_id, checkInDate, checkOutDate, authUser, guestDetails, phone, router]);

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute w-80 h-80 bg-white opacity-10 rounded-full blur-3xl top-20 left-10 animate-blob"></div>
      <div className="absolute w-96 h-96 bg-white opacity-10 rounded-full blur-3xl bottom-10 right-10 animate-blob animation-delay-2000"></div>
      
      {booking ? (
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
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
                We've received your payment of <span className="font-semibold">${amount}</span>
              </p>
            </div>
            
            {/* Booking details */}
            <div className="border-t border-white/20 pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Booking Reference</p>
                  <p className="font-medium text-lg">{booking?.confirmationNumber || booking?.id || "Confirmed"}</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Guest Name</p>
                  <p className="font-medium text-lg">{firstName} {lastName}</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Check-in Date</p>
                  <p className="font-medium text-lg">{formatDate(checkInDate)}</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Check-out Date</p>
                  <p className="font-medium text-lg">{formatDate(checkOutDate)}</p>
                </div>
                
                {propertyName && (
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Property</p>
                    <p className="font-medium text-lg">{propertyName}</p>
                  </div>
                )}
                
                {roomType && (
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">Room Type</p>
                    <p className="font-medium text-lg">{roomType}</p>
                  </div>
                )}
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
        </div>
      ) : (
        <div className="bg-white/20 backdrop-blur-lg p-8 rounded-lg shadow-lg w-11/12 sm:w-2/3 md:w-1/3 mx-auto text-center">
          {!error ? (
            <>
              <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl text-white font-medium">Processing your booking...</p>
              <p className="text-sm text-gray-300 mt-3">This may take a few moments.</p>
            </>
          ) : (
            <>
              <div className="bg-red-500/20 p-4 rounded-full mx-auto w-fit">
                <svg className="w-14 h-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
                </svg>
              </div>
              <p className="text-xl text-white mt-6 font-medium">{errorMessage}</p>
              <p className="text-sm text-gray-300 mt-3">Redirecting to home page...</p>
            </>
          )}
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

// "use client";
// import { useEffect, useState, useRef } from "react";
// import { makeBookingRequest } from "@/api/booking";
// import Cookies from "js-cookie";
// import toast from "react-hot-toast";
// import { useRouter, useSearchParams } from "next/navigation";
// import BookingDetails from "@/components/bookingComponents/BookingDetails";
// import { useSelector } from "react-redux";

// export default function PaymentSuccess() {
//   const searchParams = useSearchParams();
//   const firstName = searchParams.get("firstName") || "";
//   const lastName = searchParams.get("lastName") || "";
//   const email = searchParams.get("email") || "";

//   const [booking, setBooking] = useState<any>(null);
//   const [error, setError] = useState(false);
//   const isRequestSent = useRef(false);
//   const router = useRouter();

//   // Get data from Redux
//   const authUser = useSelector((state: any) => state.auth.user);                     
//   const { property_id, room_id, checkInDate, checkOutDate, guestDetails, amount } = useSelector((state: any) => state.pmsHotelCard);

//   useEffect(() => {
//     if (!authUser || !property_id || !room_id || !checkInDate || !checkOutDate || !guestDetails) {
//       setError(true);
//       toast.error("Missing required booking details. Please try again.");
//     }
//   }, [authUser, property_id, room_id, checkInDate, checkOutDate, guestDetails]);

//   useEffect(() => {
//     if (!amount || !firstName || !lastName || !email || isRequestSent.current) return;

//     const handleBooking = async () => {
//       const token = Cookies.get("accessToken");
//       const guestInfo = { firstName, lastName, email };
//       const payload = {
//         data: {
//           type: "hotel-order",
//           guests: [
//             {
//               tid: 1,
//               title: "MR",
//               firstName,
//               lastName,
//               phone: guestDetails.phone || "+33679278416",
//               email,
//             },
//           ],
//           travelAgent: {
//             contact: {
//               email: "support@ota.com",
//             },
//           },
//           roomAssociations: [
//             {
//               guestReferences: [{ guestReference: "1" }],
//               roomId: room_id,
//             },
//           ],
//           payment: {
//             method: "CREDIT_CARD",
//             amount,
//             paymentCard: {
//               paymentCardInfo: {
//                 vendorCode: "VI",
//                 cardNumber: "4151289722471370",
//                 expiryDate: "2026-08",
//                 holderName: `${firstName} ${lastName}`, 
//               },
//             },
//           },
//           bookingDetails: {
//             propertyId: property_id,
//             checkInDate: checkInDate,
//             checkOutDate: checkOutDate,
//             userId: authUser?._id,
//           },
//         },
//       };

//       try {
//         isRequestSent.current = true;
//         const response = await makeBookingRequest(payload, token as string);
//         setBooking(response);
//         toast.success("Booking confirmed!");
//         setTimeout(() => {
//           router.push("/");
//         }, 3000);
//       } catch (error) {
//         console.error("Booking Error:", error);
//         setError(true);
//         toast.error("Failed to complete booking. Please try again.");
//       }
//     };

//     handleBooking();
//   }, [amount, firstName, lastName, email, property_id, room_id, checkInDate, checkOutDate, authUser, guestDetails, router]);

//   return (
//     <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden p-4">
//       {/* Background decorative elements */}
//       <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-white opacity-10 rounded-full blur-3xl top-10 left-5 md:top-20 md:left-10 animate-blob"></div>
//       <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-white opacity-10 rounded-full blur-3xl bottom-5 right-5 md:bottom-10 md:right-10 animate-blob animation-delay-2000"></div>
      
//       {booking ? (
//         <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl mx-auto">
//           <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-10 w-full">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//               {/* Success message section */}
//               <div className="lg:col-span-1 flex flex-col items-center lg:items-start">
//                 <div className="relative">
//                   <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500/20 rounded-full flex items-center justify-center">
//                     <svg className="w-12 h-12 md:w-16 md:h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
//                     </svg>
//                   </div>
//                 </div>
//                 <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mt-6 text-center lg:text-left">
//                   Thank you for your booking!
//                 </h1>
//                 <p className="text-base md:text-lg text-gray-200 mt-4 text-center lg:text-left">
//                   We've received your payment of <span className="font-semibold">${amount}</span> and your booking has been confirmed.
//                 </p>
//                 <button 
//                   onClick={() => router.push("/")}
//                   className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 w-full md:w-auto"
//                 >
//                   Return to Homepage
//                 </button>
//               </div>
              
//               {/* Booking details section */}
//               <div className="lg:col-span-2 bg-white/5 rounded-xl p-6">
//                 <h2 className="text-xl font-bold text-white mb-4">Booking Details</h2>
//                 {booking && <BookingDetails booking={booking} amount={amount} />}
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-white/10 backdrop-blur-lg p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-center">
//           {error ? (
//             <div className="flex flex-col items-center">
//               <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//               </svg>
//               <h2 className="text-xl font-bold text-white mb-2">Booking Failed</h2>
//               <p className="text-gray-200">Failed to complete booking. Please try again.</p>
//               <button 
//                 onClick={() => router.push("/")}
//                 className="mt-6 px-6 py-2 bg-white text-indigo-900 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
//               >
//                 Return to Homepage
//               </button>
//             </div>
//           ) : (
//             <div className="flex flex-col items-center">
//               <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin mb-4"></div>
//               <p className="text-lg text-white font-medium">Processing your booking...</p>
//               <p className="text-sm text-gray-300 mt-2">Please wait while we confirm your reservation.</p>
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Animation styles */}
//       <style jsx global>{`
//         @keyframes blob {
//           0% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//           100% { transform: translate(0px, 0px) scale(1); }
//         }
//         .animate-blob { animation: blob 7s infinite; }
//         .animation-delay-2000 { animation-delay: 2s; }
//       `}</style>
//     </main>
//   );
// }