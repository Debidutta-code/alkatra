export interface UserType {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }
  
  export interface Booking {
    _id: string;
    property: {
      _id: string;
      property_name: string;
      property_address?: string;
    };
    room: {
      _id: string;
      room_name: string;
      room_type: string;
      room_type_code?: string;
    };
    booking_user_name: string;
    booking_user_phone: string;
    amount: number;
    booking_dates: string;
    status: string;
    payment?: string;
    paymentType?: string;
    checkInDate: string;
    checkOutDate: string;
    adultCount?: number;
    childCount?: number;
    specialRequests?: string;
    ratePlanCode?: string;
    ratePlanName?: string;
    bookingId?: string;
  }
  
  export interface PaginationResponse {
    bookingDetails: Booking[];
    totalBookings: number;
    totalPages: number;
    currentPage: number;
  }
  
  export type BookingTabType = 'all' | 'upcoming' | 'completed' | 'cancelled';