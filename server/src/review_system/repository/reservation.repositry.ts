import { ThirdPartyBooking } from "../../wincloud/src/model/reservationModel";


export class ReservationRepository {

    async getReservationData ( reservationId: String ) {
        if (!reservationId) {
            throw new Error ("REPOSITORY: Reservation Id not found");
        }
        console.log(`The reservation id we get ${reservationId}`);
        
        const reservationDetails = await ThirdPartyBooking
        .findOne({ reservationId, status: { $ne: "Cancelled" } })
        .select("reservationId hotelCode hotelName email userId checkOutDate");

        if (!reservationDetails) {
            throw new Error ("REPOSITORY: No reservation details found");
        }
        return reservationDetails;
    }

}