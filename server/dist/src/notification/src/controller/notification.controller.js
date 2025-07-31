"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_dao_1 = require("../dao/notification.dao");
const hotelOffers_model_1 = require("../model/hotelOffers.model");
const userNotificationLog_model_1 = __importDefault(require("../model/userNotificationLog.model"));
class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
        /**
         * Handle request to send notification to all users
         */
        this.sendToAllUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, body, data } = req.body;
                if (!title || !body) {
                    res.status(400).json({ message: 'Title and body are required.' });
                    return;
                }
                const response = yield this.notificationService.sendPushNotification({
                    title,
                    body,
                    data,
                    hotelCode: '',
                    offerId: null
                });
                res.status(200).json({
                    message: 'Notification sent successfully',
                    successCount: response.successCount,
                    failureCount: response.failureCount,
                });
            }
            catch (error) {
                console.error('❌ Failed to send notification:', error);
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
        this.registerDeviceToken = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, token, platform } = req.body;
                if (!userId || !token || !platform) {
                    res.status(400).json({ message: 'userId, token, and platform are required.' });
                    return;
                }
                const tokenDao = new notification_dao_1.TokenDao();
                // ✅ Access TokenDao inside service
                yield tokenDao.saveOrUpdateToken(userId, token, platform);
                res.status(200).json({ message: 'Device token registered successfully' });
            }
            catch (error) {
                console.error('❌ Failed to register device token:', error);
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
        this.createNotifications = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, body, data } = req.body;
                if (!title || !body) {
                    res.status(400).json({ message: 'Title and body are required.' });
                    return;
                }
                if (data && (!data.type || !data.offerCode)) {
                    res.status(400).json({ message: 'Data object must include type and offerCode.' });
                    return;
                }
                const offer = new hotelOffers_model_1.OfferModel({
                    title,
                    body,
                    data: data ? { type: data.type, offerCode: data.offerCode } : undefined,
                });
                const savedOffer = yield offer.save();
                res.status(201).json({
                    message: 'Offer created successfully',
                    offer: savedOffer,
                });
            }
            catch (error) {
                console.error('❌ Error creating offer:', error);
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
        this.getNotifications = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Get pagination params
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                // Fetch offers with pagination
                const offers = yield hotelOffers_model_1.OfferModel.find().sort({ _id: -1 }).skip(skip).limit(limit).lean();
                const totalOffers = yield hotelOffers_model_1.OfferModel.countDocuments();
                if (offers.length === 0) {
                    res.status(404).json({ message: 'No offers found.' });
                    return;
                }
                res.status(200).json({
                    message: 'Offers fetched successfully',
                    page,
                    limit,
                    total: totalOffers,
                    totalPages: Math.ceil(totalOffers / limit),
                    offers,
                });
            }
            catch (error) {
                console.error(`❌ Error fetching offers:`, error);
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
        /**
         * Get notifications for a specific user by userId
         */
        this.getNotificationsByUserId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: userId } = req.params;
                if (!userId || typeof userId !== 'string') {
                    res.status(400).json({ message: 'userId is required and must be a string.' });
                    return;
                }
                const tokenDao = new notification_dao_1.TokenDao();
                const notifications = yield tokenDao.getNotificationLogsByUserId(userId, { sort: { sentAt: -1 } });
                if (notifications.length === 0) {
                    res.status(404).json({ message: 'No notifications found for this user.' });
                    return;
                }
                res.status(200).json({
                    message: 'Notifications fetched successfully',
                    notifications: notifications.reverse(),
                    total: notifications.length,
                });
            }
            catch (error) {
                console.error(`❌ Error fetching notifications for user ${req.query.userId}:`, error);
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
        this.notificationUpdateFromUserSide = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, notificationId } = req.query;
                if (!userId || !notificationId) {
                    res.status(400).json({ message: 'UserId and NotificationId are required and must be strings.' });
                    return;
                }
                const result = yield userNotificationLog_model_1.default.findOneAndUpdate({ userId, _id: notificationId }, { $set: { markedAs: true } }, { new: true });
                if (!result) {
                    res.status(404).json({ message: 'Notification not found for the given user.' });
                    return;
                }
                res.status(200).json({
                    message: 'Notification marked as read successfully.',
                    updatedNotification: result
                });
            }
            catch (error) {
                console.error(`❌ Error updating notification ${req.params.notificationId}:`, error);
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map