import { ThirdPartyReservationRepository } from '../repository/reservationRepository';
import { ReservationProcessor } from '../processors/reservationProcessor';
import { XmlFormatter } from '../formatters/xmlFormatter';
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
            
            // Step 1: Process JSON input and fetch DB data
            const reservationData: ThirdPartyReservationData = await this.processor.processReservationInput(data);
            
            // Step 2: Generate XML
            const xml: string = await this.formatter.generateReservationXml(reservationData);
            console.log('Generated XML with reservationId:', reservationData.reservationId);
            
            // Step 3: Send to third-party API and parse response
            const { parsedResponse, reservationIdMap }: { parsedResponse: any; reservationIdMap: { [key: string]: string } } = await this.apiClient.sendToThirdParty(xml);
            
            // Step 4: Check API response and save booking
            if (parsedResponse.OTA_HotelResNotifRS.Success !== undefined) {
                console.log('API call successful, saving booking...');
                const enrichedReservationData: ThirdPartyReservationData = {
                    ...reservationData,
                    thirdPartyReservationIdType8: reservationIdMap['8'] || '',
                    thirdPartyReservationIdType3: reservationIdMap['3'] || '',
                };
                
                const savedBooking = await this.repository.createThirdPartyBooking(
                    enrichedReservationData,
                    xml,
                    parsedResponse
                );
                console.log('Booking saved with reservationId:', enrichedReservationData.reservationId);
                
                return enrichedReservationData.reservationId;
            } else if (parsedResponse.OTA_HotelResNotifRS.Errors) {
                const error = parsedResponse.OTA_HotelResNotifRS.Errors.Error;
                const errorMessage = `Error Code: ${error.Code || 'Unknown'}, Type: ${error.Type || 'Unknown'}, Status: ${error.Status || 'Unknown'}, ShortText: ${error.ShortText || 'Unknown'}`;
                console.error('API call failed:', errorMessage);
                throw new Error(`Third-party API call failed: ${errorMessage}`);
            } else {
                const errorMessage = 'Unknown error in API response';
                console.error('API call failed:', errorMessage);
                throw new Error(`Third-party API call failed: ${errorMessage}`);
            }
        } catch (error: any) {
            console.error('Service Error:', error);
            throw new Error(`Failed to process reservation: ${error.message}`);
        }
    }
}