// src/controllers/notification.controller.ts
import { Request, Response } from 'express';
import { NotificationService } from '../service/notification.service';
import { TokenDao } from '../dao/notification.dao';
import { OfferModel } from '../model/hotelOffers.model';
import { PropertyInfo } from '../../../property_management/src/model/property.info.model';
import userNotificationLogModel from '../model/userNotificationLog.model';


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
        hotelCode: '',
        offerId: null
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

  public createNotifications = async (req: Request, res: Response): Promise<void> => {
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

      const offer = new OfferModel({
        title,
        body,
        data: data ? { type: data.type, offerCode: data.offerCode } : undefined,
      });

      const savedOffer = await offer.save();

      res.status(201).json({
        message: 'Offer created successfully',
        offer: savedOffer,
      });
    } catch (error: any) {
      console.error('❌ Error creating offer:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

  public getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get pagination params
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Fetch offers with pagination
      const offers = await OfferModel.find().sort({ _id: -1 }).skip(skip).limit(limit).lean();
      const totalOffers = await OfferModel.countDocuments();

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
    } catch (error: any) {
      console.error(`❌ Error fetching offers:`, error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

  /**
   * Get notifications for a specific user by userId
   */
  public getNotificationsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: userId } = req.params;

      if (!userId || typeof userId !== 'string') {
        res.status(400).json({ message: 'userId is required and must be a string.' });
        return;
      }

      const tokenDao = new TokenDao();
      const notifications = await tokenDao.getNotificationLogsByUserId(userId, { sort: { sentAt: -1 } });

      if (notifications.length === 0) {
        res.status(404).json({ message: 'No notifications found for this user.' });
        return;
      }

      res.status(200).json({
        message: 'Notifications fetched successfully',
        notifications: notifications.reverse(),
        total: notifications.length,
      });
    } catch (error: any) {
      console.error(`❌ Error fetching notifications for user ${req.query.userId}:`, error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

  public notificationUpdateFromUserSide = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, notificationId } = req.query;

      if (!userId || !notificationId) {
        res.status(400).json({ message: 'UserId and NotificationId are required and must be strings.' });
        return;
      }

      const result = await userNotificationLogModel.findOneAndUpdate(
        { userId, _id: notificationId },
        { $set: { markedAs: true } },
        { new: true }
      );

      if (!result) {
        res.status(404).json({ message: 'Notification not found for the given user.' });
        return;
      }

      res.status(200).json({
        message: 'Notification marked as read successfully.',
        updatedNotification: result
      });
    } catch (error: any) {
      console.error(`❌ Error updating notification ${req.params.notificationId}:`, error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };
}
