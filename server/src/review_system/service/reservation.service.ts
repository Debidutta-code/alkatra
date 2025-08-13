import { ReservationRepository } from "../repository";

const reservationRepository = new ReservationRepository();


export class ReservationService {

    async getReservationData(reservationid: String) {
        try {
            if (!reservationid) {
                throw new Error("SERVICE: No reservation ID found");
            }
            const reservationData = await reservationRepository.getReservationData(reservationid);
            if (!reservationData) {
                throw new Error("SERVICE: No reservation data found");
            }
            return reservationData;
        } catch (error: any) {
            console.error("Error fetching reservation data:", error.message || error);
            throw new Error("SERVICE: Unable to fetch reservation data");
        }
    }

}