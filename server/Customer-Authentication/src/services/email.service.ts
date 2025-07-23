import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface SendEmailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  public async sendEmail(input: SendEmailInput): Promise<void> {
    const { to, subject, text, html } = input;

    if (!text && !html) {
      throw new Error('At least one of "text" or "html" must be provided.');
      }
      
       const senderEmail = process.env.SENDER_EMAIL;
    if (!senderEmail) {
      throw new Error('Sender email is not defined. Please set SENDER_EMAIL in .env');
    }

    const msg = {
      to,
      from: senderEmail , 
      subject,
      ...(text && { text }),
      ...(html && { html }),
    };

    try {
      await sgMail.send(msg as any); 
      console.log(`✅ Email sent to ${to}`);
    } catch (error: any) {
      console.error('❌ SendGrid Error:', error.response?.body || error.message);
      // throw new Error('Email sending failed');
    }
  }
}

export default new EmailService();
