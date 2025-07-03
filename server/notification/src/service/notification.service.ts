// src/services/notificationService.ts
import admin from '../config/firebase.config';
import { TokenDao } from '../dao/notification.dao';
import DeviceToken from '../model/deviceToken.model';

interface NotificationPayload {
  hotelCode: string;
  offerId: null;
  title: string;
  body: string;
  data?: Record<string, string>;
}

const tokenDao = new TokenDao();

export class NotificationService {
  static async sendPushNotification(payload: NotificationPayload): Promise<any> {
    const fcmTokens = await tokenDao.getAllDeviceTokensForAllUsers();

    console.log(`🔔 Sending notification to ${fcmTokens} devices...`);

    if (!fcmTokens.length) {
      console.warn('⚠️ No device tokens found to send notification');
      return { successCount: 0, failureCount: 0 };
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      tokens: fcmTokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);

      console.log(`✅ Sent to ${response.successCount} devices; ${response.failureCount} failures`);

      const tokenDocs = await DeviceToken.find({ token: { $in: fcmTokens } }).lean();
      const userTokenMap = new Map<string, string[]>();
      tokenDocs.forEach(doc => {
        if (!userTokenMap.has(doc.userId.toString())) {
          userTokenMap.set(doc.userId.toString(), []);
        }
        userTokenMap.get(doc.userId.toString())!.push(doc.token);
      });

      for (const [userId, tokens] of userTokenMap) {
        await tokenDao.saveNotificationLog(
          userId,
          payload.offerId || null,
          payload.hotelCode || 'N/A',
          payload.title,
          payload.body,
          payload.data
        );
      }
      
      const failedTokensToRemove: string[] = [];

      response.responses.forEach((resp, idx) => {
        const token = message.tokens[idx];

        if (!resp.success) {
          const errCode = resp.error?.code;
          console.warn(`❌ Failed for token ${token} - ${errCode}`);

          if (
            errCode === 'messaging/invalid-argument' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            failedTokensToRemove.push(token);
          }
        }
      });

      // Delete bad tokens from DB
      for (const badToken of failedTokensToRemove) {
        await tokenDao.deleteToken(badToken);
        console.log(`🗑️ Deleted invalid token: ${badToken}`);
      }

      return response;
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      throw new Error('Failed to send push notification');
    }
    }
    
    public async sendCryptoPaymentNotification(userId: string, amount: number, txId?: string): Promise<any> {

        console.log(`🔔 Sending crypto payment notification to user ${userId} for amount ${amount} USDT`);
      const userTokens = await tokenDao.getDeviceTokensByUserId(userId);

      console.log("---------------==============",userTokens)
      if (!userTokens.length) {
        console.warn(`⚠️ No device tokens found for user ${userId}`);
        return { successCount: 0, failureCount: 0 };
      }

       const message: admin.messaging.MulticastMessage = {
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
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`✅ Sent crypto payment notification to ${response.successCount} devices`);
      } catch (error) {
        console.error('❌ Error sending crypto payment notification:', error);
      }
    }
}
