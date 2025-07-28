"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdPartyAmendReservationRepository = void 0;
const reservationModel_1 = require("../model/reservationModel");
class ThirdPartyAmendReservationRepository {
    constructor() {
        console.log('ThirdPartyCancelReservationRepository initialized.');
    }
    createAmendReservation(data, xmlRequest, xmlResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkInDate = new Date(data.checkInDate);
                checkInDate.setHours(0, 0, 0, 0);
                if (today >= checkInDate) {
                    throw new Error('Cannot update reservation.');
                }
                console.log('Updating booking to cancelled status...');
                const updatedBooking = yield reservationModel_1.ThirdPartyBooking.findOneAndUpdate({ reservationId: data.reservationId }, {
                    $set: {
                        status: data.status,
                        hotelCode: data.hotelCode,
                        hotelName: data.hotelName,
                        numberOfRooms: data.numberOfRooms,
                        guestDetails: data.guests,
                        email: data.email,
                        phone: data.phone,
                        checkInDate: data.checkInDate,
                        checkOutDate: data.checkOutDate,
                        ageCodeSummary: data.ageCodeSummary,
                        totalAmount: data.amountBeforeTax,
                        xmlRequest,
                        xmlResponse,
                        updatedAt: new Date(),
                    },
                }, { new: true });
                if (!updatedBooking) {
                    throw new Error('Booking not found for cancellation');
                }
                // Create log entry
                yield reservationModel_1.ReservationLog.create({
                    bookingId: (_a = updatedBooking._id) === null || _a === void 0 ? void 0 : _a.toString(),
                    reservationId: updatedBooking.reservationId,
                    hotelCode: updatedBooking.hotelCode,
                    hotelName: updatedBooking.hotelName,
                    numberOfRooms: updatedBooking.numberOfRooms,
                    guestDetails: updatedBooking.guestDetails,
                    email: updatedBooking.email,
                    phone: updatedBooking.phone,
                    ratePlanCode: updatedBooking.ratePlanCode,
                    roomTypeCode: updatedBooking.roomTypeCode,
                    checkInDate: updatedBooking.checkInDate,
                    checkOutDate: updatedBooking.checkOutDate,
                    ageCodeSummary: data.ageCodeSummary,
                    totalAmount: data.amountBeforeTax,
                    jsonInput: JSON.stringify(data),
                    xmlSent: xmlRequest,
                    apiResponse: xmlResponse,
                    process: 'Amend Reservation',
                    status: 'Success',
                    timestamp: new Date(),
                });
                console.log('Booking and log updated successfully:', updatedBooking.reservationId);
                return updatedBooking;
            }
            catch (error) {
                console.error('Error updating booking in repository:', error.message);
                // Optional: log failure
                try {
                    yield reservationModel_1.ReservationLog.create({
                        reservationId: data.reservationId,
                        hotelCode: data.hotelCode,
                        hotelName: data.hotelName,
                        ratePlanCode: data.ratePlanCode,
                        roomTypeCode: data.roomTypeCode,
                        checkInDate: data.checkInDate,
                        checkOutDate: data.checkOutDate,
                        jsonInput: JSON.stringify(data),
                        xmlSent: xmlRequest,
                        apiResponse: xmlResponse,
                        process: 'Cancellation',
                        status: 'Failure',
                        errorMessage: error.message,
                        timestamp: new Date(),
                    });
                }
                catch (logError) {
                    console.error('Error logging failure:', logError);
                }
                throw new Error(`Failed to update booking: ${error.message}`);
            }
        });
    }
}
exports.ThirdPartyAmendReservationRepository = ThirdPartyAmendReservationRepository;
//# sourceMappingURL=amendReservationRepository.js.map