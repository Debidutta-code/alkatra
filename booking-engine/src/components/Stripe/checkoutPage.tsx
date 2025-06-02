// components/Stripe/checkoutPage.tsx
"use client";

import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

type TCheckOutPageProps = {
  amount: number;
  currency: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clientSecret: string;
  roomId?: string;
  propertyId?: string;
  checkIn?: string;
  checkOut?: string;
  userId?: string;
  rooms?: number;
  adults?: number;
  children?: number;
};

const CheckoutPage = ({ 
  amount, 
  currency, 
  firstName, 
  lastName, 
  email, 
  phone,
  clientSecret,
  roomId = "",
  propertyId = "",
  checkIn = "",
  checkOut = "",
  userId = "",
  rooms = 1,
  adults = 1,
  children = 0
}: TCheckOutPageProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
console.log("cheKOUT",checkOut)
  // No useEffect to fetch client secret - it's now passed as a prop!

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submission started");
    setLoading(true);

    if (!stripe || !elements) {
      console.log("Stripe or elements not loaded");
      setErrorMessage("Payment system is unavailable. Please try again.");
      setLoading(false);
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

    // Extract payment intent ID from client secret
    const paymentIntentId = clientSecret.split('_secret_')[0];
    
    console.log("Elements submitted successfully. Confirming payment...");
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/payment-success?amount=${amount}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&roomId=${roomId}&propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}&userId=${userId}&paymentIntent=${paymentIntentId}&rooms=${rooms}&adults=${adults}&children=${children}`,
      },
    });

    if (error) {
      console.error("Payment confirmation error:", error.message);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    // This code won't run as the user is redirected by Stripe
    console.log("Payment confirmed. Proceeding with booking...");
    setLoading(false);
  };

  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-tripswift-blue" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
      <PaymentElement />

      {errorMessage && (
        <div className="text-red-600 bg-red-50 p-3 rounded-md my-3 text-sm border border-red-200">
          {errorMessage}
        </div>
      )}

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