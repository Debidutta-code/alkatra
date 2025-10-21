import { ThirdPartyReservationService } from '../../../wincloud/src/service/reservationService';
import { reduceRoomsAfterBookingConfirmed } from '../utils/roomInventory';
import { ReservationInput } from '../interfaces';

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

}