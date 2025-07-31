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
exports.ThirdPartyCancelReservationRepository = void 0;
const reservationModel_1 = require("../model/reservationModel");
class ThirdPartyCancelReservationRepository {
    constructor() {
        console.log('ThirdPartyCancelReservationRepository initialized.');
    }
    createCancelReservation(data, xmlRequest, xmlResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkInDate = new Date(data.checkInDate);
                checkInDate.setHours(0, 0, 0, 0);
                if (today >= checkInDate) {
                    throw new Error('Cannot cancel reservation');
                }
                console.log('Updating booking to cancelled status...');
                // Find and update the booking
                const updatedBooking = yield reservationModel_1.ThirdPartyBooking.findOneAndUpdate({ reservationId: data.reservationId }, {
                    $set: {
                        status: data.status,
                        hotelCode: data.hotelCode,
                        hotelName: data.hotelName,
                        checkInDate: data.checkInDate,
                        checkOutDate: data.checkOutDate,
                        guestDetails: [
                            {
                                firstName: data.firstName,
                                lastName: data.lastName
                            },
                        ],
                        xmlRequest,
                        xmlResponse,
                        updatedAt: new Date(),
                    },
                }, { new: true });
                if (!updatedBooking) {
                    throw new Error('Booking not found for cancellation');
                }
                try {
                    yield reservationModel_1.ReservationLog.create({
                        bookingId: (_a = updatedBooking._id) === null || _a === void 0 ? void 0 : _a.toString(),
                        reservationId: updatedBooking.reservationId,
                        hotelCode: updatedBooking.hotelCode,
                        hotelName: updatedBooking.hotelName,
                        ratePlanCode: updatedBooking.ratePlanCode,
                        roomTypeCode: updatedBooking.roomTypeCode,
                        checkInDate: updatedBooking.checkInDate,
                        checkOutDate: updatedBooking.checkOutDate,
                        jsonInput: JSON.stringify(data),
                        xmlSent: xmlRequest,
                        apiResponse: xmlResponse,
                        process: 'Cancellation',
                        status: 'Success',
                        timestamp: new Date(),
                    });
                }
                catch (logError) {
                    console.error('Error logging failure:', logError);
                }
                console.log('Booking updated successfully:', updatedBooking.reservationId);
                return updatedBooking;
            }
            catch (error) {
                console.error('Error updating booking in repository:', error.message);
                throw new Error(`Failed to update booking: ${error.message}`);
            }
        });
    }
}
exports.ThirdPartyCancelReservationRepository = ThirdPartyCancelReservationRepository;
//# sourceMappingURL=cancelReservationRepository.js.map