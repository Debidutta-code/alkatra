import { Request, Response } from 'express';
import { ThirdPartyCancelReservationService } from '../service/cancelReservationService';


export class ThirdPartyCancelReservationController {
    private service: ThirdPartyCancelReservationService;

    constructor() {
        this.service = new ThirdPartyCancelReservationService();
    }

    async handleCancelReservation(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            console.log('##################\nController Received JSON:', JSON.stringify(data, null, 2));

            if (!data.reservationId) {
                res.status(400).json({ error: 'Invalid JSON payload: missing reservationId' });
                return;
            }

            await this.service.processCancelReservation(data);
            res.status(200).json({ message: 'Reservation cancellation processed successfully' });
        } catch (error: any) {
            console.error('Controller Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}