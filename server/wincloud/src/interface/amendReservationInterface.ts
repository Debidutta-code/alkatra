export interface GuestDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface ThirdPartyAmendReservationData {
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    checkInDate: string;
    checkOutDate: string;
    guestDetails: GuestDetails[]; // Updated to array of GuestDetails
    amountBeforeTax: number;
    currencyCode: string;
    userId: string;
    propertyId: string;
    roomIds: string[]; // Updated to array of room IDs
    status: string;
    reservationId: string;
    thirdPartyReservationIdType8?: string;
    thirdPartyReservationIdType3?: string;
}