// src/repositories/tokenRepo.ts
import mongoose from 'mongoose';
import deviceTokenModel from '../model/deviceToken.model';
import userNotificationLogModel, { IUserNotificationLog } from '../model/userNotificationLog.model';

export class TokenDao {
  /**
   * Get all unique device tokens for all users.
   */
  public async getAllDeviceTokensForAllUsers(): Promise<string[]> {
    try {
      const tokens: { token: string }[] = await deviceTokenModel.find({}).select('token').lean();
      const uniqueTokens = [...new Set(tokens.map(t => t.token))];
      return uniqueTokens;
    } catch (error) {
      console.error('❌ Error fetching device tokens:', error);
      throw new Error('Failed to fetch device tokens');
    }
  }

  /**
   * Get tokens for a specific user.
   */
  public async getDeviceTokensByUserId(userId: string): Promise<string[]> {
    try {
      const tokens = await deviceTokenModel.find({ userId }).select('token').lean();
      return tokens.map(t => t.token);
    } catch (error) {
      console.error(`❌ Error fetching tokens for user ${userId}:`, error);
      throw new Error('Failed to fetch tokens for user');
    }
  }

  /**
   * Save or update a device token for a user.
   */
  public async saveOrUpdateToken(
    userId: string,
    token: string,
    platform: 'web' | 'android' | 'ios'
  ) {
    try {
      const updated = await deviceTokenModel.findOneAndUpdate(
        { token },
        { userId, platform, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      console.log(`✅ Device token ${token} saved/updated for user ${userId}`);
      return updated;
    } catch (error) {
      console.error('❌ Error saving or updating device token:', error);
      throw new Error('Failed to save/update device token');
    }
  }

  /**
   * Delete a device token.
   */
  public async deleteToken(token: string) {
    try {
      const result = await deviceTokenModel.findOneAndDelete({ token });
      return result;
    } catch (error) {
      console.error(`❌ Error deleting token ${token}:`, error);
      throw new Error('Failed to delete device token');
    }
  }

  /**
   * Save a notification log for a user.
   */
  public async saveNotificationLog(
    userId: string,
    offerId: string | null,
    hotelCode: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<IUserNotificationLog> {
    try {
      const notificationLog = new userNotificationLogModel({
        userId,
        offerId: offerId ? new mongoose.Types.ObjectId(offerId) : null,
        hotelCode,
        title,
        body,
        data,
        sentAt: new Date(),
      });
      const savedLog = await notificationLog.save();
      console.log(`✅ Notification log saved for user ${userId}`);
      return savedLog;
    } catch (error) {
      console.error('❌ Error saving notification log:', error);
      throw new Error('Failed to save notification log');
    }
  }

  /**
   * Get notification logs for a specific user.
   */
  public async getNotificationLogsByUserId(userId: string): Promise<IUserNotificationLog[]> {
    try {
      const logs = await userNotificationLogModel.find({ userId }).lean();
      return logs;
    } catch (error) {
      console.error(`❌ Error fetching notification logs for user ${userId}:`, error);
      throw new Error('Failed to fetch notification logs');
    }
  }
}
