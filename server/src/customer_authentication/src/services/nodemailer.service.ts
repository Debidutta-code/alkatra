import nodemailer from 'nodemailer';
import { IEmailInput, IMailer } from '../../../interfaces';
import { config } from "../../../config";

const { user, pass } = config.mailServie;

export class NodemailerService implements IMailer {
    private transporter: nodemailer.Transporter;
    private senderEmail: string;

    constructor() {
        if (!user || !pass) {
            console.log("Email user or password is not defined. Please set EMAIL_USER and EMAIL_PASS in .env");
            throw new Error("Mail Service is down temporarily, please try again later.");
        }

        this.senderEmail = user;

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass,
            },
        });
    }

    async sendMail(payload: IEmailInput) {
        const { to, subject, text, html } = payload;

        if (!text && !html) {
            throw new Error('At least one of "text" or "html" must be provided.');
        }

        const msg = {
            from: this.senderEmail,
            to,
            subject,
            text,
            html,
        };

        try {
            await this.transporter.sendMail(msg);
            console.log(`✅ Email sent to ${to} using Nodemailer`);
        } catch (error: any) {
            console.error('❌ Nodemailer Error:', error.message);
        }
    }
}
