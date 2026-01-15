import { QuotusPMSApiClient } from '../utils/apiClient';
import { QuotusPMSReservationRepository } from '../repositories/reservation.repository';
import { ThirdPartyBooking } from '../../../wincloud/src/model/reservationModel';
import { PropertyInfo } from '../../../property_management/src/model';

export interface IAmendReservationInput {
  bookingDetails: {
    userId: string;
    reservationId: string;
    checkInDate: string;
    checkOutDate: string;
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    numberOfRooms: number;
    roomTotalPrice: number;
    currencyCode: string;
    guests: any[];
    email: string;
    phone: string;
  };
  ageCodeSummary: Record<string, number>;
}

export class QuotusPMSAmendService {
  private repository: QuotusPMSReservationRepository;
  private apiClient: QuotusPMSApiClient;

  constructor(apiEndpoint?: string, accessToken?: string) {
    this.repository = new QuotusPMSReservationRepository();
    this.apiClient = new QuotusPMSApiClient(apiEndpoint, accessToken);
    console.log('QuotusPMSAmendService initialized');
  }

  /**
   * Process amendment/update of reservation in QuotusPMS
   */
  async processAmendReservation(propertyId: string, amendData: IAmendReservationInput): Promise<string> {
    try {
      console.log('🔄 Processing QuotusPMS amendment for reservation:', amendData.bookingDetails.reservationId);

      // Step 1: Get property code
      const propertyCode = await this.repository.getPropertyCode(propertyId);
      if (!propertyCode) {
        throw new Error('Invalid property ID: Property code not found');
      }

      // Step 2: Get existing reservation from database
      const existingReservation = await ThirdPartyBooking.findOne({ 
        reservationId: amendData.bookingDetails.reservationId 
      });

      if (!existingReservation) {
        throw new Error(`Reservation not found with ID: ${amendData.bookingDetails.reservationId}`);
      }

      // Step 3: Check if check-in date has passed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(existingReservation.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);

      if (today >= checkInDate) {
        throw new Error("Can't update reservation. Your check-in date already passed.");
      }

      // Step 4: Get the external booking code (from QuotusPMS)
      // This should be stored when the reservation was created
      const bookingCode = existingReservation.reservationId;
      
      console.log('📋 Existing reservation found. Booking Code:', bookingCode);
      console.log('📅 Old dates:', existingReservation.checkInDate, 'to', existingReservation.checkOutDate);
      console.log('📅 New dates:', amendData.bookingDetails.checkInDate, 'to', amendData.bookingDetails.checkOutDate);

      // Step 5: Prepare amendment request for QuotusPMS API
      const amendRequest = {
        bookingCode: bookingCode,
        newFromDate: new Date(amendData.bookingDetails.checkInDate).toISOString(),
        newToDate: new Date(amendData.bookingDetails.checkOutDate).toISOString()
      };

      console.log('📤 Sending amendment to QuotusPMS:', amendRequest);

      // Step 6: Send amendment to QuotusPMS
      let apiResponse: any = null;
      let amendmentStatus = 'Confirmed';

      try {
        apiResponse = await this.apiClient.amendReservation(amendRequest);
        console.log('✅ Amendment successfully sent to QuotusPMS:', apiResponse);
      } catch (apiError: any) {
        console.error('❌ Failed to send amendment to QuotusPMS:', apiError.message);
        amendmentStatus = 'Failed';
        throw new Error(`QuotusPMS amendment failed: ${apiError.message}`);
      }

      // Step 7: Update the reservation in our database
      await ThirdPartyBooking.updateOne(
        { reservationId: amendData.bookingDetails.reservationId },
        {
          $set: {
            checkInDate: new Date(amendData.bookingDetails.checkInDate),
            checkOutDate: new Date(amendData.bookingDetails.checkOutDate),
            ratePlanCode: amendData.bookingDetails.ratePlanCode,
            roomTypeCode: amendData.bookingDetails.roomTypeCode,
            numberOfRooms: amendData.bookingDetails.numberOfRooms,
            totalAmount: amendData.bookingDetails.roomTotalPrice,
            currencyCode: amendData.bookingDetails.currencyCode,
            guestDetails: amendData.bookingDetails.guests,
            email: amendData.bookingDetails.email,
            phone: amendData.bookingDetails.phone,
            updatedAt: new Date()
          }
        }
      );

      console.log('✅ Reservation updated in database');

      return amendData.bookingDetails.reservationId;

    } catch (error: any) {
      console.error('❌ QuotusPMS amendment processing failed:', error.message);
      throw new Error(`Failed to amend QuotusPMS reservation: ${error.message}`);
    }
  }
}
