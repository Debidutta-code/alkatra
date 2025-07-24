export interface GuestDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface AmendReservationInput {
  bookingDetails: {
    userId: string;
    reservationId: string;
    checkInDate: string;
    checkOutDate: string;
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    numberOfRooms: number;
    roomTotalPrice: number;
    currencyCode: string;
    guests: any[];
    email: string;
    phone: string;
  };
  ageCodeSummary: Record<string, number>;
}


export interface ThirdPartyAmendReservationData {
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    numberOfRooms: number;
    guests: any[];
    email: string;
    phone: string;
    checkInDate: string;
    checkOutDate: string;
    ageCodeSummary: Record<string, number>; 
    amountBeforeTax: number;
    currencyCode: string;
    userId: string;
    status: string;
    reservationId: string;
}