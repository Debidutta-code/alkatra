import { ThirdPartyBooking } from "../../wincloud/src/model/reservationModel";


export class ReservationRepository {

    async getReservationData ( reservationId: String ) {
        if (!reservationId) {
            throw new Error ("REPOSITORY: Reservation Id not found");
        }
        const reservationDetails = await ThirdPartyBooking
        .findOne({ reservationId, status: { $ne: "Cancelled" } })
        .select("hotelCode hotelName email userId");
        if (!reservationDetails) {
            throw new Error ("REPOSITORY: No reservation details found");
        }
        return reservationDetails;
    }

}