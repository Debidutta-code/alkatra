import { Request, Response } from 'express';
import { ThirdPartyAmendReservationService } from '../service/amendReservationService';


export class ThirdPartyAmendReservationController {
    private service: ThirdPartyAmendReservationService;

    constructor() {
        this.service = new ThirdPartyAmendReservationService();
    }

    async handleAmendReservation(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            console.log('##################\nController Received JSON:', JSON.stringify(data, null, 2));

            if (!data.reservationId) {
                res.status(400).json({ error: 'Invalid JSON payload: missing reservationId' });
                return;
            }

            await this.service.processAmendReservation(data);
            res.status(200).json({ message: 'Reservation amendment processed successfully' });
        } catch (error: any) {
            console.error('Controller Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export { ThirdPartyAmendReservationService };