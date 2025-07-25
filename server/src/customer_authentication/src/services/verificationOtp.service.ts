import OTPDao from '../repositories/verificationOtp.dao';
import { OTPType, OTPStatus } from '../models/verification.model';
import emailService from './email.service';
import { TwilioService } from './sms.service';

const twilioService = new TwilioService();


class OTPService {
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  }

  async sendOTP(identifier: string, type: OTPType): Promise<void> {
    const mode = process.env.MODE || 'development'; // or use NODE_ENV

    console.log(`🔍 Sending OTP in ${mode} mode for type: ${type}`);

    const otp = mode === 'production' ? this.generateOTP() : '123456';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await OTPDao.createOTP({ identifier, otp, type, expiresAt, status: OTPStatus.PENDING });
    try {
      if (type === OTPType.MAIL_VERIFICATION) {
        const subject = `Your OTP for ${type.toUpperCase()}`;
        const html = `<p>Your OTP is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`;

        if (process.env.MODE === 'production') {
          await emailService.sendEmail({
            to: identifier,
            subject,
            html,
            text: `Your OTP is ${otp}`,
          });
        } else {
          console.log('📧 [DEV MODE] Email not sent. OTP:', otp);
        }

      } else if (type === OTPType.NUMBER_VERYFICATION) {
        const message = `Your OTP is ${otp}. This code will expire in 5 minutes.`;

        if (process.env.MODE === 'production') {
          await twilioService.sendSMS(identifier, message);
        } else {
          console.log('📱 [DEV MODE] SMS not sent. OTP:', otp);
        }
      }
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      throw new Error('OTP sending failed. Please try again.'); // 
      // optionally: delete the OTP record or handle the failure

    }

  }

  async verifyOTP(identifier: string, inputOtp: string, type: OTPType): Promise<{ success: boolean; message: string }> {
    const record = await OTPDao.findLatestOTP(identifier, type);

    if (!record) {
      return { success: false, message: 'No OTP record found. Please request a new OTP.' };
    }

    if (record.status !== OTPStatus.PENDING) {
      return { success: false, message: 'OTP is no longer valid.' };
    }

    if (record.expiresAt < new Date()) {
      await OTPDao.incrementAttempts(record._id as string);
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (record.otp !== inputOtp) {
      await OTPDao.incrementAttempts(record._id as string);
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }

    await OTPDao.verifyOTP(identifier, inputOtp, type);
    return { success: true, message: 'OTP verified successfully.' };
  }
}

export default new OTPService();