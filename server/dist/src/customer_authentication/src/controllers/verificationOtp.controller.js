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
const verificationOtp_service_1 = __importDefault(require("./../services/verificationOtp.service"));
class OTPController {
    sendOTP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { identifier, type } = req.body;
                if (!identifier || !type) {
                    return res.status(400).json({ success: false, message: 'Identifier and type are required.' });
                }
                yield verificationOtp_service_1.default.sendOTP(identifier, type);
                res.status(200).json({ success: true, message: 'OTP sent successfully.' });
            }
            catch (error) {
                res.status(500).json({ success: false, message: 'Failed to send OTP.', error: error.message });
            }
        });
    }
    verifyOTP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { identifier, otp, type } = req.body;
                if (!identifier || !otp || !type) {
                    return res.status(400).json({ success: false, message: 'Identifier, OTP, and type are required.' });
                }
                const result = yield verificationOtp_service_1.default.verifyOTP(identifier, otp, type);
                res.status(result.success ? 200 : 400).json(result);
            }
            catch (error) {
                res.status(500).json({ success: false, message: 'Failed to verify OTP.', error: error.message });
            }
        });
    }
}
exports.default = new OTPController();
//# sourceMappingURL=verificationOtp.controller.js.map