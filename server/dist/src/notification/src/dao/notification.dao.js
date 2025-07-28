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
exports.TokenDao = void 0;
// src/repositories/tokenRepo.ts
const mongoose_1 = __importDefault(require("mongoose"));
const deviceToken_model_1 = __importDefault(require("../model/deviceToken.model"));
const userNotificationLog_model_1 = __importDefault(require("../model/userNotificationLog.model"));
class TokenDao {
    /**
     * Get all unique device tokens for all users.
     */
    getAllDeviceTokensForAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokens = yield deviceToken_model_1.default.find({}).select('token').lean();
                const uniqueTokens = [...new Set(tokens.map(t => t.token))];
                return uniqueTokens;
            }
            catch (error) {
                console.error('❌ Error fetching device tokens:', error);
                throw new Error('Failed to fetch device tokens');
            }
        });
    }
    /**
     * Get tokens for a specific user.
     */
    getDeviceTokensByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokens = yield deviceToken_model_1.default.find({ userId }).select('token').lean();
                return tokens.map(t => t.token);
            }
            catch (error) {
                console.error(`❌ Error fetching tokens for user ${userId}:`, error);
                throw new Error('Failed to fetch tokens for user');
            }
        });
    }
    /**
     * Save or update a device token for a user.
     */
    saveOrUpdateToken(userId, token, platform) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield deviceToken_model_1.default.findOneAndUpdate({ token }, { userId, platform, updatedAt: new Date() }, { upsert: true, new: true });
                console.log(`✅ Device token ${token} saved/updated for user ${userId}`);
                return updated;
            }
            catch (error) {
                console.error('❌ Error saving or updating device token:', error);
                throw new Error('Failed to save/update device token');
            }
        });
    }
    /**
     * Delete a device token.
     */
    deleteToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield deviceToken_model_1.default.findOneAndDelete({ token });
                return result;
            }
            catch (error) {
                console.error(`❌ Error deleting token ${token}:`, error);
                throw new Error('Failed to delete device token');
            }
        });
    }
    /**
     * Save a notification log for a user.
     */
    saveNotificationLog(userId, offerId, hotelCode, title, body, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationLog = new userNotificationLog_model_1.default({
                    userId,
                    offerId: offerId ? new mongoose_1.default.Types.ObjectId(offerId) : null,
                    hotelCode,
                    title,
                    body,
                    data,
                    sentAt: new Date(),
                });
                const savedLog = yield notificationLog.save();
                console.log(`✅ Notification log saved for user ${userId}`);
                return savedLog;
            }
            catch (error) {
                console.error('❌ Error saving notification log:', error);
                throw new Error('Failed to save notification log');
            }
        });
    }
    /**
     * Get notification logs for a specific user.
     */
    getNotificationLogsByUserId(userId, p0) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const logs = yield userNotificationLog_model_1.default.find({ userId }).lean();
                return logs;
            }
            catch (error) {
                console.error(`❌ Error fetching notification logs for user ${userId}:`, error);
                throw new Error('Failed to fetch notification logs');
            }
        });
    }
}
exports.TokenDao = TokenDao;
//# sourceMappingURL=notification.dao.js.map