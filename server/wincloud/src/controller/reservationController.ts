import { ThirdPartyReservationService } from "../service/reservationService";
import { Request, Response } from 'express';

export class ThirdPartyReservationController {
    private service: ThirdPartyReservationService;

    constructor() {
        this.service = new ThirdPartyReservationService();
    }

    async handleThirdPartyReservation(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body.data;
            console.log('##################\nController Received JSON:', JSON.stringify(data, null, 2));

            if (!data || !data.guests || !data.guests[0] || !data.roomAssociations || !data.roomAssociations[0] ||
                !data.bookingDetails || !data.payment) {
                res.status(400).json({ error: 'Invalid JSON payload: missing required fields' });
                return;
            }

            const { checkInDate, checkOutDate } = data.bookingDetails;
            const currentDate = new Date().toISOString().split('T')[0];
            const formattedCheckInDate = new Date(checkInDate).toISOString().split('T')[0];
            const formattedCheckOutDate = new Date(checkOutDate).toISOString().split('T')[0];

            if (formattedCheckInDate < currentDate || formattedCheckOutDate < currentDate) {
                res.status(400).json({ error: 'Check-in and check-out dates must be in the future' });
                return;
            }

            if (new Date(checkInDate) >= new Date(checkOutDate)) {
                res.status(400).json({ error: 'Check-in date must be before check-out date' });
                return;
            }

            await this.service.processThirdPartyReservation(data);
            res.status(201).json({ message: 'Reservation processed successfully' });
        } catch (error) {
            console.error('Controller Error:', error);
            res.status(500).json({ error: "Controller error" });
        }
    }
}

export { ThirdPartyReservationService };
