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
exports.prepareAmendReservationData = prepareAmendReservationData;
const reservationModel_1 = require("../model/reservationModel");
function prepareAmendReservationData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const hotelData = yield reservationModel_1.ThirdPartyBooking.findOne({ reservationId: (_a = data.bookingDetails) === null || _a === void 0 ? void 0 : _a.reservationId });
        if (!hotelData) {
            throw new Error(`Reservation with ID ${(_b = data.bookingDetails) === null || _b === void 0 ? void 0 : _b.reservationId} not found`);
        }
        return {
            hotelCode: (_c = data.bookingDetails) === null || _c === void 0 ? void 0 : _c.hotelCode,
            hotelName: (_d = data.bookingDetails) === null || _d === void 0 ? void 0 : _d.hotelName,
            ratePlanCode: (_e = data.bookingDetails) === null || _e === void 0 ? void 0 : _e.ratePlanCode,
            roomTypeCode: (_f = data.bookingDetails) === null || _f === void 0 ? void 0 : _f.roomTypeCode,
            numberOfRooms: (_g = data.bookingDetails) === null || _g === void 0 ? void 0 : _g.numberOfRooms,
            guests: (_h = data.bookingDetails) === null || _h === void 0 ? void 0 : _h.guests,
            email: (_j = data.bookingDetails) === null || _j === void 0 ? void 0 : _j.email,
            phone: (_k = data.bookingDetails) === null || _k === void 0 ? void 0 : _k.phone,
            checkInDate: (_l = data.bookingDetails) === null || _l === void 0 ? void 0 : _l.checkInDate,
            checkOutDate: (_m = data.bookingDetails) === null || _m === void 0 ? void 0 : _m.checkOutDate,
            ageCodeSummary: data.ageCodeSummary,
            amountBeforeTax: (_o = data.bookingDetails) === null || _o === void 0 ? void 0 : _o.roomTotalPrice,
            currencyCode: ((_p = data.bookingDetails) === null || _p === void 0 ? void 0 : _p.currencyCode) || 'USD',
            userId: ((_q = data.bookingDetails) === null || _q === void 0 ? void 0 : _q.userId) || '',
            status: 'Modified',
            reservationId: (_r = data.bookingDetails) === null || _r === void 0 ? void 0 : _r.reservationId,
        };
    });
}
//# sourceMappingURL=amendReservationProcessor.js.map