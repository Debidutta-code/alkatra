import { ThirdPartyReservationData, ReservationInput } from "../interface/reservationInterface";
import { v4 as uuidv4 } from "uuid";

export class ReservationProcessor {
    async processReservationInput(data: ReservationInput): Promise<ThirdPartyReservationData> {
        const { bookingDetails, ageCodeSummary } = data;
        const {
            provider,
            coupon,
            userId,
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
            paymentMethod,
        } = bookingDetails;
        

        const reservationData: ThirdPartyReservationData = {
            provider,
            coupon,
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
            reservationId: reservationId || uuidv4(),
            ageCodeSummary,
            roomTotalPrice,
            paymentMethod,
        };

        return reservationData;
    }
}