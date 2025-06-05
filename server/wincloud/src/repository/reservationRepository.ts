import { ThirdPartyBooking, ReservationLog } from '../model/reservationModel';
import { ThirdPartyReservationData } from '../interface/reservationInterface';

export class ThirdPartyReservationRepository {
  async createThirdPartyBooking(
    data: ThirdPartyReservationData,
    xmlSent: string,
    apiResponse: string
  ): Promise<void> {
    console.log(`@@@@ Creating third-party booking @@@@\n`, JSON.stringify(data, null, 2));

    const booking = new ThirdPartyBooking({
      userId: data.userId,
      guestDetails: data.guests,
      email: data.email,
      phone: data.phone,
      reservationId: data.reservationId,
      hotelCode: data.hotelCode,
      hotelName: data.hotelName,
      ratePlanCode: data.ratePlanCode,
      roomTypeCode: data.roomTypeCode,
      checkInDate: new Date(data.checkInDate),
      checkOutDate: new Date(data.checkOutDate),
      numberOfRooms: data.numberOfRooms,
      ageCodeSummary: data.ageCodeSummary,
      totalAmount: data.amountBeforeTax,
      currencyCode: data.currencyCode,
    });

    const savedBooking = await booking.save();

    await this.logReservationAttempt(
      data,
      xmlSent,
      apiResponse,
      true,
      savedBooking._id.toString()
    );
  }

  async logReservationAttempt(
    jsonInput: ThirdPartyReservationData,
    xmlSent: string,
    apiResponse: string,
    success: boolean,
    bookingId?: string
  ): Promise<void> {
    console.log(`@@@@ Logging reservation attempt: ${success ? 'Success' : 'Failure'}`);

    const log = new ReservationLog({
      bookingId,
      reservationId: jsonInput.reservationId,
      hotelCode: jsonInput.hotelCode,
      hotelName: jsonInput.hotelName,
      ratePlanCode: jsonInput.ratePlanCode,
      roomTypeCode: jsonInput.roomTypeCode,
      guestDetails: jsonInput.guests,
      email: jsonInput.email,
      phone: jsonInput.phone,
      checkInDate: new Date(jsonInput.checkInDate),
      checkOutDate: new Date(jsonInput.checkOutDate),
      jsonInput: JSON.stringify(jsonInput, null, 2),
      xmlSent,
      apiResponse,
      process: 'Reservation',
      status: success ? 'Success' : 'Failure',
      errorMessage: success ? null : apiResponse,
      timestamp: new Date(),
    });

    await log.save();
  }
}