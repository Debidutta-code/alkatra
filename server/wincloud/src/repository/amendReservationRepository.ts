import { ThirdPartyBooking, ReservationLog } from '../model/reservationModel';
import { ThirdPartyAmendReservationData } from '../interface/amendReservationInterface';

export class ThirdPartyAmendReservationRepository {
  constructor() {
    console.log('ThirdPartyCancelReservationRepository initialized.');
  }

  async createAmendReservation(
    data: ThirdPartyAmendReservationData,
    xmlRequest: string,
    xmlResponse: string
  ): Promise<any> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(data.checkInDate);
      checkInDate.setHours(0, 0, 0, 0); 

      if (today >= checkInDate) {
        throw new Error('Cannot update reservation.');
      }
      console.log('Updating booking to cancelled status...');

      const updatedBooking = await ThirdPartyBooking.findOneAndUpdate(
        { reservationId: data.reservationId },
        {
          $set: {
            status: data.status,
            hotelCode: data.hotelCode,
            hotelName: data.hotelName,
            numberOfRooms: data.numberOfRooms,
            guestDetails: data.guests,
            email: data.email,
            phone: data.phone,
            checkInDate: data.checkInDate,
            checkOutDate: data.checkOutDate,
            ageCodeSummary: data.ageCodeSummary,
            totalAmount: data.amountBeforeTax,
            xmlRequest,
            xmlResponse,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!updatedBooking) {
        throw new Error('Booking not found for cancellation');
      }

      // Create log entry
      await ReservationLog.create({
        bookingId: updatedBooking._id?.toString(),
        reservationId: updatedBooking.reservationId,
        hotelCode: updatedBooking.hotelCode,
        hotelName: updatedBooking.hotelName,
        numberOfRooms: updatedBooking.numberOfRooms,
        guestDetails: updatedBooking.guestDetails,
        email: updatedBooking.email,
        phone: updatedBooking.phone,
        ratePlanCode: updatedBooking.ratePlanCode,
        roomTypeCode: updatedBooking.roomTypeCode,
        checkInDate: updatedBooking.checkInDate,
        checkOutDate: updatedBooking.checkOutDate,
        ageCodeSummary: data.ageCodeSummary,
        totalAmount: data.amountBeforeTax,
        jsonInput: JSON.stringify(data),
        xmlSent: xmlRequest,
        apiResponse: xmlResponse,
        process: 'Amend Reservation',
        status: 'Success',
        timestamp: new Date(),
      });

      console.log('Booking and log updated successfully:', updatedBooking.reservationId);
      return updatedBooking;
    } catch (error: any) {
      console.error('Error updating booking in repository:', error.message);

      // Optional: log failure
      try {
        await ReservationLog.create({
          reservationId: data.reservationId,
          hotelCode: data.hotelCode,
          hotelName: data.hotelName,
          ratePlanCode: data.ratePlanCode,
          roomTypeCode: data.roomTypeCode,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          jsonInput: JSON.stringify(data),
          xmlSent: xmlRequest,
          apiResponse: xmlResponse,
          process: 'Cancellation',
          status: 'Failure',
          errorMessage: error.message,
          timestamp: new Date(),
        });
      } catch (logError) {
        console.error('Error logging failure:', logError);
      }

      throw new Error(`Failed to update booking: ${error.message}`);
    }
  }
}
