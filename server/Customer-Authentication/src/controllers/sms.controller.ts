// controllers/SMSController.ts
import { Request, Response } from 'express';
import { TwilioService } from '../services/sms.service'; // adjust path as needed

export class SMSController {
  private twilioService: TwilioService;

  constructor() {
    this.twilioService = new TwilioService();
  }

  public sendSMS = async (req: Request, res: Response): Promise<Response> => {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone and message are required.',
      });
    }

    try {
      await this.twilioService.sendSMS(phone, message);
      return res.status(200).json({
        success: true,
        message: 'SMS sent successfully',
      });
    } catch (error: any) {
      console.error('❌ Error sending SMS:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send SMS',
        details: error.message,
      });
    }
  };
}
