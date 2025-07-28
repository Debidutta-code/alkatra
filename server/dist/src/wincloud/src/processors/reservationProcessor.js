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
exports.ReservationProcessor = void 0;
const uuid_1 = require("uuid");
class ReservationProcessor {
    processReservationInput(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookingDetails, ageCodeSummary } = data;
            const { userId, checkInDate, checkOutDate, hotelCode, hotelName, ratePlanCode, roomTypeCode, numberOfRooms, roomTotalPrice, currencyCode, guests, email, phone, reservationId, paymentMethod, } = bookingDetails;
            console.log("ReservationProcessor: Processing reservation input data:", bookingDetails);
            const reservationData = {
                userId,
                hotelCode,
                hotelName,
                ratePlanCode,
                roomTypeCode,
                numberOfRooms,
                checkInDate: new Date(checkInDate),
                checkOutDate: new Date(checkOutDate),
                amountBeforeTax: roomTotalPrice,
                currencyCode,
                guests,
                email,
                phone,
                reservationId: reservationId || (0, uuid_1.v4)(),
                ageCodeSummary,
                roomTotalPrice,
                paymentMethod,
            };
            return reservationData;
        });
    }
}
exports.ReservationProcessor = ReservationProcessor;
//# sourceMappingURL=reservationProcessor.js.map