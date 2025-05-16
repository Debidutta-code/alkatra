// components/paymentComponents/PayAtHotelFunction.tsx

import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { createSetupIntent, confirmBookingWithStoredCard } from '../../api/booking';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

interface PayAtHotelProps {
  bookingDetails: any;
}

const PayAtHotelFunction: React.FC<PayAtHotelProps> = ({ bookingDetails }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Get auth state from Redux store
  const auth = useSelector((state: any) => state.auth);
  const token = auth?.token || auth?.accessToken; // Try both possible token names
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

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
      // 1. Create a SetupIntent to securely store card details
      // Update endpoint to use /booking/ since that's where you added it
      const setupIntentResponse = await createSetupIntent({
        firstName: bookingDetails.firstName,
        lastName: bookingDetails.lastName,
        email: bookingDetails.email,
        phone: bookingDetails.phone
      }, token);

      const { clientSecret } = setupIntentResponse;

      // 2. Confirm card setup to securely store card details
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

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
        throw new Error(error.message);
      }

      if (!setupIntent || !setupIntent.payment_method) {
        throw new Error('Card setup failed');
      }

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
            userId: bookingDetails.userId,
            propertyId: bookingDetails.propertyId,
            checkInDate: bookingDetails.checkIn,
            checkOutDate: bookingDetails.checkOut
          },
          payment: {
            amount: parseFloat(bookingDetails.amount),
            method: "payAtHotel"
          },
          paymentInfo: {
            paymentMethodId: setupIntent.payment_method,
            setupIntentId: setupIntent.id
          }
        }
      };

      console.log("Sending booking payload:", bookingPayload);
      console.log("Token available:", !!token);
      
      const bookingResponse = await confirmBookingWithStoredCard(bookingPayload, token);

      // Handle success
      router.push(`/payment-success?reference=${bookingResponse.savedBooking._id}`);
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'An error occurred during payment processing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 p-4 bg-blue-600/20 rounded-lg border border-blue-400/30">
        <p className="text-white font-medium mb-2">Pay at Hotel Information</p>
        <p className="text-sm text-white/80">
          Your credit card details will be securely stored but not charged now.
          Payment will be processed during your stay at the hotel.
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-white mb-2">
          Card Details
        </label>
        <div className="p-4 border border-white/30 rounded-lg bg-white/10">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: 'white',
                  '::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                },
                invalid: {
                  color: '#FFC7EE',
                },
              },
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-500/20 text-red-200 p-3 rounded-md mb-4 border border-red-400/30">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={`w-full py-3 px-4 rounded-md transition ${
          isLoading || !stripe
            ? 'bg-gray-400/50 cursor-not-allowed text-white/50'
            : 'bg-green-600 hover:bg-green-500 text-white'
        }`}
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