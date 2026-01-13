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
      console.log('📥 Input received in QuotusPMS service:', JSON.stringify(input, null, 2));
      console.log('Processing QuotusPMS reservation...');
      console.log('Property ID:', input.propertyId);
      // console.log('Reservation ID:', input.bookingDetails.reservationId);

      const propertyCode = await this.repository.getPropertyCode(input.propertyId);
      if (!propertyCode) {
        throw new Error('Invalid property ID: Property code not found');
      }

      // Step 1: Format reservation data
      console.log('🔄 About to call formatter.formatReservation with input:', {
        propertyId: input.propertyId,
        hasBookingDetails: !!input.bookingDetails,
        hasRooms: !!input.rooms,
        roomsCount: input.rooms?.length,
        hasGuests: !!(input.bookingDetails as any).guests,
        guestsCount: (input.bookingDetails as any).guests?.length,
        reservationId: input.bookingDetails?.reservationId
      });
      
      // Temporary: Log the exact structure the formatter will receive
      console.log('📋 Full input structure:');
      console.log('  - input.propertyId:', input.propertyId);
      console.log('  - input.bookingDetails:', typeof input.bookingDetails);
      console.log('  - input.rooms:', Array.isArray(input.rooms), input.rooms?.length);
      console.log('  - input.ageCodeSummary:', "10");
      
      let reservation: IQuotusPMSReservation;
      try {
        reservation = this.formatter.formatReservation(input);
      } catch (formatError: any) {
        console.error('❌ Formatter error details:', formatError);
        console.error('Stack:', formatError.stack);
        console.error('Error message:', formatError.message);
        console.error('Input keys:', Object.keys(input));
        console.error('BookingDetails keys:', Object.keys(input.bookingDetails));
        console.error('Input at time of error:', JSON.stringify(input, null, 2));
        
        // Try to identify which field is undefined
        console.error('Checking fields:');
        console.error('  - input.bookingDetails.guests:', input.bookingDetails ? (input.bookingDetails as any).guests : 'bookingDetails is undefined');
        console.error('  - input.rooms:', input.rooms);
        
        throw formatError;
      }
      
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
