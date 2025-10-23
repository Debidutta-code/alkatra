import { ThirdPartyReservationService } from '../../../wincloud/src/service/reservationService';
import { reduceRoomsAfterBookingConfirmed } from '../utils/roomInventory';
import { ReservationInput } from '../interfaces';
import mongoose from 'mongoose';
import { ThirdPartyBooking } from '../../../wincloud/src/model/reservationModel';

export class ReservationRepository {

    /**
     * Singleton pattern
     */
    private static instance: ReservationRepository;

    /**
     * Generating instance of BookingRepository
     */
    static getInstance(): ReservationRepository {
        if (!ReservationRepository.instance) {
            ReservationRepository.instance = new ReservationRepository();
        }
        return ReservationRepository.instance;
    }

    async processThirdPartyReservation(reservationInput: ReservationInput) {
        const thirdPartyService = new ThirdPartyReservationService();
        await thirdPartyService.processThirdPartyReservation(reservationInput);
    }

    async reduceRooms(hotelCode: string, roomTypeCode: string, numberOfRooms: number, dates: Date[]) {
        return await reduceRoomsAfterBookingConfirmed(hotelCode, roomTypeCode, numberOfRooms, dates);
    }

    async getReservationDetails(bookingId: string) {
        if (bookingId) {
            
            const objectConvertedBookingId = new mongoose.Types.ObjectId(bookingId);
            if (!objectConvertedBookingId) {
                throw new Error('Invalid Booking ID format');
            }

            const bookingDetails = await ThirdPartyBooking.findOne({ _id: objectConvertedBookingId });
            if (!bookingDetails) {
                throw new Error('No booking details found');
            }
            return bookingDetails;
        }
        return true;
    }

}