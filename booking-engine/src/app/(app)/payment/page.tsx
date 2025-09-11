"use client";

import CheckAuthentication from "../../../components/checkAuthentication/CheckAuth";
import CheckoutPage from "../../../components/Stripe/checkoutPage";
import PayAtHotelFunction from "../../../components/paymentComponents/PayAtHotelFunction";
import PaymentOptionSelector from "../../../components/paymentComponents/PaymentOptionSelector";
import convertToSubcurrency from "../../../lib/convertToSubcurrency";
import PayWithCryptoQR from "../../../components/paymentComponents/payWithCrypto/PayWithCryptoQR";
import { formatDate, calculateNights } from "../../../utils/dateUtils";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Shield, CreditCard, CheckCircle, Clock, CalendarRange, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { RootState } from "@/Redux/store";

interface UserType {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  _id?: string;
}

interface Guest {
  firstName: string;
  lastName: string;
  dob?: string;
  type?: "adult" | "child" | "infant";
}

function PaymentPageContent() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [paymentOption, setPaymentOption] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const pmsHotelCard = useSelector((state: RootState) => state.pmsHotelCard);

  // Get booking parameters from URL
  // const amount = isNaN(parseInt(searchParams.get("amount") || "0", 10)) ? 0 : parseInt(searchParams.get("amount") || "0", 10); 
  // const currency = searchParams.get("currency")?.toLowerCase() || "";
  // const firstName = searchParams.get('firstName') || authUser?.firstName || '';
  // const lastName = searchParams.get('lastName') || authUser?.lastName || '';
  // const email = searchParams.get('email') || authUser?.email || '';
  // const phone = searchParams.get('phone') || authUser?.phone || '';
  // const roomId = searchParams.get('roomId') || '';
  // const propertyId = searchParams.get('propertyId') || '';
  // const checkIn = searchParams.get('checkIn') || '';
  // const checkOut = searchParams.get('checkOut') || '';
  // const userId = authUser?._id || searchParams.get('userId') || '';
  // const hotelName = searchParams.get('hotelName');
  // const hotelCode = searchParams.get('hotelCode');
  // const ratePlanCode = searchParams.get('ratePlanCode')?.toUpperCase() || '';
  // const roomType = searchParams.get('roomType') || '';

  // // Get guest counts from URL parameters
  // const rooms = parseInt(searchParams.get('rooms') || '1', 10);
  // const adults = parseInt(searchParams.get('adults') || '1', 10);
  // const children = parseInt(searchParams.get('children') || '0', 10);
  // const infants = parseInt(searchParams.get('infants') || '0', 10);
  // const amountFromRedux = useSelector((state: any) => state.pmsHotelCard.amount);
  // console.log(`>>>>>>>>>>>>>>>>>###################The amount we get from Redux is: ${amountFromRedux}`);

  const guestDetails = useSelector(
    (state: RootState) => state.pmsHotelCard.guestDetails
  );
  const firstName = guestDetails?.guests?.[0]?.firstName || "";
  const lastName = guestDetails?.guests?.[0]?.lastName || "";
  const email = guestDetails?.email || "";
  const phone = guestDetails?.phone || "";

  const currency = (pmsHotelCard?.currency || "").toLowerCase();
  const hotelCode = pmsHotelCard?.hotelCode || "";
  const ratePlanCode = pmsHotelCard?.ratePlanCode || "";
  const roomType = pmsHotelCard?.roomType || "";

  const roomId = pmsHotelCard.room_id || "";
  const propertyId = pmsHotelCard.property_id || "";
  const checkIn = pmsHotelCard.checkInDate || "";
  const checkOut = pmsHotelCard.checkOutDate || "";
  const userId = authUser?._id || searchParams.get("userId") || "";
  const hotelName = pmsHotelCard?.hotelName || "";

  // Get guest counts
  console.log(
    "?????????????????????????????????????????????currency:",
    currency
  );
  const amountFromRedux = useSelector(
    (state: RootState) => state.pmsHotelCard.amount || 0
  );
  const rooms = guestDetails?.rooms || 0;
  const adults = guestDetails?.adults || 0;
  const children = guestDetails?.children || 0;
  const infants = guestDetails?.infants || 0;

  // const amountFromRedux = useSelector((state: any) => state.pmsHotelCard.amount);
  console.log(
    `>>>>>>>>>>>>>>>>>###################The amount we get from Redux is: ${amountFromRedux}`
  );
  const { i18n } = useTranslation();
  const amount = amountFromRedux ?? 0;
  console.log(`<><><><><><><><><><><><>The amount we are Getting from amountFromRedux is: ${amount.toFixed(2)}`);
  // const guests: Guest[] = (() => {
  //   try {
  //     const guestsStr = searchParams.get('guests');
  //     if (!guestsStr) {
  //       console.warn('No guests query parameter provided');
  //       return [{ firstName: firstName || 'Guest', lastName: lastName || 'User', type: 'adult', dob: '' }];
  //     }
  //     const parsed = JSON.parse(decodeURIComponent(guestsStr));
  //     if (!Array.isArray(parsed) || parsed.length === 0) {
  //       console.warn('Guests query parameter is empty or not an array:', parsed);
  //       return [{ firstName: firstName || 'Guest', lastName: lastName || 'User', type: 'adult', dob: '' }];
  //     }
  //     return parsed.map((guest: any) => ({
  //       firstName: guest.firstName || '',
  //       lastName: guest.lastName || '',
  //       dob: guest.dob || '',
  //       type: ['adult', 'child', 'infant'].includes(guest.type) ? guest.type : 'adult'
  //     }));
  //   } catch (error) {
  //     console.error('Failed to parse guests:', error);
  //     return [{ firstName: firstName || 'Guest', lastName: lastName || 'User', type: 'adult', dob: '' }];
  //   }
  // })();
  const guests = useSelector(
    (state: any) => state.pmsHotelCard.guestDetails.guests
  );

  const nights = calculateNights(checkIn, checkOut);

  const numericAmount = amount || 0;
  // const ratePerNight = nights > 0 ? (numericAmount / nights) : 0;

  const bookingDetails = {
    roomId,
    propertyId,
    amount,
    currency,
    checkIn,
    checkOut,
    firstName,
    lastName,
    email,
    phone,
    userId,
    hotelName,
    hotelCode,
    ratePlanCode,
    roomType,
    rooms,
    adults,
    children,
    infants,
    guests,
    paymentOption

  };
  console.log("Booking details:", JSON.stringify(bookingDetails, null, 2));

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8] font-noto-sans">
        <div className="text-center p-8 bg-tripswift-off-white rounded-xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-tripswift-bold text-tripswift-black mb-4">{t('Payment.PaymentPageContent.invalidPayment.title')}</h2>
          <p className="text-tripswift-black/70 mb-6">{t('Payment.PaymentPageContent.invalidPayment.message')}</p>
          <Link href="/" className="btn-tripswift-primary py-3 px-8 rounded-lg inline-block transition-all duration-300 hover:shadow-lg">
            {t('Payment.PaymentPageContent.invalidPayment.returnToHomepage')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CheckAuthentication setLoading={setLoading}>
      <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8] relative font-noto-sans">
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8">
              {/* Payment Form - 3 columns */}
              <div className="md:col-span-3 space-y-6">
                {/* Booking Summary Card */}
                <div className="bg-tripswift-off-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-tripswift-blue p-4 text-tripswift-off-white">
                    <h2 className="font-tripswift-medium text-lg">{t('Payment.PaymentPageContent.bookingSummary.title')}</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between gap-6">
                      <div className={`flex items-start`}>
                        <CalendarRange className={`text-tripswift-blue flex-shrink-0`} size={20} />
                        <div className={`${i18n.language === "ar" ? "mr-3" : "ml-3"} flex-1 min-w-0 ${i18n.language === "es" ? "md:min-w-[200px]" : ""}`}>
                          <p className="text-sm text-tripswift-black/60">{t('Payment.PaymentPageContent.bookingSummary.stayDates')}</p>
                          <p className={`text-sm md:text-xs lg:text-sm text-tripswift-black/60 break-words leading-tight ${i18n.language === "ar" ? "text-right" : "text-left"}`}>
                            {i18n.language === "ar" ? (
                              <>
                                {formatDate(checkOut, { weekday: 'short', month: 'short', day: 'numeric' })} - {formatDate(checkIn, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </>
                            ) : (
                              <>
                                {formatDate(checkIn, { weekday: 'short', month: 'short', day: 'numeric' })} - {formatDate(checkOut, { weekday: 'short', month: 'short', day: 'numeric' })}
                              </>
                            )}
                          </p>
                          <p className="text-sm text-tripswift-black/60">
                            {nights} {nights === 1 ? t('Payment.PaymentPageContent.bookingSummary.night') : t('Payment.PaymentPageContent.bookingSummary.nights')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Users className="text-tripswift-blue flex-shrink-0" size={20} />
                        <div className={`${i18n.language === "ar" ? "mr-3" : "ml-3"} flex-1 min-w-0`}>
                          <p className="text-sm text-tripswift-black/60">{t('Payment.PaymentPageContent.bookingSummary.guests')}</p>

                          {/* Line 1: Rooms and Adults */}
                          <div className="text-sm text-tripswift-black/60 flex flex-wrap gap-x-1 gap-y-1">
                            <span>· {rooms} {rooms === 1 ? t('Payment.PaymentPageContent.bookingSummary.room') : t('Payment.PaymentPageContent.bookingSummary.rooms')}</span>
                            <span>· {adults} {adults === 1 ? t('Payment.PaymentPageContent.bookingSummary.adult') : t('Payment.PaymentPageContent.bookingSummary.adults')}</span>
                          </div>

                          {/* Line 2: Children and Infants */}
                          {(children > 0 || infants > 0) && (
                            <div className="text-sm text-tripswift-black/60 flex flex-wrap gap-x-1 gap-y-1 mt-1">
                              {children > 0 && (
                                <span>
                                  · {children} {children === 1 ? t('Payment.PaymentPageContent.bookingSummary.child') : t('Payment.PaymentPageContent.bookingSummary.children')}
                                </span>
                              )}
                              {infants > 0 && (
                                <span>
                                  · {infants} {infants === 1 ? t('Payment.PaymentPageContent.bookingSummary.infant') : t('Payment.PaymentPageContent.bookingSummary.infants')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start ">
                        <CheckCircle className="text-tripswift-blue flex-shrink-0" size={20} />
                        <div className={` ${i18n.language === "ar" ? "mr-3" : "ml-3"}`}>
                          <p className="text-sm text-tripswift-black/60">{t('Payment.PaymentPageContent.bookingSummary.guest')}</p>
                          <p className="text-sm text-tripswift-black/60 truncate max-w-[200px]">{guests[0]?.firstName} {guests[0]?.lastName}</p>
                          <p className="text-sm text-tripswift-black/60 truncate max-w-[200px]">{email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details Card */}
                <div className="bg-tripswift-off-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-tripswift-blue p-4 text-tripswift-off-white">
                    <h2 className="font-tripswift-medium text-lg">{t('Payment.PaymentPageContent.paymentMethod.title')}</h2>
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
                          className="mt-3 py-2 px-4 bg-tripswift-off-white border border-red-300 rounded-lg text-sm font-tripswift-medium hover:bg-red-50 transition-all duration-300"
                        >
                          Try Again
                        </button>
                      </div>
                    )}

                    {/* Payment Form - Only render when payment option is selected and not initializing */}
                    {paymentOption && stripePromise && !isInitializing && !error && (
                      <div className="mt-6">
                        {paymentOption === "payNow" && clientSecret ? (
                          <Elements
                            stripe={stripePromise}
                            options={{
                              clientSecret,
                              appearance: {
                                theme: "stripe",
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
                        ) : paymentOption === "payAtHotel" ? (
                          <Elements
                            stripe={stripePromise}
                            options={{
                              mode: "setup",
                              currency: currency,
                              appearance: {
                                theme: "stripe",
                              },
                            }}
                          >
                            <PayAtHotelFunction
                              bookingDetails={{
                                ...bookingDetails,
                                hotelName: bookingDetails.hotelName ?? undefined // Convert null to undefined
                              }}
                            />
                          </Elements>
                        ) : paymentOption === "payWithCrypto-payWithQR" ? (
                          <PayWithCryptoQR
                            bookingDetails={bookingDetails}
                            onConvertedAmountChange={setConvertedAmount}
                          />
                        ) : paymentOption === "payWithCrypto" ? (
                          <div className="bg-tripswift-off-white p-4 rounded-lg shadow-md">
                            <p className="text-sm text-tripswift-black/70">
                              {t("Payment.PaymentPageContent.selectCryptoMethod") || "Please select a crypto payment method above."}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary - 2 columns */}
              <div className="md:col-span-2">
                <div className="md:sticky md:top-6 flex flex-col space-y-6">
                  {/* Price Details Card */}
                  <div className="bg-tripswift-off-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-tripswift-blue p-4 text-tripswift-off-white">
                      <h2 className="font-tripswift-medium text-lg">{t('Payment.PaymentPageContent.priceDetails.title')}</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {/* <div className="flex justify-between items-center">

                          <div className="text-tripswift-black/70">{t('Payment.PaymentPageContent.priceDetails.roomRate')}</div>
                          <div className="font-tripswift-medium">{currency.toUpperCase()} {ratePerNight.toLocaleString()} {t('Payment.PaymentPageContent.priceDetails.perNight')}</div>

                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-tripswift-black/70">{nights} {nights === 1 ? t('Payment.PaymentPageContent.bookingSummary.night') : t('Payment.PaymentPageContent.bookingSummary.nights')}</div>
                          <div className="font-tripswift-medium">{currency.toUpperCase()} {ratePerNight.toLocaleString()} × {nights}</div>
                        </div> */}

                        {/* <div className="border-t border-gray-200 my-4"></div> */}
                        <div className="flex justify-between items-center">
                          <div className="font-tripswift-bold text-lg">{t('Payment.PaymentPageContent.priceDetails.total')}</div>
                          <div className="font-tripswift-bold text-xl text-tripswift-blue">
                            {(paymentOption === "payWithCrypto-payWithQR" || paymentOption === "payWithCrypto-payWithWallet") && convertedAmount !== null
                              ? `USD ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`
                              : `${currency.toUpperCase()} ${numericAmount.toFixed(2)}`
                            }
                          </div>
                        </div>

                        {paymentOption === 'payAtHotel' && (
                          <div className="bg-blue-50 p-3 rounded-lg mt-4">
                            <div className="flex items-start">
                              <Clock className={`text-tripswift-blue flex-shrink-0 mt-0.5  ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} size={16} />
                              <p className="text-sm text-tripswift-black/70">
                                {t('Payment.PaymentPageContent.priceDetails.payAtHotelInfo')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Security badges */}
                      <div className="mt-8 pt-4 border-t border-gray-200">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center">
                            <Shield className={`h-5 w-5 text-green-600 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                            <span className="text-sm text-tripswift-black/70">{t('Payment.PaymentPageContent.securityBadges.securePayments')}</span>
                          </div>
                          <div className="flex items-center">
                            <CreditCard className={`h-5 w-5 text-green-600 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                            <span className="text-sm text-tripswift-black/70">{t('Payment.PaymentPageContent.securityBadges.noCardStorage')}</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className={`h-5 w-5 text-green-600 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                            <span className="text-sm text-tripswift-black/70">{t('Payment.PaymentPageContent.securityBadges.freeCancellation')}</span>
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
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-3">{t('Payment.PaymentPageContent.needHelp.title')}</h3>

                    <p className="text-tripswift-black/70 text-sm mb-4">
                      {t('Payment.PaymentPageContent.needHelp.message')}
                    </p>
                    <Link
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=business.alhajz@gmail.com&su=${encodeURIComponent(
                        "Support Request - Booking Assistance"
                      )}&body=${encodeURIComponent(
                        "Hello, I need help with my booking."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-tripswift-blue font-tripswift-medium cursor-pointer hover:underline"
                    >
                      {t('Payment.PaymentPageContent.needHelp.contactSupport')}
                    </Link>
                  </div>
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
  const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8]">
        <div className="p-8 bg-tripswift-off-white rounded-xl shadow-xl max-w-md text-center font-noto-sans">
          <div className="w-16 h-16 border-t-4 border-b-4 border-tripswift-blue rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-tripswift-medium text-tripswift-black mb-3">{t('Payment.PaymentPageContent.loading.title')}</h2>
          <p className="text-tripswift-black/60">{t('Payment.PaymentPageContent.loading.message')}</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}