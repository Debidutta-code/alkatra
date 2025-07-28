import { config } from "../../../config";
import { IMailer } from "../../../interfaces";
import { NodemailerService } from "./nodemailer.service";
import { SendGridMailer } from "./sendgrid.service"

export class MailFactory {
    private static instance: IMailer;

    static getMailer(): IMailer {
        if (this.instance) return this.instance;

        const provider = config.mailServie.provider;

        switch (provider) {
            case "sendgrid":
                this.instance = new SendGridMailer();
                break;
            case "nodemailer":
                this.instance = new NodemailerService();
                break;
            default:
                throw new Error(`Unsupported mail provider: ${provider}`);
        }

        return this.instance;
    }
}