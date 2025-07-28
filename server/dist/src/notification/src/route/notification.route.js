"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/notification.routes.ts
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("../controller/notification.controller");
const notification_service_1 = require("../service/notification.service");
const router = express_1.default.Router();
// ✅ Instantiate controller with the service
const notificationController = new notification_controller_1.NotificationController(notification_service_1.NotificationService);
// ✅ Register routes
router.post('/send-notification', notificationController.sendToAllUsers);
router.post('/register-device-token', notificationController.registerDeviceToken);
router.route('/create-notification').post(notificationController.createNotifications);
router.route('/get-notification').get(notificationController.getNotifications);
router.get('/user-notifications-get/:id', notificationController.getNotificationsByUserId);
router.patch('/update-notification-user', notificationController.notificationUpdateFromUserSide);
exports.default = router;
//# sourceMappingURL=notification.route.js.map