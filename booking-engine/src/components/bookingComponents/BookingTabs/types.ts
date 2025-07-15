export interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface GuestDetails {
  type: "adult" | "child" | "infant";
  _id?: string;
  firstName: string;
  lastName: string;
  dob?: string;
}

// Matches backend response!
export interface Booking {
  paymentType: string;
  _id: string;
  reservationId: string;
  paymentMethod?: string;
  hotelCode: string;
  hotelName: string;
  ratePlanCode: string;
  roomTypeCode: string;
  checkInDate: string;
  checkOutDate: string;
  guestDetails: GuestDetails[];
  email: string;
  phone: string;
  ageCodeSummary?: { [key: string]: number };
  numberOfRooms: number;
  totalAmount: number;
  currencyCode: string;
  userId: string;
  createdAt: string;
  status?: string;
  __v?: number;
}

export interface PaginationResponse {
  bookings: Booking[];
  totalBookings: number;
  totalPages: number;
  currentPage: number;
}

export type BookingTabType = 'all' | 'upcoming' | 'completed' | 'cancelled';