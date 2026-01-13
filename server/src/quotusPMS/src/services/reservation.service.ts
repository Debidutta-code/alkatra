import { QuotusPMSFormatter } from '../formatters/reservation.formatter';
import { QuotusPMSReservationRepository } from '../repositories/reservation.repository';
import { QuotusPMSApiClient } from '../utils/apiClient';
import { IReservationInput, IQuotusPMSReservation } from '../interfaces/reservation.interface';

export class QuotusPMSReservationService {
  private formatter: QuotusPMSFormatter;
  private repository: QuotusPMSReservationRepository;
  private apiClient: QuotusPMSApiClient;

  constructor(apiEndpoint?: string, accessToken?: string) {
    this.formatter = new QuotusPMSFormatter();
    this.repository = new QuotusPMSReservationRepository();
    this.apiClient = new QuotusPMSApiClient(apiEndpoint, accessToken);
    console.log('QuotusPMSReservationService initialized');
  }

  /**
   * Process reservation and send to QuotusPMS
   */
  async processReservation(input: IReservationInput): Promise<string> {
    try {
      console.log(input)
      console.log('Processing QuotusPMS reservation...');
      console.log('Property ID:', input.propertyId);
      // console.log('Reservation ID:', input.bookingDetails.reservationId);

      const propertyCode = await this.repository.getPropertyCode(input.propertyId);
      if (!propertyCode) {
        throw new Error('Invalid property ID: Property code not found');
      }

      // Step 1: Format reservation data
      const reservation: IQuotusPMSReservation = this.formatter.formatReservation(input);
      console.log("Data for validation:", reservation);
      // Step 2: Validate reservation data
      const validation = this.formatter.validateReservation(reservation);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Step 3: Prepare JSON payload
      const requestPayload = JSON.stringify(reservation, null, 2);
      console.log('Request payload prepared');

      // Step 4: Send to QuotusPMS
      let pmsResponse: any;
      let status: 'pending' | 'confirmed' | 'failed' = 'pending';

      try {
        pmsResponse = await this.apiClient.sendReservation(reservation, propertyCode);
        status = 'confirmed';
        console.log('Successfully sent to QuotusPMS');
      } catch (apiError: any) {
        console.error('Failed to send to QuotusPMS:', apiError.message);
        pmsResponse = { error: apiError.message };
        status = 'failed';
        // Don't throw here, we still want to save the record
      }

      const responsePayload = JSON.stringify(pmsResponse, null, 2);

      // Step 5: Save to database
      await this.repository.createReservation(
        input.propertyId,
        pmsResponse.data.reservationId,
        reservation,
        requestPayload,
        responsePayload,
        status
      );

      console.log('Reservation saved to database with status:', status);

      if (status === 'failed') {
        throw new Error('Failed to send reservation to QuotusPMS');
      }

      return input.bookingDetails.reservationId;
    } catch (error: any) {
      console.error('Service Error:', error);
      throw new Error(`Failed to process reservation: ${error.message}`);
    }
  }

  /**
   * Get reservation by ID
   */
  async getReservation(reservationId: string) {
    try {
      return await this.repository.findByReservationId(reservationId);
    } catch (error: any) {
      throw new Error(`Failed to get reservation: ${error.message}`);
    }
  }

  /**
   * Get reservations by property ID
   */
  async getPropertyReservations(propertyId: string) {
    try {
      return await this.repository.findByPropertyId(propertyId);
    } catch (error: any) {
      throw new Error(`Failed to get property reservations: ${error.message}`);
    }
  }
}
