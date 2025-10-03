"use client";

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { createSetupIntent, confirmBookingWithStoredCard } from '../../api/booking';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Shield, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from '../../Redux/store';
import { setGuestDetails, setFinalAmount, setPromoCode, setOriginalAmount } from '../../Redux/slices/pmsHotelCard.slice';
import axios from 'axios';
import { formatDate } from '../../utils/dateUtils';

interface Guest {
  firstName: string;
  lastName: string;
  dob?: string;
  type?: "adult" | "child" | "infant";
}

interface PayAtHotelProps {
  bookingDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    roomId: string;
    propertyId: string;
    checkIn: string;
    checkOut: string;
    amount: number;
    originalAmount?: number;
    userId?: string;
    hotelName?: string;
    ratePlanCode?: string;
    roomType?: string;
    rooms?: number;
    adults?: number;
    children?: number;
    currency?: string;
    hotelCode?: string;
    guests: Guest[];
    promoCode?: string | null;
  };
}

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const PayAtHotelFunction: React.FC<PayAtHotelProps> = ({ bookingDetails }) => {
  const { t, i18n } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const auth = useSelector((state: any) => state.auth);
  const token = auth?.token || auth?.accessToken;


  // Validate booking details on component mount
  useEffect(() => {
    const requiredFields: (keyof typeof bookingDetails)[] = [
      'firstName', 'lastName', 'email', 'phone', 'roomId', 'propertyId', 'checkIn', 'checkOut', 'amount', 'hotelCode'
    ];

    const missingFields = requiredFields.filter(field => !bookingDetails[field]);

    if (missingFields.length > 0) {
      console.error('Missing required booking details:', missingFields);
      setValidationError(`Missing required booking information: ${missingFields.join(', ')}`);
    } else if (!Array.isArray(bookingDetails.guests)) {
      console.error('Guests data is not an array:', bookingDetails.guests);
      setValidationError('Invalid guest information provided.');
    } else {
      setValidationError(null);
    }

    console.log("PayAtHotel initialized with booking details:", {
      ...bookingDetails,
      stripeAvailable: !!stripe,
      elementsAvailable: !!elements,
      tokenAvailable: !!token
    });
  }, [bookingDetails, stripe, elements, token]);

  // Handle card element changes
  const handleCardChange = (event: any) => {
    setIsCardComplete(event.complete);
    if (event.error) {
      setErrorMessage(event.error.message);
    } else {
      setErrorMessage(null);
    }
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage(t('Payment.PaymentComponents.PayAtHotelFunction.stripeNotLoadedError'));
      return;
    }

    if (!token) {
      setErrorMessage(t('Payment.PaymentComponents.PayAtHotelFunction.notLoggedInError'));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Creating setup intent with guest data:", {
        firstName: bookingDetails.firstName,
        lastName: bookingDetails.lastName,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        guests: bookingDetails.guests
      });

      const setupIntentResponse = await createSetupIntent({
        firstName: bookingDetails.firstName,
        lastName: bookingDetails.lastName,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        guests: bookingDetails.guests
      }, token);

      console.log("Setup intent response:", setupIntentResponse);
      const { clientSecret } = setupIntentResponse;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error(t('Payment.PaymentComponents.PayAtHotelFunction.cardElementNotFoundError'));
      }

      console.log("Confirming card setup...");
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${bookingDetails.firstName} ${bookingDetails.lastName}`,
            email: bookingDetails.email,
            phone: bookingDetails.phone
          }
        }
      });

      if (error) {
        console.error("Card setup error:", error);
        throw new Error(error.message);
      }

      if (!setupIntent || !setupIntent.payment_method) {
        throw new Error(t('Payment.PaymentComponents.PayAtHotelFunction.cardSetupFailedError'));
      }
      console.log("Card setup successful, creating booking...");
      const bookingPayload = {
        checkInDate: bookingDetails.checkIn,
        checkOutDate: bookingDetails.checkOut,
        hotelCode: bookingDetails.hotelCode || '',
        hotelName: bookingDetails.hotelName || " ",
        ratePlanCode: bookingDetails.ratePlanCode || " ",
        numberOfRooms: bookingDetails.rooms || 1,
        roomTypeCode: bookingDetails.roomType || "",
        roomTotalPrice: bookingDetails.amount,
        currencyCode: bookingDetails.currency?.toUpperCase() || " ",
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        provider: "web",
        coupon: bookingDetails.promoCode ? [bookingDetails.promoCode] : [],
        guests: bookingDetails.guests.map((guest: Guest) => ({
          firstName: guest.firstName || '',
          lastName: guest.lastName || '',
          dob: guest.dob || '',
          type: guest.type || ''
        })),
        paymentInfo: {
          paymentMethodId: setupIntent.payment_method as string,
          setupIntentId: setupIntent.id
        }
      };

      console.log("Sending booking payload:", bookingPayload);
      const bookingResponse = await confirmBookingWithStoredCard(bookingPayload, token);
      console.log("Booking response:", bookingResponse);

      // Send SMS confirmation with better error handling
      try {
        if (bookingDetails.phone && process.env.NEXT_PUBLIC_BACKEND_URL) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/send-sms`,
            {
              phone: bookingDetails.phone,
              message:
                `Your booking at ${bookingDetails.hotelName || "our hotel"} is confirmed!
                • Room Type: ${bookingDetails.roomType || "Standard"}
                • Rooms: ${bookingDetails.rooms || 1}
                • Check-in: ${formatDate(bookingDetails.checkIn)}
                • Check-out: ${formatDate(bookingDetails.checkOut)}
                • Total: ${formatCurrency(bookingDetails.amount, bookingDetails.currency || 'USD')}`
            },
            {
              withCredentials: true,
              timeout: 5000,
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              }
            }
          );
        }
      } catch (smsError: any) {
      }
      dispatch(setOriginalAmount(bookingDetails.originalAmount || bookingDetails.amount));
      dispatch(setFinalAmount(bookingDetails.amount));
      dispatch(setPromoCode(bookingDetails.promoCode || null));
      dispatch(setGuestDetails({
        guests: bookingResponse?.savedBooking?.guests || bookingDetails.guests,
        rooms: bookingDetails.rooms || 1,
        adults: bookingDetails.adults || 1,
        children: bookingDetails.children || 0,
        // infants: bookingDetails.infants || 0,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        checkInDate: bookingResponse?.savedBooking?.checkInDate,
        checkOutDate: bookingResponse?.savedBooking?.checkOutDate,
        bookingId: bookingResponse?.savedBooking?.id,
        hotelName: bookingDetails.hotelName,
        ratePlanCode: bookingDetails.ratePlanCode,
        roomType: bookingDetails.roomType,
      }));

      router.push(`/payment-success`);
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || t('Payment.PaymentComponents.PayAtHotelFunction.paymentProcessingError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (validationError) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-trips-bold text-red-700 mb-2">{t('Payment.PaymentComponents.PayAtHotelFunction.errorTitle')}</h3>
            <p className="text-red-600 mb-2">{validationError}</p>
            <p className="text-sm text-red-600">{t('Payment.PaymentComponents.PayAtHotelFunction.errorMessage')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="font-noto-sans">
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-tripswift-black font-tripswift-semibold mb-2">{t('Payment.PaymentComponents.PayAtHotelFunction.infoTitle')}</p>
        <p className="text-sm text-tripswift-black/70">
          {t('Payment.PaymentComponents.PayAtHotelFunction.infoMessage')}
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-tripswift-medium text-tripswift-black mb-2">
          {t('Payment.PaymentComponents.PayAtHotelFunction.cardDetailsLabel')}
        </label>
        <div className="p-4 border border-gray-300 rounded-lg bg-tripswift-off-white min-h-[48px]">
          <CardElement
            id="card-element"
            onChange={handleCardChange}
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#000000',
                  fontFamily: 'Noto Sans, sans-serif',
                  '::placeholder': {
                    color: 'rgba(0, 0, 0, 0.6)',
                  },
                  ':-webkit-autofill': {
                    color: '#000000',
                  },
                },
                invalid: {
                  color: '#EF4444',
                  '::placeholder': {
                    color: '#EF4444',
                  },
                },
              },
              hidePostalCode: true
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 border border-red-200 font-tripswift-regular">
          {errorMessage}
        </div>
      )}

      <div className="mb-6 flex items-start">
        <Shield className={`h-5 w-5 text-tripswift-blue flex-shrink-0 mb-1.5 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
        <p className="text-xs text-tripswift-black/70">
          {t('Payment.PaymentComponents.PayAtHotelFunction.footer')}
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading || !!validationError || !isCardComplete}
        className={`w-full py-3 px-4 rounded-lg transition-all duration-300 ${isLoading || !stripe || validationError || !isCardComplete
          ? 'bg-gray-300 cursor-not-allowed text-tripswift-black/50'
          : 'bg-tripswift-blue hover:bg-[#054B8F] text-tripswift-off-white'
          } font-tripswift-semibold`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-tripswift-off-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('Payment.PaymentComponents.PayAtHotelFunction.processing')}
          </span>
        ) : (
          t('Payment.PaymentComponents.PayAtHotelFunction.confirmBooking')
        )}
      </button>
    </form>
  );
};

export default PayAtHotelFunction;