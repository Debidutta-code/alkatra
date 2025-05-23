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

    async getRoomsByHotelCode(req: Request, res: Response): Promise<void> {
        try {
            const hotelCode = req.params.hotelCode;

            if (!hotelCode) {
                res.status(400).json({ error: 'Hotel code is required' });
                return;
            }

            const rooms = await this.service.getRoomsByHotelCode(hotelCode);
            res.status(200).json(rooms);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }



    async getRoomDetails(req: Request, res: Response): Promise<void> {
        try {
            const hotelCode = req.query.hotelCode as string;
            const invTypeCode = req.query.invTypeCode as string;
            const startDate = new Date(req.query.startDate as string);
            const endDate = new Date(req.query.endDate as string);

            if (!hotelCode || !invTypeCode || !startDate || !endDate) {
                res.status(400).json({ error: 'Hotel code, inventory type code, start date, and end date are required' });
                return;
            }

            const roomDetails = await this.service.getRoomDetails(hotelCode, invTypeCode, startDate, endDate);
            res.status(200).json(roomDetails);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}