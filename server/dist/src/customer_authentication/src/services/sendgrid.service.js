"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridMailer = void 0;
const config_1 = require("../../../config");
const mail_1 = __importDefault(require("@sendgrid/mail"));
// sgMail.setApiKey(config.mailServie.sendGridApiKey);
class SendGridMailer {
    constructor() {
        const apiKey = config_1.config.mailServie.sendGridApiKey;
        if (!apiKey) {
            console.log("SendGrid API key is not defined. Please set SENDGRID_API_KEY in .env");
            throw new Error("Mail Service is down temporarily, please try again later.");
        }
        this.sgMail = mail_1.default.setApiKey(apiKey);
    }
    sendMail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { to, subject, text, html } = payload;
            if (!text && !html) {
                throw new Error('At least one of "text" or "html" must be provided.');
            }
            const senderEmail = process.env.SENDER_EMAIL;
            if (!senderEmail) {
                throw new Error('Sender email is not defined. Please set SENDER_EMAIL in .env');
            }
            const msg = Object.assign(Object.assign({ to, from: senderEmail, subject }, (text && { text })), (html && { html }));
            try {
                yield this.sgMail.send(msg);
                console.log(`✅ Email sent to ${to} using SendGrid`);
            }
            catch (error) {
                console.error('❌ SendGrid Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.body) || error.message);
            }
        });
    }
}
exports.SendGridMailer = SendGridMailer;
//# sourceMappingURL=sendgrid.service.js.map