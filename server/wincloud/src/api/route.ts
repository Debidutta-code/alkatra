import { Router } from 'express';
import { HotelSyncController } from '../controller/hotelSyncController';
import express from 'express';

const router = Router();
const hotelSyncController = new HotelSyncController();

router.post('/hotel-sync', express.text({ type: ['application/xml', 'text/xml'], limit: '10mb' }), hotelSyncController.handleHotelSyncUpdate.bind(hotelSyncController));

export default router;