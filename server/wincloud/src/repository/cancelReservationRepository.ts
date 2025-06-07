import { ReservationLog, ThirdPartyBooking } from '../model/reservationModel';
import { ThirdPartyCancelReservationData } from '../interface/cancelReservationInterface';

export class ThirdPartyCancelReservationRepository {
  constructor() {
    console.log('ThirdPartyCancelReservationRepository initialized.');
  }

  async createCancelReservation(
    data: ThirdPartyCancelReservationData,
    xmlRequest: string,
    xmlResponse: string
  ): Promise<any> {
    try {
      console.log('Updating booking to cancelled status...');

      // Find and update the booking
      const updatedBooking = await ThirdPartyBooking.findOneAndUpdate(
        { reservationId: data.reservationId },
        {
          $set: {
            status: data.status,
            hotelCode: data.hotelCode,
            hotelName: data.hotelName,
            checkInDate: data.checkInDate,
            checkOutDate: data.checkOutDate,
            guestDetails: [
              {
                firstName: data.firstName,
                lastName: data.lastName
              },
            ],
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
      try {
      await ReservationLog.create({
              bookingId: updatedBooking._id?.toString(),
              reservationId: updatedBooking.reservationId,
              hotelCode: updatedBooking.hotelCode,
              hotelName: updatedBooking.hotelName,
              ratePlanCode: updatedBooking.ratePlanCode,
              roomTypeCode: updatedBooking.roomTypeCode,
              checkInDate: updatedBooking.checkInDate,
              checkOutDate: updatedBooking.checkOutDate,
              jsonInput: JSON.stringify(data),
              xmlSent: xmlRequest,
              apiResponse: xmlResponse,
              process: 'Cancellation',
              status: 'Success',
              timestamp: new Date(),
            });
      } catch (logError) {
        console.error('Error logging failure:', logError);
      }
      console.log('Booking updated successfully:', updatedBooking.reservationId);
      return updatedBooking;
    } catch (error: any) {
      console.error('Error updating booking in repository:', error.message);
      throw new Error(`Failed to update booking: ${error.message}`);
    }
  }
}