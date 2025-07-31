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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMSController = void 0;
const sms_service_1 = require("../services/sms.service"); // adjust path as needed
class SMSController {
    constructor() {
        this.sendSMS = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { phone, message } = req.body;
            if (!phone || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Phone and message are required.',
                });
            }
            try {
                yield this.twilioService.sendSMS(phone, message);
                return res.status(200).json({
                    success: true,
                    message: 'SMS sent successfully',
                });
            }
            catch (error) {
                console.error('❌ Error sending SMS:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to send SMS',
                    details: error.message,
                });
            }
        });
        this.twilioService = new sms_service_1.TwilioService();
    }
}
exports.SMSController = SMSController;
//# sourceMappingURL=sms.controller.js.map