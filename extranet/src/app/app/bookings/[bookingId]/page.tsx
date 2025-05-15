"use client";
import { useEffect, useState } from "react";
import { getBookingById } from "../api";
import { useParams } from "next/navigation";
import { Calendar, MapPin, Mail, Phone, User, Hotel, BedDouble } from "lucide-react";
import React from "react";

type BookingDetailsType = {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: "Confirmed" | "Pending";
  amount: number;
  property: {
    id: string;
    name: string;
    city: string;
  };
  roomDetails: string;
  userDetails: {
    email: string;
    phone: string;
  };
};

export default function BookingDetails() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<BookingDetailsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (typeof bookingId === "string") {
        const data = await getBookingById(bookingId);
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^\n", bookingId);

        if (data && data.status === "Confirmed") {
          setBooking({
            ...data,
            status: "Confirmed",
          });
        } else {
          console.error("Booking not found or not confirmed!");
          setBooking(null);
        }
      } else {
        console.error("Invalid bookingId!");
        setBooking(null);
      }
      setLoading(false);
    }

    fetchData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gradient-to-b dark:from-gray-950 dark:to-gray-900">
        <div className="animate-[pulse_1.5s_ease-in-out_infinite] flex flex-col items-center">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800/50 rounded mb-8"></div>
          <div className="w-96 h-64 bg-gray-200 dark:bg-gray-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gradient-to-b dark:from-gray-950 dark:to-gray-900">
        <div className="text-center p-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-lg border border-red-200 dark:border-red-500/20 animate-[fadeIn_0.5s_ease-out]">
          <p className="text-red-600 dark:text-red-400 text-xl font-semibold mb-2">
            Booking Not Found
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            The booking you're looking for is either invalid or not confirmed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-gray-900 dark:via-gray-950 dark:to-black px-4 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-4 animate-[slideDown_0.5s_ease-out]">
          <h3 className="text-3xl font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-2 animate-[gradient_3s_ease-in-out_infinite]">
            Booking Details
          </h3>
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full backdrop-blur-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">{booking.status}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Guest Information */}
          <div className="group p-4 bg-white dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">Guest Information</h2>
            </div>
            <div className="space-y-2">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                <span className="font-medium">{booking.guestName}</span>
              </p>
              <div className="flex items-center text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                <Calendar className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                <span>Check-in: {booking.checkIn}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                <Calendar className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                <span>Check-out: {booking.checkOut}</span>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="group p-4 bg-white dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <Hotel className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">Property Details</h2>
            </div>
            <div className="space-y-2">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                <span className="font-medium">{booking.property.name}</span>
              </p>
              <div className="flex items-center text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                <MapPin className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                <span>{booking.property.city}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                <BedDouble className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                <span>{booking.roomDetails}</span>
              </div>
            </div>
            {/* Amount Section */}
            <div className="group p-4 bg-white dark:bg-gray-900/40 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:-translate-y-0.5 mt-2">
              <div className="flex items-center mb-2">
                <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">Booking Amount</h2>
              </div>
              <div className="relative flex justify-center items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-950/50 border border-green-200 dark:border-green-500/30 shadow-md group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300">
                <span className="text-lg font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                  ${booking.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="md:col-span-2 group p-4 bg-white dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">Contact Information</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="flex items-center text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                <Mail className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                <span>{booking.userDetails.email}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                <Phone className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                <span>{booking.userDetails.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}