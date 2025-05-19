"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import axios from "axios";
import router from "next/router";

type TCheckOutPageProps = {
  amount: number;
  // offerId: string;
  currency: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

// const CheckoutPage = ({ amount, offerId, currency, firstName, lastName, email, phone }: TCheckOutPageProps) => {
  const CheckoutPage = ({ amount, currency, firstName, lastName, email, phone }: TCheckOutPageProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchClientSecret = async () => {
      console.log("&^^^^%&^%&^%&^%&^%&^%&^%&^%&^%&^%&%\nFetching client secret...",amount, currency );
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/create-payment-intent`, {
          amount: convertToSubcurrency(amount),
          // offerId: offerId,
          currency: currency
        });

        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Error fetching client secret:", error);
        setErrorMessage("Failed to initialize payment. Please try again later.");
      }
    };

    fetchClientSecret();
  // }, [amount, offerId]);
}, [amount]);

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  console.log("Form submission started");
  setLoading(true);

  if (!stripe || !elements) {
    console.log("Stripe or elements not loaded");
    return;
  }

  console.log("Attempting to submit elements...");
  const { error: submitError } = await elements.submit();

  if (submitError) {
    console.error("Element submission error:", submitError.message);
    setErrorMessage(submitError.message);
    setLoading(false);
    return;
  }

  console.log("Elements submitted successfully. Confirming payment...");
  const { error } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/payment-success?amount=${amount}&firstName=${firstName}&lastName=${lastName}&email=${email}&phone=${phone}`,
    },
  });

  console.log('*$%#%$#%$#%$#%$#%$#%$#%$#%$#%$#%\nStripe confirmPayment response:', { error });

  if (error) {
    console.error("Payment confirmation error:", error.message);
    setErrorMessage(error.message);
    setLoading(false);
    return;
  }

  console.log("Payment confirmed. Proceeding with booking...");
  try {
    console.log("Booking process started");
    // Uncomment the booking request once you're ready:
    // await handleBookingRequest();
    console.log("Booking process completed");
  } catch (bookingError) {
    console.error("Error during booking process:", bookingError);
  }

  setLoading(false);
  console.log("Form submission completed");
};

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
      {clientSecret && <PaymentElement />}

      {errorMessage && <div>{errorMessage}</div>}

      <button
        disabled={!stripe || loading}
        className="text-white w-full p-5 bg-black mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
      >
        {!loading ? `Pay ₹${amount}` : "Processing..."}
      </button>
    </form>
  );
};

export default CheckoutPage;  