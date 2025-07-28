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
exports.ThirdPartyAmendReservationService = exports.ThirdPartyAmendReservationController = void 0;
const amendReservationService_1 = require("../service/amendReservationService");
Object.defineProperty(exports, "ThirdPartyAmendReservationService", { enumerable: true, get: function () { return amendReservationService_1.ThirdPartyAmendReservationService; } });
class ThirdPartyAmendReservationController {
    constructor() {
        this.service = new amendReservationService_1.ThirdPartyAmendReservationService();
    }
    handleAmendReservation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                console.log('##################\nController Received JSON:', JSON.stringify(data, null, 2));
                if (!data.reservationId) {
                    res.status(400).json({ error: 'Invalid JSON payload: missing reservationId' });
                    return;
                }
                yield this.service.processAmendReservation(data);
                res.status(200).json({ message: 'Reservation amendment processed successfully' });
            }
            catch (error) {
                console.error('Controller Error:', error);
                res.status(500).json({ error: error.message });
            }
        });
    }
}
exports.ThirdPartyAmendReservationController = ThirdPartyAmendReservationController;
//# sourceMappingURL=amendReservationController.js.map