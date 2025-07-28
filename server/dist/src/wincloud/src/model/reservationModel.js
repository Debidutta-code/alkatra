"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationLog = exports.ThirdPartyBooking = void 0;
const mongoose_1 = require("mongoose");
const guestDetailsSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: String, required: true },
});
const thirdPartyBookingSchema = new mongoose_1.Schema({
    reservationId: { type: String, required: true, unique: true },
    paymentMethod: { type: String, required: true },
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: false },
    ratePlanCode: { type: String, required: true },
    roomTypeCode: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    guestDetails: { type: [guestDetailsSchema], required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    ageCodeSummary: { type: Map, of: Number, required: true },
    numberOfRooms: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currencyCode: { type: String, required: true },
    userId: { type: String, required: true },
    status: { type: String, required: false, enum: ['Confirmed', 'Pending', 'Cancelled'] },
    createdAt: { type: Date, default: Date.now },
});
const reservationLogSchema = new mongoose_1.Schema({
    bookingId: { type: String, required: false },
    paymentMethod: { type: String, required: false },
    reservationId: { type: String, required: true },
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: true },
    ratePlanCode: { type: String, required: true },
    roomTypeCode: { type: String, required: true },
    guestDetails: { type: [guestDetailsSchema], required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    jsonInput: { type: String, required: true },
    xmlSent: { type: String, required: true },
    apiResponse: { type: String, required: true },
    status: { type: String, required: true },
    process: { type: String, required: true, enum: ['Reservation', 'Amend Reservation', 'Cancellation'] },
    errorMessage: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
});
exports.ThirdPartyBooking = (0, mongoose_1.model)('WincloudReservation', thirdPartyBookingSchema);
exports.ReservationLog = (0, mongoose_1.model)('WincloudReservationLog', reservationLogSchema);
//# sourceMappingURL=reservationModel.js.map