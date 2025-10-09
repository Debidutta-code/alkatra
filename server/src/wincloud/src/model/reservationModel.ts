import { Schema, model, Document } from 'mongoose';

interface IGuestDetails {
    firstName: string;
    lastName: string;
    dob: string;
}

interface IThirdPartyBooking extends Document {
    provider: string;
    coupon: string[];
    taxValue?: number;
    reservationId: string;
    paymentMethod: string;
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    checkInDate: Date;
    checkOutDate: Date;
    guestDetails?: IGuestDetails[]; 
    email: string;
    phone: string;
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
    updatedAt: Date;
}

interface IReservationLog extends Document {
    bookingId?: string;
    reservationId: string;
    paymentMethod: string;
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    guestDetails?: IGuestDetails[]; 
    email: string;
    phone: string;
    checkInDate: Date;
    checkOutDate: Date;
    jsonInput: string;
    xmlSent: string;
    apiResponse: string;
    process: 'Reservation' | 'Amend Reservation' | 'Cancellation';
    status: string;
    errorMessage?: string;
    timestamp: Date;
}

const guestDetailsSchema = new Schema<IGuestDetails>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: {type: String, required: true},
});

const thirdPartyBookingSchema = new Schema<IThirdPartyBooking>({
    provider: { type: String, required: true, enum: ['mobile', 'web']  },
    coupon: { type: [String], required: false },
    taxValue: { type: Number, required: false, default: 0 },
    reservationId: { type: String, required: true, unique: true },
    paymentMethod: { type: String, required: true },
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: false },
    ratePlanCode: { type: String, required: true },
    roomTypeCode: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    guestDetails: { type: [guestDetailsSchema], required: false },
    email: {type: String, required: false},
    phone: {type: String, required: false},
    ageCodeSummary: { type: Map, of: Number, required: true },
    numberOfRooms: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currencyCode: { type: String, required: true },
    userId: { type: String, required: true },
    status: { type: String, required: false, enum: ['Confirmed', 'Pending', 'Cancelled'] },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
});

const reservationLogSchema = new Schema<IReservationLog>({
    bookingId: { type: String, required: false },
    paymentMethod: { type: String, required: false },
    reservationId: { type: String, required: true},
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: true },
    ratePlanCode: { type: String, required: true },
    roomTypeCode: { type: String, required: true },
    guestDetails: { type: [guestDetailsSchema], required: false },
    email: {type: String, required: false},
    phone: {type: String, required: false},
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    jsonInput: { type: String, required: true },
    xmlSent: { type: String, required: true },
    apiResponse: { type: String, required: true },
    status: { type: String, required: true },
    process: { type: String, required: true, enum: ['Reservation', 'Amend Reservation', 'Cancellation'] },
    errorMessage: { type: String, required: false },
    timestamp: { type: Date, default: () => new Date()},
});

export const ThirdPartyBooking = model<IThirdPartyBooking>('WincloudReservation', thirdPartyBookingSchema);
export const ReservationLog = model<IReservationLog>('WincloudReservationLog', reservationLogSchema);
