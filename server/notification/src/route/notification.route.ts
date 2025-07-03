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
router.route('/create-notification').post(notificationController.createNotifications)
router.route('/get-notification').get(notificationController.getNotifications);
router.get('/user-notifications-get/:id', notificationController.getNotificationsByUserId);
router.patch('/update-notification-user', notificationController.notificationUpdateFromUserSide);

export default router;
