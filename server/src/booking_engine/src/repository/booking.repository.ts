import { ThirdPartyBooking } from "../../../wincloud/src/model/reservationModel";

export class BookingRepository {

    /**
     * Singleton pattern
     */
    private static instance: BookingRepository;

    /**
     * Generating instance of BookingRepository
     */
    static getInstance(): BookingRepository {
        if (!BookingRepository.instance) {
            BookingRepository.instance = new BookingRepository();
        }
        return BookingRepository.instance;
    }

    async getBookingDetailsByReservationId(reservationId: String) {
        try {
            if (!reservationId) {
                throw new Error("REPOSITORY: No reservation ID found");
            }


            const bookingDetails = await ThirdPartyBooking.findOne({
                reservationId,
                status: { $ne: "Cancelled" }
            });

            if (!bookingDetails) {
                throw new Error("REPOSITORY: No booking details found");
            }

            return bookingDetails;
        }
        catch (error: any) {
            console.error("Error deleting booking:", error);
            throw new Error("REPOSITORY: Unable to find booking details");
        }
    }

}
