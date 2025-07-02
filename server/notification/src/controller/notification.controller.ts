// src/controllers/notification.controller.ts
import { Request, Response } from 'express';
import { NotificationService } from '../service/notification.service';
import { TokenDao } from '../dao/notification.dao';
import { OfferModel } from '../model/hotelOffers.model';
import { PropertyInfo } from '../../../Property_Management/src/model/property.info.model';

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

  public createOffersAccordingToHotel = async (req: Request, res: Response): Promise<void> => {
    try {
      // const { hotelCode, title, body, data } = req.body;
      const { title, body, data } = req.body;

      // if (!title || !body || !hotelCode) {
      if (!title || !body) {
        // res.status(400).json({ message: 'Title, body, and hotel code are required.' });
        res.status(400).json({ message: 'Title and body are required.' });
        return;
      }

      // const propertyDetails = await PropertyInfo.findOne({ property_code : hotelCode });
      // if (!propertyDetails) {
      //   res.status(400).json({ message: 'Defined hotel is not available' });
      //   return;
      // }

      const offer = new OfferModel({
        title,
        body,
        data,
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

  public getOffersByHotelCode = async (req: Request, res: Response): Promise<void> => {
    try {
      // const { hotelCode } = req.query;
      const { id: notificationId } = req.params;

      // if (!hotelCode) {
      if (!notificationId) {
        // res.status(400).json({ message: 'Hotel code is required.' });
        res.status(400).json({ message: 'Notification id is required.' });
        return;
      }
      
      // const propertyDetails = await PropertyInfo.findOne({ property_code : hotelCode });
      // if (!propertyDetails) {
      //   res.status(400).json({ message: 'Defined hotel is not available' });
      //   return;
      // }

      const offers = await OfferModel.find({ _id : notificationId }).lean();

      if (offers.length === 0) {
        // res.status(404).json({ message: 'No offers found for this hotel.' });
        res.status(404).json({ message: 'No offers found.' });
        return;
      }

      res.status(200).json({
        message: 'Offers fetched successfully',
        offers,
      });
    } catch (error: any) {
      console.error(`❌ Error fetching offers for ${req.params.notificationId}:`, error);
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
      const notifications = await tokenDao.getNotificationLogsByUserId(userId);

      if (notifications.length === 0) {
        res.status(404).json({ message: 'No notifications found for this user.' });
        return;
      }

      res.status(200).json({
        message: 'Notifications fetched successfully',
        notifications,
        total: notifications.length,
      });
    } catch (error: any) {
      console.error(`❌ Error fetching notifications for user ${req.query.userId}:`, error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

}
