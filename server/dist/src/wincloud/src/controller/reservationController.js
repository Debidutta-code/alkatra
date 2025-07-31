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
exports.ThirdPartyReservationService = exports.ThirdPartyReservationController = void 0;
const reservationService_1 = require("../service/reservationService");
Object.defineProperty(exports, "ThirdPartyReservationService", { enumerable: true, get: function () { return reservationService_1.ThirdPartyReservationService; } });
class ThirdPartyReservationController {
    constructor() {
        this.service = new reservationService_1.ThirdPartyReservationService();
    }
    handleThirdPartyReservation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body.data;
                console.log('##################\nController Received JSON:', JSON.stringify(data, null, 2));
                if (!data || !data.guests || !data.guests[0] || !data.roomAssociations || !data.roomAssociations[0] ||
                    !data.bookingDetails || !data.payment) {
                    res.status(400).json({ error: 'Invalid JSON payload: missing required fields' });
                    return;
                }
                const { checkInDate, checkOutDate } = data.bookingDetails;
                const currentDate = new Date().toISOString().split('T')[0];
                const formattedCheckInDate = new Date(checkInDate).toISOString().split('T')[0];
                const formattedCheckOutDate = new Date(checkOutDate).toISOString().split('T')[0];
                if (formattedCheckInDate < currentDate || formattedCheckOutDate < currentDate) {
                    res.status(400).json({ error: 'Check-in and check-out dates must be in the future' });
                    return;
                }
                if (new Date(checkInDate) >= new Date(checkOutDate)) {
                    res.status(400).json({ error: 'Check-in date must be before check-out date' });
                    return;
                }
                yield this.service.processThirdPartyReservation(data);
                res.status(201).json({ message: 'Reservation processed successfully' });
            }
            catch (error) {
                console.error('Controller Error:', error);
                res.status(500).json({ error: "Controller error" });
            }
        });
    }
}
exports.ThirdPartyReservationController = ThirdPartyReservationController;
//# sourceMappingURL=reservationController.js.map