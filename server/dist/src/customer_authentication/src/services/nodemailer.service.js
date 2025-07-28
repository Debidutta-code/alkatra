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
exports.NodemailerService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../../config");
const { user, pass } = config_1.config.mailServie;
class NodemailerService {
    constructor() {
        if (!user || !pass) {
            console.log("Email user or password is not defined. Please set EMAIL_USER and EMAIL_PASS in .env");
            throw new Error("Mail Service is down temporarily, please try again later.");
        }
        this.senderEmail = user;
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass,
            },
        });
    }
    sendMail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield this.transporter.sendMail(msg);
                console.log(`✅ Email sent to ${to} using Nodemailer`);
            }
            catch (error) {
                console.error('❌ Nodemailer Error:', error.message);
            }
        });
    }
}
exports.NodemailerService = NodemailerService;
//# sourceMappingURL=nodemailer.service.js.map