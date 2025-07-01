// src/services/notificationService.ts
import admin from '../config/firebase.config';
import { TokenDao } from '../dao/notification.dao';

interface NotificationPayload {
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

      // 🔁 Remove invalid or expired tokens
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
}
