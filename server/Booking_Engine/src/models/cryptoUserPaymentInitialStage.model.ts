import { Schema, model, Document } from 'mongoose';

interface IGuestDetails {
    firstName: string;
    lastName: string;
    dob: string;
}

interface ICryptoBooking extends Document {
    reservationId: string;
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    checkInDate: string; 
    checkOutDate: string;
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
    txHash?: string;
    senderWalletAddress?: string;
    status?: string;
    createdAt: Date;
}

const guestDetailsSchema = new Schema<IGuestDetails>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: {type: String, required: true},
});

const cryptoBookingSchema = new Schema<ICryptoBooking>({
    reservationId: { type: String, required: true, unique: true },
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: false },
    ratePlanCode: { type: String, required: true },
    roomTypeCode: { type: String, required: true },
    checkInDate: { type: String, required: true },
    checkOutDate: { type: String, required: true },
    guestDetails: { type: [guestDetailsSchema], required: false },
    email: {type: String, required: false},
    phone: {type: String, required: false},
    ageCodeSummary: { type: Map, of: Number, required: true },
    numberOfRooms: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currencyCode: { type: String, required: true, enum: ['usd'], default: 'usd' },
    userId: { type: String, required: true },
    txHash: {type: String,required: false},
    senderWalletAddress: {type: String, require: false},
    status: { type: String, required: false, enum: ['Confirmed', 'Processing', 'Cancelled'] },
    createdAt: { type: Date, default: Date.now },
});

export const CryptoGuestDetails = model<ICryptoBooking>('CryptoGuestDetails', cryptoBookingSchema);