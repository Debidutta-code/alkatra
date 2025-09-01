import { BookingRepository } from "../repository";
export class BookingService {

    private bookingRepository: BookingRepository;
    private static instance: BookingService;

    private constructor() {
        this.bookingRepository = BookingRepository.getInstance();
    }

    static getInstance(): BookingService {
        if (!BookingService.instance) {
            BookingService.instance = new BookingService();
        }
        return BookingService.instance;
    }



    /**
     * Get booking details by reservation id
     * @param reservationId
     */

    async getBookings(reservationId: any) {
        
        try {
            if (!reservationId) {
                throw new Error("No reservation id found to get booking details");
            }
        

            const bookDetails = await this.bookingRepository.getBookingDetailsByReservationId(reservationId);
            if (!bookDetails) {
                throw new Error("No booking details found");
            }
            
            return bookDetails;
        }
        catch (error: any) {
            console.log("Error in getBookings", error);
            throw new Error("Failed to get bookings");
        }
    }

    async checkRequiredField ( requiredFields: any) {
        const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => value === undefined || value === null || value === "")
        .map(([key]) => key);

      if (missingFields.length > 0) {
        return "Missing required fields: " + missingFields.join(", ");
      }
    }

}