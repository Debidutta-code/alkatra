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
exports.ThirdPartyAmendReservationService = void 0;
const amendReservationXmlFormatter_1 = require("../formatters/amendReservationXmlFormatter");
const amendReservationProcessor_1 = require("../processors/amendReservationProcessor");
const reservationModel_1 = require("../model/reservationModel");
const apiClient_1 = require("../utils/apiClient");
const amendReservationRepository_1 = require("../repository/amendReservationRepository");
class ThirdPartyAmendReservationService {
    constructor() {
        this.repository = new amendReservationRepository_1.ThirdPartyAmendReservationRepository();
        console.log('ThirdPartyAmendReservationService initialized.');
    }
    processAmendReservation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let xml = '';
            try {
                console.log('Starting third-party amend reservation processing...');
                const reservation = yield reservationModel_1.ThirdPartyBooking.findOne({ reservationId: data.bookingDetails.reservationId });
                if (!reservation) {
                    throw new Error('Reservation not found');
                }
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkInDate = new Date(reservation.checkInDate);
                checkInDate.setHours(0, 0, 0, 0);
                if (today >= checkInDate) {
                    throw new Error("Can't update reservation. Your check-in date already passed.");
                }
                console.log('@@@@@@@@@@@@@@@@@@The data we get from controller', data);
                const amendReservationData = yield (0, amendReservationProcessor_1.prepareAmendReservationData)(data);
                console.log('###########The amend reservation data is:', amendReservationData);
                xml = (0, amendReservationXmlFormatter_1.generateAmendReservationXML)(amendReservationData);
                console.log('#@#@#@#@#@#@#@#@#Generated XML:', xml);
                const apiClient = new apiClient_1.ApiClient();
                const apiResponse = yield apiClient.sendToThirdParty(xml);
                const enrichedAmendReservationData = Object.assign({}, amendReservationData);
                yield this.repository.createAmendReservation(enrichedAmendReservationData, xml, JSON.stringify(apiResponse));
                // return data.reservationId;
                return '';
            }
            catch (error) {
                console.error('Service Error:', error.message);
                throw new Error(error.message);
            }
        });
    }
}
exports.ThirdPartyAmendReservationService = ThirdPartyAmendReservationService;
//# sourceMappingURL=amendReservationService.js.map