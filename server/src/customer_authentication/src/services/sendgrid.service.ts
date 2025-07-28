import { IEmailInput, IMailer } from '../../../interfaces';
import { config } from "../../../config";
import sgMail from '@sendgrid/mail';

// sgMail.setApiKey(config.mailServie.sendGridApiKey);

export class SendGridMailer implements IMailer {
    private sgMail: any;

    constructor () {
        const apiKey = config.mailServie.sendGridApiKey;
        if (!apiKey) {
            console.log("SendGrid API key is not defined. Please set SENDGRID_API_KEY in .env");
            throw new Error("Mail Service is down temporarily, please try again later.");
        }
        this.sgMail = sgMail.setApiKey(apiKey);
    }
    
    async sendMail(payload: IEmailInput): Promise<void> {
        const { to, subject, text, html } = payload;

        if (!text && !html) {
            throw new Error('At least one of "text" or "html" must be provided.');
        }

        const senderEmail = process.env.SENDER_EMAIL;
        if (!senderEmail) {
            throw new Error('Sender email is not defined. Please set SENDER_EMAIL in .env');
        }

        const msg = {
            to,
            from: senderEmail,
            subject,
            ...(text && { text }),
            ...(html && { html }),
        };

        try {
            await this.sgMail.send(msg as any);
            console.log(`✅ Email sent to ${to} using SendGrid`);
        } catch (error: any) {
            console.error('❌ SendGrid Error:', error.response?.body || error.message);
        }
    }
}