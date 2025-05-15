import { RootState } from "@src/redux/store";
import { access } from "fs";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

type Booking = {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: "Confirmed" | "Pending";
  property: {
    id: string;
    name: string;
    city: string;
  };
  amount: number;
};

type GetBookingsResponse = {
  bookingDetails: Booking[];
  currentPage: number;
  totalPages: number;
  totalBookings: number;
};

export async function getBookings(page: number = 1, itemsPerPage: number = 10, accessToken: string,): Promise<GetBookingsResponse> {
  try {
    const ownerId = Cookies.get("ownerId");
    console.log("################The owner id", ownerId);
    console.log("$$$$$$$$$$$$$$$$$The access Token is:", accessToken);
    
    if (!ownerId || !accessToken) {
      console.error("Owner ID or Access Token not found! Redirecting to login...");
      return { bookingDetails: [], currentPage: 1, totalPages: 1, totalBookings: 0 };
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendUrl}/booking/count/${ownerId}?page=${page}&limit=${itemsPerPage}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch bookings");

    const data = await response.json();
    console.log("&&&&&&&&&&&&&&&&&&&API Response:\n", data);

    return {
      bookingDetails: data.bookingDetails.map((booking: any) => ({
        id: booking._id,
        guestName: `${booking.booking_user_name}`,
        checkIn: new Date(booking.checkInDate).toLocaleDateString(),
        checkOut: new Date(booking.checkOutDate).toLocaleDateString(),
        status: booking.status === "Confirmed" ? "Confirmed" : "Pending",
        property: {
          id: booking.property._id,
          name: booking.property.property_name,
          city: booking.location?.city || "Unknown City",
        },
        amount: booking.amount, // Include the amount field
      })),
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      totalBookings: data.totalBookings,
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return { bookingDetails: [], currentPage: 1, totalPages: 1, totalBookings: 0 };
  }
}

// Store for raw booking data to avoid multiple API calls
let rawBookingsCache: any[] = [];

export async function getBookingById(bookingId: string) {
  try {
    console.log(`Fetching booking details for ID: ${bookingId}`);
    const accessToken = Cookies.get("accessToken") || "undefined";
    const ownerId = Cookies.get("ownerId");
    
    if (!ownerId || !accessToken) {
      console.error("Owner ID or Access Token not found for booking details!");
      return null;
    }
    
    // First, try to find the booking in our transformed data
    const result = await getBookings(1, 100, accessToken);
    
    if (!result || !result.bookingDetails || result.bookingDetails.length === 0) {
      console.log("No bookings found in initial fetch");
      return null;
    }
    
    const booking = result.bookingDetails.find((b) => b.id === bookingId);
    console.log(`Looking for booking ID: ${bookingId} in ${result.bookingDetails.length} bookings`);
    
    if (!booking) {
      console.log("Booking not found in results");
      return null;
    }
    
    // If we have already fetched raw data, use the cache
    if (rawBookingsCache.length === 0) {
      // Fetch raw booking data with a larger limit to ensure we get the one we need
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/booking/count/${ownerId}?page=1&limit=100`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.error("Failed to fetch raw booking data");
        // Return what we have if raw data fetch fails
        return {
          ...booking,
          roomDetails: `Room ${booking.id.slice(-4)}`,
          userDetails: {
            email: "N/A",
            phone: "N/A",
          },
        };
      }
      
      const data = await response.json();
      rawBookingsCache = data.bookingDetails || [];
    }
    
    // Find the raw booking data with matching ID
    const rawBooking = rawBookingsCache.find((b: any) => b._id === bookingId);
    
    if (!rawBooking) {
      console.log("Raw booking data not found in cache");
      // Return what we have if raw booking is not found
      return {
        ...booking,
        roomDetails: `Room ${booking.id.slice(-4)}`,
        userDetails: {
          email: "N/A",
          phone: "N/A",
        },
      };
    }
    
    // Return enhanced booking with email and phone from raw data
    return {
      ...booking,
      roomDetails: rawBooking.room ? 
        `${rawBooking.room.room_name || "Room"} - ${rawBooking.room.room_type || ""}` : 
        `Room ${booking.id.slice(-4)}`,
      userDetails: {
        email: rawBooking.booking_user_email || "N/A",
        phone: rawBooking.booking_user_phone || "+1-234-567-890",
      },
    };
    
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    return null;
  }
}