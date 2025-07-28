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
exports.ThirdPartyReservationService = void 0;
const reservationRepository_1 = require("../repository/reservationRepository");
const reservationProcessor_1 = require("../processors/reservationProcessor");
const reservationXmlFormatter_1 = require("../formatters/reservationXmlFormatter");
const apiClient_1 = require("../utils/apiClient");
class ThirdPartyReservationService {
    constructor() {
        this.repository = new reservationRepository_1.ThirdPartyReservationRepository();
        this.processor = new reservationProcessor_1.ReservationProcessor();
        this.formatter = new reservationXmlFormatter_1.XmlFormatter();
        this.apiClient = new apiClient_1.ApiClient();
        console.log('ThirdPartyReservationService initialized.');
    }
    processThirdPartyReservation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Starting third-party reservation processing...');
                // console.log(`@@@@@@@@@@@@@@@@@@@@\nReceived data: ${JSON.stringify(data)}`);
                const reservationData = yield this.processor.processReservationInput(data);
                // Step 2: Generate XML
                const xml = yield this.formatter.generateReservationXml(reservationData);
                // console.log('Generated XML with reservationId:', reservationData.reservationId);
                // let response: any;
                // Step 3: Send to third-party API
                const response = yield this.apiClient.sendToThirdParty(xml);
                console.log('Third-party API call result:', response);
                const enrichedReservationData = Object.assign({}, reservationData);
                const responseString = typeof response === 'string' ? response : JSON.stringify(response);
                yield this.repository.createThirdPartyBooking(enrichedReservationData, xml, responseString);
                console.log('Booking saved with reservationId:', enrichedReservationData.reservationId);
                return enrichedReservationData.reservationId;
            }
            catch (error) {
                console.error('Service Error:', error);
                throw new Error(`Failed to process reservation: ${error.message}`);
            }
        });
    }
}
exports.ThirdPartyReservationService = ThirdPartyReservationService;
//# sourceMappingURL=reservationService.js.map