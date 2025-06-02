import { create } from 'xmlbuilder2';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { AmendReservationInput, ThirdPartyAmendReservationData } from '../interface/amendReservationInterface';
import { PropertyInfo } from '../../../Property_Management/src/model/property.info.model';
import { generateAmendReservationXML } from '../formatters/amendReservationXmlFormatter';
import { prepareAmendReservationData } from '../processors/amendReservationProcessor';
import { ThirdPartyBooking } from '../model/reservationModel';
import { ApiClient } from '../utils/apiClient';
import { ThirdPartyAmendReservationRepository } from '../repository/amendReservationRepository';


export class ThirdPartyAmendReservationService {
    private repository: ThirdPartyAmendReservationRepository;

    constructor() {
        this.repository = new ThirdPartyAmendReservationRepository();
        console.log('ThirdPartyAmendReservationService initialized.');
    }

    async processAmendReservation(data: AmendReservationInput): Promise<string> {
        let xml = '';
        try {
            console.log('Starting third-party amend reservation processing...');

            const existingReservation = await ThirdPartyBooking.findOne({ reservationId: data.bookingDetails?.reservationId });
            if (!existingReservation) {
                throw new Error(`Reservation with ID ${data.bookingDetails?.reservationId} not found`);
            }

            const amendReservationData = await prepareAmendReservationData(data);

            xml = generateAmendReservationXML(amendReservationData);
            console.log('Generated XML:', xml);

            const apiClient = new ApiClient();
            const apiResponse = await apiClient.sendToThirdParty(xml);

            const enrichedAmendReservationData = {
                ...amendReservationData,
            };
            
            await this.repository.createAmendReservation(enrichedAmendReservationData, xml, JSON.stringify(apiResponse));
            // return data.reservationId;
            
            return '';
        } catch (error: any) {
            console.error('Service Error:', error.message);
            throw new Error(error.message);
        }
    }
}