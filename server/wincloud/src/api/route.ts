import express, { Router } from 'express';
import { HotelSyncController } from '../controller/hotelSyncController';
import { RatePlanController } from '../controller/ratePlanController';

const router = Router();
const hotelSyncController = new HotelSyncController();
const ratePlanController = new RatePlanController();

router.post('/hotel-sync', express.text({ type: ['application/xml', 'text/xml'], limit: '10mb' }), hotelSyncController.handleHotelSyncUpdate.bind(hotelSyncController));

router.get('/:hotelCode', 
    ratePlanController.getRoomsByHotelCode.bind(hotelSyncController)
);

router.get('/', 
    ratePlanController.getRoomDetails.bind(ratePlanController)
)

router.put('/rate-amount/update', ratePlanController.updateRateAmount.bind(ratePlanController));

export default router;