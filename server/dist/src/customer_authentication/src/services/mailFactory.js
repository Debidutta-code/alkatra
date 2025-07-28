"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailFactory = void 0;
const config_1 = require("../../../config");
const nodemailer_service_1 = require("./nodemailer.service");
const sendgrid_service_1 = require("./sendgrid.service");
class MailFactory {
    static getMailer() {
        if (this.instance)
            return this.instance;
        const provider = config_1.config.mailServie.provider;
        switch (provider) {
            case "sendgrid":
                this.instance = new sendgrid_service_1.SendGridMailer();
                break;
            case "nodemailer":
                this.instance = new nodemailer_service_1.NodemailerService();
                break;
            default:
                throw new Error(`Unsupported mail provider: ${provider}`);
        }
        return this.instance;
    }
}
exports.MailFactory = MailFactory;
//# sourceMappingURL=mailFactory.js.map