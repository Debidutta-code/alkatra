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
    guestDetails: IGuestDetails[]; // Updated to array
    amountBeforeTax: number;
    currencyCode: string;
    userId: string;
    propertyId: string;
    roomIds: string[]; // Updated to array
    status: string;
    thirdPartyReservationIdType8?: string;
    thirdPartyReservationIdType3?: string;
    createdAt: Date;
}

interface IReservationLog extends Document {
    bookingId?: string;
    jsonInput: string;
    xmlSent: string;
    apiResponse: string;
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
    hotelName: { type: String, required: true },
    ratePlanCode: { type: String, required: true },
    roomTypeCode: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    guestDetails: { type: [guestDetailsSchema], required: true }, // Updated to array
    amountBeforeTax: { type: Number, required: true },
    currencyCode: { type: String, required: true },
    userId: { type: String, required: true },
    propertyId: { type: String, required: true },
    roomIds: { type: [String], required: true }, // Updated to array
    status: { type: String, required: true, enum: ['Confirmed', 'Pending', 'Cancelled'] },
    thirdPartyReservationIdType8: { type: String, required: false },
    thirdPartyReservationIdType3: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
});

const reservationLogSchema = new Schema<IReservationLog>({
    bookingId: { type: String, required: false },
    jsonInput: { type: String, required: true },
    xmlSent: { type: String, required: true },
    apiResponse: { type: String, required: true },
    status: { type: String, required: true, enum: ['Success', 'Failure'] },
    errorMessage: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
});

export const ThirdPartyBooking = model<IThirdPartyBooking>('ReservationDetails', thirdPartyBookingSchema);
export const ReservationLog = model<IReservationLog>('ReservationLog', reservationLogSchema);