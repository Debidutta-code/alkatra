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
exports.NotificationService = void 0;
// src/services/notificationService.ts
const firebase_config_1 = __importDefault(require("../config/firebase.config"));
const notification_dao_1 = require("../dao/notification.dao");
const deviceToken_model_1 = __importDefault(require("../model/deviceToken.model"));
const tokenDao = new notification_dao_1.TokenDao();
class NotificationService {
    static sendPushNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const fcmTokens = yield tokenDao.getAllDeviceTokensForAllUsers();
            console.log(`🔔 Sending notification to ${fcmTokens} devices...`);
            if (!fcmTokens.length) {
                console.warn('⚠️ No device tokens found to send notification');
                return { successCount: 0, failureCount: 0 };
            }
            const message = {
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data || {},
                tokens: fcmTokens,
            };
            try {
                const response = yield firebase_config_1.default.messaging().sendEachForMulticast(message);
                console.log(`✅ Sent to ${response.successCount} devices; ${response.failureCount} failures`);
                const tokenDocs = yield deviceToken_model_1.default.find({ token: { $in: fcmTokens } }).lean();
                const userTokenMap = new Map();
                tokenDocs.forEach(doc => {
                    if (!userTokenMap.has(doc.userId.toString())) {
                        userTokenMap.set(doc.userId.toString(), []);
                    }
                    userTokenMap.get(doc.userId.toString()).push(doc.token);
                });
                for (const [userId, tokens] of userTokenMap) {
                    yield tokenDao.saveNotificationLog(userId, payload.offerId || null, payload.hotelCode || 'N/A', payload.title, payload.body, payload.data);
                }
                const failedTokensToRemove = [];
                response.responses.forEach((resp, idx) => {
                    var _a;
                    const token = message.tokens[idx];
                    if (!resp.success) {
                        const errCode = (_a = resp.error) === null || _a === void 0 ? void 0 : _a.code;
                        console.warn(`❌ Failed for token ${token} - ${errCode}`);
                        if (errCode === 'messaging/invalid-argument' ||
                            errCode === 'messaging/registration-token-not-registered') {
                            failedTokensToRemove.push(token);
                        }
                    }
                });
                // Delete bad tokens from DB
                for (const badToken of failedTokensToRemove) {
                    yield tokenDao.deleteToken(badToken);
                    console.log(`🗑️ Deleted invalid token: ${badToken}`);
                }
                return response;
            }
            catch (error) {
                console.error('❌ Error sending push notification:', error);
                throw new Error('Failed to send push notification');
            }
        });
    }
    sendCryptoPaymentNotification(userId, amount, txId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`🔔 Sending crypto payment notification to user ${userId} for amount ${amount} USDT`);
            const userTokens = yield tokenDao.getDeviceTokensByUserId(userId);
            console.log("---------------==============", userTokens);
            if (!userTokens.length) {
                console.warn(`⚠️ No device tokens found for user ${userId}`);
                return { successCount: 0, failureCount: 0 };
            }
            const message = {
                data: {
                    type: 'CRYPTO_PAYMENT_CONFIRMED',
                    userId,
                    amount: amount.toString(),
                    txId: txId || '',
                    message: `Your crypto payment of ${amount} USDT has been confirmed.`,
                },
                tokens: userTokens,
            };
            try {
                const response = yield firebase_config_1.default.messaging().sendEachForMulticast(message);
                console.log(`✅ Sent crypto payment notification to ${response.successCount} devices`);
            }
            catch (error) {
                console.error('❌ Error sending crypto payment notification:', error);
            }
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map