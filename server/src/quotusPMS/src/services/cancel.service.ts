import { QuotusPMSApiClient } from '../utils/apiClient';
import { QuotusPMSReservationRepository } from '../repositories/reservation.repository';
import { ThirdPartyBooking } from '../../../wincloud/src/model/reservationModel';
import { ICancelReservationInput } from '../interfaces/cancel.interface';

export class QuotusPMSCancelService {
  private repository: QuotusPMSReservationRepository;
  private apiClient: QuotusPMSApiClient;

  constructor(apiEndpoint?: string, accessToken?: string) {
    this.repository = new QuotusPMSReservationRepository();
    this.apiClient = new QuotusPMSApiClient(apiEndpoint, accessToken);
    console.log('QuotusPMSCancelService initialized');
  }

  /**
   * Process cancellation of reservation in QuotusPMS
   */
  async processCancelReservation(propertyId: string, cancelData: ICancelReservationInput): Promise<string> {
    try {
      console.log('🔄 Processing QuotusPMS cancellation for reservation:', cancelData.reservationId);

      // Step 1: Get property code
      const propertyCode = await this.repository.getPropertyCode(propertyId);
      if (!propertyCode) {
        throw new Error('Invalid property ID: Property code not found');
      }
      console.log('Found property:', propertyCode);

      // Step 2: Get existing reservation from database
      const existingReservation = await ThirdPartyBooking.findOne({ 
        reservationId: cancelData.reservationId 
      });

      if (!existingReservation) {
        throw new Error(`Reservation not found with ID: ${cancelData.reservationId}`);
      }

      // Step 3: Check if check-in date has passed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(existingReservation.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);

      if (today >= checkInDate) {
        throw new Error("Can't cancel reservation. Your check-in date already passed.");
      }

      // Step 4: Get the booking code
      const bookingCode = existingReservation.reservationId;
      
      console.log('📋 Existing reservation found. Booking Code:', bookingCode);
      console.log('📅 Check-in date:', existingReservation.checkInDate);
      console.log('📅 Check-out date:', existingReservation.checkOutDate);

      // Step 5: Prepare cancellation request for QuotusPMS API
      const cancelRequest = {
        bookingCode: bookingCode
      };

      console.log('📤 Sending cancellation to QuotusPMS:', cancelRequest);

      // Step 6: Send cancellation to QuotusPMS
      let apiResponse: any = null;
      let cancellationStatus = 'Cancelled';

      try {
        apiResponse = await this.apiClient.cancelReservation(cancelRequest);
        console.log('✅ Cancellation successfully sent to QuotusPMS:', apiResponse);
      } catch (apiError: any) {
        console.error('❌ Failed to send cancellation to QuotusPMS:', apiError.message);
        cancellationStatus = 'Failed';
        throw new Error(`QuotusPMS cancellation failed: ${apiError.message}`);
      }

      // Step 7: Update the reservation status in our database
      await ThirdPartyBooking.updateOne(
        { reservationId: cancelData.reservationId },
        {
          $set: {
            status: cancellationStatus,
            updatedAt: new Date()
          }
        }
      );

      console.log('✅ Reservation status updated to cancelled in database');

      return cancelData.reservationId;

    } catch (error: any) {
      console.error('❌ QuotusPMS cancellation processing failed:', error.message);
      throw new Error(`Failed to cancel QuotusPMS reservation: ${error.message}`);
    }
  }
}
