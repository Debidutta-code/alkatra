import { Request, Response } from 'express';
import OTPService from './../services/verificationOtp.service';

class OTPController {

  async customerEmailVerification(req: Request, res: Response) {
    try {
      const { identifier, type } = req.body;

      if (!identifier || !type) {
        return res.status(400).json({ success: false, message: 'Identifier and type are required.' });
      }
      const result = await OTPService.emailVerification(identifier, type);
      return res.status(200).json(result);

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify email.',
        error: (error as Error).message
      });
    }

  }

  // async sendOTP(req: Request, res: Response) {
  //   try {
  //     const { identifier, type } = req.body;
  //     if (!identifier || !type) {
  //       return res.status(400).json({ success: false, message: 'Identifier and type are required.' });
  //     }

  //     await OTPService.sendOTP(identifier, type);
  //     res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  //   } catch (error) {
  //     res.status(500).json({ success: false, message: 'Failed to send OTP.', error: (error as Error).message });
  //   }
  // }

  async verifyOTP(req: Request, res: Response) {
    try {
      const { identifier, otp, type } = req.body;
      if (!identifier || !otp || !type) {
        return res.status(400).json({ success: false, message: 'Identifier, OTP, and type are required.' });
      }

      const result = await OTPService.verifyOTP(identifier, otp, type);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to verify OTP.', error: (error as Error).message });
    }
  }
}

export default new OTPController();