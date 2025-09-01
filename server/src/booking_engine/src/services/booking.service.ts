import { BookingRepository } from "../repository";
import { Inventory } from "../../../wincloud/src/model/inventoryModel";

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

    async increaseRoomsAfterBookingCancelled(
        hotelCode: string,
        roomTypeCode: string,
        numberOfRooms: number,
        dates: Date[]
    ) {
        console.log(`Get data to increase rooms ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);

        const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => value === undefined || value === null || value === "" || (key === 'startDate' && (!Array.isArray(value) || value.length !== 2)))
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return {
                message: `Missing required fields: ${missingFields.join(", ")}`,
            }
        }

        const [checkInDate, checkOutDate] = dates;

        if (checkInDate > checkOutDate) {
            return {
                message: "Check-in date must be before or equal to check-out date",
            };
        }

        try {
            const dateRange = [];
            let currentDate = new Date(checkInDate);
            const endDate = new Date(checkOutDate);
            while (currentDate < endDate) {
                dateRange.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            const inventoryRecords = await Inventory.find({
                hotelCode,
                invTypeCode: roomTypeCode,
                'availability.startDate': {
                    $in: dateRange,
                },
            });

            if (!inventoryRecords || inventoryRecords.length === 0) {
                return { message: "No matching room inventory records found for the given dates." };
            }

            const bulkOps = [];

            for (const item of inventoryRecords) {
                const currentCount = item.availability?.count || 0;
                const newCount = currentCount + numberOfRooms;

                bulkOps.push({
                    updateOne: {
                        filter: { _id: item._id },
                        update: {
                            $set: {
                                'availability.count': newCount,
                                updatedAt: new Date(),
                            },
                        },
                    },
                });
            }

            const result = await Inventory.bulkWrite(bulkOps);

            return {
                message: "Room counts increased successfully after cancellation.",
                result,
            };

        } catch (error: any) {
            console.error("❌ Error increasing rooms after booking cancellation:", error.message || error);
            throw new Error(`Failed to increase rooms after booking cancellation: ${error.message}`);
        }
    };

    async reduceRoomsAfterBookingConfirmed(
        hotelCode: string,
        roomTypeCode: string,
        numberOfRooms: number,
        dates: Date[]
    ) {
        console.log(`Get data for reduce rooms ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);

        const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
        const missingFields = Object.entries(requiredFields)
            .filter(([key, value]) => value === undefined || value === null || value === "" || (key === 'dates' && (!Array.isArray(value) || value.length !== 2)))
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return {
                message: `Missing required fields: ${missingFields.join(", ")}`,
            };
        }

        const [checkInDate, checkOutDate] = dates;

        if (checkInDate >= checkOutDate) {
            return {
                message: "Check-in date must be before check-out date",
            };
        }

        try {
            // Calculate the date range excluding the checkout date
            const dateRange = [];
            let currentDate = new Date(checkInDate);
            const endDate = new Date(checkOutDate);
            while (currentDate < endDate) {
                dateRange.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            const inventoryRecords = await Inventory.find({
                hotelCode,
                invTypeCode: roomTypeCode,
                'availability.startDate': {
                    $in: dateRange,
                },
            });

            if (!inventoryRecords || inventoryRecords.length === 0) {
                return { message: "No available rooms found for the specified criteria" };
            }

            const bulkOps = [];

            for (const item of inventoryRecords) {
                const currentCount = item.availability?.count || 0;
                if (currentCount < numberOfRooms) {
                    return {
                        message: `Not enough rooms for date ${item.availability?.startDate}. Available: ${currentCount}, requested: ${numberOfRooms}`,
                    };
                }

                const newCount = currentCount - numberOfRooms;

                bulkOps.push({
                    updateOne: {
                        filter: { _id: item._id },
                        update: {
                            $set: {
                                'availability.count': newCount,
                                updatedAt: new Date(),
                            },
                        },
                    },
                });
            }

            const result = await Inventory.bulkWrite(bulkOps);

            return {
                message: "Room counts reduced successfully for booking",
                result,
            };

        } catch (error: any) {
            console.error("❌ Error reducing rooms after booking confirmed:", error.message || error);
            throw new Error("Failed to reduce rooms after booking confirmed");
        }
    };

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