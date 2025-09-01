import { BookingRepository } from "../repository";

interface AmendReservationInputInterfcace {
    bookingDetails: {
        userId: string;
        reservationId: string;
        checkInDate: string;
        checkOutDate: string;
        hotelCode: string;
        hotelName?: string;
        ratePlanCode: string;
        roomTypeCode: string;
        numberOfRooms: number;
        roomTotalPrice: number;
        currencyCode: string;
        guests: any[];
        email: string;
        phone: string;
    };
    ageCodeSummary: Record<string, number>;
}

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

    async checkRequiredField(requiredFields: any) {
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null || value === "")
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return "Missing required fields: " + missingFields.join(", ");
        }
    }

    async calculateAgeCategory(dob: string) {
        try {
            if (!dob) {
                throw new Error("DOB is required");
            }
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            if (
                today.getMonth() < birthDate.getMonth() ||
                (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }
            if (age <= 2) return { age, category: "Infant", ageCode: "7" };
            if (age <= 12) return { age, category: "Child", ageCode: "8" };
            return { age, category: "Adult", ageCode: "10" };
        } catch (error: any) {
            console.log("Error in calculateAgeCategory", error);
            throw new Error("Failed to calculate age category");
        }
    }

    // async processAmendReservation(amendReservationInput: AmendReservationInputInterfcace ) {
    //     try {
    //         const { bookingDetails } = amendReservationInput;
    //         await this.bookingRepository.updateBooking(bookingDetails);
    //     } catch (error: any) {
    //         console.log("Error in processAmendReservation", error);
    //         throw new Error("Failed to process reservation amendment");
    //     }
    // }

}