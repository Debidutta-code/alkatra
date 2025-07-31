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
exports.ThirdPartyReservationRepository = void 0;
const reservationModel_1 = require("../model/reservationModel");
class ThirdPartyReservationRepository {
    createThirdPartyBooking(data, xmlSent, apiResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = new reservationModel_1.ThirdPartyBooking({
                userId: data.userId,
                guestDetails: data.guests,
                email: data.email,
                phone: data.phone,
                reservationId: data.reservationId,
                hotelCode: data.hotelCode,
                hotelName: data.hotelName,
                ratePlanCode: data.ratePlanCode,
                roomTypeCode: data.roomTypeCode,
                checkInDate: new Date(data.checkInDate),
                checkOutDate: new Date(data.checkOutDate),
                numberOfRooms: data.numberOfRooms,
                ageCodeSummary: data.ageCodeSummary,
                totalAmount: data.amountBeforeTax,
                currencyCode: data.currencyCode,
                status: 'Confirmed',
                paymentMethod: data.paymentMethod,
            });
            console.log(`The currency code in WINCLOUD Repository ${booking.currencyCode}`);
            const savedBooking = yield booking.save();
            yield this.logReservationAttempt(data, xmlSent, apiResponse, true, savedBooking._id.toString());
        });
    }
    logReservationAttempt(jsonInput, xmlSent, apiResponse, success, bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`@@@@ Logging reservation attempt: ${success ? 'Success' : 'Failure'}`);
            const log = new reservationModel_1.ReservationLog({
                bookingId,
                reservationId: jsonInput.reservationId,
                hotelCode: jsonInput.hotelCode,
                hotelName: jsonInput.hotelName,
                ratePlanCode: jsonInput.ratePlanCode,
                roomTypeCode: jsonInput.roomTypeCode,
                guestDetails: jsonInput.guests,
                email: jsonInput.email,
                phone: jsonInput.phone,
                checkInDate: new Date(jsonInput.checkInDate),
                checkOutDate: new Date(jsonInput.checkOutDate),
                jsonInput: JSON.stringify(jsonInput, null, 2),
                status: 'Confirmed',
                xmlSent,
                apiResponse,
                process: 'Reservation',
                errorMessage: success ? null : apiResponse,
                timestamp: new Date(),
            });
            yield log.save();
        });
    }
}
exports.ThirdPartyReservationRepository = ThirdPartyReservationRepository;
//# sourceMappingURL=reservationRepository.js.map