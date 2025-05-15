import { ThirdPartyBooking } from '../model/reservationModel';
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
                firstName: data.guestFirstName,
                lastName: data.guestLastName,
                email: '',
                phone: '',
              },
            ],
            thirdPartyReservationIdType8: data.thirdPartyReservationIdType8 || '',
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

      console.log('Booking updated successfully:', updatedBooking.reservationId);
      return updatedBooking;
    } catch (error: any) {
      console.error('Error updating booking in repository:', error.message);
      throw new Error(`Failed to update booking: ${error.message}`);
    }
  }
}