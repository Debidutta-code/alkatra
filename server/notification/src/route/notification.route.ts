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

export default router;
