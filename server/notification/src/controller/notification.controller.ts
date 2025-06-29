// src/controllers/notification.controller.ts
import { Request, Response } from 'express';
import { NotificationService } from '../service/notification.service';
import { TokenDao } from '../dao/notification.dao';

export class NotificationController {
    constructor(private notificationService: typeof NotificationService) { }


  /**
   * Handle request to send notification to all users
   */
  public sendToAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, body, data } = req.body;

      if (!title || !body) {
        res.status(400).json({ message: 'Title and body are required.' });
        return;
      }

      const response = await this.notificationService.sendPushNotification({
        title,
        body,
        data,
      });

      res.status(200).json({
        message: 'Notification sent successfully',
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
    } catch (error: any) {
      console.error('❌ Failed to send notification:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
    };

    public registerDeviceToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, token, platform } = req.body;

    if (!userId || !token || !platform) {
      res.status(400).json({ message: 'userId, token, and platform are required.' });
      return;
    }

    const tokenDao = new TokenDao();
 // ✅ Access TokenDao inside service
    await tokenDao.saveOrUpdateToken(userId, token, platform);

    res.status(200).json({ message: 'Device token registered successfully' });
  } catch (error: any) {
    console.error('❌ Failed to register device token:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
    

}
