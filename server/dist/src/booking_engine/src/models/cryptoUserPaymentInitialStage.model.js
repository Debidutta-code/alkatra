"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoGuestDetails = void 0;
const mongoose_1 = require("mongoose");
const guestDetailsSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: String, required: true },
});
const cryptoBookingSchema = new mongoose_1.Schema({
    reservationId: { type: String, required: true, unique: true },
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: false },
    ratePlanCode: { type: String, required: true },
    roomTypeCode: { type: String, required: true },
    checkInDate: { type: String, required: true },
    checkOutDate: { type: String, required: true },
    guestDetails: { type: [guestDetailsSchema], required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    ageCodeSummary: { type: Map, of: Number, required: true },
    numberOfRooms: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currencyCode: { type: String, required: true, enum: ['USD'], default: 'USD' },
    userId: { type: String, required: true },
    txHash: { type: String, required: false },
    senderWalletAddress: { type: String, require: false },
    status: { type: String, required: false, enum: ['Confirmed', 'Processing', 'Cancelled'] },
    createdAt: { type: Date, default: Date.now },
});
exports.CryptoGuestDetails = (0, mongoose_1.model)('CryptoGuestDetails', cryptoBookingSchema);
//# sourceMappingURL=cryptoUserPaymentInitialStage.model.js.map