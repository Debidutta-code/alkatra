"use client";

import CheckAuthentication from "@/components/check_authentication/CheckAuth";
import CheckoutPage from "@/components/Stripe/checkoutPage";
import PayAtHotelFunction from "@/components/paymentComponents/PayAtHotelFunction";
import PaymentOptionSelector from "@/components/paymentComponents/PaymentOptionSelector";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { formatDate, calculateNights } from "@/utils/dateUtils";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { Shield, CreditCard, CheckCircle, Clock, CalendarRange, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";

// Define RootState type based on your store's state shape
interface RootState {
  auth: {
    user: UserType | null;
    token?: string;
  };
}

// Define UserType
interface UserType {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  _id?: string;
}

// Don't create Stripe promise at module level
// Instead, create it on demand when user selects payment method

function PaymentPageContent() {
  const [loading, setLoading] = useState(true);
  const [paymentOption, setPaymentOption] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  const searchParams = useSearchParams();
  const authUser = useSelector((state: RootState) => state.auth.user);

  // Get booking parameters from URL
  const amount = parseInt(searchParams.get("amount") || "0", 10);
  const currency = searchParams.get("currency")?.toLowerCase() || "inr";
  const firstName = searchParams.get('firstName') || authUser?.firstName || '';
  const lastName = searchParams.get('lastName') || authUser?.lastName || '';
  const email = searchParams.get('email') || authUser?.email || '';
  const phone = searchParams.get('phone') || authUser?.phone || '';
  const roomId = searchParams.get('roomId') || '';
  const propertyId = searchParams.get('propertyId') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const userId = authUser?._id || searchParams.get('userId') || '';

  // Get guest counts from URL parameters
  const rooms = parseInt(searchParams.get('rooms') || '1', 10);
  const adults = parseInt(searchParams.get('adults') || '1', 10);
  const children = parseInt(searchParams.get('children') || '0', 10);

  // Calculate nights between check-in and check-out
  const nights = calculateNights(checkIn, checkOut);

  // Calculate rate per night
  const ratePerNight = amount / (nights || 1);

  // Compile all booking details in one object to pass to payment components
  const bookingDetails = {
    roomId,
    propertyId,
    amount: amount.toString(),
    currency,
    checkIn,
    checkOut,
    firstName,
    lastName,
    email,
    phone,
    userId,
    rooms,
    adults,
    children
  };

  // Initialize payment when payment method is selected
  const handleInitializePayment = async (option: string) => {
    setIsInitializing(true);
    setError(null);

    try {
      // Initialize Stripe
      if (!stripePromise) {
        if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
          throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
        }
        setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY));
      }

      // For Pay Now, create a payment intent
      if (option === 'payNow') {
        console.log("Creating payment intent for Pay Now option");
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/create-payment-intent`, {
          amount: convertToSubcurrency(amount),
          currency: currency
        });

        setClientSecret(response.data.clientSecret);
      }

      // We don't need to create a setup intent here for payAtHotel
      // That will be handled by the PayAtHotelFunction component

      setPaymentOption(option);
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      setError(err.response?.data?.message || "Failed to initialize payment method");
      setPaymentOption(null);
    } finally {
      setIsInitializing(false);
    }
  };

  // Add a loading or error state handler
  if (!searchParams || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8]">
        <div className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-tripswift-bold text-tripswift-black mb-4">Invalid Payment</h2>
          <p className="text-tripswift-black/70 mb-6">We couldn't process your payment due to missing information.</p>
          <Link href="/" className="btn-tripswift-primary py-3 px-8 rounded-lg inline-block transition-all duration-300 hover:shadow-lg">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CheckAuthentication setLoading={setLoading}>
      <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8] relative">
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8">
              {/* Payment Form - 3 columns */}
              <div className="md:col-span-3 space-y-6">
                {/* Booking Summary Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-tripswift-blue p-4 text-white">
                    <h2 className="font-tripswift-medium text-lg">Booking Summary</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between gap-6">
                      <div className="flex items-start space-x-3">
                        <CalendarRange className="text-tripswift-blue flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-tripswift-black/60">Stay Dates</p>
                          <p className="font-tripswift-medium">
                            {formatDate(checkIn, { weekday: 'short', month: 'short', day: 'numeric' })} - {formatDate(checkOut, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-tripswift-black/60">
                            {nights} {nights === 1 ? 'night' : 'nights'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Users className="text-tripswift-blue flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-tripswift-black/60">Guests</p>
                          <p className="font-tripswift-medium">
                            {rooms} {rooms === 1 ? 'Room' : 'Rooms'} · {adults} {adults === 1 ? 'Adult' : 'Adults'}
                            {children > 0 ? ` · ${children} ${children === 1 ? 'Child' : 'Children'}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <CheckCircle className="text-tripswift-blue flex-shrink-0" size={20} />
                        <div>
                          <p className="text-sm text-tripswift-black/60">Guest</p>
                          <p className="font-tripswift-medium">{firstName} {lastName}</p>
                          <p className="text-sm text-tripswift-black/60 truncate max-w-[200px]">{email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-tripswift-blue p-4 text-white">
                    <h2 className="font-tripswift-medium text-lg">Payment Method</h2>
                  </div>
                  <div className="p-6">
                    {/* Payment Option Selector */}
                    <div className="mb-6">
                      <PaymentOptionSelector
                        selectedOption={paymentOption}
                        onChange={handleInitializePayment}
                      />
                    </div>

                    {/* Initializing State */}
                    {isInitializing && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-tripswift-blue mb-4" />
                        <p className="text-sm text-tripswift-black/70">
                          Initializing payment method...
                        </p>
                      </div>
                    )}

                    {/* Error State */}
                    {error && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 mb-6">
                        <p className="font-medium">Payment Error</p>
                        <p className="text-sm mt-1">{error}</p>
                        <button
                          onClick={() => {
                            setError(null);
                            setPaymentOption(null);
                          }}
                          className="mt-3 py-2 px-4 bg-white border border-red-300 rounded-md text-sm hover:bg-red-50"
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    {/* Payment Form - Only render when payment option is selected and not initializing */}
                    {paymentOption && stripePromise && !isInitializing && !error && (
                      <div className="mt-6">
                        {paymentOption === 'payNow' && clientSecret ? (
                          <Elements
                            stripe={stripePromise}
                            options={{
                              clientSecret, // This is required for payment mode
                              appearance: {
                                theme: 'stripe',
                              },
                            }}
                          >
                            <CheckoutPage
                              amount={amount}
                              currency={currency}
                              firstName={firstName}
                              lastName={lastName}
                              email={email}
                              phone={phone as string}
                              clientSecret={clientSecret}
                              roomId={roomId}
                              propertyId={propertyId}
                              checkIn={checkIn}
                              checkOut={checkOut}
                              userId={userId}
                              rooms={rooms}
                              adults={adults}
                              children={children}
                            />
                          </Elements>
                        ) : (
                          <Elements
                            stripe={stripePromise}
                            options={{
                              mode: 'setup',
                              currency: currency, // Added currency here - this fixes the error
                              appearance: {
                                theme: 'stripe',
                              },
                            }}
                          >
                            <PayAtHotelFunction
                              bookingDetails={bookingDetails}
                            />
                          </Elements>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary - 2 columns */}
              <div className="md:col-span-2">
                <div className="md:sticky md:top-6 flex flex-col space-y-6">
                  {/* Price Details Card */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-tripswift-blue p-4 text-white">
                      <h2 className="font-tripswift-medium text-lg">Price Details</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="text-tripswift-black/70">Room Rate</div>
                          <div className="font-tripswift-medium">{currency.toUpperCase()} {ratePerNight.toLocaleString()} / night</div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-tripswift-black/70">{nights} {nights === 1 ? 'night' : 'nights'}</div>
                          <div className="font-tripswift-medium">{currency.toUpperCase()} {ratePerNight.toLocaleString()} × {nights}</div>
                        </div>

                        <div className="border-t border-gray-200 my-4"></div>
                        <div className="flex justify-between items-center">
                          <div className="font-tripswift-bold text-lg">Total</div>
                          <div className="font-tripswift-bold text-xl text-tripswift-blue">
                            {currency.toUpperCase()} {amount.toLocaleString()}
                          </div>
                        </div>

                        {paymentOption === 'payAtHotel' && (
                          <div className="bg-blue-50 p-3 rounded-lg mt-4">
                            <div className="flex items-start">
                              <Clock className="text-tripswift-blue flex-shrink-0 mt-1 mr-2" size={16} />
                              <p className="text-sm text-tripswift-black/70">
                                Your card will be securely stored, but payment will be collected at the hotel.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Security badges */}
                      <div className="mt-8 pt-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center">
                            <Shield className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm text-tripswift-black/70">Secure payments</span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm text-tripswift-black/70">We never store your full card details</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm text-tripswift-black/70">Free cancellation available</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center mt-6 space-x-4">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-6 opacity-70" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 opacity-70" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-70" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Need Help Card (moved inside sticky container) */}
                  {/* <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-3">Need Help?</h3>
                    <p className="text-tripswift-black/70 text-sm mb-4">
                      Our customer service team is available 24/7 to assist you with any questions about your booking.
                    </p>
                    <div className="text-tripswift-blue font-tripswift-medium cursor-pointer hover:underline">
                      Contact Support
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CheckAuthentication>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8]">
        <div className="p-8 bg-white rounded-xl shadow-xl max-w-md text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-tripswift-blue rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-tripswift-medium text-tripswift-black mb-3">Loading payment information...</h2>
          <p className="text-tripswift-black/60">Please wait while we prepare your checkout.</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}