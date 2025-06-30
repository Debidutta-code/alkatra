// twilioService.ts
import twilio, { Twilio } from 'twilio';

export class TwilioService {
  private client: Twilio;
  private from: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    this.from = process.env.TWILIO_PHONE_NUMBER!;

    this.client = twilio(accountSid, authToken);
  }

  async sendSMS(to: string, message: string): Promise<void> {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.from,
        to,
      });

      console.log('✅ SMS sent:', result.sid);
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      throw error;
    }
  }
}
