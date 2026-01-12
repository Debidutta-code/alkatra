import { ThirdPartyReservationService } from '../../../wincloud/src/service/reservationService';
import { reduceRoomsAfterBookingConfirmed } from '../utils/roomInventory';
import { ReservationInput } from '../interfaces';
import { PropertyInfo } from '../../../property_management/src/model/property.info.model';
import { PMSOrchestrator } from '../../../common/pmsOrchestrator';
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
        try {
            console.log('ReservationRepository: Processing reservation');

            // Get property ID from hotel code
            const hotelCode = reservationInput.bookingDetails?.hotelCode;
            if (!hotelCode) {
                throw new Error('Hotel code is required');
            }

            const property = await PropertyInfo.findOne({ property_code: hotelCode });

            if (!property) {
                console.error(`Property not found with code: ${hotelCode}`);
                throw new Error(`Property not found with code: ${hotelCode}`);
            }

            const propertyId = property._id.toString();
            console.log(`Property found: ${property.property_name} (ID: ${propertyId})`);

            // Use PMSOrchestrator to route to correct PMS
            await PMSOrchestrator.processReservation(propertyId, reservationInput);
            console.log('✅ Reservation successfully processed through PMS Orchestrator');
        } catch (error: any) {
            console.error('❌ ReservationRepository Error:', error.message);
            throw error;
        }
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