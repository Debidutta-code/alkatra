import { ThirdPartyReservationRepository } from '../repository/reservationRepository';
import { ReservationProcessor } from '../processors/reservationProcessor';
import { XmlFormatter } from '../formatters/reservationXmlFormatter';
import { ApiClient } from '../utils/apiClient';
import { ReservationInput, ThirdPartyReservationData } from '../interface/reservationInterface';


export class ThirdPartyReservationService {
    private repository: ThirdPartyReservationRepository;
    private processor: ReservationProcessor;
    private formatter: XmlFormatter;
    private apiClient: ApiClient;

    constructor() {
        this.repository = new ThirdPartyReservationRepository();
        this.processor = new ReservationProcessor();
        this.formatter = new XmlFormatter();
        this.apiClient = new ApiClient();
        console.log('ThirdPartyReservationService initialized.');
    }

    async processThirdPartyReservation(data: ReservationInput): Promise<string> {
        try {
            console.log('Starting third-party reservation processing...');
            console.log(`@@@@@@@@@@@@@@@@@@@@\nReceived data: ${JSON.stringify(data)}`);

            const reservationData: ThirdPartyReservationData = await this.processor.processReservationInput(data);
            console.log('@@@@@@@@@@@@@@@\nProcessed reservation data:', JSON.stringify(reservationData, null, 2));

            // Step 2: Generate XML
            const xml: string = await this.formatter.generateReservationXml(reservationData);
            console.log('Generated XML with reservationId:', reservationData.reservationId);

            // Step 3: Send to third-party API
            const response = await this.apiClient.sendToThirdParty(xml);
            console.log('Third-party API call result:', response);

            const enrichedReservationData: ThirdPartyReservationData = {
                ...reservationData,
            };

            const responseString = typeof response === 'string' ? response : JSON.stringify(response);

            await this.repository.createThirdPartyBooking(
                enrichedReservationData,
                xml,
                responseString
            );
            console.log('Booking saved with reservationId:', enrichedReservationData.reservationId);
            return enrichedReservationData.reservationId;

        } catch (error: any) {
            console.error('Service Error:', error);
            throw new Error(`Failed to process reservation: ${error.message}`);
        }
    }
}