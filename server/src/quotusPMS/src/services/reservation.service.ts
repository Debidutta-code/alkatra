import { QuotusPMSFormatter } from '../formatters/reservation.formatter';
import { QuotusPMSReservationRepository } from '../repositories/reservation.repository';
import { QuotusPMSApiClient } from '../utils/apiClient';
import { IReservationInput, IQuotusPMSReservation } from '../interfaces/reservation.interface';
import { PropertyInfo } from '../../../property_management/src/model';
import { ThirdPartyBooking } from '../../../wincloud/src/model/reservationModel';
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
  // reservation.service.ts

  async processReservation(input: IReservationInput): Promise<string> {
    try {
      const propertyCode = await this.repository.getPropertyCode(input.propertyId);
      if (!propertyCode) {
        throw new Error('Invalid property ID: Property code not found');
      }

      console.log("input data for formatting inside procress reservation is: ", input);
      console.log("----------------")
      console.log("----------------")

      // Format & validate for QuotusPMS
      const quotusReservation = this.formatter.formatReservation(input);

      const validation = this.formatter.validateReservation(quotusReservation);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      let apiResponse: any = null;
      let wincloudStatus: string = 'Pending';
      let quotusReservationId: string | null = null;

      // Try to send to QuotusPMS
      try {
        apiResponse = await this.apiClient.sendReservation(quotusReservation, propertyCode);
        wincloudStatus = 'Confirmed';

        // Try to get external reservation ID if Quotus returns it
        quotusReservationId = apiResponse?.reservationId
          ?? apiResponse?.id
          ?? apiResponse?.data?.reservationId
          ?? null;

        console.log('Reservation successfully sent to QuotusPMS');
      } catch (apiError: any) {
        console.error('Failed to send to QuotusPMS:', apiError.message);
        apiResponse = { error: apiError.message };
        wincloudStatus = 'Pending';  // ← or 'Failed' if you want to distinguish
        // You can decide: throw here or continue and save as pending
      }

      // ─────────────────────────────────────────────────────────────
      //              ALWAYS save to WincloudReservation
      // ─────────────────────────────────────────────────────────────
      const guestDetails = input.bookingDetails.guests?.map(guest => ({
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        dob: guest.dob || "1900-01-01"
      })) || [];

      const numberOfRooms = quotusReservation.Rooms.reduce((sum, r) => sum + (r.noOfRooms || 1), 0);

      await ThirdPartyBooking.create({
        provider: "web",
        reservationId: input.bookingDetails.reservationId,
        paymentMethod: quotusReservation.paymentMethod || "none",
        hotelCode: propertyCode,
        hotelName: (await PropertyInfo.findById(input.propertyId))?.property_name || "Unknown Hotel",
        ratePlanCode: quotusReservation.Rooms[0]?.ratePlanCode || "",
        roomTypeCode: quotusReservation.Rooms[0]?.roomCode || "",
        checkInDate: quotusReservation.from,
        checkOutDate: quotusReservation.to,
        guestDetails,
        email: quotusReservation.Guests[0]?.email || "",
        phone: quotusReservation.Guests[0]?.phoneNumber || "",
        ageCodeSummary: this.buildAgeCodeSummary(quotusReservation.Rooms),
        numberOfRooms,
        totalAmount: quotusReservation.totalAmount,
        currencyCode: quotusReservation.currencyCode,
        userId: input.bookingDetails.userId || "system",
        status: wincloudStatus,
        thirdPartyReservationIdType8: quotusReservationId,   // ← external ID if available
        // Optional: you can add error field if you extend schema
        // errorMessage: apiResponse?.error ? apiResponse.error : undefined,
      });

      console.log(`Reservation saved to WincloudReservation with status: ${wincloudStatus}`);

      if (wincloudStatus === 'Pending') {  // means Quotus failed
        throw new Error('Failed to send reservation to QuotusPMS (saved as Pending)');
      }

      return input.bookingDetails.reservationId;

    } catch (error: any) {
      console.error('Reservation processing failed:', error);
      throw error;
    }
  }

  // Simple helper
  private buildAgeCodeSummary(rooms: any[]): Record<string, number> {
    const map: Record<string, number> = {};
    for (const room of rooms) {
      const key = `${room.noOfAdults || 0}a_${room.noOfChildren || 0}c_${room.noOfInfants || 0}i`;
      map[key] = (map[key] || 0) + (room.noOfRooms || 1);
    }
    return map;
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
