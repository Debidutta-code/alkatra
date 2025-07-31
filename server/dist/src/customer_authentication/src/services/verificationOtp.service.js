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
const verificationOtp_dao_1 = __importDefault(require("../repositories/verificationOtp.dao"));
const verification_model_1 = require("../models/verification.model");
const sms_service_1 = require("./sms.service");
const mailFactory_1 = require("./mailFactory");
const otp_template_1 = require("../constant/otp.template");
const twilioService = new sms_service_1.TwilioService();
const mailer = mailFactory_1.MailFactory.getMailer();
class OTPService {
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    }
    sendOTP(identifier, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = process.env.MODE || 'development'; // or use NODE_ENV
            console.log(`🔍 Sending OTP in ${mode} mode for type: ${type}`);
            const otp = mode === 'production' ? this.generateOTP() : '123456';
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
            yield verificationOtp_dao_1.default.createOTP({ identifier, otp, type, expiresAt, status: verification_model_1.OTPStatus.PENDING });
            try {
                if (type === verification_model_1.OTPType.MAIL_VERIFICATION) {
                    const subject = `Your OTP for ${type.toUpperCase()}`;
                    const html = `<p>Your OTP is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`;
                    if (process.env.MODE === 'production') {
                        // await emailService.sendEmail({
                        //   to: identifier,
                        //   subject,
                        //   html,
                        //   text: `Your OTP is ${otp}`,
                        // });
                        mailer.sendMail({
                            to: identifier,
                            subject,
                            html: (0, otp_template_1.OTPTemplate)(otp),
                            text: `Your OTP is ${otp}`,
                        });
                    }
                    else {
                        console.log('📧 [DEV MODE] Email not sent. OTP:', otp);
                    }
                }
                else if (type === verification_model_1.OTPType.NUMBER_VERYFICATION) {
                    const message = `Your OTP is ${otp}. This code will expire in 5 minutes.`;
                    if (process.env.MODE === 'production') {
                        yield twilioService.sendSMS(identifier, message);
                    }
                    else {
                        console.log('📱 [DEV MODE] SMS not sent. OTP:', otp);
                    }
                }
            }
            catch (error) {
                console.error('❌ Failed to send OTP email:', error);
                throw new Error('OTP sending failed. Please try again.'); // 
                // optionally: delete the OTP record or handle the failure
            }
        });
    }
    verifyOTP(identifier, inputOtp, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield verificationOtp_dao_1.default.findLatestOTP(identifier, type);
            if (!record) {
                return { success: false, message: 'No OTP record found. Please request a new OTP.' };
            }
            if (record.status !== verification_model_1.OTPStatus.PENDING) {
                return { success: false, message: 'OTP is no longer valid.' };
            }
            if (record.expiresAt < new Date()) {
                yield verificationOtp_dao_1.default.incrementAttempts(record._id);
                return { success: false, message: 'OTP has expired. Please request a new one.' };
            }
            if (record.otp !== inputOtp) {
                yield verificationOtp_dao_1.default.incrementAttempts(record._id);
                return { success: false, message: 'Invalid OTP. Please try again.' };
            }
            yield verificationOtp_dao_1.default.verifyOTP(identifier, inputOtp, type);
            return { success: true, message: 'OTP verified successfully.' };
        });
    }
}
exports.default = new OTPService();
//# sourceMappingURL=verificationOtp.service.js.map