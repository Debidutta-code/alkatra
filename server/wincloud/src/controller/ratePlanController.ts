import { RatePlanService } from "../service/ratePlanService";
import { Request, Response } from 'express';

export class RatePlanController {
    private service: RatePlanService;

    constructor() {
        this.service = new RatePlanService();
    }

    async handleRatePlanUpdate(req: Request, res: Response): Promise<void> {
        try {
            const xml = req.body;
            console.log('##################\nController Received XML:', xml);
            if (!xml || typeof xml !== 'string') {
                res.status(400).json({ error: 'Invalid XML payload' });
                return;
            }

            await this.service.processRateAmountXml(xml);
            res.status(200).json({ message: 'Rate amount updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}