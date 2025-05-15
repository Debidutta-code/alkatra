import { InventoryService, InventoryError } from "../service/inventoryService";
import { RatePlanError, RatePlanService } from "../service/ratePlanService";
import { Request, Response } from 'express';
import { parseStringPromise } from 'xml2js';

export class HotelSyncController {
    private inventoryService: InventoryService;
    private ratePlanService: RatePlanService;

    constructor() {
        this.inventoryService = new InventoryService();
        this.ratePlanService = new RatePlanService();
    }

    async handleHotelSyncUpdate(req: Request, res: Response): Promise<void> {
        try {
            const xml = req.body;
            if (!xml || typeof xml !== 'string') {
                res.status(400).json({ error: 'Invalid XML payload' });
                return;
            }

            const parsedXml = await parseStringPromise(xml, { explicitArray: false, mergeAttrs: true });
            const rootElement = Object.keys(parsedXml)[0];

            if (rootElement === 'OTA_HotelInvCountNotifRQ') {
                const inventories = await this.inventoryService.processInventoryXml(xml);
                const responsePayload = { 
                    message: 'Inventory updated successfully',
                    inventories 
                };
                res.status(200).json(responsePayload);
            } else if (rootElement === 'OTA_HotelRateAmountNotifRQ') {
                const rateAmounts = await this.ratePlanService.processRateAmountXml(xml);
                const responsePayload = { 
                    message: 'Rate amount updated successfully',
                    rateAmounts 
                };
                res.status(200).json(responsePayload);
            } else {
                res.status(400).json({ error: 'Unsupported XML request type' });
            }

        } catch (error: any) {
            if (error instanceof InventoryError) {
                res.status(error.statusCode).json({
                    error: 'Failed to process inventory XML',
                    message: error.errorMessage
                });
            } else if (error instanceof RatePlanError) {
                res.status(error.statusCode).json({
                    error: 'Internal Server Error',
                    message: error.errorMessage || 'Something went wrong'
                });
            }
        }
    }
}