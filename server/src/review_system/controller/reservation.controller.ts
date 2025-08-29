import { ReservationService } from "../service";
import { Request, Response } from "express";

const reservationService = ReservationService.getInstance();

export class ReservationController {

    async getReservationData(req: Request, res: Response) {
        try {
            const reservationId = req.query.reservationId;
            if (!reservationId) {
                return res.status(400).json({ error: "Reservation ID is required" });
            }

            const reservationData = await reservationService.getReservationData(reservationId as string);
            return res.status(200).json(reservationData);
        } catch (error: any) {
            console.error("Error fetching reservation data:", error.message || error);
            return res.status(500).json({ error: "Unable to fetch reservation data" });
        }
    }

}

