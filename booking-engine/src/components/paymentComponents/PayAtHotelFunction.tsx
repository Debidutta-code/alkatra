import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { createSetupIntent, confirmBookingWithStoredCard } from '../../api/booking';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Shield, AlertCircle } from 'lucide-react';

interface PayAtHotelProps {
  bookingDetails: any;
}

const PayAtHotelFunction: React.FC<PayAtHotelProps> = ({ bookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get auth state from Redux store
  const auth = useSelector((state: any) => state.auth);
  const token = auth?.token || auth?.accessToken; // Try both possible token names

  // Validate booking details on component mount
  useEffect(() => {
    // Add validation before proceeding
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 
      'roomId', 'propertyId', 'checkIn', 'checkOut', 'amount'
    ];
    
    const missingFields = requiredFields.filter(field => !bookingDetails?.[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required booking details:', missingFields);
      setValidationError(`Missing required booking information: ${missingFields.join(', ')}`);
    } else {
      setValidationError(null);
    }
    
    // Log booking details for debugging (exclude sensitive info)
    console.log("PayAtHotel initialized with booking details:", {
      ...bookingDetails,
      stripeAvailable: !!stripe,
      elementsAvailable: !!elements,
      tokenAvailable: !!token
    });
  }, [bookingDetails, stripe, elements, token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Don't proceed if there are validation errors
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!stripe || !elements) {
      setErrorMessage("Stripe hasn't loaded yet. Please try again.");
      return;
    }

    // Check if user is authenticated
    if (!token) {
      setErrorMessage("You need to be logged in to complete this booking. Please sign in and try again.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Creating setup intent with guest data:", {
        firstName: bookingDetails.firstName,
        lastName: bookingDetails.lastName,
        email: bookingDetails.email,
        phone: bookingDetails.phone
      });
      
      // 1. Create a SetupIntent to securely store card details
      const setupIntentResponse = await createSetupIntent({
        firstName: bookingDetails.firstName,
        lastName: bookingDetails.lastName,
        email: bookingDetails.email,
        phone: bookingDetails.phone
      }, token);

      console.log("Setup intent response:", setupIntentResponse);
      const { clientSecret } = setupIntentResponse;

      // 2. Confirm card setup to securely store card details
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
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
        throw new Error('Card setup failed');
      }

      console.log("Card setup successful, creating booking...");
      
      // 3. Create the booking with stored card information
      const bookingPayload = {
        data: {
          guests: [{
            firstName: bookingDetails.firstName,
            lastName: bookingDetails.lastName,
            email: bookingDetails.email,
            phone: bookingDetails.phone
          }],
          roomAssociations: [{
            roomId: bookingDetails.roomId
          }],
          bookingDetails: {
            userId: bookingDetails.userId || "",
            propertyId: bookingDetails.propertyId,
            checkInDate: bookingDetails.checkIn,
            checkOutDate: bookingDetails.checkOut,
            // Add these fields if they exist in your booking details
            rooms: bookingDetails.rooms,
            adults: bookingDetails.adults,
            children: bookingDetails.children
          },
          payment: {
            amount: parseFloat(bookingDetails.amount),
            currency: bookingDetails.currency || "INR",
            method: "payAtHotel"
          },
          paymentInfo: {
            paymentMethodId: setupIntent.payment_method,
            setupIntentId: setupIntent.id
          }
        }
      };

      console.log("Sending booking payload:", bookingPayload);
      const bookingResponse = await confirmBookingWithStoredCard(bookingPayload, token);
      console.log("Booking response:", bookingResponse);

      // Handle success
      router.push(`/payment-success?reference=${bookingResponse.savedBooking._id || bookingResponse.savedBooking.id || ""}&amount=${bookingDetails.amount}&firstName=${bookingDetails.firstName}&lastName=${bookingDetails.lastName}&email=${bookingDetails.email}&phone=${bookingDetails.phone}&method=payAtHotel`);
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'An error occurred during payment processing');
    } finally {
      setIsLoading(false);
    }
  };

  // If we have validation errors, show a friendly message
  if (validationError) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-tripswift-semibold text-red-700 mb-2">Unable to Process Payment</h3>
            <p className="text-red-600 mb-4">{validationError}</p>
            <p className="text-sm text-red-600">Please return to the previous page and try again, or contact customer support if the issue persists.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-tripswift-black font-tripswift-semibold mb-2">Pay at Hotel Information</p>
        <p className="text-sm text-tripswift-black/70">
          Your credit card details will be securely stored but not charged now.
          Payment will be processed during your stay at the hotel.
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-tripswift-medium text-tripswift-black mb-2">
          Card Details
        </label>
        <div className="p-4 border border-gray-300 rounded-lg bg-white min-h-[48px]">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#000000', // Black text for light background
                  fontFamily: 'Arial, sans-serif',
                  '::placeholder': {
                    color: 'rgba(0, 0, 0, 0.6)', // Dark gray placeholder text
                  },
                  ':-webkit-autofill': {
                    color: '#000000',
                  },
                },
                invalid: {
                  color: '#EF4444', // Red color for errors
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
        <Shield className="h-5 w-5 text-tripswift-blue mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-tripswift-black/70">
          Your card details are encrypted and securely processed by Stripe. We never store your full card information on our servers.
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading || !!validationError}
        className={`w-full py-3 px-4 rounded-md transition ${isLoading || !stripe || validationError
            ? 'bg-gray-300 cursor-not-allowed text-tripswift-black/50'
            : 'bg-tripswift-blue hover:bg-[#054B8F] text-tripswift-off-white'
          } font-tripswift-semibold`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Confirm Booking'
        )}
      </button>
    </form>
  );
};

export default PayAtHotelFunction;