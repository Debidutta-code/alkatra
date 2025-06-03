import { Schema, model, Document } from 'mongoose';

interface IGuestDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

interface IThirdPartyBooking extends Document {
    reservationId: string;
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    checkInDate: Date;
    checkOutDate: Date;
    guestDetails?: IGuestDetails[]; 
    ageCodeSummary?: Record<string, number>;
    numberOfRooms: number;
    totalAmount: number;
    currencyCode: string;
    userId?: string;
    propertyId?: string;
    roomIds?: string[];
    status?: string;
    thirdPartyReservationIdType8?: string;
    thirdPartyReservationIdType3?: string;
    createdAt: Date;
}

interface IReservationLog extends Document {
    bookingId?: string;
    reservationId: string;
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    checkInDate: Date;
    checkOutDate: Date;
    jsonInput: string;
    xmlSent: string;
    apiResponse: string;
    process: 'Reservation' | 'Amend Reservation' | 'Cancellation';
    status: 'Success' | 'Failure';
    errorMessage?: string;
    timestamp: Date;
}

const guestDetailsSchema = new Schema<IGuestDetails>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
});

const thirdPartyBookingSchema = new Schema<IThirdPartyBooking>({
    reservationId: { type: String, required: true, unique: true },
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: false },
    ratePlanCode: { type: String, required: true },
    roomTypeCode: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    guestDetails: { type: [guestDetailsSchema], required: false },
    ageCodeSummary: { type: Map, of: Number, required: true },
    numberOfRooms: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currencyCode: { type: String, required: true },
    userId: { type: String, required: true },
    status: { type: String, required: false, enum: ['Confirmed', 'Pending', 'Cancelled'] },
    createdAt: { type: Date, default: Date.now },
});

const reservationLogSchema = new Schema<IReservationLog>({
    bookingId: { type: String, required: false },
    reservationId: { type: String, required: true},
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: true },
    ratePlanCode: { type: String, required: true },
    roomTypeCode: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    jsonInput: { type: String, required: true },
    xmlSent: { type: String, required: true },
    apiResponse: { type: String, required: true },
    status: { type: String, required: true, enum: ['Success', 'Failure'] },
    process: { type: String, required: true, enum: ['Reservation', 'Amend Reservation', 'Cancellation'] },
    errorMessage: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
});

export const ThirdPartyBooking = model<IThirdPartyBooking>('WincloudReservation', thirdPartyBookingSchema);
export const ReservationLog = model<IReservationLog>('WincloudReservationLog', reservationLogSchema);
