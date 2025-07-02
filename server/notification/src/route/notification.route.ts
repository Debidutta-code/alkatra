// src/routes/notification.routes.ts
import express from 'express';
import { NotificationController } from '../controller/notification.controller';
import { NotificationService } from '../service/notification.service';


const router = express.Router();

// ✅ Instantiate controller with the service
const notificationController = new NotificationController(NotificationService);

// ✅ Register routes
router.post('/send-notification', notificationController.sendToAllUsers);
router.post('/register-device-token', notificationController.registerDeviceToken);
router.route('/offer-by-hotel').post(notificationController.createOffersAccordingToHotel)
router.route('/offer-by-hotel/:id').get(notificationController.getOffersByHotelCode);
router.get('/user-notifications-get/:id', notificationController.getNotificationsByUserId);

export default router;
