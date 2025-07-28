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
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
class EmailService {
    sendEmail(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { to, subject, text, html } = input;
            if (!text && !html) {
                throw new Error('At least one of "text" or "html" must be provided.');
            }
            const senderEmail = process.env.SENDER_EMAIL;
            if (!senderEmail) {
                throw new Error('Sender email is not defined. Please set SENDER_EMAIL in .env');
            }
            const msg = Object.assign(Object.assign({ to, from: senderEmail, subject }, (text && { text })), (html && { html }));
            try {
                yield mail_1.default.send(msg);
                console.log(`✅ Email sent to ${to}`);
            }
            catch (error) {
                console.error('❌ SendGrid Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.body) || error.message);
                // throw new Error('Email sending failed');
            }
        });
    }
}
exports.default = new EmailService();
//# sourceMappingURL=email.service.js.map