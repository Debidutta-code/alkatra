import Cookies from "js-cookie";
import axios from "axios";

type ApiBooking = {
  _id: string;
  reservationId: string;
  hotelCode: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guestDetails: Array<{
    firstName: string;
    lastName: string;
    dob: string;
    _id: string;
  }>;
  email: string;
  phone: string;
  status: string;
  totalAmount: number;
  currencyCode: string;
  numberOfRooms: number;
  roomTypeCode: string;
  ratePlanCode: string;
  paymentMethod: string;
  userId: string;
  createdAt: string;
  __v: number;
};

type ApiResponse = {
  success: boolean;
  count: number;
  totalPages: number;
  currentPage: number;
  bookingDetails: ApiBooking[];
};

type Booking = {
  id: string;
  reservationId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  property: {
    id: string;
    name: string;
    code: string;
  };
  email: string;
  phone: string;
  totalAmount: number;
  currency: string;
  numberOfRooms: number;
  roomType: string;
  paymentMethod: string;
  amount: number;
};

type GetBookingsResponse = {
  bookingDetails: Booking[];
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  count: number;
};

type HotelNamesResponse = {
  success: boolean;
  message: string;
  hotelNames: string[];
  count: number;
};

export async function getAllHotelNames(accessToken: string): Promise<string[]> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    console.log("Fetching hotel names with token:", accessToken ? "Token exists" : "No token");
    
    const response = await axios.get(
      `${backendUrl}/booking/hotelname`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data: HotelNamesResponse = response.data;
    console.log("Hotel names API response:", data);
    
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch hotel names");
    }

    return data.hotelNames || [];
  } catch (error: any) {
    console.error("Error fetching hotel names:", error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error("Unauthorized access to hotel names - token may be expired");
    } else if (error.response?.status === 404) {
      console.error("Hotel names endpoint not found");
    }
    
    return []; // Return empty array on error
  }
}

// Transform API data to frontend format
const transformBookingData = (apiBookings: ApiBooking[]): Booking[] => {
  return apiBookings.map((booking) => ({
    id: booking._id,
    reservationId: booking.reservationId,
    guestName: booking.guestDetails.length > 0
      ? `${booking.guestDetails[0].firstName} ${booking.guestDetails[0].lastName}`.trim()
      : "N/A",
    checkIn: new Date(booking.checkInDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    checkOut: new Date(booking.checkOutDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    status: booking.status,
    property: {
      id: booking._id,
      name: booking.hotelName,
      code: booking.hotelCode,
    },
    email: booking.email,
    phone: booking.phone,
    totalAmount: booking.totalAmount,
    currency: booking.currencyCode,
    numberOfRooms: booking.numberOfRooms,
    roomType: booking.roomTypeCode,
    paymentMethod: booking.paymentMethod,
    amount: booking.totalAmount, // For backward compatibility
  }));
};

// Main function to get bookings
export async function getBookings(page: number = 1, itemsPerPage: number = 10, accessToken: string): Promise<GetBookingsResponse> {
  try {
    const ownerId = Cookies.get("ownerId");
    console.log("################The owner id", ownerId);
    console.log("$$$$$$$$$$$$$$$$$The access Token is:", accessToken);

    if (!ownerId || !accessToken) {
      console.error("Owner ID or Access Token not found! Redirecting to login...");
      return {
        bookingDetails: [],
        currentPage: 1,
        totalPages: 1,
        totalBookings: 0,
        count: 0
      };
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const response = await axios.get(
      `${backendUrl}/booking/count/${ownerId}?page=${page}&limit=${itemsPerPage}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data: ApiResponse = response.data;
    console.log("&&&&&&&&&&&&&&&&&&&API Response:\n", data);

    if (!data.success) {
      throw new Error("API returned unsuccessful response");
    }

    const transformedBookings = transformBookingData(data.bookingDetails);

    return {
      bookingDetails: transformedBookings,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      totalBookings: data.count,
      count: data.count,
    };

  } catch (error: any) {
    console.error("Error fetching bookings:", error);

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error("Unauthorized access - token may be expired");
    } else if (error.response?.status === 404) {
      console.error("Bookings endpoint not found");
    }

    return {
      bookingDetails: [],
      currentPage: 1,
      totalPages: 1,
      totalBookings: 0,
      count: 0
    };
  }
}

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

    // Fetch raw booking data to get complete guest details
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await axios.get(
        `${backendUrl}/booking/count/${ownerId}?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data: ApiResponse = response.data;
      const rawBooking = data.bookingDetails.find((b: ApiBooking) => b._id === bookingId);

      if (rawBooking) {
        // Helper function to calculate age from date of birth
        const calculateAge = (dob: string): number => {
          const birthDate = new Date(dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          return age;
        };

        // Process guests with age calculation
        const processedGuests = rawBooking.guestDetails.map(guest => ({
          ...guest,
          age: calculateAge(guest.dob)
        }));

        // Return enhanced booking with complete guest details
        return {
          ...booking,
          guests: processedGuests,
          primaryGuest: processedGuests[0] || null,
          guestCount: processedGuests.length,
          roomDetails: `${rawBooking.roomTypeCode} - ${rawBooking.ratePlanCode}`,
          userDetails: {
            email: rawBooking.email || "N/A",
            phone: rawBooking.phone || "N/A",
          },
          reservationId: rawBooking.reservationId,
          paymentMethod: rawBooking.paymentMethod,
          numberOfRooms: rawBooking.numberOfRooms,
        };
      }
    } catch (error) {
      console.error("Failed to fetch raw booking data:", error);
    }

    // Return basic booking data if raw data fetch fails
    return {
      ...booking,
      roomDetails: booking.roomType || `Room ${booking.id.slice(-4)}`,
      userDetails: {
        email: booking.email || "N/A",
        phone: booking.phone || "N/A",
      },
    };

  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    return null;
  }
}

// Helper function to get payment method display text
export const getPaymentMethodDisplay = (method: string | undefined | null): string => {
  if (!method || typeof method !== 'string') {
    return 'Unknown Payment Method';
  }
  switch (method) {
    case 'payAtHotel':
      return 'Pay at Hotel';
    case 'crypto':
      return 'Cryptocurrency';
    default:
      return method ? method.charAt(0).toUpperCase() + method.slice(1) : 'Unknown Payment Method';
  }
};

// Helper function to format currency
export const formatCurrency = (amount: number, currency: string): string => {
  return `${amount.toFixed(2)} ${currency}`;
};

// Export types for use in components
export type { Booking, GetBookingsResponse, ApiBooking, ApiResponse, HotelNamesResponse };