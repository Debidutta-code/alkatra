import { ThirdPartyReservationData, ReservationInput } from "../interface/reservationInterface";
import { v4 as uuidv4 } from "uuid";

export class ReservationProcessor {
    async processReservationInput(data: ReservationInput): Promise<ThirdPartyReservationData> {
        const { bookingDetails, ageCodeSummary } = data;
        const {userId,
            checkInDate,
            checkOutDate,
            hotelCode,
            hotelName,
            ratePlanCode,
            roomTypeCode,
            numberOfRooms,
            roomTotalPrice,
            currencyCode,
            guests,
            email,
            phone,
            reservationId,  
        } = bookingDetails;
        console.log("ReservationProcessor: Processing reservation input data:", bookingDetails);

        const reservationData: ThirdPartyReservationData = {
            userId,
            hotelCode,
            hotelName,
            ratePlanCode,
            roomTypeCode,
            numberOfRooms,
            checkInDate: new Date(checkInDate),
            checkOutDate: new Date(checkOutDate),
            amountBeforeTax: roomTotalPrice,
            currencyCode, 
            guests,
            email,
            phone,
            // userId: "someUserId", 
            // propertyId: "somePropertyId",
            // roomIds: ["room1", "room2"], 
            // status: "Confirmed", 
            reservationId: reservationId || uuidv4(),
            ageCodeSummary,
            roomTotalPrice
        };

        return reservationData;
    }
}