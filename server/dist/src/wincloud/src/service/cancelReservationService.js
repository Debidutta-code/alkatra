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
exports.ThirdPartyCancelReservationService = void 0;
const cancelReservationRepository_1 = require("../repository/cancelReservationRepository");
const reservationModel_1 = require("../model/reservationModel");
const apiClient_1 = require("../utils/apiClient");
class ThirdPartyCancelReservationService {
    constructor() {
        this.repository = new cancelReservationRepository_1.ThirdPartyCancelReservationRepository();
    }
    processCancelReservation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let xml = '';
            try {
                console.log('▶️ Starting third-party cancel reservation processing...');
                const reservation = yield reservationModel_1.ThirdPartyBooking.findOne({ reservationId: data.reservationId });
                if (!reservation) {
                    throw new Error('Reservation not found');
                }
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkInDate = new Date(reservation.checkInDate);
                checkInDate.setHours(0, 0, 0, 0);
                if (today >= checkInDate) {
                    throw new Error("Can't cancel reservation. Your check-in date already passed.");
                }
                const reservationData = {
                    reservationId: data.reservationId,
                    hotelCode: data === null || data === void 0 ? void 0 : data.hotelCode,
                    hotelName: data === null || data === void 0 ? void 0 : data.hotelName,
                    firstName: data === null || data === void 0 ? void 0 : data.firstName,
                    lastName: data === null || data === void 0 ? void 0 : data.lastName,
                    checkInDate: data === null || data === void 0 ? void 0 : data.checkInDate,
                    checkOutDate: data === null || data === void 0 ? void 0 : data.checkOutDate,
                    status: 'Cancelled',
                };
                xml = formatCancelReservationXml(Object.assign(Object.assign({}, reservationData), { checkInDate: reservationData.checkInDate, checkOutDate: reservationData.checkOutDate }));
                console.log('📤 XML to be sent:\n', xml);
                const apiClient = new apiClient_1.ApiClient();
                const apiResponse = yield apiClient.sendToThirdParty(xml);
                const enrichedReservationData = Object.assign({}, reservationData);
                yield this.repository.createCancelReservation(enrichedReservationData, xml, JSON.stringify(apiResponse));
                return data.reservationId;
            }
            catch (error) {
                console.error('🚨 Service Error:', error.message);
                throw new Error(error.message);
            }
        });
    }
}
exports.ThirdPartyCancelReservationService = ThirdPartyCancelReservationService;
// Placeholder for XML formatter
function formatCancelReservationXml(data) {
    return `<OTA_CancelRQ xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.opentravel.org/OTA/2003/05"
    EchoToken="987654323" TimeStamp="2025-04-30T15:00:00Z" Version="1.0" CancelType="Cancel">
    <POS>
        <Source>
            <RequestorID ID="TripSwift" Type="" />
            <BookingChannel Type=""></BookingChannel>
        </Source>
    </POS>
    <UniqueID ID="${data.reservationId}" Type="14" ID_Context="WINCLOUD" />
    <Verification>
        <PersonName>
            <GivenName>${data.firstName}</GivenName>
        </PersonName>
        <TPA_Extensions>
            <BasicPropertyInfo HotelCode="${data.hotelCode}" HotelName="${data.hotelName}" />
        </TPA_Extensions>
    </Verification>
</OTA_CancelRQ>`;
}
//# sourceMappingURL=cancelReservationService.js.map