export interface BookingDetails {
    provider: string;
    coupon: string[];
    reservationId: string;
    paymentMethod: string;
    userId: string;
    checkInDate: string;
    checkOutDate: string;
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    numberOfRooms: number;
    roomTotalPrice: number;
    currencyCode: string;
    guests: { firstName: string; lastName: string; dob: string }[];
    email: string;
    phone: string;
}

export interface ReservationInput {
    bookingDetails: BookingDetails;
    ageCodeSummary: Record<string, number>;
}

export interface CategorizedGuest {
    firstName: string;
    lastName: string;
    dob: string;
    age: number;
    category: string;
    ageCode: string;
}